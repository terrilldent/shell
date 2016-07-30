# shell

Shell is like a Service Worker polyfill for cached resource loading.  

Note: This is a work in progress, but a variant of it is powering an app in production.

It allows you to instantly update Cordova and Phonegap based mobile applications on the App Store and Google Play without resubmitting your app for approval. Typically the App Store does not allow you to download code changes on the fly, unless your code is running inside a WebView. 

You can use it on regular websites to achieve instant resource load times and save data transmission.

If you have a Cordova/PhoneGap app your entire application can be hosted on a server, rather than bundled into the app store deployable. 

## How does it work?

Shell is a small immediately invoked script that downloads and caches your application resources (HTML,CSS,JS, and Images) in local storage. It also stores a version code. 

When application is launched again the cached code is injected, cutting out the round trips to the server. In the background the version will be checked against the server, and if an update is available it is automatically downloaded, cached, and applied. 

