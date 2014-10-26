define(function (require){
	var FH = function(){
		var _Running = false,
		_isScroll = true,
		_tst = 0,
		_tsp = null,
		_top_ = 0,
		_dx = 0,
		_dy = 0,
		/*
		*维护绑定队列
		*length: 绑定个数
		*push：加入一个元素
		*remove： 除去一个元素
		**/
		Targs = {
			length: 0,
			push: function(obj){
				if(obj.constructor != Object)
					return false;

				obj.acb = obj.acb || function(){};
				obj.dcb = obj.dcb || function(){};
				obj.h = obj.h || 0;
				obj.th = obj.th || 0;

				this[this.length++] = obj;
				return true
			},
			remove: function(el){
				for(var i = 0, l = Targs.length; i < l; i++){
					Targs[i].el == el && delete Targs[i];

					Targs.length -= 1;
					if(Targs.length <= 0)
						_Running = false;

					return true;
				}
				return false
			}
		};

		var fixHack = function(){
			/*
			*loop
			*处理绑定元素队列中
			**/
	        for(var i = 0, l = Targs.length; i < l; i++){
	        	var tar = Targs[i],
	        	rect = tar.el.getBoundingClientRect();

		        if(rect.top <= tar.h - tar.th && !tar._hstate){
					tar.acb();
					tar._hstate = true;
		        }else if(rect.top > tar.h - tar.th && !!tar._hstate){
		            tar.dcb();
					tar._hstate = false;
		        }
	        }
	    },

	    isneedDecelerate = function(t, y){
	    	var velocity = Math.abs(y) / t;
	      	log(velocity);
	    },

	    dampJudge = function(){

	    },

		bindEvent = function(){
			var self = this,
			ons = window.onscroll,

			clearTouch = function(){
				_tsp = null;
				_isScroll = true;
			},

		    onTouchStart = function(e){
				_tsp = {Y: e.touches[0].clientY, X: e.touches[0].clientX};
				_tst = e.timeStamp;
		    },

		    onTouchMove = function(e){
		        fixHack();

		        _dx = e.changedTouches[0].clientX - _tsp.X;
		  		_dy = e.changedTouches[0].clientY - _tsp.Y;

		  		var mh = Math.abs(_dx) > Math.abs(_dy);

		  		mh && (_isScroll = false);
		    },

		    onTouchEnd = function(e){
		    	if (!!_isScroll) {
		    		var dt = e.timeStamp - _tst;

		      		isneedDecelerate(dt, _dy);

		      		if(!!false){
		        		dampJudge(timer);
		      		}

		      		_top_ = document.body.scrollTop;
		      	}

		      	clearTouch();
		    },

		    handleEvent = function(e){
		    	switch (e.type) {
		            case 'touchstart':
		                onTouchStart(e);
		                break;
		            case 'touchmove':
		                onTouchMove(e);
		                break;
		            case 'touchend':
		                onTouchEnd(e);
		                break;
		        }
		    };

			window.onscroll = function(){
			    !!ons && ons();
			    _Running && fixHack();

			    /*
			    *hack计算弹性滚动滚了多远
			    **/
			    log(document.body.scrollTop - _top_);
			};
			
			/(ios|iphone|ipad|itouch)/g.test(window.navigator.userAgent.toLowerCase()) && function(){
			    document.addEventListener('touchstart', handleEvent, false);
			    document.addEventListener('touchmove', handleEvent, false);
			    document.addEventListener('touchend', handleEvent, false);
		    }();
		};

		bindEvent();

		return {
			/*
			*绑定元素
			*param: obj || {el: 参照元素, h: 触发位置，默认0, th: 目标元素距离参照元素顶部的距离, acb: 激活回调, dcb: 消除回调}
			**/
			bind: function(obj){
				if(obj.constructor != Object)
					return false;

				Targs.push(obj);
				_Running = true;
			},
			/*
			*接触元素绑定
			*param: el || DomNode
			**/
			remove: Targs.remove
		}
	}();

	return FH;
});