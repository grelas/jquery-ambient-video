module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Uglify
        uglify: {
            prod: {
                options: {
                    compress: true,
                    mangle: false,
                    compress: {
                        drop_console: true
                    },
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= pkg.author %>-' + '<%= grunt.template.today("yyyy-mm-dd") %> */' + '\n'
                },
                files: {
                    'js/<%= pkg.file %>.min.js': 'js/<%= pkg.file %>.js'
                }
            },
            dev: {
                options: {
                    mangle: false,
                    beautify: true,

                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= pkg.author %>- ' + '<%= grunt.template.today("yyyy-mm-dd") %> */' + '\n'
                },
                files: {
                    'js/<%= pkg.file %>.min.js': 'js/<%= pkg.file %>.js'
                }
            }
        },


        connect: {
            all: {
                options:{
                    port: 9000,
                    hostname: "0.0.0.0",
                    // Prevents Grunt to close just after the task (starting the server) completes
                    // This will be removed later as `watch` will take care of that
                    keepalive: true
                }
            }
        }


    });

    // https://github.com/sindresorhus/load-grunt-tasks
    require('load-grunt-tasks')(grunt);


    // " $ grunt build"
    grunt.registerTask('build', ['uglify:prod']);

    grunt.registerTask('dev', ['connect']);
};