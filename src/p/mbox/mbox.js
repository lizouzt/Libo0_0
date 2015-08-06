/*
* Elfer_Dev 2014-09-14
**/
var getXHR = function(){
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

	if(xhr != null){
		xhr.sendHTTP = function(param){
			xhr.method = !!param.method ? param.method : 'GET';
			xhr.url = !!param.url ? param.url : "";
			xhr.async = !!param.async ? param.async : true;
			xhr.data = !!param.data ? param.data : "";
			xhr.resFormat = !!param.format ? param.format : "json";
			xhr.callback = !!param.callback ? param.callback : function(){};
			xhr.failback = !!param.failback ? param.failback : function(){};
			xhr.result = "";

			xhr.onreadystatechange = function(){
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
								this.failback({'ret': e.message});
							}
							this.callback(str);
						}else{
							console.log("response empty");
							this.failback({'ret': 'response empty'});
						}
					}else{
						console.log(this.status);
						this.failback({'ret': this.status});
					}
				}
			}

			if(xhr.method.toUpperCase() == "POST"){
				var data = xhr.data.constructor == Object ? JSON.stringify(xhr.data) : xhr.data;
				xhr.open(xhr.method, xhr.url, xhr.async);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send(data);
			}else{
				if(!!xhr.data){
					var flag = /\?/.test(xhr.url), data = xhr.data;
					if(data.constructor == Object){
						var s = flag ? '' : '?';
						for(key in data)
							s += key + '=' + data[key] + '&';

						xhr.url += s;
					}else{
						data = data.toString();
						xhr.url += flag ? data : ('?' + data);
					}
				}
				
				xhr.open(xhr.method, xhr.url, xhr.async);
				xhr.send(null);
			}
		}
	}

	return xhr;
}

var cheater = function(){
	var uri_collection = "http://yinyueyun.baidu.com/data/cloud/collection",
		uri_songInfo = "http://yinyueyun.baidu.com/data/cloud/songinfo",
		uri_songRate = "http://yinyueyun.baidu.com/data/cloud/download",
		uri_songLink = "http://yinyueyun.baidu.com/data/cloud/downloadsongfile?songIds={songIds}&rate={rate}&format={format}";

	window.favorInfo = {
		songIds: [],
		songList: {},
		total: mbox.favorIds.data.total
	}

	var prepareDetails = function(cb){
		var getIds = function(){
			var loop = Math.floor(favorInfo.total / 200);
			(favorInfo.total % 200 != 0) && ++loop;

			var get = function(obj){
				var xhr = getXHR();
				xhr.sendHTTP({
					url: uri_collection,
					data: {type: 'song', start: obj.start, size: 200, _: +new Date},
					callback: function(data){
						if(!!data.data.songList){
							var list = data.data.songList;
							list.forEach(function(song){
								favorInfo.songIds.push(song.id)
							});
						}

						if(obj.end) {
							console.log('getIds ends.'); 
							console.log(favorInfo);
							getInfos();
						}
					},
					failback: function(o){
						return function(e){
							console.log('get Ids failed with: ' + JSON.stringify(e));
							get(o);
						}
					}(obj)
				});
			}

			for(var i = 0; i < loop; i++){
				get({start: i * 200, end: (i == loop - 1)});
			}
		},
		getInfos = function(){
			var xhr = getXHR();
			xhr.sendHTTP({
				method: 'POST',
				url: uri_songInfo,
				data: 'songIds=' + encodeURIComponent(favorInfo.songIds.join(',')) + '&type=&rate=&pt=0&flag=&s2p=&prerate=&bwt=&dur=&bat=&bp=&pos=&auto=',
				callback: function(obj){
					var list = obj.data.songList;
					if(!!list && list.length) {
						var songs = {};
						list.forEach(function(song){
							songs[song.songId] = song;
						});

						favorInfo.songList = songs;
					}

					console.log('getInfos ends.');
					console.log(favorInfo);
					getRate();
				},
				failback: function(e){
					console.log('get Info failed with: ' + JSON.stringify(e));
				}
			});
		},
		getRate = function(){
			var i = 0, len = favorInfo.songIds.length;
			var timer = setInterval(function(){
				var xhr = getXHR();
				var id = favorInfo.songIds[i];

				xhr.sendHTTP({
					url: uri_songRate,
					data: {songIds: id},
					callback: function(id){
						return function(obj){
							var song = favorInfo.songList[id];

							// var rateObj = obj.data.data.flac;
							// if(!rateObj)
							var rateObj = obj.data.data['320'];

							!!rateObj && !!song && (song.flacLink = uri_songLink.replace(/\{songIds\}/, id).replace(/\{rate\}/, rateObj.rate).replace(/\{format\}/, rateObj.format));
						}
					}(id)
				});

				++i;

				if(i == len - 1){
					clearInterval(timer);
					renderList();
					console.log('end');
				}

			}, 100);
		};
		getIds();
	},

	renderList = function(){
	    var html = '<style type="text/css">body{margin:0; padding:0;} h1 a{color: #fff; font-size: 28px;} sub a{color: #fff; font-size: 12px;} h1{background-color: #36465d; color: #fff; font: 900 28px/44px Arial,Helvetica,sans-serif "微软雅黑";} sub{font-size: 12px; font-weight: 400; float: right;} a{font: 900 22px/44px Arial,Helvetica,sans-serif "微软雅黑";height: 44px;margin: 0 12px;text-decoration: none;text-align: center;}</style><h1><a target="_blank" href="http://elferoooh.tumblr.com/">@Elfer </a>2014 <sub>无版权爱运动，停止盗版不如先停止翻唱！<a target="_blank" href="http://weibo.com/u/3966406133">@Borels</a></sub></h1>',
	    tpl = '<a href="{link}" data-id="{id}">{name}---{author}</a>';
	    
	    for(var id in favorInfo.songList){
	        var song = favorInfo.songList[id];
	        song && song.flacLink && (html += tpl.replace(/\{link\}/,song.flacLink).replace(/\{id\}/,song.songId).replace(/\{name\}/, song.songName).replace(/\{author\}/, song.artistName));
	    };
	    
	    document.write(html);
	},

	searchNames = function(){

	},

	download = function(ids){

	};

	return {
		init: function(){
			prepareDetails(renderList);
		}
	}
}();

cheater.init();