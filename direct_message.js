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
function DirectMessage(podConfig) {
    this.podConfig = podConfig;
}

DirectMessage.prototype = {};

/**
 * Invokes (runs) the action.
 *
 */
DirectMessage.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var tc = this.pod._getClient(sysImports.auth.oauth);
  // tc.newDirectMessage(imports.user_id, imports.message, next);
  var params = {
		    user :imports.user_id,
	      text : imports.message
	    };

   tc.direct_messages("new", params, sysImports.auth.oauth.access_token, sysImports.auth.oauth.secret, next);
}

// -----------------------------------------------------------------------------
module.exports = DirectMessage;
