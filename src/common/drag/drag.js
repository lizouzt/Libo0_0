
/*
* use case
*Drag({
*		el:'drag_p2',
*		range: {range_point_one_x, range_point_one_y, range_point_two_x, range_point_two_y},
*		start: function(){
*			this.el.classList.add('active');
*			//code
*		},
*		move: function(){
*			var subx = this.el.style.left.substring(0,this.el.style.left.length-2),
*				suby = this.el.style.top.substring(0,this.el.style.top.length-2);
*			//code
*		},
*		end:function(e){
*			this.el.classList.remove('active');
*			//code
*		}
*	});
**/

var Drag = (function(){
		var SupportsTouches = ("ontouchstart" in document),
		Events = SupportsTouches ? {
			StartEvent: "ontouchstart", 
			MoveEvent: "ontouchmove",
			EndEvent: "ontouchend"
		} : {
			StartEvent: "onmousedown", 
			MoveEvent: "onmousemove",
			EndEvent: "onmouseup"
		},

		$ = function(id){
			return document.getElementById(id);
		},
		preventDefault = function(ev){
			!!ev ? ev.preventDefault() : window.event.returnValue = false;
		},
		getMousePoint=function(ev){
			var x = y = 0;
			if(SupportsTouches){
				var evt = ev.touches.item(0);
				x = evt.pageX;
				y = evt.pageY;
			}else{
				x = ev.clientX;
				y = ev.clientY;
			}
			return {'x' : x, 'y' : y};
		};
		function _drag(opt){
			this.el = typeof opt.el == 'string' ? $(opt.el) : opt.el;
			this.range = opt.range || null;
			this.onstart = opt.start || new Function();
			this.onmove = opt.move || new Function();
			this.onend = opt.end || new Function();
			this.action = false;
			this.init();
		}
		_drag.prototype={
			init:function(){
				this.el[Events.StartEvent] = function(e){
					preventDefault(e);
					if(this.action)return false;
					else this.action = true;
					this.startPoint = getMousePoint(e);
					var leftS = this.el.offsetLeft;
					var topS = this.el.offsetTop;
					this.onstart();
					document[Events.MoveEvent] = function(e){
						preventDefault(e);
						this.nowPoint = getMousePoint(e);
						var left = this.nowPoint.x - this.startPoint.x + leftS,
							top = this.nowPoint.y - this.startPoint.y + topS;
						(!this.range || (left >= this.range.x1) && left <= this.range.x2) && (this.el.style.left = left + 'px');
						(!this.range || (top >= this.range.y1) && top <= this.range.y2) && (this.el.style.top = top + 'px');
						this.onmove();
					}.bind(this);
					document[Events.EndEvent] = document['ontouchcancel'] = function(){
						document[Events.EndEvent] = document['ontouchcancel'] = document[Events.MoveEvent] = null;
						this.action = false;
						this.onend();
					}.bind(this);
				}.bind(this);
			},
			bind:function(fn,obj){
				return function(){
					fn.apply(obj,arguments);
				}
			}
		}
		return function(opt){
			return new _drag(opt);
		}
})();