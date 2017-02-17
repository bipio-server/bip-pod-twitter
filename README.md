![Twitter](twitter.png) bip-pod-twitter
=======

[Twitter](https://www.twitter.com/) pod for [bipio](https://bip.io).

## Installation

From bipio server root directory

    npm install bip-pod-twitter
    ./tools/pod-install.js -a twitter [-u optional account-wide channel auto install]

The pod-install script is a server script which will register the pod with the bipio server and add sparse
configuration to your NODE_ENV environment config ('default.json', staging or production)
keyed to 'twitter', based on the default config in the pod constructor.  It will also move the
pod icon into the server cdn

Manually restart the bipio server at your convenience.

## Twitter App Registration

A Twitter Consumer Key and Secret is needed to use this pod.  Register your application at https://apps.twitter.com/app

**note** When setting 'callback url' on Twitter, **do not** use `localhost` and do not leave the field empty.  Use something like `http://example.org`.  BipIO will figure out the rest. [reference](https://dev.twitter.com/discussions/5749)

## Documentation

[Bipio Docs](https://bip.io/docs/pods/twitter)

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
