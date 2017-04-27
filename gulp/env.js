

var gulp = require('gulp'),
ngConfig = require('ng-config'),
fs = require('fs'),
config = require('../.config.js');
var argv = require('yargs').argv;
var ENV = (argv.env === undefined)? 'development':argv.env;
console.log('Setting environment: ' + ENV);

gulp.task('env', function(callback) {
    var options = {
            constants: config.environments[ENV]
        };
    var configApp = ngConfig(options);
    fs.writeFileSync('src/app/config.js', ngConfig(options));
    callback();
});

