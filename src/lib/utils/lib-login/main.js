/*
*没有做IE8兼容考虑，自重
**/
!function (name, context, definition) {
  if (typeof define == 'function') define(definition)
  else if (typeof module != 'undefined') module.exports = definition()
  else context[name] = definition()
}('lib/utils/lib-login/main', this, function () {
    var __utils__ = require('lib/utils/utils');
    var tpl_login = require('lib/utils/lib-login/mod/loginView.jst');
    var lib = window.lib || (window['lib'] = {});

    var _callBack = null, 
        _context = null;

    var REGISTE_API = window.location.origin + "/admin/usr/regist";
    var PICS = ['//timage.oss-cn-shanghai.aliyuncs.com/RqLZaZaZDzcV-KDZ.gif', '//timage.oss-cn-shanghai.aliyuncs.com/Obx5Ocs5Dj4RB3AJ.png', '//timage.oss-cn-shanghai.aliyuncs.com/GGvKzcc1z33pmfU8.jpg', '//timage.oss-cn-shanghai.aliyuncs.com/G8f_MBg9sYS07km3.gif'];
    /*
    *登录失败提示信息toggle
    * @param {string} msg
    **/
    var showFailTips = function(msg, el_tips){
        el_tips.innerText = msg;
        _.activeCls(el_tips);
        setTimeout(function(){
            _.negativeCls(el_tips);
        }, 4000);
    },
    /*
    *登陆成功回调操作
    * @param {Object} obj登陆接口返回参数
    **/
    fnSuccessCallBack = function (obj) {
        !!_callBack && _callBack.call(_context, obj);
    };

    /*
    *唤起注册视图
    **/
    var initialRegisterView = function () {
        var regx = "!|！|@|◎|#|＃|(\\$)|￥|%|％|(\\^)|……|(\\&)|※|(\\*)|×|(\\()|（|(\\))|）|_|——|(\\+)|＋|(\\|)|§ ";

        var el_register = _.querySelector('#j-l-l-view .llv-reg'),
            el_form     = document.forms['regist[form]'],
            el_btn      = _.querySelector(el_register, '.llv-submit'),
            el_tips     = _.querySelector(el_register, '.llv-tips');

        var registInfoCheck = function () {
            var el_pwd = el_form['regist[pwd]'],
                el_name = el_form['regist[name]'],
                el_nick = el_form['regist[nick]'];

            var name = el_name.value,
                nick = el_nick.value,
                pwd = el_pwd.value;

            if (!name || !pwd || !nick) {
                showFailTips('完成信息填写！', el_tips);
                return false;
            }

            if (name.length > 20) {
                showFailTips('登录账号不能超过20个字符', el_tips);
                return false;
            }

            if (nick.length > 20) {
                showFailTips('昵称不能超过20个字符', el_tips);
                return false;
            }

            if (pwd.length > 20) {
                showFailTips('密码不能超过20个字符', el_tips);
                return false;
            }
            
            if (RegExp(regx).test(name)) {
                showFailTips('登录账号不能包含特殊字符', el_tips);
                return false;
            }

            if (RegExp(regx).test(nick)) {
                showFailTips('昵称不能包含特殊字符', el_tips);
                return false;
            }

            return {
                name: name,
                password: pwd,
                nick: nick
            }
        };
        /*
        *   绑定注册相关事件
        * */
        el_form.onsubmit = function (e) {
            e.preventDefault();

            var info = registInfoCheck();
            if (info && /posting/.test(el_btn.className) == false) {
                _.activeCls(el_btn, 'posting');
                lib.api.request({
                    api: 'gbuy.ms.user.regist',
                    data: info,
                    type: 'POST',
                    success: function(obj){
                        _.negativeCls(el_btn, 'posting');
                        
                        showFailTips('注册成功，跳转中...', el_tips);
                        setTimeout(function () {
                            fnSuccessCallBack(obj.data);
                        }, 2000);
                    },
                    error: function(obj){
                        _.negativeCls(el_btn, 'posting');
                        showFailTips(obj.status.msg || '注册失败请重试！', el_tips);
                    }
                });
            }
            return false;
        }
    },

    /*
    *唤起登陆视图
    **/
    callLogin = (function(){
        var el_login = null, 
            el_register = null,
            el_form = null, 
            el_tips = null,
            el_btn = null,
            block = false;
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
        setBg = function (url) {
            var randBg = PICS[Math.floor(Math.random() * 4)];
            url = Math.random() > 0.6 ? randBg : (url || randBg);
            document.getElementsByClassName('llv-bg')[0].style.backgroundImage = 'url('+url+')';
            if (/RqLZaZaZDzcV|GGvKzcc1z33pmfU8/.test(url)) {
                _.activeCls(document.getElementById('j-l-l-view'), 'bdm')
            }
        }, 
        getBg = function () {
            lib.api.request({
                api: 'gbuy.ms.hpi',
                timeout: 2000,
                success: function (obj) {
                    if (obj && obj.data && obj.data.images && obj.data.images.length > 0 && obj.data.images[0].url)
                        setBg('//cn.bing.com/' + obj.data.images[0].url);
                    else setBg();
                },
                error: function () {
                    setBg();
                }
            });
        },
        /*渲染登陆视图*/
        renderLoginView = function(opts){
            getBg();
            document.body.insertAdjacentHTML('beforeEnd', tpl_login(opts));
            el_register = _.querySelector('#j-l-l-view .llv-reg');
            el_login = _.querySelector('#j-l-l-view .llv-wrapper');
            el_form = document.forms['login[form]'];
            el_tips = _.querySelector(el_login, '.llv-tips');
            el_btn = _.querySelector(el_form, '.llv-submit');
            
            initialRegisterView();
            bindLoginView();

            return el_login;
        },
        hideLoginView = function(){
            _.negativeCls(el_login);
            _.activeCls(el_login);
        },
        /*
        *登陆操作绑定
        **/
        bindLoginView = function(){
            var el_pwd = _.querySelector(el_form, 'input[name="login[pwd]"]'),
                timer = null,
                firstKill = true;

            el_pwd.onfocus = function(){
                timer = setTimeout(function () {
                    el_pwd.type = 'password';
                    if (firstKill) {
                        el_pwd.value = '';
                        firstKill = false;
                    }
                }, 10);
            };

            el_pwd.onblur = function(){
                clearTimeout(timer);
                !this.value && (this.type = 'text');
            };

            el_form.onsubmit = function(e){
                var info = loginInfoCheck();
                e.preventDefault();
                if (info && /posting/.test(el_btn.className) == false) {
                    _.activeCls(el_btn, 'posting');
                    lib.api.request({
                        api: 'gbuy.ms.user.login',
                        dataType: 'json',
                        data: info,
                        type: 'POST',
                        timeout: 5000,
                        success: function(obj){
                            _.negativeCls(el_btn, 'posting');

                            resetLoginStatus();
                            fnSuccessCallBack(obj.data);
                        },
                        error: function (obj) {
                            _.negativeCls(el_btn, 'posting');
                            showFailTips(obj.status.msg || '注册失败请重试！', el_tips);
                        }
                    });
                }
                return false;
            };

            var navBtnLogin = _.querySelector('.lvc-l');
            var navBtnRegist = _.querySelector('.lvc-r');
            
            _.addEvent(navBtnRegist, 'click', function (e) {
                _.activeCls(el_login, 'negative');
                _.negativeCls(el_register, 'negative');

                _.activeCls(navBtnRegist, 'hide');
                _.negativeCls(navBtnLogin, 'hide');
            });
            _.addEvent(navBtnLogin, 'click', function (e) {
                _.activeCls(el_register, 'negative');
                _.negativeCls(el_login, 'negative');

                _.activeCls(navBtnLogin, 'hide');
                _.negativeCls(navBtnRegist, 'hide');
            });
        },
        /*
        *重置登陆视图状态及数据
        **/
        resetLoginStatus = function () {
            hideLoginView();
            el_form['login[name]'].value = null;
            el_form['login[pwd]'].value = null;
        };

        return function(opts){
            el_login = _.querySelector('#j-l-l-view .llv-wrapper') || renderLoginView(opts);
            _.negativeCls(el_login, 'hide')
            _.activeCls(el_login, 'active');
            opts.hideBG ? _.activeCls(el_login, 'nobg') : _.negativeCls(el_login, 'nobg');
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