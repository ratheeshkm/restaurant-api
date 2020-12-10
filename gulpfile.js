var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();


gulp.task('gulp_nodemon', function (done) {
	nodemon({
		script: 'index.js'
		, ext: 'js'
		, env: { 'NODE_ENV': 'development' }
		, done: done
	});
	done();
});


gulp.task('sync', function (done) {
	browserSync.init({
		injectChanges: true,
		port: 5002, //this can be any port, it will show our app
		proxy: 'http://localhost:5000/', //this is the port where express server works
		ui: { port: 5003 }, //UI, can be any port
		reloadDelay: 1000 //Important, otherwise syncing will not work
	});

	gulp.watch(['./**/*.js', './**/*.html', './**/*.css']).on("change", browserSync.reload);
	done();
});

