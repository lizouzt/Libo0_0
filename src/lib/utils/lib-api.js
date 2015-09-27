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
            // 开发环境域名，可通过config配置
            proHost: 'online.com',
        };
        var _onerror = null, _context = null;

        /*
        * 检索地址
        * @param {Object} opt
        */
        fetchURL = function(opt){
            var api = bucket[opt.api] || null, err = null;
            
            if (!api) {
                err = "未知API";
            } else {
                if (api.methods.join(',').indexOf(opt.type.toUpperCase()) == -1) {
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
                $.extend(_configure, options);
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
                var params = $.extend({type: options.type, dataType: options.dataType}, _configure);
                params.data = $.extend({}, _configure.data, options.data);
                //先支持http方式
                if (!options.api.indexOf('http') == -1) {
                    params.url = encodeURI(options.api);
                } else {
                    params.url = fetchURL(options);
                    if (!params.url) return false;
                    // else params.url = params.url.replace(/(^\/\/)/, window.location.protocol+'//');
                }

                // post\put\update方式
                // 兼容beego
                if (params.type !== 'GET') {
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

                $.ajax($.extend(options, params));
            }
        }
    })();

    lib.api = API;
});