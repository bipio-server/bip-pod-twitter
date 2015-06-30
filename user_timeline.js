/**
 *
 * The Bipio Twitter Pod.  user_timeline action definition
 * ---------------------------------------------------------------
 *
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2013 Michael Pearson https://github.com/mjpearson
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
function UserTimeline(podConfig) {
    this.podConfig = podConfig;
}

UserTimeline.prototype = {};


/**
 * Initializes local timeline tracking.  Only tracks from channel setup.
 * @todo - there's no tracking start for trigger bip setup. This needs to
 * be abstracted away into tracking starts for channelid/bipid pairs, which
 * should override the trigger invoke() tracking start for this channel instance.
 */
UserTimeline.prototype.setup = function(channel, accountInfo, next) {
     var $resource = this.$resource,
        self = this,
        dao = $resource.dao,
        modelName = this.$resource.getDataSourceName('track_timeline');

    var args = {
        count : 1,
        include_rts : 1
    };

    if (channel.config.user_id && '' !== channel.config.user_id) {
        args.user_id = channel.config.user_id;
    } else if (channel.config.screen_name && '' !== channel.config.screen_name) {
        args.screen_name = channel.config.screen_name.replace(/^@/, '');
    }

    var tc = this.pod._getClient(accountInfo._setupAuth.oauth);
    tc.getUserTimeline(args, function(err, response) {
        if (err) {
            var errData = JSON.parse(err.data);
            next(errData.errors ? errData.errors[0].message : errData.error);
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
UserTimeline.prototype.teardown = function(channel, accountInfo, next) {
  this.$resource.dao.removeFilter(
    this.$resource.getDataSourceName('track_timeline'),
    {
      owner_id : channel.owner_id,
      channel_id : channel.id
    },
    next
  );
};

UserTimeline.prototype.trigger = function(imports, channel, sysImports, contentParts, next) {
    var $resource = this.$resource,
        self = this,
        dao = $resource.dao,
        modelName = this.$resource.getDataSourceName('track_timeline');

    dao.find(modelName, { channel_id : channel.id, owner_id : channel.owner_id }, function(err, result) {
        if (err) {
            log(err, channel, 'error');
            next(err, {});
        } else {
            imports.since_id = result.last_id_str;
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
UserTimeline.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
    var $resource = this.$resource,
        self = this,
        dao = $resource.dao,
        log = $resource.log;

    if (imports.user_id && '' !== imports.user_id) {
        imports.user_id = imports.user_id;
    } else if (imports.screen_name && '' !== imports.screen_name) {
        imports.screen_name = imports.screen_name.replace(/^@/, '');
    }

    this.pod._getClient(sysImports.auth.oauth).getUserTimeline(imports, function(err, tweets) {
         if (err) {
            log(err, channel, 'error');
            next(err, {});
         } else {

            for (var i = 0; i < tweets.length; i++) {
                // don't export everything from user timeline yet.
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
module.exports = UserTimeline;
