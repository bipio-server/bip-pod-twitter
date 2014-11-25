/**
 *
 * The Bipio Twitter Pod.  Twitter Actions and Content Emitters
 *
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2014 Michael Pearson https://github.com/mjpearson
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
var ntwitter = require('ntwitter');

var Pod = require('bip-pod'),
Twitter = new Pod();

Twitter._getClient = function(oauth) {
  var podConfig = this.getConfig();
  return new ntwitter({
    consumer_key : oauth.consmerKey || podConfig.oauth.consumerKey,
    consumer_secret : oauth.consumerSecret || podConfig.oauth.consumerSecret,
    access_token_key : oauth.token,
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
