/*jshint node: true*/

'use strict';

module.exports = {
    dev: {
        options: {
            jshintrc: true
        },
        files: {
            src: [
                '<%= meta.cwdAll %>.js',
                '!<%= meta.buildAll %>',
                '!<%= meta.testAll %>',
                '!<%= meta.npmAll %>'
            ]
        }
    }
};
