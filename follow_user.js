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
function DirectMessage(podConfig) {
  this.podConfig = podConfig;
}

DirectMessage.prototype = {};

/**
 * Invokes (runs) the action.
 *
 */
DirectMessage.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var log = this.$resource.log;
  var tc = this.pod._getClient(sysImports.auth.oauth);

  var args = {}, id;
  if (imports.enable_notifications && this.$resource.helper.isTruthy(imports.enable_notifications) ) {
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
