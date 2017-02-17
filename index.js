/**
 *
 * The Bipio Twitter Pod.  Twitter Actions and Content Emitters
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
var ntwitter = require('ntwitter');

var Pod = require('bip-pod'),
Twitter = new Pod();

Twitter.profileReprOAuth = function(profile) {
  return '@' + profile.screen_name;
}

Twitter._getClient = function(oauth) {
  return new ntwitter({
    consumer_key : oauth.consumerKey,
    consumer_secret : oauth.consumerSecret,
    access_token_key : oauth.access_token,
    access_token_secret : oauth.secret
  });
}

Twitter._getMentions = function(oauth, params, callback) {
  this._getClient(oauth).get(
    '/statuses/mentions_timeline.json',
    params,
    callback
  );
}

// -----------------------------------------------------------------------------
module.exports = Twitter;
