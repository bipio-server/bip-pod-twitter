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
function OnLocalTweets() {
}

OnLocalTweets.prototype = {};

OnLocalTweets.prototype.trigger = function(imports, channel, sysImports, contentParts, next) {
	var $resource = this.$resource;
	this.invoke(imports, channel, sysImports, contentParts, function(err, tweet) {
		$resource.dupFilter(tweet, 'id', channel, sysImports, function(err, tweet) {
			if (!err) {
				tweet.user_name = tweet.user.name;
				tweet.tweet_url = 'https://twitter.com/' + tweet.user.screen_name + '/statuses/' + tweet.id_str;
			}
			next(err, tweet);
		});
	});
}

OnLocalTweets.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
	var log = this.$resource.log;
    var tc = this.pod._getClient(sysImports.auth.oauth);
    var profile=JSON.parse(sysImports.auth.oauth.profile);
    tc.get('/geo/search.json',  { query : profile.location }, function(err, exports) {
    	if (err) {
    		next(err);
    	} else {
    			var placeId=exports.result.places[0].id;
        	    tc.get('/search/tweets.json',  { q : 'place:'+placeId}, function(err, exports) {
        	    	if (err) {
        	    		next(err);
        	    	} else {
        	    		for (var i = 0; i < exports.statuses.length; i++) {
                            exports.statuses[i].tweet_url = 'https://twitter.com/' + exports.statuses[i].user.screen_name + '/statuses/' + exports.statuses[i].id_str;
        	    			next(false, exports.statuses[i]);
        	    		}
        	    	}
        	    });
    	}
    });
}

// -----------------------------------------------------------------------------
module.exports = OnLocalTweets;
