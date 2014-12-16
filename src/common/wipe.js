/*
*created by Tao.z 2014/12/16
**/
var wipe = function(){
    var params = {
      startX: 0, 
      startY: 0,
      dx: 0,
      dy: 0
    },
    CLIENTHEIGHT = document.documentElement.clientHeight,
    _curWipe = '',
    _starttimer = null,
		_wapperEl = null,
		_contentEl = null;

    var options = {
      mindis: 100,
      minsec: 50,
      prefixList: ['-webkit-','-moz-','-ms-','-o-']
    };

    var rollback = function(timer){
      wipeTransition(_contentEl[_curWipe]);
      console.log('rollback');
    },

    setPrefixStyle = function(str){
      var val = str;
      for(var i in options.prefixList)
        val += options.prefixList[i] + str;
      return val;
    }

    wipeTransition = function(curPos){
      var transform = {
        dx: 'transform: translateX(@{dis}px);',
        dy: 'transform: translateY(@{dis}px);'
      };
      
      var val = setPrefixStyle(transform[_curWipe].replace(/\@\{dis\}/gi, curPos));
      // console.log('needYTransition: ' + curPos);
      _contentEl.setAttribute('style', val);
    },

    onTouchStart = function(e){
  		var target = e.target;
  		if(target.dataset['wipe'] != 'ignore'){
        e.preventDefault();
        e.stopPropagation();
        _starttimer = e.timeStamp;
        params.startX = e.touches[0].pageX;
        params.startY = e.touches[0].pageY;
      }
    },
    
    onTouchMove = function(e){
		  if(!!_starttimer){
	    	e.preventDefault();
	    	e.stopPropagation();

        params.dx = e.touches[0].clientX - params.startX;
	  		params.dy = e.touches[0].clientY - params.startY;
        
	  		var hm = Math.abs(params.dx) > Math.abs(params.dy);
	  		if(hm && _curWipe != 'dy') {
          /*
          *X
          **/
          _curWipe = 'dx';
          var curPos = _contentEl[_curWipe] + params[_curWipe];
          options.needXTransition && wipeTransition(curPos);
	      } else if(!hm && _curWipe != 'dx') {
      		/*
          *Y
          **/
          _curWipe = 'dy';
          var curPos = _contentEl[_curWipe] + params[_curWipe];
          options.needYTransition && wipeTransition(curPos);
	      }
	    }
    },

    endHandler = {
      dx: function(timer){
        var obj = {dis: params.dx, time: timer};
        if(params.dx > 0){
          options.wipeRight && options.wipeRight(obj);
        }else{
          options.wipeLeft && options.wipeLeft(obj);
        }
      },
      dy: function(timer){
        var obj = {dis: params.dy, time: timer};
        if(params.dy > 0){
          options.wipeDown && options.wipeDown(obj) ? (_contentEl[_curWipe] += CLIENTHEIGHT) : rollback(timer);
          console.log('_contentEl[_curWipe] :' + _contentEl[_curWipe]);
        }else{
          if(options.wipeUp && options.wipeUp(obj)){
            _contentEl[_curWipe] -= CLIENTHEIGHT;
            console.log('here: '+_contentEl[_curWipe]);
          }else{
            rollback(timer)
          }
        }
      },
    },

    onTouchEnd = function(e){
      if(!!_starttimer){
      	var timer = e.timeStamp - _starttimer;
        if(_curWipe == '')
          return;

        if(Math.abs(params[_curWipe]) > options.mindis || timer < options.minsec){
          endHandler[_curWipe](timer);
        }else{
          !!params[_curWipe] && rollback(timer);
        }
      	cancelTouch();
      }
    },

    cancelTouch = function(){
        params.startY = params.startX = params.dx = params.dy = 0;

        _starttimer = null;
		    _curWipe = 0;
    },
    setPrefixStyle = function(str){
        var val = str;
        for(var i in prefixList)
            val += prefixList[i] + str;
        return val;
    },
    reTransition = function(timer){
      var transition = setPrefixStyle('transition: all .6s cubic-bezier(0.2,0.2, 1, .70);');
      _contentEl.setAttribute('style', transition);
    },
    clearTransition = function(e){
      var transition = setPrefixStyle('transition: none;');
        _contentEl.setAttribute('style', transition);
    },
    handleEvent = function(e) {
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
        case 'webkitTransitionEnd', 'transitionEnd', 'mozTransitionEnd', 'msTransitionEnd':
          clearTransition(e);
          console.log('clear');
          break;
      }
    };
    return {
    	init: function(opt){
        if(!opt) var opt = {};

		    _wapperEl = opt.wapperEl;
  			_contentEl = opt.tarEl;
        _contentEl.dy = _contentEl.dx = 0;

        for( k in opt){
          options[k] = opt[k];
        }

		    _wapperEl.addEventListener('touchstart', handleEvent, false);
		    _wapperEl.addEventListener('touchmove', handleEvent, false);
		    _wapperEl.addEventListener('touchend', handleEvent, false);
		    _wapperEl.addEventListener('webkitTransitionEnd', handleEvent, false);
        _wapperEl.addEventListener('transitionEnd', handleEvent, false);
    	}
    };
}();
