'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    tempBase: 'temp',
    srcBase: 'src',
    buildBase: 'build',
    less: {
      compile: {
        files: [{
          expand: true,
          cwd: '<%= srcBase %>',
          src: ['lib/**/*.less','p/**/*.less','!lib/*.less','!lib/deps/**/*.less'],
          dest: '<%= buildBase %>',
          ext: '.css'
        }]
      }
    },
    cssmin: {
      combine: {
        expand: true,
        cwd: '<%= buildBase %>',
        src: ['**/*.css', '!**/*-min.css', '!lib/deps/**/*.less'],
        dest: '<%= buildBase %>',
        ext: '.css'
      }
    },
    jst:{
      complie:{
        options:{
          amd:true,
          prettify:true,
          namespace:false,
          templateSettings : {},
          processContent: function(src) {
            return src.replace(/\r\n/g, '\n');
          }
        },
        files:[{
          expand: true,
          cwd: '<%= srcBase %>',
          src: ['**/*.jst.html'],
          dest: '<%= srcBase %>',
          ext: '.jst.js'
        }]
      }
    },
    transport: {
      options: {
        debug: false,
        paths:['src']
      },
      trans: {
        expand: true,
        cwd: '<%= srcBase %>',
        src: ['lib/**/*.js', '!lib/**/*-min.js', '!lib/deps/**/*.js'],
        dest: '<%= tempBase %>'
      }
    },
    concat: {
      mod: {
        options: {
          include: 'all',
          paths: ['temp'],
          separator: ';',
        },
        files: [{
          expand: true,
          cwd: '<%= tempBase %>',
          src: ['lib/**/*.js','!lib/**/*.jst.js','!lib/deps/*.js'],
          dest: '<%= tempBase %>',
          ext: '.js'
        }]
      }
    },
    copy: {
      main: {
        expand: true,
        cwd: '<%= tempBase %>',
        src: ['lib/**/*.js','!**/mod/'],
        dest: '<%= buildBase %>',
        ext: '.org.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n /**********************************************\n * Handcrafted by <%= pkg.author.name %>, <%= pkg.author.url %>\n **********************************************/\n'
      },
      build: {
        expand: true,
        cwd: '<%= buildBase %>',
        src: ['**/*.org.js','!**/*-min.js','!lib/deps/**/*.js'],
        dest: '<%= buildBase %>',
        ext: '.js'
      }
    },
    clean:{
      temp:{
        src:'<%= tempBase %>'
      }
    },

    browserSync: {
      files: ['./build/**/*.css','./srlib/**/*.js'],
      options: {
        watchTask: true,
        server: {
          baseDir: "./",
          index: "./html/index.html"
        },
      }
    },

    watch:{
      options: {
        ignoreInitial: true,
        ignored: ['*.txt','*.json']
      },
      assets:{
        files: ['./srlib/**/*.less','./srlib/**/*.jst.html'],
        tasks: ['less','jst']
      }
    },
  });

  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-cmd-concat');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', [
    'jst', 
    'transport', 
    'concat',
    'copy',
    'uglify',
    'less', 
    'cssmin', 
    'clean'
  ]);

  grunt.registerTask('sync', ['browserSync','watch']);

  grunt.registerTask('js', [
    'jst',
    'transport',
    'concat',
    'copy',
    'clean'
  ]);

  grunt.registerTask('css', [
    'less', 
    'cssmin',
    'clean'
  ]);
};