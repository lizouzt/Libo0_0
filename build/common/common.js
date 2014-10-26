;(function($,w){
  var isRetina = (function(){
    var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
    (min--moz-device-pixel-ratio: 1.5),\
    (-o-min-device-pixel-ratio: 3/2),\
    (min-resolution: 1.5dppx)";
    if (w.devicePixelRatio > 1)
      return true;
    if (w.matchMedia && w.matchMedia(mediaQuery).matches)
      return true;
    return false;
  })();

  $.isOS = function(){
    var agent = window.navigator.userAgent.toLowerCase();
    var os = agent.match(/(android|ios)/g);
    if(!!os)
      return os[0]
    else
      return os
  };

  $.isRetina = function (size2X , size1X){
    if(size2X && size1X){
      return isRetina?size2X:size1X;
    }
    return isRetina;
  };

  $.fn.inView = function(distance) {
      var st = $(window).scrollTop(),
          distance = distance + 400 || 400,
          offset = $(this).offset(), 
          stop = offset['top'],
          bottom = stop + offset['height'],
          vh = window.innerHeight;
          // console.log('view:' + distance);
      return (stop >= st-distance && stop <= st + vh+distance)||(bottom >= st-distance && bottom <= st + vh+distance);
  };

})(Zepto,window);