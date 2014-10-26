;
(function(lib, undef) {
	var syn = function(){
		this.conf = {
			'name': 'config',
			'path': '../build/common/config.js'
		};
		this.stack = [];
		this.init();
	}
	syn.prototype = {
		init: function(){
			this.addJS(this.conf.path, this.analy.bind(this));
		},
		kickass: function(){
			// $.use([page.yup]);
			require([page.yup]);
		},
		analy: function(){
			var res = window.res[page.type];
			
			if(!res)
				return

			for(var i in res)
				this.disp(res[i]);

			this.rely(0);
		},
		rely: function(no){
			var stack = this.stack, self = this, next = no + 1;

			var cb = null;

			if(next < stack.length)
				cb = function(){
					self.rely(next);
				}
			else
				cb = function(){
					self.kickass();
				}
			this.addJS(stack[no].path, cb);
		},
		disp: function(obj){
			if(typeof obj.seq == 'undefined')
				this.addJS(obj.path)
			else
				this.stack[obj.seq] = obj;
		},
		addJS: function(path, cb){
			var script = document.createElement('script');
			script.src = path;

			if(!!cb)
				script.onload = cb;

			document.head.appendChild(script);
		}
	};
	lib.synloader = new syn();
})(window['lib'] || (window['lib'] = {}));