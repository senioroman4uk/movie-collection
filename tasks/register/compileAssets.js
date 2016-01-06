module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'jst:dev',
		'less:dev',
    'shell:buildModernizr',
		'copy:dev',
		'coffee:dev'
	]);
};
