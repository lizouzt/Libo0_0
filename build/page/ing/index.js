/**
* Created by Elfer on 14-1-8.
*/
define("page/ing/index", [ "./mod/items-udt" ], function(itemTmp) {
    // var itemTmp = require();
    var uri = "../list.json";
    document.addEventListener("touchstart", function() {}, false);
    var offsetpage = 0;
    var cwrapper = document.getElementById("content");
    var tool = {
        getNode: function(opt) {
            var options = {
                method: "GET",
                url: "./empty_req",
                dataType: "json",
                data: {},
                timeout: "400",
                scb: function() {},
                fcb: function() {},
                extend: function(data) {
                    for (var key in data) this[key] = data[key];
                }
            };
            !opt && (opt = {});
            options.extend(opt);
            $.ajax({
                type: options.method,
                url: options.url,
                data: options.data,
                dataType: options.dataType,
                timeout: options.timeout,
                success: options.scb.bind(this),
                fcb: options.fcb.bind(this)
            });
        },
        constructItems: function(data) {
            var html = itemTmp(data);
            this.addNode(html);
            !!rock && rock.loadSuccess();
        },
        getListFailed: function(e) {
            var errormsg = "sorry about that!";
            this.addNode(errormsg);
        },
        addNode: function(html) {
            var node = document.createElement("div");
            node.id = "no_" + offsetpage++;
            node.className = "items";
            node.innerHTML = html;
            cwrapper.appendChild(node);
        },
        lazyload: {
            init: function() {}
        }
    };
    var opt = {
        url: uri,
        scb: tool.constructItems,
        fcb: tool.getListFailed
    };
    rock = new lib.scroll({
        loaderNeeded: true,
        content: document.getElementById("content"),
        onscrollbottom: function() {
            tool.getNode(opt);
        }
    });
    tool.getNode(opt);
    tool.lazyload.init();
    return {};
});

define("page/ing/mod/items-udt", [], function() {
    return function(obj) {
        obj || (obj = {});
        var __t, __p = "", __e = _.escape, __j = Array.prototype.join;
        function print() {
            __p += __j.call(arguments, "");
        }
        with (obj) {
            if (data) {
                __p += "\n  ";
                _.each(data, function(item) {
                    __p += '\n  <div class="item">\n    <a class="seller">\n      <div class="seller-pic"><img class="J_lazyload" src="';
                    if (item.userImageUrl) {
                        __p += ((__t = item.userImageUrl) == null ? "" : __t) + "_" + ((__t = $.isRetina("80x80", "40x40")) == null ? "" : __t) + "Q50.jpg";
                    } else {
                        __p += "http://demo.com/avatar-80.png";
                    }
                    __p += '" alt="" width="40" height="40" /></div>\n      <div class="seller-info">\n        <p class="name">' + ((__t = item.sellerNick) == null ? "" : __t) + '</p>\n        <p class="sub"><span class="time">' + ((__t = item.showTimeStr) == null ? "" : __t) + '</span> 来自<span class="geo">' + ((__t = item.lbs) == null ? "" : __t) + '</span></p>\n      </div>\n    </a>\n    <a class="link">\n      <div class="product">\n        ';
                    if (item.imgUrlsList) {
                        __p += '\n        <ul class="piclist clearfix style' + ((__t = item.imgUrlsList.length) == null ? "" : __t) + '">\n          ';
                        _.each(item.imgUrlsList, function(picitem, index) {
                            __p += '\n          <li class="picitem" data-index="' + ((__t = index) == null ? "" : __t) + '">\n            <img src="' + ((__t = picitem) == null ? "" : __t);
                            if (item.imgUrlsList.length == 2 || item.imgUrlsList.length == 4) {
                                __p += "_" + ((__t = $.isRetina("310x310", "160x160")) == null ? "" : __t) + "xzQ50.jpg";
                            } else {
                                __p += "_" + ((__t = $.isRetina("200x200", "100x100")) == null ? "" : __t) + "xzQ50.jpg";
                            }
                            __p += '" alt="" width="';
                            if (item.imgUrlsList.length == 2 || item.imgUrlsList.length == 4) {
                                __p += "146";
                            } else {
                                __p += "96";
                            }
                            __p += '" height="';
                            if (item.imgUrlsList.length == 2 || item.imgUrlsList.length == 4) {
                                __p += "146";
                            } else {
                                __p += "96";
                            }
                            __p += '" data-origin="' + ((__t = picitem) == null ? "" : __t) + '" />\n          </li>\n          ';
                        });
                        __p += "\n        </ul>\n        ";
                    }
                    __p += '\n      </div>\n    \n      <p class="title">' + ((__t = item.title) == null ? "" : __t) + '</p>\n      <p class="price"><span class="yen">&yen;</span>' + ((__t = +item.price / 100) == null ? "" : __t) + '</p>\n    </a>\n    \n    <div class="itembar">\n      <ul class="clearfix">\n        <li class="sns-comment J_comment_' + ((__t = item.itemId) == null ? "" : __t) + '"><a ></a></li>\n        <li class="sns-like J_like_' + ((__t = item.itemId) == null ? "" : __t) + '" data-key="' + ((__t = item.itemId) == null ? "" : __t) + '"></li>\n      </ul>\n    </div>\n  </div>\n  ';
                });
                __p += "\n";
            }
            __p += "\n";
        }
        return __p;
    };
});
