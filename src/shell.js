/*! shell v2.0.0 ~ (c) 2016 Terrill Dent ~ http://www.terrill.ca/projects/shelljs/license */
/* globals SERVER_ADDRESS */
(function(){
  'use strict';

  if (!SERVER_ADDRESS) {
    console.error('Error: var SERVER_ADDRESS not defined!');
    return;
  }

    // Configuration
  var DEBUG_OUTPUT = true,
      SIMULATE_OLD_CACHE = false,
      SIMULATE_EMPTY_CACHE = false,
      
      // Functions
      requestVersion,
      request,
      remove,
      clearStorage,
      checkCache,
      showNoDataFailure,
      injectContent,
      init,
      log,

      // Variables
      platform,
      styleTag,
      scriptTag,
      params,
      mobile,
      initialized;

  log = function(msg){
    if(DEBUG_OUTPUT){
      console.log(msg);
    }
  };

  (function(){
    var ua   = navigator.userAgent.toLowerCase(),
        ipad     = ua.indexOf( 'ipad' ) > -1,
        ios      = ipad || ua.indexOf( 'ipod' ) > -1 || ua.indexOf( 'iphone' ) > -1,
        bb10     = !ios && ua.indexOf( 'bb10' ) > -1 ,
        playbook = !ios && ua.indexOf( 'playbook' ) > -1,
        bb       = bb10 || playbook,
        android  = !ios && (ua.indexOf( 'android' ) > -1 || ua.indexOf( 'silk' ) > -1 || ua.indexOf( 'htc_' ) > -1),
        tablet   = playbook || ipad || window.innerWidth >= 768 || ( android && ua.indexOf( 'mobile' ) === -1 ),
        highres  = window.devicePixelRatio >= 2;

    platform = (ios? 'ios' : '') || (bb? 'bb' : '') || (android? 'android' : '') || 'ios';

    params = '?platform=' + platform + (highres? '&highres=t' : '') + (tablet? '&tablet=t' : '');
    mobile = ios || android || bb;

    log( '- shell: config: ' + params );
  }());

  request = function( url, successCallback, failureCallback, overrideMimeType, ignoreStatusCode ){
    var request = new XMLHttpRequest();

    request.open( 'GET', url, true );
    if( overrideMimeType ) {
      request.overrideMimeType('text/plain;charset=x-user-defined');
    }

    request.onreadystatechange = function() {
      if( this.readyState === 4 ) {
        if( this.status === 200 || ignoreStatusCode ) {
          if( successCallback ) {
            successCallback( request.status, request.responseText, request.getResponseHeader('Content-Type') );
            successCallback = null; // prevent double calling for local ajax calls
          }
        } else if( failureCallback ) {
          failureCallback( request.status, request.responseText, request.getResponseHeader('Content-Type') );
        }
      }
    };
    request.send( true );
  };

  showNoDataFailure = function()
  {
    console.log( 'no data to show, and init failed' );
    // TODO: Implement your error screen
  };

  clearStorage = function() {
    // Clean up CSS
    var i = 0, key;
    for( i = localStorage.length - 1; i >= 0 ; i-- ){
      key = localStorage.key( i );
      if(key !== 'uid')  {
        localStorage.removeItem( key );
      }
    }
  };

  requestVersion = function(){
    var curVersion = localStorage['shell-version'];

    request( SERVER_ADDRESS + params + ( curVersion ? '&version=' + curVersion : '' ),
      function(statusCode, data) {
        if( !data ){ return; }

        try{
          data = JSON.parse(data);
        }catch( e ){
          console.log(e);
          showNoDataFailure();
          return;
        }
        if( !data.version ){
          log( '- shell: response has no version' );
          return;
        }
        if( curVersion && data.version <= curVersion ){
          log( '- shell: we have this version' );
          if (!SIMULATE_OLD_CACHE) {
            return;
          }
          log( '- shell: (SIMULATE_OLD_CACHE) continuing anyway' );
        }

        log( '- shell: clearing storage' );
        clearStorage();

        log( '- shell: caching response' );
        localStorage['shell-style']   = data.style;
        localStorage['shell-script']  = data.script;
        localStorage['shell-img']     = data.img;
        localStorage['shell-version'] = data.version;
        checkCache();
      },
      function(statusCode){
        // error case
        if( statusCode === 304 ){
          log( '- shell: we have the correct version' );
          return;
        }
        log( '- shell: error requesting update from server: ' + statusCode );
        showNoDataFailure();
      }
    );
  };

  remove = function( element ){
    if( element && element.parentNode ) {
      element.parentNode.removeChild( element );
    }
  };

  injectContent = function( cachedStyle, cachedScript, cachedIMG ){
    remove( scriptTag );
    remove( styleTag );

    styleTag = document.createElement( 'style' );
    styleTag.type= 'text/css';
    styleTag.appendChild(document.createTextNode(cachedStyle + ' ' + (cachedIMG || '')));

    scriptTag = document.createElement( 'script' );
    scriptTag.type= 'text/javascript';
    scriptTag.textContent = cachedScript;

    document.getElementsByTagName('head')[0].appendChild(styleTag);
    try {
      document.body.appendChild(scriptTag);
    } catch( e ){
      log( '- shell: error inserting app fragment: ' + e );
      log( '- This typically happens when there is a bug in the app initialization code.' );
      log( '- This is a good thing to report to the server!' );
    }
  };

  checkCache = function(){
    var cachedScript = localStorage['shell-script'],
        cachedStyle  = localStorage['shell-style'],
        cachedIMG    = localStorage['shell-img'];

    if( cachedScript && cachedStyle ){
      log( '- shell: injecting cached content' );
      injectContent( cachedStyle, cachedScript, cachedIMG );
      initialized = true;
      return true;
    }
    log( '- shell: cache miss' );
    return false;
  };

  init = function(){
    log( '- shell: initializing' );
    if( SIMULATE_EMPTY_CACHE || !checkCache() ){
      requestVersion();
    } else {
      // Request the new version later
      setTimeout( function(){
        requestVersion();
      }, SIMULATE_OLD_CACHE ? 0 : 500);
    }
  };

  init();
}());


