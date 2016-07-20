var http  = require("http"),
    url   = require("url"),
    path  = require("path"),
    fs    = require("fs"),
    url   = require('url'),
    port  = process.argv[2] || 8892;

http.createServer(function(request, response) {
 
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri),
        requrl = url.parse(request.url, true),
        version  = (requrl && requrl.query) ? requrl.query.version : false,
        highres  = (requrl && requrl.query) ? requrl.query.highres : false,
        tablet   = (requrl && requrl.query) ? requrl.query.tablet : false,
        platform = (requrl && requrl.query) ? ( requrl.query.platform || 'ios' ): 'ios',
        addFolder;

    if( platform !== 'ios' && platform !== 'bb' && platform !== 'android' ){
        response.statusCode = 500;
        response.setHeader("Content-Type", "text/html");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        response.write( "Something is not right with the platform");
        response.end();
        return;
    }

    var EXTENSION_MIME_MAP = {
        gif: 'image/gif',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        txt: 'text/txt',
        css: 'text/css',
        html: 'text/html',
        js: 'application/javascript'
    };

    addFolder = function( map, folderPath )
    {
        var images;
        try {
            images = fs.readdirSync(path.join(process.cwd(), folderPath));
        }catch( e ){
            console.log( 'directory: ', folderPath, 'does not exist');
            return;
        }
        for (var i in images){
            var name = images[i];
            if( name === '.DS_Store' || name === '.' || name === '..' || name.charAt(0) == '_' || name == '2x' ){
                continue;
            }
            var fullpath = path.join(process.cwd(), folderPath) + name;
            var data = fs.readFileSync(fullpath);

            var lastDot = name.lastIndexOf('.'),
                id = name.substr( 0, lastDot ),
                ext = path.extname(name).substr(1),
                mime = EXTENSION_MIME_MAP[ ext ],
                base64data = new Buffer(data).toString('base64');    

            map[ id ] = "." + id + " { background-image: url(data:" + mime + ";base64," + base64data + ");}\n";
        }
    };

    if( uri.indexOf( '/app' ) === 0 ){
        console.log( '- app data requested' );

        var imageMap = {};

        addFolder( imageMap, 'img/' );
        if( highres ){
            addFolder( imageMap, 'img/_2x/' );
        }
        if( platform ){
            addFolder( imageMap, 'img/_' + platform + '/' );
        }
        if( highres && platform ){
            addFolder( imageMap, 'img/_' + platform + '/2x/' );
        }
        if( tablet ){
            addFolder( imageMap, 'img/_tablet/' );
        }
        if( highres && tablet ){
            addFolder( imageMap, 'img/_tablet/2x/' );
        }

        // Build CSS
        var imageCSS = '';
        for (var id in imageMap){
            if( imageMap.hasOwnProperty( id ) ){
                imageCSS += imageMap[ id ];
            }
        }

        fs.readFile(path.join(process.cwd(), 'VERSION.txt'), "binary", function(err, versionFile) {
            fs.readFile(path.join(process.cwd(), platform + '/index.html'), "binary", function(err, htmlFile) {
                fs.readFile(path.join(process.cwd(), platform + '/script.min.js'), "binary", function(err, scriptFile) {
                    fs.readFile(path.join(process.cwd(), platform + '/style.min.css'), "binary", function(err, styleFile) {

                        response.statusCode = 200;
                        response.setHeader("Content-Type", "application/json");
                        response.setHeader("Access-Control-Allow-Origin", "*");
                        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                        response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

                        response.write("{");
                        response.write("\"version\":" + JSON.stringify(versionFile) + ",");
                        response.write("\"style\":" + JSON.stringify(styleFile) + ",");
                        response.write("\"img\":" + JSON.stringify(imageCSS) + ",");
                        response.write("\"html\":" + JSON.stringify(htmlFile) + ",");
                        response.write("\"script\":" + JSON.stringify(scriptFile) ); 
                        response.write("}");   
                        response.end();

                    });
                });
            });
        });
        return;
    }

    console.log( '- ' + uri );
    
    path.exists(filename, function(exists) {
        var mime;

        if(!exists) {
            response.statusCode = 404;
            response.setHeader("Content-Type", "text/html");
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            response.write("<h1>404 Not Found</h1>");
            response.end();
            return;
        }
 
        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }

        mime = EXTENSION_MIME_MAP[ path.extname(filename).substr(1) ] || 'text/plain';
 
        fs.readFile(filename, "binary", function(err, file) {
            if(err) {        
                response.statusCode = 500;
                response.setHeader("Content-Type", "text/html");
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
                response.write(err + "\n");
                response.end();
                return;
            }
 
            response.writeHead(200, {"Content-Type": mime});
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(port, 10));
 
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
