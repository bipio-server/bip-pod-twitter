/**
 *
 * The Bipio Twitter Pod.  user_timeline action definition
 * ---------------------------------------------------------------
 *
 * @author Michael Pearson <michael@cloudspark.com.au>
 * Copyright (c) 2010-2013 CloudSpark pty ltd http://www.cloudspark.com.au
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
var ntwitter = require('ntwitter');

function UserTimeline(podConfig) {
    this.name = 'user_timeline';
    this.description = 'Get Tweets By User';
    this.description_long = 'Returns a collection of the most recent Tweets posted by a user';
    this.trigger = true; // can be a periodic trigger
    this.singleton = false; // only 1 instance per account
    this.podConfig = podConfig;
}

UserTimeline.prototype = {};

UserTimeline.prototype.getSchema = function() {
    return {
        'config' : {
            properties : {
                'screen_name' : {
                    type : "string",
                    description: 'Screen Name'
                },
                'user_id' : {
                    type : "string",
                    description: 'User ID'
                }
            }
        },
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
                'created_at' : {
                    type  : "string",
                    description : "Created Timestamp"
                }
            }
        },
        "imports": {
            properties : {
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
UserTimeline.prototype.setup = function(channel, accountInfo, next) {
     var $resource = this.$resource,
        self = this,
        dao = $resource.dao,
        log = $resource.log,
        modelName = this.$resource.getDataSourceName('track_timeline');

    (function(channel, accountInfo, next) {       
        var args = {
            count : 1,
            include_rts : 1
        };

        if (channel.config.user_id && '' !== channel.config.user_id) {
            args.user_id = channel.config.user_id;
        } else if (channel.config.screen_name && '' !== channel.config.screen_name) {
            args.screen_name = channel.config.screen_name.replace(/^@/, '');
        }

        var tc = new ntwitter({
            consumer_key : self.podConfig.oauth.consumerKey,
            consumer_secret : self.podConfig.oauth.consumerSecret,
            access_token_key : accountInfo._setupAuth.oauth.token,
            access_token_secret : accountInfo._setupAuth.oauth.secret
        });
        tc.getUserTimeline(args, function(err, response) {
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

/**
 * Invokes (runs) the action.
 *
 */
UserTimeline.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
    var $resource = this.$resource,
        self = this,
        dao = $resource.dao,
        log = $resource.log,
        modelName = this.$resource.getDataSourceName('track_timeline');

    (function(channel, sysImports, next) {
        var args = {};
        dao.find(modelName, { channel_id : channel.id, owner_id : channel.owner_id }, function(err, result) {
            if (err) {
                log(err, channel, 'error');
                next(err, {});
            } else {
                args.since_id = result.last_id_str;

                if (channel.config.user_id && '' !== channel.config.user_id) {
                    args.user_id = channel.config.user_id;
                } else if (channel.config.screen_name && '' !== channel.config.screen_name) {
                    args.screen_name = channel.config.screen_name.replace(/^@/, '');
                }

                var tc = new ntwitter({
                    consumer_key : self.podConfig.oauth.consumerKey,
                    consumer_secret : self.podConfig.oauth.consumerSecret,
                    access_token_key : sysImports.auth.oauth.token,
                    access_token_secret : sysImports.auth.oauth.secret
                });

                tc.getUserTimeline(args, function(err, tweets) {
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
module.exports = UserTimeline;
