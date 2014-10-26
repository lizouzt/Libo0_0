;
(function(lib){
	var getMaxRockMiles = function(el){
		var viewHeight = el.parentElement.clientHeight;
		if(el.parentElement.tagName == 'BODY')
			viewHeight = screen.height;

		var rect = el.getBoundingClientRect();
		
		return viewHeight - rect.height;
	}

	var El_SCROLL = function(el, options){
		/*
		*分析过后结论：还是需要一个EL，可以满足页面内div内容滚动的需求。ps:独立div touch一样会有弹跳机制。
		**/
		this.element = el;
		
		this.offset = 0;
		this.__maxRockMiles = 0;
		this.__handling = false;
		this.__prevTop = 0;

		var self = this;

		var _opts = {
            isBounce: true,
            scrollBar: true,
            padding: {
                top: 0,
                bottom: 0
            },
            bounceOffset: {
                top: 0,
                bottom: 0
            }
        };

        for(key in _opts){
            if(!options[key])
                options[key] = _opts[key];
        }

        var i = 0;
        var launch = function(){
        	eventEncap();
        	damping();
        },
        eventEncap = function(){
        	var killMove = function(e){
        		e.preventDefault();
        	},
        	removeListener = function(){
        		document.body.removeEventListener('touchmove', killMove, true);
        		self.element.removeEventListener('webkitAnimationEnd', removeListener, false);
        		console.log('removed' + (i++));
        	}

        	document.body.addEventListener('touchmove', killMove, true);
        	self.element.addEventListener('webkitAnimationEnd', removeListener, false);
        },
        edgeDetection = function(){
    		var top = self.element.getBoundingClientRect().top;

    		var downward = self.__prevTop > top;
			self.__prevTop = top;

    		if(top <= self.__maxRockMiles - 1 && downward)
    			return true
    		else
    			return false
    	},
        damping = function(){
        	/*
        	*damping simulator
        	**/
        	console.log('damping');
        	$(self.element).trigger('webkitAnimationEnd');
        },
		scrollHandler = function(e){
        	var isComming = edgeDetection();
        	
        	if(isComming) {
        		console.log('yes');
        		launch();
        	}
        }

        window.onscroll = scrollHandler;

        this.init();
	};
	El_SCROLL.prototype = {
		init: function(){
			this.handle().refresh();
			console.log('El_SCROLL inited!');

			return this;
		},
		handle: function(){
			this.__handling = true;
			return this;
		},
		letItGo: function(){
			this.__handling = false;
			return this;
		},
		refresh: function(){
			/*
			*装在内容后调用
			**/
			this.__maxRockMiles = getMaxRockMiles(this.element);
			this.scrollThumb.update();
			return this;
		},
		scrollThumb: {
			/*
			*好像不需要啊，再考虑
			**/
			init: function(){

			},
			update: function(){

			}
		}
	};

	lib.RockIt = El_SCROLL;
})(window.lib || (window['lib'] = {}));