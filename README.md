![](http://www.terrill.ca/projects/shelljs/banner.png)

# shell

Shell is a minimal reliable resource cache that lets you keep your application code on the server and ship just the shell in the app store. It works especially well for Cordova and Phonegap applications, providing the ability to instantly update your application on the App Store and Google Play without resubmitting for approval.

It's like a Service Worker polyfill for cached resource loading. 

### How does it work?

Using a small immediately invoked script, shell downloads and caches your application resources (CSS, JS, and Images) in local storage. When application is launched again the cached resources are injected, cutting out the round trips to the server. 

In the background the version will be checked against the server, and if an update is available it is automatically downloaded, cached, and applied. 

## Usage  

First, remove everything from your application except index.html, the App icons, and Splash Screens.

Your application `index.html` reduces to the minimal script import:

```
<!DOCTYPE html>
<html>
  <head>
  <meta charset="utf-8">
  <meta name="format-detection" content="telephone=no">
  <meta name="viewport" content ="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
</head>
<body>
<script>
  var SERVER_ADDRESS = 'https://www.example.com/api/app';
</script>
<script src="shell.js"></script>
</body>
</html>
```

On the server you build an endpoint that will serve the application resources as a single JSON response. There is a sample node server in `/sample/server.js`.

```
  // GET https://www.example.com/api/app

  {
    version: 6, 
    script: "the-etire-app-scripts-stringified"
    style: "the-entire-app-styles-stringified"
    img: "image-data-as-css-data-uris"
  } 
```

![](http://www.terrill.ca/projects/shelljs/launch_scenarios@2x.png)

