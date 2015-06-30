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
function FollowUser(podConfig) {
  this.podConfig = podConfig;
}

FollowUser.prototype = {};

/**
 * Invokes (runs) the action.
 *
 */
FollowUser.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var log = this.$resource.log;
  var tc = this.pod._getClient(sysImports.auth.oauth);

  var params = {include_entities: 1}, id;
  if (imports.enable_notifications && this.$resource.helper.isTruthy(imports.enable_notifications) ) {
    params.enable_notifications = true;
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
	  if (typeof id === 'string'){
		  params.screen_name = id;
	  }else{
		  params.user_id = id;
		}
//var url = '/friendships/create.json';
//tc.createFriendship(id, args, function(err, exports) {
	  tc.friendships("create",params, sysImports.auth.oauth.access_token, sysImports.auth.oauth.secret,  function(err, exports) {
      if (err) {
        log(err, channel, 'error');
      }
      next(err, exports);
    });
  }
}

// -----------------------------------------------------------------------------
module.exports = FollowUser;
