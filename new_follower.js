/**
 *
 * The Bipio Twitter Pod.  search action definition
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
function OnNewFollower() {
}

OnNewFollower.prototype = {};

OnNewFollower.prototype.trigger = function(imports, channel, sysImports, contentParts, next) {
	var $resource = this.$resource;
	this.invoke(imports, channel, sysImports, contentParts, function(err, followersId) {
		$resource.dupFilter(followersId, 'id_str', channel, sysImports, function(err, follower) {
			next(err, follower);
		});

	});
}

OnNewFollower.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
	var log = this.$resource.log;
  var tc = this.pod._getClient(sysImports.auth.oauth);
  var profile = JSON.parse(sysImports.auth.oauth.profile);

  tc.get('/followers/list.json', imports , function(err, exports) {
      if (err) {
          next(err);
      } else {
          for (var i = 0; i < exports.users.length; i++) {
            next(false, exports.users[i]);
          }
      }
  });
}

// -----------------------------------------------------------------------------
module.exports = OnNewFollower;
