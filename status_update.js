/**
 *
 * The Bipio Facebook Pod.  status_update action definition
 * ---------------------------------------------------------------
 *  Posts a message to users facebook wall
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

function StatusUpdate(podConfig) {
    this.name = 'status_update';
    this.description = 'New Status Update';
    this.description_long = 'Any message this Channel receives will trigger a new Twitter Status Update';
    this.trigger = false; // can be a periodic trigger
    this.singleton = true; // only 1 instance per account
    this.podConfig = podConfig;
}

StatusUpdate.prototype = {};

StatusUpdate.prototype.getSchema = function() {
    return {
        'exports' : {
            properties : {
                'id' : {
                    type : "string",
                    description: 'Tweet ID'
                }
            }
        },
        "imports": {
            properties : {
                "status" : {
                    type : "string",
                    "description" : "New Timeline Content"
                }
            }
        }
    };
}

/**
 * Invokes (runs) the action.
 *
 */
StatusUpdate.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
    var log = this.$resource.log;
    var tc = new ntwitter({
        consumer_key : this.podConfig.oauth.consumerKey,
        consumer_secret : this.podConfig.oauth.consumerSecret,
        access_token_key : sysImports._oauth_token,
        access_token_secret : sysImports._oauth_token_secret
    });
    if (imports.status) {
        tc.updateStatus(imports.status, function(err, exports) {
            if (err) {
                log(err, channel, 'error');
            }
            
            next(err, exports);
        });
    } 
}

// -----------------------------------------------------------------------------
module.exports = StatusUpdate;
