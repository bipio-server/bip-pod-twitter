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
function UserTweets() {
}

UserTweets.prototype = {};

UserTweets.prototype.trigger = function(imports, channel, sysImports, contentParts, next) {
	var $resource = this.$resource;
	this.invoke(imports, channel, sysImports, contentParts, function(err, tweet) {
		$resource.dupFilter(tweet, 'id', channel, sysImports, function(err, tweet) {
			next(err, tweet);
		});
	});
}

UserTweets.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
	var log = this.$resource.log;
    var tc = this.pod._getClient(sysImports.auth.oauth);
    var profile = JSON.parse(sysImports.auth.oauth.profile);

    tc.get('/statuses/user_timeline.json',  { screen_name : profile.screen_name }, function(err, tweets) {
    	if (err) {
    		next(err);
    	} else {
            for (var i = 0; i < tweets.length; i++) {
                tweets[i].tweet_url = 'https://twitter.com/' + tweets[i].user.screen_name + '/statuses/' + tweets[i].id_str;
        		next(false, tweets[i]);
            }
    	}
    });
}

// -----------------------------------------------------------------------------
module.exports = UserTweets;
