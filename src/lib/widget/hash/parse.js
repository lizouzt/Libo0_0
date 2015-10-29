define(function(){
    var hash = /\#\!/.test(window.location.hash) ? window.location.hash.match(/\#\!(.+)/)[0] : "";
    /\?/.test(hash) && (hash = hash.replace(/\?.*/, ''));
    return (function () {
        var obj = {};
        if (hash.indexOf("#!" == 0)) {
            hash = hash.substring(2);
            var m = hash.split("&");
            for (var i in m) {
                var t = m[i].split("=");
                obj[t[0]] = decodeURI(t[1]);
            }
        }
        return obj;
    })()
})
