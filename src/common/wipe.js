/*
*created by Tao.z 2012/12/16
**/

/************************************************
wipe.init({
    wapperEl: document.body,
    tarEl: document.getElementById('ul'),
    needTransition: true,
    wipeRight: function(obj){
        return obj.dis;
    },
    wipeLeft: function(obj){
        return obj.dis;
    },
    wipeUp: function(obj){
      return obj.dis;
    },
    wipeDown: function(obj){
      return obj.dis;
    }
});
************************************************/
var wipe = function(){
  var params = {
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0
  },
  CLIENTHEIGHT = document.documentElement.clientHeight,
  CLIENTWIDTH = document.documentElement.clientWidth,
  _curWipe = '',
  _starttimer = null,
  _wapperEl = null,
  _contentEl = null;

  var options = {
    mindis: 100,
    minsec: 50,
    prefixList: ['-webkit-','-moz-','-ms-','-o-']
  };

  var _fn_rollback = function(timer){
    options.wipeTransition(_contentEl.dx, _contentEl.dy);
    console.log('rollback');
  },

  setPrefixStyle = function(str){
    var val = str;
    for(var i in options.prefixList)
      val += options.prefixList[i] + str;
    return val;
  }

  _fn_wipeTransition = function(x,y){
    var val = setPrefixStyle('transform: translate3d(@{disx}px, @{disy}px, 0);'.replace(/\@\{disx\}/i, x).replace(/\@\{disy}/i, y));
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
        var curPos = _contentEl.dx + params.dx;
        options.needTransition && options.wipeTransition(curPos, _contentEl.dy);
      } else if(!hm && _curWipe != 'dx') {
        /*
        *Y
        **/
        _curWipe = 'dy';
        var curPos = _contentEl.dy + params.dy;
        options.needTransition && options.wipeTransition(_contentEl.dx, curPos);
      }
    }
  },

  endHandler = {
    dx: function(timer){
      var obj = {dis: params.dx, time: timer}, ret = null;
      if(params.dx > 0){
        options.wipeRight && (ret = options.wipeRight(obj))
      }else{
        options.wipeLeft && (ret = options.wipeLeft(obj))
      }
      return ret
    },
    dy: function(timer){
      var obj = {dis: params.dy, time: timer};
      if(params.dy > 0){
        options.wipeDown && (ret = options.wipeDown(obj));
      }else{
        options.wipeUp && (ret = options.wipeUp(obj));
      }
      return ret
    },
  },

  onTouchEnd = function(e){
    if(!!_starttimer){
      var timer = e.timeStamp - _starttimer;
      if(_curWipe == '')
        return;

      if(Math.abs(params[_curWipe]) > options.mindis || timer < options.minsec){
        var ret = endHandler[_curWipe](timer);
        ret ? (_contentEl[_curWipe] += ret) : options.rollback(timer);
      }else{
        !!params[_curWipe] && options.rollback(timer);
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
      for(var i in options.prefixList)
          val += options.prefixList[i] + str;
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
      options.wipeTransition = options.wipeTransition || _fn_wipeTransition;
      options.rollback = options.rollback || _fn_rollback;

      _wapperEl.addEventListener('touchstart', handleEvent, false);
      _wapperEl.addEventListener('touchmove', handleEvent, false);
      _wapperEl.addEventListener('touchend', handleEvent, false);
      _wapperEl.addEventListener('webkitTransitionEnd', handleEvent, false);
      _wapperEl.addEventListener('transitionEnd', handleEvent, false);
    }
  };
}();
