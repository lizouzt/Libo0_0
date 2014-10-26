;
(function(lib){
	var temp ={
		logdom: '<nav class="t_nav">'
                +'<ul class="t_tab">'
                    +'<li class="t_type active" data-type="all">All</li>'
                    +'<li class="t_type" data-type="errors">Errors</li>'
                    +'<li class="t_type" data-type="logs">Logs</li>'
                +'</ul>'
                +'<div class="t_ctrl">'
                    +'<div class="t_btn" data-func="resize">R</div>'
                    +'<div class="t_btn" data-func="locate">P</div>'
                +'</div>'
                +'<div class="t_btn close">X</div>'
            +'</nav>'
            +'<div class="t_box all">'
            +'</div></div>'
            +'<div class="t_holder"></div>',

        logcss: ''
	};

	var TLog = function(){
		this.__islog = false;
		this.cursize = 0;
		this.sizes = ['small', 'normal', 'huge'];

		var self = this;

		var insertDom = function(){
			var w = document.createElement('div');
			w.id = "t_log";
			w.className = "hide";
			w.innerHTML = temp.logdom;

			var css = document.createTextNode(temp.logcss),
			style = document.createElement('style');
			style.appendChild(css);

			document.head.appendChild(style);
			document.body.insertAdjacentElement('beforeend', w);

			self.tab = w.querySelector('.t_tab');
			self.ctrl = w.querySelector('.t_ctrl');
			self.box = w.querySelector('.t_box');
			self.lamp = w.querySelector('.t_holder');
			self.el = w;
		},
		func = {
			resize: function(){
				var cursize = self.cursize,
				sizes = self.sizes,
				cur = sizes[cursize],
				nexts = (cursize + 1) % 3,
				next = sizes[nexts];

				self.cursize = nexts;
				self.el.classList.remove(cur);
				self.el.classList.add(next);
			},
			locate: function(){
				self.el.classList.toggle('up');
			}
		},
		tabHandler = function(e){
			var el = e.target,
			query = oquery = '',
			type = el.dataset['type'];

			if(!type || /active/.test(el.className))
				return;

			if(type == 'all'){
				query = '.t_item[data-type]';
			}else {
				query = '.t_item[data-type="' + type + '"]';
				oquery = '.t_item:not([data-type="' + type + '"])';
			}

			showitems = self.box.querySelectorAll(query);
			!!oquery && (hideItems = self.box.querySelectorAll(oquery));

			el.classList.add('active');
			!!this.cur && this.cur.classList.remove('active');
			this.cur = el;
			self.box.className = 't_box ' + type;

			show(showitems);
			hide(hideItems);
		},
		ctrlHandler = function(e){
			var el = e.target,
			fn = el.dataset['func'];

			!!fn && func[fn]();
		},
		lampHandler = function(e){
			this.classList.remove('lamp');
			self.show.call(self);
		},
		register = function(){
			var hover = function(e){
				e.preventDefault();
			}

			self.tab.cur = self.tab.querySelector('.t_type[data-type=all]');
			self.tab.addEventListener('click', tabHandler, false);
			self.ctrl.addEventListener('click', ctrlHandler, false);
			self.lamp.addEventListener('click', lampHandler, false);

			self.el.querySelector('.close').addEventListener('click', function(){
				self.close.call(self);
			}, false);

			self.box.addEventListener('click', function(e){
				var tar = e.target,
				tcn = tar.className;

				if(tcn == 't_icon')
					tar.parentNode.classList.toggle('unfold');
			}, false);
		},
		hide = function(doms){
			for(var i = 0, l = doms.length; i < l; i++)
				doms[i].style.display = 'none';
		},
		show = function(doms){
			for(var i = 0, l = doms.length; i < l; i++)
				doms[i].style.display = 'block';
		};

		insertDom();
		register();

		window.onerror = function(){
			self.lamp.classList.add('error');
			self._log.call(self, 'error');
		}

		window.log = self._log.bind(self);

		log('w y want? I really wanna to know that!');
		json = {name: 'hahah', key: 'chchc', sexy: ['boy', 'girl'], wtf: {f1: 'yoyo', f2: 'wowo'}}
		log(json);
	};
	TLog.prototype = {
		_temp: {
			'item': '<div class="t_item {%valtype%}" data-type="{%itemtype%}"><i class="t_icon"></i><div class="t_msg">{%item%}</div></div>',
			'key_val': '<span class="tvo_p {%nodetype%}"><em class="t_key">{%key%}</em><em class="t_val">{%val%}</em></span>',
			'Obj': '<span class="tt_obj">Object&nbsp;{</span>{%obj%}}',
		},
		init: function(opts){
			/*
			*opts={
			*	cursize: 设置大小huge|normal|small,
			*	curlocate: 设置位置是否上显示
			*}
			**/
			var opts = opts || {},
			curlocate = '';
			!!opts.cursize && (this.cursize = opts.cursize);
			!!opts.curUp && (curlocate = 'up');
			this.el.className += ' ' + this.sizes[this.cursize] + curlocate;
		},
		show: function(){
			this.el.classList.remove('hide');
			return this;
		},
		close: function(e){
			this.el.classList.add('hide');
			return this;
		},
		_exceTemp: function(temp, data){
			var keys = temp.match(/(\{\%([a-zA-Z0-9]+)\%\})/g);
			for(k in keys){
				var val = data[keys[k].slice(2,-2)] || '';
				temp = temp.replace(keys[k], val);
			}

			return temp;
		},
		_log: function(data, type){
			type = type || 'ms';

			if(type != 'logs' && !!/hide/.test(this.el.className))
				this.lamp.classList.add('lamp');

			if(typeof(data) == 'string')
				this._msglog(data);
			else if(typeof(data) == 'object')
				this._objlog(data);
			else if(type == 'error')
				this._erlog(data);
			else if(type == 'warn')
				this._warnlog(data);
			else
				this._msglog(JSON.stringify(data));
			this.box.scrollTop = this.box.scrollHeight
		},
		_msglog: function(str){
			var html = this._exceTemp(this._temp.item, {item: str, itemtype: 'logs'});
			this.box.insertAdjacentHTML('beforeend', html);
		},
		_objlog: function(data){
			var self = this;
			var objctr = function(key, val){
				var str_val = '', nodetype = '';

				if(val.constructor == String)
					str_val = '"' + val + '"';
				else if(val.constructor == Array){
					str_val = '<span class="tt_obj" data-val="' + btoa(JSON.stringify(val)) + '">Array[' + val.length + ']</span>';
					nodetype = 'tvop_obj';
				}else if(val.constructor == Boolean)
					str_val = '"' + val + '"';
				else if(val.constructor == Object){
					str_val = '<span class="tt_obj" data-val="' + btoa(JSON.stringify(val)) + '">Object</span>';
					nodetype = 'tvop_obj';
				}else if(val.constructor == Function)
					str_val = val.toString();
				else
					str_val = val.toString();

				return self._exceTemp(self._temp.key_val, {key: key + ':', val: str_val, nodetype: nodetype});
			};

			var key_str = '';
			for(key in data){
				key_str += objctr(key, data[key]);
			}
			
			var obj_str = this._exceTemp(this._temp.Obj, {obj: key_str});
			this._exceData({item: obj_str, itemtype: 'logs', valtype: 't_v_obj'});
		},

		/*
		*   解析日志HTML
		*	params [item] 		日志填充html
		*	params [itemtype]   日志类型 errors || logs
		*	params [valtype]	日志数据类型 Object || Array ||
		**/
		_exceData: function(opts){
			var options = {
				item: opts.item,
				itemtype: opts.itemtype || 'logs',
				valtype: opts.valtype || ''
			};

			var html = this._exceTemp(this._temp.item, opts);
			this.box.insertAdjacentHTML('beforeend', html);
		},
		_erlog: function(){
			var html = '<h5 class="t_item" data-type="errors">' + str + '</h5>';
			this.box.insertAdjacentHTML('beforeend', html);
		},
		_warnlog: function(){
			var html = '<h5 class="t_item" data-type="errors">' + str + '</h5>';
			this.box.insertAdjacentHTML('beforeend', html);
		}
	};

	lib.tlog = TLog;
	
	window.onload = function(){
		new lib.tlog().init();
	}

})(window.lib || (window['lib'] = {}));