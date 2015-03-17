/**
 *
 * The Bipio Twitter Pod.  search action definition
 * ---------------------------------------------------------------
 *
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2015 WoT.IO inc http://wot.io
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
function OnNewFollower() {
}

OnNewFollower.prototype = {};

OnNewFollower.prototype.trigger = function(imports, channel, sysImports, contentParts, next) {
	var $resource = this.$resource;
	this.invoke(imports, channel, sysImports, contentParts, function(err, followersId) {
		$resource.dupFilter(followersId, 'id', channel, sysImports, function(err, follower) {
			next(err, follower);
		});

	});
}

OnNewFollower.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
	var log = this.$resource.log;
    var tc = this.pod._getClient(sysImports.auth.oauth);
    var profile = JSON.parse(sysImports.auth.oauth.profile);
    tc.getFollowersIds(undefined, function(err, exports) {
        if (err) {
            log(err, channel, 'error');
          } else if (exports && exports.length > 0) {
        	  next(false , exports)
          }
    })

}

// -----------------------------------------------------------------------------
module.exports = OnNewFollower;
