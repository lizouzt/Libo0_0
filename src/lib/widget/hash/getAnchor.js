define(function (require) {
    var hash = /\#\!/.test(window.location.hash) ? window.location.hash.match(/\#\!(.+)/)[1] : "";
        /\?/.test(hash) && (hash = hash.replace(/\?.*/, ''));
    return
        /**
         * 获取
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        function (key) {
            var p = hash.split('&');
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
