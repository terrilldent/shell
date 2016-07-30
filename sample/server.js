var http  = require("http"),
    url   = require("url"),
    path  = require("path"),
    fs    = require("fs"),
    url   = require('url'),
    port  = process.argv[2] || 8889;

/** 
 * Sample nodeJS Server that serves up static files from `/static` if they exist.
 * 
 * Custom handler for `/app` requests, generating a document with all the app resources: 
 * 
 * {
 *   version: 6, 
 *   script: "the-etire-app-scripts"
 *   style: "the-entire-app-styles"
 *   img: "image-data-as-css-data-uris"
 * } 
 * 
 */

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

var addImageFolder = function( map, folderPath )
{
    var images;
    try {
        images = fs.readdirSync(path.join(process.cwd(), folderPath));
    }catch( e ){
        console.log( 'directory: ' + folderPath + ' does not exist');
        return;
    }
    for (var i in images){
        var name = images[i];
        if( name === '.DS_Store' || name === '.' || name === '..' || name.charAt(0) == '_' ){
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

var setHeaders = function(response, contentType) {
    response.setHeader("Content-Type", "text/html");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
}

http.createServer(function(request, response) {

    // Handle requests for App Resources
    var uri = url.parse(request.url).pathname;
    if( uri.indexOf( '/app' ) === 0 ){
        var query    = url.parse(request.url, true).query || {},
            version  = query.version
            highres  = query.highres
            imageMap = {},
            imageCSS = '';

        console.log( '- /app requested' );

        // Create a map of all the images as Data URIs
        addImageFolder( imageMap, 'img/' );
        if( highres ){ addImageFolder( imageMap, 'img/_2x/' ); }

        // Build Image CSS
        for (var id in imageMap){
            if( imageMap.hasOwnProperty( id ) ){
                imageCSS += imageMap[ id ];
            }
        }

        response.statusCode = 200;
        setHeaders(response, "application/json");

        response.write("{");
        response.write("\"version\":" + JSON.stringify(fs.readFileSync(path.join(process.cwd(), '/sample/app/VERSION.txt'), "binary")) + ",");
        response.write("\"style\":"   + JSON.stringify(fs.readFileSync(path.join(process.cwd(), '/sample/app/style.css'), "binary")) + ",");
        response.write("\"script\":"  + JSON.stringify(fs.readFileSync(path.join(process.cwd(), '/sample/app/app.js'), "binary")) + "," ); 
        response.write("\"img\":"     + JSON.stringify(imageCSS));
        response.write("}");   
        response.end();
        return;
    }

    // Handle Static Resources
    var filename = path.join(process.cwd(), '/sample/static/', uri);
    fs.exists(filename, function(exists) {
        var mime;

        if(!exists) {
            console.log( '- 404: ' + uri );
            response.statusCode = 404;
            setHeaders(response, "text/html");
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
                console.log( '- 500: ' + uri );
                response.statusCode = 500;
                setHeaders(response, "text/html");
                response.write(err + "\n");
                response.end();
                return;
            }
 
            console.log( '- 200: ' + uri );
            response.writeHead(200, {"Content-Type": mime});
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(port, 10));
 
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
