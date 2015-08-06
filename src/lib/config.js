;
(function(win, undef) {
	var conf = {
		"index": [{
			'name': 'scroll',
			'path': '../build/common/scoll_hack/scroll.js',
			'seq': 0
		}, {
			'name': 'index',
			'path': '../build/page/ing/index.js',
			'seq': 1
		}, {
			'name': 'common',
			'path': '../build/common/common.js'
		},{
			'name': 'tlog',
			'path': '../build/common/tLog/tlog.js'
		}]
	};

	win.res = conf;
})(window);