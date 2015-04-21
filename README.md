# shell

Instantly update Cordova and Phonegap based mobile applications on the App Store and Google Play, without resubmitting your app for approval. 

The App Store does not allow you to download code changes on the fly, *unless your code is running inside a WebView.* 

If you have a Cordova/PhoneGap app your entire application can be hosted on a server, rather than bundled into your application. 

SHELL is a small script that will download and cache your entire application (HTML,CSS,JS, and Images) in local storage. It also stores a version. 

Each time your application is launched the cached code is injected. In the background the version will be checked against the server, and if an update is available it is automatically downloaded, cached, and applied. 


