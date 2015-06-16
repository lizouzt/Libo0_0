;(function(win, lib){
    /**
     * lossy 有损压缩
     * lossless 无损压缩 
     * alpha 透明通道 如带透明通道的png
     * animation 动画 如gif
     */
    var KEY = 'webp_support_',
    typeObj = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };

    /*
    *舍去基于ua的不严谨判断
    **/
    function isSupport(cb, type) {
        if(!cb) return
        type = type || "lossy";
        var storage = win.localStorage;
        var val = storage && storage.getItem(KEY+type);
        if(val) {
            cb(val == 'true');
        } else {
            var img = new Image;
            img.onload = function() {
                var is = img.width > 0 && img.height > 0;
                cb(is);
                storage.setItem(KEY+type, is);
            };
            img.onerror = function() {
                cb(false);
                storage.setItem(KEY+type, false);
            };
            img.src = "data:image/webp;base64," + typeObj[type];
        }
    }

    var webp = {};
    webp.isSupport = isSupport;
    lib.webp = webp;
})(window, window.lib || (window['lib'] = {}));
