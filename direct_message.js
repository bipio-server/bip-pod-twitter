/**
 *
 * The Bipio Twitter Pod.
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
var ntwitter = require('ntwitter');

function DirectMessage(podConfig) {
    this.name = 'direct_message';
    this.title = 'Send a Direct Message';
    this.description = 'Direct Message another Twitter user who you\'re following and is following you';
    this.trigger = false; // can be a periodic trigger
    this.singleton = true; // only 1 instance per account
    this.podConfig = podConfig;
}

DirectMessage.prototype = {};

DirectMessage.prototype.getSchema = function() {
    return {
        'exports' : {
            properties : {
                'id_str' : {
                    type : "string",
                    description: 'Message ID'
                },
                'sender_id' : {
                    type : "string",
                    description: 'Your User ID'
                },
                'sender_screen_name' : {
                    type : "string",
                    description: 'Your Screen Name'
                },
                'text' : {
                    type : "string",
                    description: 'The Message You Sent'
                }
            }
        },
        "imports": {
            properties : {
                "message" : {
                    type : "string",
                    "description" : "Direct Message Content"
                },
                "user_id" : {
                    type : "string",
                    "description" : "User ID"
                }
            },
            "required" : [ "message", "user_id" ]
        }
    };
}

/**
 * Invokes (runs) the action.
 *
 */
DirectMessage.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
    var log = this.$resource.log;
    var tc = new ntwitter({
        consumer_key : this.podConfig.oauth.consumerKey,
        consumer_secret : this.podConfig.oauth.consumerSecret,
        access_token_key : sysImports.auth.oauth.token,
        access_token_secret : sysImports.auth.oauth.secret
    });

    if (imports.message && '' !== imports.message && imports.user_id && '' !== imports.user_id) {
      tc.newDirectMessage(imports.user_id, imports.message, function(err, exports) {
          if (err) {
              log(err, channel, 'error');
          }

          next(err, exports);
      });
    }
}

// -----------------------------------------------------------------------------
module.exports = DirectMessage;
