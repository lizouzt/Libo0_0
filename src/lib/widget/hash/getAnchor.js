define(function (require) {
    return {
        /**
         * 获取
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        get : function(key){
            var url = window.location.hash;
            var p = url.substring(2,url.length).split('&');
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
    };
});