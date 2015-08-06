define(function(){
    // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    var methodMap = {
        'create': 'POST',
        'update': 'POST',
        'patch': 'POST',
        'delete': 'GET',
        'read':   'GET'
    };
    // Throw an error when a URL is needed, and none is supplied.
    var urlError = function() {
        throw new Error('A "url" property or function must be specified');
    };

    var Override = {};
    Override = {
        sync: function(method, model, options){
            var type = methodMap[method];

            // Default options, unless specified.
            _.defaults(options || (options = {}));

            // Default JSON-request options.
            var params = {type: type, dataType: 'json', timeout: 10000};

            if (!options.url) {
                params.api = _.result(model, 'url') || urlError();
            }

            // Ensure that we have the appropriate request data.
            if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
              params.contentType = 'application/json';
              params.data = JSON.stringify(options.attrs || model.toJSON(options));
            }

            // Don't process data on a non-GET request.
            if (params.type !== 'GET') {
              params.processData = false;
            }

            // Pass along `textStatus` and `errorThrown` from jQuery.
            var error = options.error;
            options.error = function(xhr, textStatus, errorThrown) {
                textStatus = textStatus || (xhr && xhr.xhr ? xhr.xhr.statusText : "请求失败");
                if (error) error.call(options.context, {
                    xhr: xhr,
                    status: {
                        state: false,
                        msg: textStatus
                    }
                });
                console.warn(textStatus);
            };

            var success = options.success;
            /*
            * 配合处理服务端返回数据
            **/
            options.success = function(obj, textStatus, xhr){
                if (obj.status.state == 0 || obj.status.state == "0"){
                    !!success && success(obj.data.list);
                    !!options.pageNav && options.pageNav.call(options.context, obj.data);
                } else
                    options.error(xhr, obj.status.msg, obj.status);
            };

            lib.api.request(_.extend(params, options));
        },
        //看实际情况决定要不要重载fetch、save、destory
    };

    return Override;
});