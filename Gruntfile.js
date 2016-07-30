module.exports = function( grunt )
{
  var latest = '<%= pkg.name %>',
      name   = '<%= pkg.name %>-v<%= pkg.version%>';
       
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
        src : [ 'src/**/*.js' ]
      }
    },

    execute: {
      sample: {
        src: 'sample/server.js'
      }
    },

    uglify: {
      shell: {
        files: {
          'dist/shell.min.js': ['src/shell.js']
        }
      }
    },

    copy: {
      sample: {
        expand: true,
        cwd: 'src',
        src: '**',
        dest: 'sample/static/',
      },
    },

    watch: {
      shell: {
        files: 'src/**/*.*',
        tasks: ['build'],
        options: {
          livereload: true,
        },
      }
    },

    concurrent: {
      execAndWatch: [ 'execute:sample', 'watch' ],
      options: {
        logConcurrentOutput: true
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', [ 'jshint', 'uglify', 'copy:sample' ]);
  grunt.registerTask('default', [ 'build', 'concurrent:execAndWatch' ]);
};


