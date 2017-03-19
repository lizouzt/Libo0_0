define(['lib/utils/api-bucket','lib/utils/utils'], function(bucket){
    var lib = window.lib || (window['lib'] = {});
    /*
    *接口映射模块
    * 接口地址管理
    * 开发环境切换
    * 接口入参验证
    **/
    var API = (function(){
        /*
        *环境配置变量
        **/
        var _configure = {
            data: {},
            // 开发环境域名，可通过config配置
            proHost: 'online.com',
        };
        var _onerror = null, _context = null;

        /*
        * 检索地址
        * @param {Object} opt
        */
        var fetchURL = function(opt){
            var api = bucket[opt.api] || null, err = null;
            
            if (!api) {
                err = "未知API";
            } else {
                if (api.methods.join(',').toUpperCase().indexOf(opt.type.toUpperCase()) == -1) {
                    err = "方法错误: " + opt.type;
                }

                if('required' in api) {
                    var temp = [];
                    for (var i = 0, j = api.required.length; i < j; i++) {
                        var param = api.required[i],
                            key = param['key'],
                            type = param['type'];
                        
                        if (!(key in opt.data) || type != typeof opt.data[key]) {
                            temp.push(key);
                        }
                    }
                    temp.length != 0 && (err = "参数类型错误: " + temp.join(','));
                }
            }

            if (!!err) {
                console.warn(err + '\napi: ' + opt.api);
                apiError({
                    state: false,
                    msg: err
                });
            }

            return !!api ? (window.location.hostname == _configure.proHost ? api.url : api.devUrl) : false;
        },

        apiError = function(error){
            _onerror.call(_context, error);
        };

        return {
            /*
            * 可域验证配置及环境配置
            * @param {Object} options
            */
            config: function(options){
                /*
                if ('proHost' in options && !!options.proHost) {
                    proHost = options.proHost;
                    delete options.proHost
                }
                */
                if ('proHost' in options && !options.proHost) delete options.proHost;
                _.extend(_configure, options);
                return true;
            },
            /*
            * 发起数据请求
            * @param {Object} options
            */
            request: function(options){
                options = _.extend({
                    api: '',
                    type: 'GET',
                    data: {},
                    dataType: 'json'
                },options||{});

                _onerror = options.error || function(status, xhr){
                    throw new Error(status.msg)
                };
                _context = options.context || null;

                //默认获取请求方式req: get, res: json
                var params = _.extend({type: options.type, dataType: options.dataType}, _configure);
                params.data = _.extend({}, _configure.data, options.data);
                //先支持http方式
                if (options.api.indexOf('http') != -1) {
                    params.url = encodeURI(options.api);
                } else {
                    params.url = fetchURL(options);
                    if (!params.url) return false;
                    // else params.url = params.url.replace(/(^\/\/)/, window.location.protocol+'//');
                }

                //post\put\update方式
                //兼容beego
                if (params.type.toUpperCase() !== 'GET') {
                    params.data = JSON.stringify(params.data);
                }

                //统一失败回调入口
                params.error = function(xhr, info, err){
                    _onerror.call(_context, {
                        status: {
                            state: false,
                            msg: typeof err == 'string' ? err : info
                        },
                        xhr: xhr
                    });
                    return false;
                }

                var success = options.success
                params.success = function(){
                    !!success && success.apply(_context, arguments);
                }

                lib.ajax(_.extend(options, params));
            }
        }
    })();

    var ajax = (function(){
        /*
        * response handler
        * */
        var stateChange = function(){
            if(this.readyState == 4){
                if(this.status == 200 || this.state == 304){
                    if(this.responseText){
                        try{
                            if(this.resFormat != "text"){
                                var str = JSON.parse(this.responseText);
                            }else{
                                var str = this.responseText;
                            }
                        }catch(e){
                            console.log(e.message);
                            this.failback({'status': {"msg": e.message, "code": 1}});
                        }
                        this.callback(str);
                    }else{
                        console.log("response empty");
                        this.failbackthis.failback({'status': {"msg": "response empty", "code": 1}});
                    }
                }else{
                    console.log(this.status);
                    this.failback({'status': {"msg": this.status, "code": 1}});
                }
            }
        },
        /*
        * set credentials
        * @param  {Object} xhr
        * @param  {Object} param
        * @return {object} xhr
        * */
        setCredentials = function (xhr, param) {
            if (/api\.codoon\.com/.test(xhr.url)) {
                try{
                    xhr.withCredentials = true;
                } catch (e) { console.error(e)} 
            }
            if (typeof(param.withCredentials) != 'undefined') {
                try{
                    xhr.withCredentials = param.withCredentials;;
                } catch (e) { console.error(e)} 
            }

            return xhr;
        };
        
        return function(param){
            var xhr = null;
            try{
                xhr = new XMLHttpRequest();
            }catch(e){
                try{
                    xhr = new ActiveXObject("MSXML2.XMLHTTP");
                }catch(e){
                    try{
                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    }catch(e){
                        xhr = null;
                    }
                }
            }
            
            xhr.method = !!param.type ? param.type : 'GET';
            xhr.url = !!param.url ? param.url : "";
            xhr.async = !!param.async ? param.async : true;
            xhr.data = !!param.data ? param.data : "";
            xhr.resFormat = !!param.format ? param.format : "json";
            xhr.cType = !!param.contentType ? param.contentType : "";
            xhr.callback = !!param.success ? param.success : function(){};
            xhr.failback = !!param.error ? param.error : function(){};
            xhr.result = "";
            xhr.onreadystatechange = stateChange;
            
            if(xhr.method.toUpperCase() == "POST"){
                var data = xhr.data.constructor == Object ? JSON.stringify(xhr.data) : xhr.data;
                if (!!xhr.cType)
                    xhr.setRequestHeader("Content-Type", xhr.cType);
                else if (xhr.data.constructor == Object) {
                    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                }

                xhr.open(xhr.method, xhr.url, xhr.async);
                setCredentials(xhr, param);
                xhr.send(data);
            }else{
                if(!!xhr.data){
                    var flag = /\?/.test(xhr.url), data = xhr.data;
                    if(data.constructor == Object){
                        var s = flag ? '' : '?';
                        for(key in data)
                            s += key + '=' + data[key] + '&';

                        xhr.url += s.slice(0, -1);
                    }else{
                        data = data.toString();
                        xhr.url += flag ? data : ('?' + data);
                    }
                }
                xhr.open(xhr.method, xhr.url, xhr.async);
                setCredentials(xhr, param);
                xhr.send(null);
            }
        }
    })();
    
    lib.api = API;
    lib.ajax = ajax;
});
