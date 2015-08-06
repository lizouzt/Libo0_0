/*
* overried
* */
!function (name, context, definition) {
  if (typeof define == 'function') define(definition)
  else if (typeof module != 'undefined') module.exports = definition()
  else context[name] = definition()
}('utils', this, function(){
  /*
  * set base rem
  * */
  document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + 'px';

  var _ = window._ || (window._ = {});
  
  /*
  * iterator for array and object
  * */
  _.each = function(obj, iteratee, context){
    var i, length;
    if ($.isArr(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee.call(context, obj[i], i, obj);
      }
    } else {
      for (key in obj) {
        iteratee.call(context, obj[key]);
      }
    }
    return obj;
  }
  /*
  * extend first level key value
  * @param {object} object
  * @param {object} object
  * */
  _.extend = function (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }
    
    return object;
  }
  /*
  * extend all level key value
  * @param {object} object
  * @param {object} object
  * */
  _.extendDeep = function(a, b){
    if ("_" in window) {
      for (var k in b) {
        if ( $.isObj(b[k]) )
          arguments.callee(a[k], b[k]);
        else 
          (a[k] = b[k]);
      }
      return a
    }
  }

  _.isFunc = function(a){
    return toString.call(a) === "[object Function]"
  }

  _.isArr = function(a){
    return toString.call(a) === "[object Array]"
  }

  _.isObj = function(a){
    return toString.call(a) === "[object Object]"
  }

  _.isNum = function(a){
    return toString.call(a) === "[object Number]" && a.toString() != "NaN"
  }

  _.isCH = function(a){
    return /[\u4E00-\u9FFF]+/.test(a)
  }
  /*
  * device pixel ratio
  * */
  _.isRetina = (function(){
    var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
    (min--moz-device-pixel-ratio: 1.5),\
    (-o-min-device-pixel-ratio: 3/2),\
    (min-resolution: 1.5dppx)";
    if (window.devicePixelRatio > 1)
      return true;
    if (window.matchMedia && window.matchMedia(mediaQuery).matches)
      return true;
    return false;
  })();
  /*
  * simple XSS replace
  * */
  _.strXSSCheck = function(str){
    return str.replace(/[\'\"\>\<\s]/g, "");
  };

  /*
  * escape functional for html
  * */
  (function(){
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#96;'
    },
    htmlUnEscapes = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#96;': '`'
    };

    var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
        reUnescapedHtml = /[&<>"'`]/g;

    function escapeHtmlChar(chr) {
      return htmlEscapes[chr];
    }

    function escape(string) {
      // reset `lastIndex` because in IE < 9 `String#replace` does not
      string = (string == null) ? '' : String(string);
      return string && (reUnescapedHtml.lastIndex = 0, reUnescapedHtml.test(string))
        ? string.replace(reUnescapedHtml, escapeHtmlChar)
        : string;
    }
    function unescape(string) {
      string = (string == null) ? '' : String(string);
      return string && (reEscapedHtml.lastIndex = 0, reEscapedHtml.test(string))
        ? string.replace(reEscapedHtml, htmlUnEscapes)
        : string;
    }

    var _ = root._ || {};
    _.escape = _.escape || window.escape || escape;
    _.unescape = _.unescape || window.unescape || unescape;
  })();
});