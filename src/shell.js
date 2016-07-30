/*! shell v2.0.0 ~ (c) 2016 Terrill Dent ~ http://www.terrill.ca/shell/license */
/* globals SERVER_ADDRESS */
(function(){
    'use strict';

    if (!SERVER_ADDRESS) {
        console.error('Error: var SERVER_ADDRESS not defined!');
        return;
    }

        // Functions
    var requestVersion,
        checkCache,
        injectContent,
        showNoDataFailure,
        getById,
        restart,
        request,
        remove,
        addClass,
        removeClass,
        hasClass,
        init,

        // Variables
        styleTag,
        imgStyleTag,
        scriptTag,
        loader,

        // User Agent Sniffing
        ua       = navigator.userAgent.toLowerCase(),
        ipad     = ~ua.indexOf('ipad'),
        ios      = ipad || ~ua.indexOf('iphone') || ~ua.indexOf('ipod') ,
        android  = ~ua.indexOf('android') || ~ua.indexOf('silk') || ~ua.indexOf('htc_'),
        playbook = ua.indexOf( 'playbook' ),
        bb       = playbook || ~ua.indexOf('bb10' ),
        tablet   = playbook || ipad || window.innerWidth >= 768 || ( android && ua.indexOf('mobile') === -1 ),
        highres  = window.devicePixelRatio >= 2,
        vendor   = (ios? 'ios' : '') || (bb? 'bb' : '') || (android? 'android' : '') || 'ios',
        params   = '?vendor=' + vendor + (highres? '&highres=t' : '') + (tablet? '&tablet=t' : '');


    getById = function(id)
    {
        return document.getElementById(id);
    };

    request = function( url, successCallback, failureCallback, overrideMimeType, ignoreStatusCode )
    {
        var request = new XMLHttpRequest();
      
        request.open( 'GET', url, true );
        if( overrideMimeType ) {
            request.overrideMimeType('text/plain;charset=x-user-defined');
        }

        request.onreadystatechange = function()
        {
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

    remove = function( element )
    {
        if( element && element.parentNode ) {
            element.parentNode.removeChild( element );
        }
    };

    addClass = function( element, className )
    {
        if(!hasClass(element,className)){
            element.className += ' ' + className;
        }
    };

    removeClass = function( element, className )
    {
        if(hasClass(element,className)){
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            element.className = element.className.replace( reg, ' ' );
        }
    };

    hasClass = function( element, className )
    {
        return element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    };

    // TODO: Shown if there is no cached content and initialization fails
    showNoDataFailure = function()
    {
        console.log( 'no data to show, and init failed' );
    };

    requestVersion = function()
    {
        var curVersion = localStorage['shell-version'],
            firstLoad = !!curVersion;

        request( SERVER_ADDRESS + params + ( curVersion ? '&version=' + curVersion : '' ),
            function( statusCode, data ){
                if( !data ){ return; }

                try{
                    data = JSON.parse(data);
                }catch( e ){
                    if( !curVersion ){
                        showNoDataFailure();
                    }
                    return;
                }
                if( !data.version ){
                    console.log( 'Response has no version' );
                    return;
                }
                if( curVersion && data.version <= curVersion ){
                    console.log( 'we have this version' );
                    return;
                }

                console.log( 'saving response' );
                localStorage['shell-style']   = data.style;
                localStorage['shell-script']  = data.script;
                localStorage['shell-img']     = data.img;
                localStorage['shell-version'] = data.version;

                if(scriptTag) {
                    restart(firstLoad);
                } else {
                    checkCache();
                }
            },
            function(){
                // error case
                console.log( 'error requesting update from server' );
                if( !scriptTag ){
                    showNoDataFailure();
                }
            }
        );
    };

    injectContent = function( cachedStyle, cachedScript, cachedIMG )
    {
        if( scriptTag ){
            remove( scriptTag );
        }
        if( imgStyleTag ){
            remove( imgStyleTag );
        }
        if( styleTag ){
            remove( styleTag );
        }

        styleTag = document.createElement( 'style' );
        styleTag.type= 'text/css';
        styleTag.innerHTML = cachedStyle;

        imgStyleTag = document.createElement( 'style' );
        imgStyleTag.type= 'text/css';
        imgStyleTag.innerHTML = cachedIMG;

        document.getElementsByTagName('head')[0].appendChild(styleTag);
        document.getElementsByTagName('head')[0].appendChild(imgStyleTag);

        scriptTag = document.createElement( 'script' );
        scriptTag.type= 'text/javascript';
        scriptTag.textContent = cachedScript;

        try {
            document.body.appendChild( scriptTag );
        } catch( e ){
            console.log( e );
        }

        // Hide the loader
        addClass( loader, 'hide' );
        setTimeout( function(){
            addClass( loader, 'hidden' );
        }, 300);
    };

    restart = function()
    {
        checkCache();
    };

    checkCache = function()
    {
        var cachedScript = localStorage['shell-script'],
            cachedStyle  = localStorage['shell-style'],
            cachedIMG    = localStorage['shell-img'];

        if( cachedScript && cachedStyle ){
            console.log( 'injecting cached content' );
            injectContent( cachedStyle, cachedScript, cachedIMG );
        } else {
            console.log( 'cache miss' );
        }
    };

    init = function()
    {
        console.log( 'initializing' );
        loader = getById('base-loader');
        checkCache();
        requestVersion();
    };

    init();
}());


