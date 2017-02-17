/**
 *
 * The Bipio Twitter Pod.  user_timeline action definition
 * ---------------------------------------------------------------
 *
 * Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function UserMentions(podConfig) {
    this.podConfig = podConfig;
}

UserMentions.prototype = {};


/**
 * Initializes local timeline tracking.  Only tracks from channel setup.
 * @todo - there's no tracking start for trigger bip setup. This needs to
 * be abstracted away into tracking starts for channelid/bipid pairs, which
 * should override the trigger invoke() tracking start for this channel instance.
 */
UserMentions.prototype.setup = function(channel, accountInfo, next) {
     var $resource = this.$resource,
        self = this,
        dao = $resource.dao,
        pod = this.pod,
        modelName = this.$resource.getDataSourceName('track_mentions');

    var args = {
        count : 1,
        include_rts : 1
    };

    if (channel.config.user_id && '' !== channel.config.user_id) {
        args.user_id = channel.config.user_id;
    } else if (channel.config.screen_name && '' !== channel.config.screen_name) {
        args.screen_name = channel.config.screen_name.replace(/^@/, '');
    }

    pod._getMentions(accountInfo._setupAuth.oauth, args, function(err, response) {
      if (err) {
          next(JSON.parse(err.data).errors[0].message);
      } else {
        var trackingStruct = {
          owner_id : channel.owner_id,
          channel_id : channel.id,
          last_update : $resource.helper.nowUTCMS(),
          last_id_str : response[0].id_str
        }
        model = dao.modelFactory(modelName, trackingStruct, accountInfo);
        dao.create(model, function(err, result) {
            next(err); // ok
        }, accountInfo);
      }
    });
};


/**
 * Drop timeline tracker
 *
 * @todo deprecate - move to pods unless action has teardown override
 */
UserMentions.prototype.teardown = function(channel, accountInfo, next) {
  this.$resource.dao.removeFilter(
    this.$resource.getDataSourceName('track_mentions'),
    {
      owner_id : channel.owner_id,
      channel_id : channel.id
    },
    next
  );
};

UserMentions.prototype.trigger = function(imports, channel, sysImports, contentParts, next) {
    var $resource = this.$resource,
        self = this,
        dao = $resource.dao,
        modelName = this.$resource.getDataSourceName('track_mentions');

    dao.find(modelName, { channel_id : channel.id, owner_id : channel.owner_id }, function(err, result) {
        if (err) {
            next(err, {});
        } else {
            // recover if
            if (result && result.last_id_str) {
              imports.since_id = result.last_id_str;
            }

            var lastId;

            self.invoke(imports, channel, sysImports, contentParts, function(err, exports) {
                if (err) {
                    next(err);
                } else {
                    next(false, exports);

                    if (!lastId) {
                        lastId = exports.id;
                        dao.updateColumn(
                            modelName,
                            {
                                owner_id : channel.owner_id,
                                channel_id : channel.id
                            },
                            {
                                last_id_str : lastId
                            },
                            function(err) {
                                if (err) {
                                    next(err);
                                }
                            }
                        );
                    }
                }
            });
        }
    });
}

/**
 * Invokes (runs) the action.
 *
 */
UserMentions.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var $resource = this.$resource,
    self = this,
    pod = this.pod,
    dao = $resource.dao;

  pod._getMentions(sysImports.auth.oauth, imports, function(err, tweets) {
    if (err) {
      next(JSON.parse(err.data).errors[0].message);
    } else {
      for (var i = 0; i < tweets.length; i++) {
        next(
           false,
           {
             id : tweets[i].id_str,
             created_at : tweets[i].created_at,
             text : tweets[i].text,
             retweeted : tweets[i].retweeted,
             tweet_url : 'https://twitter.com/' + tweets[i].user.screen_name + '/statuses/' + tweets[i].id_str
           }
        );
      }
    }
  });
}

// -----------------------------------------------------------------------------
module.exports = UserMentions;
