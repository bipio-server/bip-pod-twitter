/**
 *
 * The Bipio Twitter Pod.
 * ---------------------------------------------------------------
 *
 * Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
        isMutual = $resource.helper.isTruthy(imports.me_following);

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
