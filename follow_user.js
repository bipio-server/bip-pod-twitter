/**
 *
 * The Bipio Twitter Pod.
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

function DirectMessage(podConfig) {
  this.name = 'follow_user';
  this.description = 'Follow A User';
  this.description_long = 'Start Following a Twitter User';
  this.trigger = false; // can be a periodic trigger
  this.singleton = true; // only 1 instance per account
  this.podConfig = podConfig;
}

DirectMessage.prototype = {};

DirectMessage.prototype.getSchema = function() {
  return {
    'config' : {
      properties : {
        "enable_notifications" : {
          type : 'boolean',
          description : "Enable notifications for the target user",
          'default' : true
        }
      }
    },
    'exports' : {
      properties : {
        "name": {
          type : "string",
          description: 'User Name'
        },
        "screen_name":{
          type : "string",
          description: 'User Screen Name'
        },
        "id_str": {
          type : "string",
          description: 'User ID (String)'
        },
        "profile_image_url":{
          type : "string",
          description: 'Profile Image URL'
        },
        "url": {
          type : "string",
          description: 'Profile URL'
        },
        "utc_offset":{
          type : "string",
          description: 'UTC Offset'
        },
        "description": {
          type : "string",
          description: 'Profile Description'
        }
      }
    },
    "imports": {
      properties : {
        "screen_name" : {
          type : "string",
          "description" : "The screen name of the user for whom to befriend."
        },
        "user_id" : {
          type : "string",
          "description" : "The ID of the user for whom to befriend."
        }        
      }
    }
  };
}

/**
 * Invokes (runs) the action.
 *
 */
DirectMessage.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var log = this.$resource.log;
  var tc = this.pod._getClient(sysImports.auth.oauth);
  var args = {}, id;
  if (channel.config.enable_notifications && app.helper.isTrue(channel.config.enable_notifications) ) {
    args.enable_notifications = true;    
  }

  if ('' !== imports.screen_name) {
    id = imports.screen_name;
  } else if ('' !== imports.user_id) {
    id = Number(imports.user_id);
    if (isNaN(id)) {
      id = undefined;
    }
  }
  
  if (id) {
    tc.createFriendship(id, args, function(err, exports) {
      if (err) {
        log(err, channel, 'error');
      }

      next(err, exports);
    });
  }
}

// -----------------------------------------------------------------------------
module.exports = DirectMessage;
