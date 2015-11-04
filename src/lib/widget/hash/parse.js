define(function(){
    var parse = /\?/.test(window.location.href) ? window.location.href.match(/\?(.+)/)[1] : "";
    /\#\!/.test(parse) && (parse = parse.replace(/\#\!.*/, ''));
    return (function () {
        var obj = {};
        if (!!parse) {
            var m = parse.split("&");
            for (var i in m) {
                var t = m[i].split("=");
                obj[t[0]] = decodeURI(t[1]);
            }
        }
        return obj;
    })()
})
