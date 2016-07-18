/************************************************
wipe.init({
    wapperEl: document.body,
    tarEl: document.getElementById('ul'),
    needTransition: true,
    needLoop: true,
    wipeRight: function(obj){
        return obj.dis; //反馈实际位置便宜量
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
  CLIENTHEIGHT  = document.documentElement.clientHeight,
  CLIENTWIDTH   = document.documentElement.clientWidth,
  LOOPTIMER     = 3000,
  _curWipe      = '',
  _starttimer   = null,
  _wapperEl     = null,
  _contentEl    = null,
  _enabled      = true,
  _isUserHandleActive = false,
  _preventClick = false;
  HANDLER       = {};

  HANDLER.dx    = false;
  HANDLER.dy    = false;

  var SupportsTouches = ("ontouchstart" in document);

  var options = {
    mindis: 60,
    minsec: 50,
    prefixList: ['-webkit-','-ms-']
  };

  var _fn_rollback = function(timer){
    options.wipeTransition(_contentEl.dx, _contentEl.dy);
  },

  _fn_wipeTransition = function(x,y){
    var val = _contentEl._orgStyle + setPrefixStyle('transform: translate3d(@{disx}px, @{disy}px, 0);'.replace(/\@\{disx\}/i, x).replace(/\@\{disy}/i, y));
    _contentEl.setAttribute('style', val);
  },

  _fn_clearTransition = function(e){
    var transition = _contentEl._orgStyle + setPrefixStyle('transition: none;');
      _contentEl.setAttribute('style', transition);
  },

  setPrefixStyle = function(str){
    var val = str;
    for(var i in options.prefixList)
      val += options.prefixList[i] + str;
    return val;
  },

  getPointPositionObj = (function () {
    return SupportsTouches ? function (e) {
      return {
        X: e.touches[0].pageX,
        Y: e.touches[0].pageY
      }
    } : function (e) {
      return {
        X: e.clientX,
        Y: e.clientY
      }
    }
  })(),

  onTouchStart = function (e) {
    var target = e.target;
    _preventClick = false;
    if(target.dataset['wipe'] != 'ignore' && _enabled){
      _isUserHandleActive = true;
      _starttimer = e.timeStamp;

      var point = getPointPositionObj(e);
      params.startX = point.X;
      params.startY = point.Y;
    }
  },
  
  onTouchMove = function(e){
    if(!_starttimer) {
      return false;
    }

    _preventClick = true;

    var point = getPointPositionObj(e);
    params.dx = point.X - params.startX;
    params.dy = point.Y - params.startY;

    if(!_curWipe){
      var adx = Math.abs(params.dx), ady = Math.abs(params.dy);
      if (adx + ady > 10) {
        var hm = adx > ady;
        _curWipe = hm ? 'dx' : 'dy';
      };
    }

    if (HANDLER[_curWipe]) {
      e.preventDefault();
      e.stopPropagation();
      !!_curWipe && options.needTransition && options.wipeTransition(params.dx, params.dy);
    }
  },

  endHandler = {
    dx: function(timer){
      var ret = options.wipeRight ? 0 : params.dx;
      var obj = {dis: params.dx, time: timer};
      if(params.dx > 0){
        options.wipeRight && (ret = options.wipeRight(obj));
      }else{
        options.wipeLeft && (ret = options.wipeLeft(obj));
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
    }
    cancelTouch();
  },

  clearHandlerStateTimer = null,
  cancelTouch = function(){
    _isUserHandleActive && (clearHandlerStateTimer = setTimeout(function () {
      !_starttimer && (_isUserHandleActive = false);
    }, 600));

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
      case 'mousedown':
        onTouchStart(e);
        break;
      case 'touchmove':
      case 'mousemove':
        onTouchMove(e);
        break;
      case 'touchend':
      case 'mouseup':
        onTouchEnd(e);
        break;
      case 'webkitTransitionEnd': 
      case 'transitionEnd':
      case 'mozTransitionEnd':
      case 'msTransitionEnd':
        options.clearTransition(e);
        break;
    }
  };
  return {
    init: function(opt){
      if(!opt) var opt = {};

      _wapperEl     = opt.wapperEl;
      _contentEl    = opt.tarEl;
      _contentEl.dy = _contentEl.dx = 0;

      _contentEl._orgStyle = _contentEl.getAttribute('style');

      for(var k in opt){
        options[k] = opt[k];
      }
      options.wipeTransition = options.wipeTransition || _fn_wipeTransition;
      options.rollback = options.rollback || _fn_rollback;
      options.clearTransition = options.clearTransition || _fn_clearTransition;

      if ('wipeRight' in options || 'wipeLeft' in options) 
        HANDLER.dx = true;
      if ('wipeUp' in options || 'wipeDown' in options)
        HANDLER.dy = true;

      var Events = SupportsTouches ? {
        StartEvent: "touchstart", 
        MoveEvent: "touchmove",
        EndEvent: "touchend"
      } : {
        StartEvent: "mousedown", 
        MoveEvent: "mousemove",
        EndEvent: "mouseup"
      };
      _wapperEl.addEventListener(Events.StartEvent, handleEvent, false);
      _wapperEl.addEventListener(Events.MoveEvent, handleEvent, false);
      _wapperEl.addEventListener(Events.EndEvent, handleEvent, false);
      _wapperEl.addEventListener('webkitTransitionEnd', handleEvent, false);
      _wapperEl.addEventListener('transitionEnd', handleEvent, false);
      _wapperEl.addEventListener('click', function (e) {
        if (_preventClick) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, false);

      if (options.needLoop) {
        setInterval(function() {
          !_isUserHandleActive && endHandler['dx'](0);
        }, LOOPTIMER);
      }
    },
    disable: function () {
      _enabled = false;
    },
    enable: function () {
      _enabled = true;
    }
  };
}();
module.exports = wipe;
