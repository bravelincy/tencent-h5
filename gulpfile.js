'use strict';
var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

//sass编译、自动前缀
gulp.task('styles', function () {
	return gulp.src('src/sass/**/*.scss')
		.pipe($.sass({outputStyle: 'expanded'}))
		.pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Android > 2.2', 'IOS > 5']}))
		.pipe(gulp.dest('.tmp/css'))
		.pipe(reload({stream: true}));
});

//html引用资源替换
gulp.task('html', ['styles'], function () {
	var assets = $.useref.assets({searchPath: ['.tmp', 'src']});

	return gulp.src('src/*.html')
		.pipe(assets)
		.pipe($.if('*.min.js', $.uglify()))
		.pipe($.if('*.min.css', $.minifyCss()))
		.pipe(assets.restore())
		.pipe($.useref())
		.pipe(gulp.dest('dist'));
});

//启动调试服务
gulp.task('serve', function () {
	browserSync({
		server: {
			baseDir: ['.tmp', 'src']
		},
		notify: false
	});

	gulp.watch(['src/sass/**/*.scss'], ['styles']);
	gulp.watch(['src/**/*', '!src/sass/**/*'], reload);
});

//启动服务
gulp.task('serve:dist', ['copy'], function () {
	browserSync({
		server: 'dist',
		notify: false
	});
});

//拷贝发布代码
gulp.task('copy', ['clean', 'html'], function () {
	return gulp.src('src/!(sass|js)/**/*')
		.pipe(gulp.dest('dist'));
});

//清理目录文件
gulp.task('clean', function () {
	gulp.src(['.tmp','dist'], {read: false}).pipe($.clean());
});

//注册默认任务
gulp.task('default', ['serve:dist']);