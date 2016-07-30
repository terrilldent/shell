(function(){
  var clearCache, 
      init;

  clearCache = function( prefix )
  {
    var i, key;
    for( i = localStorage.length - 1; i >= 0 ; i-- ){
      key = localStorage.key( i );
      if( key.indexOf( prefix ) === 0 ) {
        localStorage.removeItem( key ); 
      }
    }
  };

  init = function(){
    var clearButton = document.getElementById('clear');
    clearButton.addEventListener('click', function(){
      clearCache('shell');
      console.log( 'test' );
    }, true);
  };

  init();

}());