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
function EachFollower(podConfig) {
  this.podConfig = podConfig;
}

EachFollower.prototype = {};

/**
 * Invokes (runs) the action.
 *
 */
EachFollower.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var $resource = this.$resource,
    log = $resource.log,
    tc = this.pod._getClient(sysImports.auth.oauth);

  tc.getFollowersIds(undefined, function(err, exports) {
    if (err) {
      log(err, channel, 'error');
    } else if (exports && exports.length > 0) {
      var batch = [],
        isMutual = $resource.helper.isTruthy(channel.config.me_following);

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
