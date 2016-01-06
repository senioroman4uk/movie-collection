/**
 * Created by Vladyslav on 04.01.2016.
 */

module.exports = function (grunt) {

  grunt.config.set('shell', {
    buildModernizr: {
      options: {
        stderr: false
      },
      command: 'node node_modules/modernizr/bin/modernizr -c modernizr-config.json -d assets/js/modernizr.js'
    }
  });

  grunt.loadNpmTasks('grunt-shell');
};
