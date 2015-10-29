define(function (require) {
    var url = /\?/.test(window.location.href) ? window.location.href.match(/\?(.+)/)[1] : "";
    /\#\!/.test(url) && (url = url.replace(/\#\!.*/, ''));
    return
        /**
         * 获取
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        function (key) {
            var p = url.split('&');
            var result = '';
            for(var i=0,len=p.length;i<len;i++){
                var obj = p[i].split('=');
                if(obj[0] == key){
                    result = obj[1];
                    break;
                }
            }
            return result;
        }
});
