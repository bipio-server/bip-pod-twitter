/**
 *
 * @author Michael Pearson <michael@cloudspark.com.au>
 * Copyright (c) 2010-2014 CloudSpark pty ltd http://www.cloudspark.com.au
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
function UserMentions(podConfig) {
  this.name = 'user_mentions';
  this.description = 'Get Mentions';
  this.description_long = 'Forwards the details of any Tweet where your username is mentioned';
  this.trigger = true;
  this.singleton = false;
  this.podConfig = podConfig;
}

UserMentions.prototype = {};

UserMentions.prototype.getSchema = function() {
  return {
    'exports' : {
      properties : {
        'text' : {
          type : "string",
          description: 'Tweet Text'
        },
        'retweeted' : {
          type  : "boolean",
          description : "Was Retweeted"
        },
        'id' : {
          type  : "string",
          description : "ID"
        },
        'tweet_url' : {
          type : 'string',
          description : 'Tweet Direct URL'
        },
        'user_name' : {
          type : 'string',
          description : 'Mentioning User Name'
        },
        'created_at' : {
          type  : "string",
          description : "Created Timestamp"
        }
      }
    }
  };
};

/**
 * Initializes local timeline tracking.  Only tracks from channel setup.
 * @todo - there's no tracking start for trigger bip setup. This needs to
 * be abstracted away into tracking starts for channelid/bipid pairs, which
 * should override the trigger invoke() tracking start for this channel instance.
 */
UserMentions.prototype.setup = function(channel, accountInfo, next) {
  var $resource = this.$resource,
  pod = this.pod,
  self = this,
  dao = $resource.dao,
  log = $resource.log,
  modelName = this.$resource.getDataSourceName('track_mentions');

  (function(channel, accountInfo, next) {
    var args = {
      count : 1,
      include_rts : 1
    };
   
   //Twitter._getMentions = function(oauth, params, callback) {
   
    pod._getMentions(accountInfo._setupAuth.oauth, args, function(err, response) {
      if (err) {
        log(err, channel, 'error');
        next(err, 'channel', channel);
      } else {
        var trackingStruct = {
          owner_id : channel.owner_id,
          channel_id : channel.id,
          last_update : app.helper.nowUTCSeconds(),
          last_id_str : response[0].id_str
        }
        model = dao.modelFactory(modelName, trackingStruct, accountInfo);
        dao.create(model, function(err, result) {
          if (err) {
            log(err, channel, 'error');
          }
          next(err, 'channel', channel); // ok
        }, accountInfo);
      }
    });
  })(channel, accountInfo, next);
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

/**
 * Invokes (runs) the action.
 *
 */
UserMentions.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var $resource = this.$resource,
  self = this,
  pod = this.pod,
  dao = $resource.dao,
  log = $resource.log,
  modelName = this.$resource.getDataSourceName('track_mentions');

  (function(channel, sysImports, next) {
    var args = {};
    dao.find(modelName, {
      channel_id : channel.id,
      owner_id : channel.owner_id
    }, function(err, result) {
      if (err) {
        log(err, channel, 'error');
        next(err, {});
      } else {
        args.since_id = result.last_id_str;

        pod._getMentions(sysImports.auth.oauth, args, function(err, tweets) {
          if (err) {
            log(err, channel, 'error');
            next(err, {});
          } else {
            // set tracking
            if (tweets.length > 0) {
              dao.updateColumn(
                modelName,
                {
                  owner_id : channel.owner_id,
                  channel_id : channel.id
                },
                {
                  last_id_str : tweets[0].id_str
                },
                function(err) {
                  if (err) {
                    log(err, channel, 'error');
                    next(err, {});
                  } else {
                    for (var i = 0; i < tweets.length; i++) {
                      next(
                        false,
                        {
                          id : tweets[i].id_str,
                          created_at : tweets[i].created_at,
                          text : tweets[i].text,
                          retweeted : tweets[i].retweeted,
                          tweet_url : 'https://twitter.com/' + tweets[i].user.screen_name + '/statuses/' + tweets[i].id_str,
                          user_name : tweets[i].user.name
                        }
                        );
                    }
                  }
                }
                );
            }
          }
        });
      }
    });
  })(channel, sysImports, next);
}

// -----------------------------------------------------------------------------
module.exports = UserMentions;
