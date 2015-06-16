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

  _fn_wipeTransition = function(x,y){
    var val = setPrefixStyle('transform: translate3d(@{disx}px, @{disy}px, 0);'.replace(/\@\{disx\}/i, x).replace(/\@\{disy}/i, y));
    _contentEl.setAttribute('style', val);
  },

  _fn_clearTransition = function(e){
    var transition = setPrefixStyle('transition: none;');
      _contentEl.setAttribute('style', transition);
  },

  setPrefixStyle = function(str){
    var val = str;
    for(var i in options.prefixList)
      val += options.prefixList[i] + str;
    return val;
  }

  onTouchStart = function(e){
    var target = e.target;
    if(target.dataset['wipe'] != 'ignore'){
      _starttimer = e.timeStamp;
      params.startX = e.touches[0].pageX;
      params.startY = e.touches[0].pageY;
    }
  },
  
  onTouchMove = function(e){
    if(!_starttimer)
      return
    e.preventDefault();
    e.stopPropagation();

    params.dx = e.touches[0].clientX - params.startX;
    params.dy = e.touches[0].clientY - params.startY;

    if(!_curWipe){
      var adx = Math.abs(params.dx), ady = Math.abs(params.dy);
      if (adx + ady > 10) {
        var hm = adx > ady;
        _curWipe = hm ? 'dx' : 'dy';
      };
    }
    !!_curWipe && options.needTransition && options.wipeTransition(params.dx, params.dy);
  },

  endHandler = {
    dx: function(timer){
      var ret = options.wipeRight ? 0 : params.dx;
      var obj = {dis: params.dx, time: timer};
      if(params.dx > 0){
        options.wipeRight && (ret = options.wipeRight(obj))
      }else{
        options.wipeLeft && (ret = options.wipeLeft(obj))
      }
      return ret
    },
    dy: function(timer){
      var ret = options.wipeDown ? 0 : params.dy;
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
    if(!!_starttimer && _curWipe){
      var timer = e.timeStamp - _starttimer;

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
        options.clearTransition(e);
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
      options.clearTransition = options.clearTransition || _fn_clearTransition;

      _wapperEl.addEventListener('touchstart', handleEvent, false);
      _wapperEl.addEventListener('touchmove', handleEvent, false);
      _wapperEl.addEventListener('touchend', handleEvent, false);
      _wapperEl.addEventListener('webkitTransitionEnd', handleEvent, false);
      _wapperEl.addEventListener('transitionEnd', handleEvent, false);
    }
  };
}();