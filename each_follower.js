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

function EachFollower(podConfig) {
  this.name = 'each_follower';
  this.description = 'Retrieve My Followers';
  this.description_long = 'Generates a user ID export for every user following you';
  this.trigger = false; // can be a periodic trigger
  this.singleton = false; // only 1 instance per account
  this.podConfig = podConfig;
}

EachFollower.prototype = {};

EachFollower.prototype.getSchema = function() {
  return {
    'config' : {
      properties : {
        'me_following' : {
          type : 'boolean',
          description: 'Only get Users that I am also following',
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
        
        /* kitchen sink hints if you need them.
        "created_at": {
          type : "string",
          description: 'Created At Time'
        },
        "profile_sidebar_fill_color":{
          type : "string",
          description: 'Hex Sidebar Fille Color'
        },
        "profile_background_tile": {
          type : "string",
          description: 'Profile Background Title'
        },
        "profile_sidebar_border_color": {
          type : "string",
          description: 'Hex Sidebar Border Color'
        },
        
        "location": {
          type : "string",
          description: 'Location'
        },
        
        "follow_request_sent": {
          type : "integer",
          description: 'Follow Requests Sent'
        },

        "profile_link_color": {
          type : "string",
          description: 'Hex Profile Link Color'
        },
        "is_translator": {
          type : "boolean",
          description: 'Is Translator'
        },
        "default_profile": {
          type : "boolean",
          description: 'Is Default Profile'
        },
        "favourites_count": {
          type : "integer",
          description: '# Favorites'
        },
        "contributors_enabled": {
          type : "boolean",
          description: 'Contributors Enabled'
        },

        "profile_image_url_https":{
          type : "string",
          description: 'Profile Image URL (SSL)'
        },

        "id": {
          type : "integer",
          description: 'ID'
        },
        "profile_use_background_image": {
          type : "boolean",
          description: 'Uses Background Image'
        },
        "listed_count": {
          type : "integer",
          description: '# Listed'
        },
        "profile_text_color":{
          type : "string",
          description: 'Hex Profile Text Color'
        },
        "lang":{
          type : "string",
          description: 'Language'
        },
        "followers_count": {
          type : "integer",
          description: '# Followers'
        },
        "protected": {
          type : "boolean",
          description: 'Is Protected'
        },
        "profile_background_image_url_https": {
          type : "string",
          description: 'Profile Background URL (ssl)'
        },
        "geo_enabled": {
          type : "boolean",
          description: 'Is Geo Enabled'
        },

        "profile_background_color": {
          type : "string",
          description: 'Hex Background Color'
        },
        "verified": {
          type : "boolean",
          description: 'Is Verified'
        },
        "notifications": {
          type : "boolean",
          description: 'Notifications'
        },
        "time_zone":{
          type : "string",
          description: 'Timezone'
        },
        "statuses_count": {
          type : "integer",
          description: '# Statuses'
        },
        "profile_background_image_url": {
          type : "string",
          description: 'Profile Background URL'
        },
        "default_profile_image": {
          type : "boolean",
          description: 'Default Profile Image'
        },
        "friends_count": {
          type : "integer",
          description: '# Friends'
        },

        "following": {
          type : "boolean",
          description: 'You Are Following'
        },
        "show_all_inline_media": {
          type : "boolean",
          description: 'Showing Media Inline'
        }
        */
      }
    },
    "imports": {
      properties : {
    }
    }
  };
}

/**
 * Invokes (runs) the action.
 *
 */
EachFollower.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var log = this.$resource.log;
  var tc = this.pod._getClient(sysImports.auth.oauth);
  tc.getFollowersIds(undefined, function(err, exports) {
    if (err) {
      log(err, channel, 'error');
    } else if (exports && exports.length > 0) {
      var batch = [],
        isMutual = app.helper.isTrue(channel.config.me_following);

      do {
        batch = exports.splice(0, 100);
        if (batch.length > 0) {
          tc.showUser(batch.join(','), function(err, exports) {
            if (err) {
              log(err, channel, 'error');
            } else {
              for (var i = 0; i < exports.length; i++) {
                if (isMutual && exports[i].following) {
                  next(false, exports[i]);
                } else {
                  next(false, exports[i]);
                }
              }
            }
          });
        }
      } while (batch.length > 0);
    }
  });
}

// -----------------------------------------------------------------------------
module.exports = EachFollower;
