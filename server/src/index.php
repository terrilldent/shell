<?php

function get_mime_content_type( $filename )
{
    $mime_types = array(
        'png'  => 'image/png',
        'jpeg' => 'image/jpeg',
        'jpg'  => 'image/jpeg',
        'gif'  => 'image/gif'
    );
    
    $parts = explode( '.', $filename );
    $extension = strtolower( $parts[ 1 ] );
    
    if( array_key_exists( $extension, $mime_types ) ) {
        return $mime_types[ $extension ];
    }
}

function outputFileJsonString( $jsonName, $filename, $trailingComma ) 
{
    if( file_exists( $filename ) ){
        echo '"' . $jsonName . '" : ' . json_encode( file_get_contents( $filename ) );
        if( $trailingComma ){
            echo ",";
        }
    }
}

function outputFile( $jsonName, $filename, $trailingComma ) 
{
    if( file_exists( $filename ) ){
        
        $fileContent = file_get_contents( $filename );

        echo '"' . $jsonName . '" : ' . $fileContent;
     
        if( $trailingComma ){
            echo ",\n";
        }
    }
}

function addImagesInDir( &$map, $directory )
{
    if( $handle = @opendir( $directory ) ) {
        while( false !== ( $fileName = readdir( $handle ) ) ) {
        
            if( $fileName != "." && $fileName != ".." ) {
                if( file_exists( $directory . $fileName ) ) {
                    
                    $parts = explode( '.', $fileName );
                    $id = $parts[ 0 ];
                    
                    if( count( $parts ) > 1 ) {
                        $image = file_get_contents( $directory . $fileName );
                        $img64 = base64_encode($image); 
                        $mimeType = get_mime_content_type( $fileName );
                        if( $mimeType != null ) {
                            $map[$id] = ".{$id} { background-image: url(data:" . $mimeType . ";base64,{$img64});}\n";
                        }
                    }
                }
                
            }
        }
        closedir($handle);
    }
}

function outputImageCSS( $jsonName, $platform, $highres, $tablet, $trailingComma )
{
    $imageMap = array();

    addImagesInDir( $imageMap, 'img/' );
    if( $highres ){
        addImagesInDir( $imageMap, 'img/_2x/' );
    }
    if( strlen( $platform ) > 0 ){
        addImagesInDir( $imageMap, 'img/_' . $platform . '/'  );
    }
    if( $highres && strlen( $platform ) > 0 ){
        addImagesInDir( $imageMap, 'img/_' . $platform . '/2x' );
    }
    if( $tablet ){
        addImagesInDir( $imageMap, 'img/_tablet' );
    }
    if( $highres && $tablet ){
        addImagesInDir( $imageMap, 'img/_tablet/2x' );
    }

    $imageContent = '';
    foreach( $imageMap as $id => $encoding ){
        $imageContent .= $encoding;
    }

    echo '"' . $jsonName . '" : ' . json_encode($imageContent);

    if( $trailingComma ){
        echo ",\n";
    }
}

function compareVersion( $requestVersion )
{
    $serverVersion = intval( trim( file_get_contents( "VERSION.txt" ) ) );
    return intval( $requestVersion ) < $serverVersion;
}

function generateResponse()
{
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    $version  = isSet( $_GET[ 'version' ] ) ? preg_replace("/[^0-9]/", "", $_GET[ 'version' ] ) : 0;
    $highres  = isset( $_GET[ 'highres' ] );
    $tablet   = isset( $_GET[ 'tablet' ] );
    $platform = preg_replace("/[^a-zA-Z0-9]/", "", $_GET[ 'platform' ] );

    if( $platform !== 'ios' && $platform !== 'android' && $platform !== 'bb' ){
        $platform = 'ios';
    }

    if( !compareVersion($version) ){
        http_response_code(304);    // Not modified
        echo '{ "message": "No motified"}';
        return;
    }

    echo "{";
    outputFile( "version", "VERSION.txt", true );
    outputFileJsonString( "style",  $platform . "/style.min.css", true );
    outputFileJsonString( "script", $platform . "/script.min.js", true );
    outputFileJsonString( "html",   $platform . "/index.html", true );
    outputImageCSS( "img", $platform, $highres, $tablet, false );
    echo "}";
}

generateResponse();

?>