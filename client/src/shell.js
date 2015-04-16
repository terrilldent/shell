/*! shell v1.0.0 ~ (c) 2015 Terrill Dent ~ http://www.terrill.ca/shell/license */
!(function(){

        // Variables
    var SERVER_ADDRESS = 'http://www.example.com/app-dist/',

        // Functions
        requestVersion,
        injectStyle,
        injectScript,
        checkStyle,
        checkScript,
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
        htmlTag,
        scriptTag,
        loader,
        params,
        initialized = true;


    (function(){
        var ua   = navigator.userAgent.toLowerCase(),
            ipad     = ua.indexOf( 'ipad' ) > -1, 
            ios      = ipad || ua.indexOf( 'ipod' ) > -1 || ua.indexOf( 'iphone' ) > -1,
            bb10     = !ios && ua.indexOf( 'bb10' ) > -1 ,
            playbook = !ios && ua.indexOf( 'playbook' ) > -1,
            bb       = bb10 || playbook,
            android,
            tablet,
            highres,
            vendor;
            
        android  = !ios && ( ua.indexOf( 'android' ) > -1 || 
                             ua.indexOf( 'silk' ) > -1 || 
                             ua.indexOf( 'htc_' ) > -1 ),
        ipad     = ipad || window.innerWidth >= 768,
        tablet   = playbook || ipad || window.innerWidth >= 768 ||
                    ( android && ua.indexOf( 'mobile' ) == -1 ),
        highres = window.devicePixelRatio >= 2,

        vendor = (ios? 'ios' : '') || (bb? 'bb' : '') || (android? 'android' : '') || 'ios';

        params = '?vendor=' + vendor + (highres? '&highres=t' : '') + (tablet? '&tablet=t' : '');
    }());


    getById = function(id)
    {
        return document.getElementById(id);
    };

    request = function( url, successCallback, failureCallback, overrideMimeType, ignoreStatusCode ) 
    {
        var request = new XMLHttpRequest();
        
        request.open( "GET", url, true );
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
    }

    remove = function( element )
    {
        if( element && element.parentNode ) {
            element.parentNode.removeChild( element );
        }
    };

    addClass = function( element, className )
    {
        if(!hasClass(element,className)){
            element.className += " " + className;
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

    // Shown if there is no cached content and initialization fails
    showNoDataFailure = function(){
        // TODO: 
        console.log( 'no data to show, and init failed' );
    };

    requestVersion = function(){
        var curVersion = localStorage['shell-version'];
            firstLoad = !!curVersion;

        request( SERVER_ADDRESS + params + ( curVersion ? '&version=' + curVersion : '' ), 
            function( statusCode, data, contentType ){
                if( !data ){ return; }

                try{
                    data = JSON.parse(data);
                }catch( e ){
                    if( !initialized ){
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
                localStorage['shell-html']    = data.html;

                if( initialized ) {
                    restart(firstLoad);
                } else {
                    checkCache();
                }
            },
            function(){
                // error case
                console.log( 'error requesting update from server' );
                if( !initialized ){
                    showNoDataFailure();
                }
            }
        );
    };

    injectContent = function( cachedStyle, cachedHTML, cachedScript, cachedIMG ) {
        var fragment;

        if( scriptTag ){
            remove( scriptTag );
        }
        if( htmlTag ){
            remove( htmlTag );
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

        fragment = document.createDocumentFragment();
        htmlTag = document.createElement( 'div' );
        htmlTag.id = 'shell-app';
        htmlTag.innerHTML = cachedHTML;
        fragment.appendChild( htmlTag );

        scriptTag = document.createElement( 'script' );
        scriptTag.type= 'text/javascript';
        scriptTag.textContent = cachedScript;
        fragment.appendChild( scriptTag );

        try {
            document.body.appendChild( fragment );
        } catch( e ){
            console.log( e );
        }

        // Hide the loader
        addClass( loader, 'hide' );
        setTimeout( function(){
            addClass( loader, 'hidden' );
        }, 300);
    };

    restart = function(){
        checkCache();
    };

    checkCache = function(){
        var cachedScript = localStorage['shell-script'],
            cachedStyle  = localStorage['shell-style'],
            cachedHTML   = localStorage['shell-html'],
            cachedIMG    = localStorage['shell-img'];

        if( cachedScript && cachedStyle ){
            console.log( 'injecting cached content' );
            injectContent( cachedStyle, cachedHTML, cachedScript, cachedIMG );
            initialized = true;
        } else {
            console.log( 'cache miss' );
        }
    };

    init = function(){
        console.log( 'initializing' );
        loader = getById('base-loader');
        checkCache();
        requestVersion();
    };

    init();
}());


