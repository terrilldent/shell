module.exports = function( grunt )
{
  var latest = '<%= pkg.name %>',
      name   = '<%= pkg.name %>-v<%= pkg.version%>',
      sourceClient = 'client/',
      sourceServer = 'server/';
       
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        curly:true,
        eqeqeq: true,
        forin: true,
        immed:true,
        noarg:true,
        quotmark:'single',
        undef:true,
        unused:true,
        trailing: true,
        globals: {
          console: true,
          document: true,
          localStorage: true,
          navigator: true,
          setTimeout: true,
          window: true,
          XMLHttpRequest: true
        }
      },
      target: {
        src : [ sourceClient + '**/*.js' ]
      }
    },

    nodestatic: {
      server: {
        options: {
          port: 8887,
          base: 'client/src',
          keepalive: true
        }
      }
    }

  });
 
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-nodestatic');

  grunt.registerTask('default', [ 'jshint', 'nodestatic' ]);
};


