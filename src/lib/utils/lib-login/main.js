/*
*没有做IE8兼容考虑，自重
**/
define([
    'lib/utils/lib-login/mod/loginView.jst',
    'lib/utils/utils'
    ], function(tpl_login){
    var lib = window.lib || (window['lib'] = {});

    var _callBack = null, 
        _context = null;
    /*
    *唤起登陆视图
    **/
    var callLogin = (function(){
        var el_login = null, 
            el_form = null, 
            el_tips = null,
            op_block = false;
        /*
        *登陆信息检验
        **/
        var loginInfoCheck = function(){
            var el_pwd = el_form['login[pwd]'],
                el_name = el_form['login[name]'];

            var name = el_name.value,
                pwd = el_pwd.value;

            if (!name || !pwd) {
                showFailTips('请完成信息填写！');
                return false;
            }
            
            if (/[\'\"\>\<\s]/.test(name)) {
                showFailTips('请输入有效用户名！');
                return false;
            }

            return {
                username: name,
                password: pwd
            }
        },
        /*
        *加载样式文件
        **/
        injectStyle = function(){
            
        },
        /*渲染登陆视图*/
        renderLoginView = function(opts){
            document.body.insertAdjacentHTML('beforeEnd', tpl_login(opts));
            el_login = document.getElementById('j-l-l-view');
            el_form = document.forms['login[form]'];
            el_tips = el_login.querySelector('.llv-tips');
            bindLoginView();

            return el_login;
        },
        hideLoginView = function(){
            console.log('hide');
            el_login.classList.remove('active');
            el_login.classList.add('hide');
        },
        /*
        *登录失败提示信息toggle
        * @param {string} msg
        **/
        showFailTips = function(msg){
            el_tips.innerText = msg;
            el_tips.classList.add('active');
            setTimeout(function(){
                el_tips.classList.remove('active');
            }, 2000);
        },
        /*
        *登陆操作绑定
        **/
        bindLoginView = function(){
            var el_pwd = el_form.querySelector('input[name="login[pwd]"]');
            el_pwd.onfocus = function(){
                setTimeout(function () {
                    el_pwd.type = 'password';
                }, 50);
            };
            el_pwd.onblur = function(){
                !this.value && (this.type = 'text');
            };

            el_form.onsubmit = function(e){
                var info = loginInfoCheck();
                e.preventDefault();
                if (info && !op_block) {
                    op_block = true;
                    lib.api.request({
                        api: 'api.user.login',
                        dataType: 'json',
                        data: info,
                        type: 'POST',
                        success: function(obj){
                            op_block = false;
                            if (obj.status.state == 0) {
                                resetLoginStatus();
                                fnSuccessCallBack(obj.data);
                            } else {
                                /*
                                *失败
                                ***/
                                fnFailCallBack(obj.status);
                            }
                        },
                        error: function(err){
                            op_block = false;
                            fnFailCallBack(err);
                        }
                    });
                }
                return false;
            };
        },
        /*
        *重置登陆视图状态及数据
        **/
        resetLoginStatus = function(){
            hideLoginView();
            el_form['login[name]'].value = null;
            el_form['login[pwd]'].value = null;
        },
        /*
        *登陆成功回调操作
        * @param {Object} obj登陆接口返回参数
        **/
        fnSuccessCallBack = function(obj){
            !!_callBack && _callBack.call(_context, obj);
        },
        /*登陆失败回调操作
        * @param {Object} err登陆接口返回参数
        **/
        fnFailCallBack = function(err){
            showFailTips(err.msg || '登录失败请重试！');
        };

        return function(opts){
            el_login = document.getElementById('j-l-l-view') || renderLoginView(opts);
            el_login.classList.remove('hide');
            el_login.classList.add('active');
            opts.hideBG ? el_login.classList.add('nobg') : el_login.classList.remove('nobg');
        }
    })(),

    /*
    *解析cookie
    * @param {string} key
    * @return {string}
    **/
    getCookieObject = function(key){
        var ret = new RegExp("(?:^|;\\s*)"+key+"\\=([^;]+)(?:;\\s*|$)").exec(document.cookie)
        return ret ? ret[1] : null;
    };

    /*
    *从cookie获取用户名
    **/
    var _getNickName = function(){
        return getCookieObject('_un');
    },
    /*
    *检查是否为长登录状态
    * @param {function} cb
    * @param {object} context
    **/
    _isLogin = function(cb, context){
        var ret = !!(_getNickName() && getCookieObject('_sec'));
        if (!!cb) {
            cb.call(context, ret);
        } else {
            return ret;
        }
    },
    /*
    *调用登陆，登陆成功之后跳转到指定地址或当前页面
    * @param [Function|Object] opts
    * @param [object] context
    * @param [object] viewset
    * 暂定支持登陆回调函数、登陆跳转、登陆刷新操作
    * 默认登陆成功不进行任何操作
    * 跳转 {targetUrl: url, [context: this]}
    * 刷新 {cbType: "refresh"}
    **/
    _goLogin = function(opts, context, viewset){
        var viewset = viewset || {};
        if (typeof opts == 'function') {
            _callBack = opts;
            _context = context;
        } else if(typeof opts == 'object' && 'cbType' in opts) {
            if (opts.cbType == 'redirect' && 'targetUrl' in opts) {
                _callBack = function(){
                    window.location.href = encodeURI(opts.targetUrl);
                }
            } else if (opts.cbType == 'refresh') {
                _callBack = function(){
                    window.location.reload();
                }
            }
        } else {
            _callBack = null;
            _context = null;
        }

        callLogin(viewset);
    },
    /*
    *当前用户退出所有登陆状态
    *清除服务端登陆状态，清除本地cookie纪录
    * @param {function} cb
    * @param {object} context
    **/
    _goLogout = function(){

    };

    var login = (function(){
        return {
            isLogin: _isLogin,
            /*
            *检查是否为强登陆状态
            *服务器session判断
            **/
            isSyncLogin: function(cb, context){

            },
            goLogin: _goLogin,
            goLogout: function(cb, context){
                this.isLogin(function(){
                    _goLogout(cb, context)
                })
            },
            getNickName: _getNickName
        }
    })();

    lib.login = login;
});