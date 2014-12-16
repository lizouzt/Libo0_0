define(function (require){
	var FH = function(){
		var _Running = false,
		_isScroll = true,
		_tst = 0,		//touch start time
		_tsp = null,	//touch start point
		_top_ = 0,      //scrollTop
		_dx = 0,        //delta x
		_dy = 0,        //delta y
		_pdy = 0,       //previous dy
		_hc = 0,        //hold count
		_hcTimer = null,//hold counter 计时器
		_IOSVersion = function(){
		    var v = false;
		    var agent = window.navigator.userAgent;
		    if(agent && /iphone|ipad|ipod|itouch/i.test(agent)){
		      	var r = agent.match(/OS\ (\d_\d)/);
		      	v = !!r && r[1] ? r[1] : false;
		    }
		    return v;
		}(),

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

		/*
		*loop
		*处理绑定元素队列中
		**/
		var fixHack = function(alfa){
			alfa = alfa || 0;

	        for(var i = 0, l = Targs.length; i < l; i++){
	        	var tar = Targs[i],
	        	rect = tar.el.getBoundingClientRect().top + alfa;

	        	// alfa != 0 && log((rect <= tar.h - tar.th) + '****' + rect + '****'+alfa);
		        if(rect <= tar.h - tar.th && !tar._hstate){
					tar.acb();
					tar._hstate = true;
		        }else if(rect > tar.h - tar.th && !!tar._hstate){
		            tar.dcb();
					tar._hstate = false;
		        }
	        }
	    },

	    /*
	    *计算是否会做弹性滚动
	    *params {t,y} || t：touchmove时长，y: touchmove距离
	    **/
	    isneedDecelerate = function(t, y){
	    	var velocity = y / t;
	      	if((_hc == 0 && Math.abs(velocity) > 0.174) || _hc < 2 && Math.abs(velocity) > 0.3)
	      		return velocity;
	      	else
	      		return false;
	    },
	    /*
	    *计算弹性滚动距离
	    *params {v：速率}
	    **/
	    dampJudge = function(v){
	    	var damp = v * 750;
	    	fixHack(damp)
	    },
	    /*
	    *事件绑定
	    **/
		bindEvent = function(){
			var self = this,
			ons = window.onscroll,

			clearTouch = function(){
				_tsp = null;
				_tst = 0,
				_isScroll = true;
				_dx = 0;
				_dy = 0;
				_pdy = 0;
				_hc = 0;

				!!_hcTimer && clearInterval(_hcTimer);
			},

		    onTouchStart = function(e){
				_tsp = {Y: e.touches[0].clientY, X: e.touches[0].clientX};
				_tst = e.timeStamp;
		    },

		    onTouchMove = function(e){
		    	if(!_tst)
		    		return
		    	else if(!_hc){
		    		/*
		    		*弥补TouchMove触发间隔手onscroll控制
		    		**/
		    		_hcTimer = setInterval(function(){
		    			Math.abs(_pdy - _dy) < 3 && _hc++;
		    		}, 200);
		    	}

		        fixHack();

		        _dx = e.changedTouches[0].clientX - _tsp.X;
		  		_dy = e.changedTouches[0].clientY - _tsp.Y;

		  		var mh = Math.abs(_dx) > Math.abs(_dy);

		  		mh && (_isScroll = false);

		  		Math.abs(_pdy - _dy) < 3 && _hc++;

		  		_pdy = _dy;
		    },

		    onTouchEnd = function(e){
		    	if (!!_isScroll) {
		    		var dt = e.timeStamp - _tst;

		      		var isneed = isneedDecelerate(dt, _dy);

		      		if(!!isneed){
		        		dampJudge(isneed);
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

		    /*
		    *IOS6、7
		    **/		    
			window.onscroll = function(){
			    !!ons && ons();
			    _Running && fixHack();

			    /*
			    *计算弹性滚动滚了多远
			    **/
			};

			document.addEventListener('touchstart', handleEvent, false);
			document.addEventListener('touchmove', handleEvent, false);
			document.addEventListener('touchend', handleEvent, false);
		};

		var publicBind = function(obj){
			if(obj.constructor != Object)
				return false;

			Targs.push(obj);
			_Running = true;
		};
		
		bindEvent();
		/********************
		*IOS8 测试不支持sticky，还得查
		*********************
		if(!_IOSVersion || parseInt(_IOSVersion[0]) < 7){
			bindEvent();
		}else{
			publicBind = function(obj){
				!!obj && obj.targetEl && obj.targetEl.setAttribute('style', 'position:-webkit-sticky; position:sticky;');
			}
		}
		***********************/

		return {
			/*
			*绑定元素
			*param: obj || {el: 参照元素, targetEl: 目标元素[可以缺省], h: 触发位置，默认0, th: 目标元素距离参照元素顶部的距离, acb: 激活回调, dcb: 消除回调}
			**/
			bind: publicBind,
			/*
			*接触元素绑定
			*param: el || DomNode
			**/
			remove: Targs.remove
		}
	}();

	return FH;
});
