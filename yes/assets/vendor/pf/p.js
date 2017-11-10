/**
 * 主框架
 * 基于jQuery 和 BootStrap UI
 * 主张配置化的简洁业务逻辑，特别适用于管理系统，尽量保持简洁
 * 代码风格上：
 * 	- 驼峰
 * 	- 英文含义
 * 	- 二级命名空间带有分类型前缀，以减少调用层级
 * @type {[type]}
 */

(function(P){
// 本文件的二级命名空间，常用的会直接将函数挂载到一级

/**
 * 业务框架配置，通过单独的config/文件管理
 * @type {[type]}
 */
P.config = P.config || {};
/**
 * 网络请求类，支持RESTful
 * @type {[type]}
 */
P.rest = {
	GET		: function(url, params, callback, opts) {
		return new P.network.send('GET', url, params, callback, opts);
	},
	POST	: function(url, params, callback, opts) {
		return new P.network.send('POST', url, params, callback, opts);
	},
	PATCH 		: function(url, params, callback, opts) {
		return new P.network.send('PATCH', url, params, callback, opts);
	},
	PUT		: function(url, params, callback, opts) {
		return new P.network.send('PUT', url, params, callback, opts);
	},
	'DELETE': function(url, params, callback, opts) {
		return new P.network.send('DELETE', url, params, callback, opts);
	},
	DOWNLOAD: function(url, params, callback, opts) {
		return new P.network.send('DOWNLOAD', url, params, callback, opts);
	},
	LOCATION: function(url, params, callback, opts) {
		return new P.network.send('LOCATION', url, params, callback, opts);
	}
}

// P.generate = null;		// 生成模块
// P.generateCgis = null;	// 生成模块下的cgi
// P.generatePages = null;	// 生成模块下的页面

/**
 * 工具型
 * @type {[type]}
 */
P.util = P.util || {};			// 通用功能

/**
 * 表单类
 * @type {[type]}
 */
P.form = P.form || {};			// 表单操作

/**
 * 字典类
 * @type {[type]}
 */
P.dict =P.dict || {};			// 字典存储，用于各类静态、动态产生的映射表等

/**
 * UI类
 * @type {[type]}
 */
P.uiPage = P.uiPage || {};		// 页面级的ui操作

/**
 * 事件类
 * @type {[type]}
 */
P.event = P.event || {};		// 事件操作

/**
 * JSON的操作
 * @type {[type]}
 */
P.JSON = P.JSON || {};

/**
 * 存储类
 * @type {[type]}
 */
P.storage = P.storage || {};

/**
 * 提示条
 * @type {[type]}
 */
P.tips = P.tips || {};

////////////////////////// P.util //////////////////////////////

/**
 * hash算法，基于time33，用于将字符串转换为一组数
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
P.util.genHash = function(str){
	var hash = 5381;
	str = str || '';

	for(var i=0, len=str.length; i<len; ++i){
		hash += (hash << 5) + str.charAt(i).charCodeAt();
	}

	return hash & 0x7fffffff;
};

/**
 * 模板填充
 */
(function(P){
	var cache = {};
	P.util.tmpl = function tmpl(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
		cache[str] = cache[str] ||
		tmpl(document.getElementById(str).innerHTML) :
		// Generate a reusable function that will serve as a template
		// generator (and which will be cached).
		new Function("obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +

			// Introduce the data as local variables using with(){}
			"with(obj){p.push('" +

			// Convert the template into pure JavaScript
			str
				.replace(/[\r\t\n]/g, " ")
				.split("<%").join("\t")
				.replace(/((^|%>)[^\t]*)'/g, "$1\r")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("%>").join("p.push('")
				.split("\r").join("\\'")
			+ "');}return p.join('');");

		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	};
})(P);

/**
 * 跳转到页面
 * @param  {[type]} mod    模块
 * @param  {[type]} page   页面
 * @param  {[type]} params 带的参数
 * @return {[type]}        [description]
 */
P.util.goPage = function(mod, page, params) {
	// http://stackoverflow.com/questions/632471/base-href-javascript-and-internet-explorer-vs-firefox
	window.location.assign(P.util.getPageUrl(mod, page, params));
};

// 获取实际的url
P.util.getPageUrl = function(mod, page, params) {
	var url = '';

	page = page || '';
	url = mod + page;
	if (params) {
		if (typeof params === 'object') {
			var kv = [];
			$.each(params, function(k, v){
				kv.push(k +'='+ encodeURIComponent(v));
			});
			url += '?'+ kv.join('&');
		} else {
			url += '?'+ encodeURI(params);
		}
	};

	return url;
};

/**
 * 获取URL参数，支持数组格式来批量获取
 * 优先从querystring获取，其次为fragment
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
P.util.getUrlParams = function(params){
	var result, ps = {},
		search = location.search.substring(1).split('&')||[],
		hash, tidyValue;

	// 防止xss
	tidyValue = function (str) {
		return str.replace(/[<>\'\"&']/g, '');
	};

	hash = location.hash;
	hash.substring(0,2)=='#!' && (hash = hash.substring(1));  // 支持下#!的情况
	hash = hash.substring(1).split('&')||[];

	// 优先取search，再取hash
	$.each(hash.concat(search), function(k, v){
		var t;

		if (v) {
			t = v.split('=');
			ps[t[0]] = t.length>1 ? tidyValue(t[1]) : '';
		}
	});

	if ($.isArray(params)) {
		result = {};
		$.each(params, function(i, v){
			result[v] = typeof ps[v]!=='undefined' ? ps[v] : undefined;
		});
	} else {
		// 如果没有传入参数，则返回所有
		result = params ? (typeof ps[params]!=='undefined' ? ps[params] : undefined) : ps;
	}

	return result;
};

/**
 * 增加url参数，替换已存在的参数
 * @param {[type]} params [description]
 */
P.util.addUrlParams = function (params) {
	var queryString = location.search;

	$.each(params || {}, function(k, v){
		var rule = new RegExp('\\b'+ k +'\\b=[^&#$]*', 'g');
		if (rule.test(queryString)) {
			queryString = queryString.replace(rule, k +'='+ v);
		} else {
			queryString += (queryString.substring(0, 1)==='?' ? '&' : '?') + k +'='+ v;
		}
	});

	location.search = queryString;
};

/**
 * 获取到完整的http地址
 *
 * @param  string url
 * @return string type type='api'(API完整地址) type='location'(页面完整地址)
 */
P.util.getFullUrl = function(url, type) {
	var host = type='api' ? P.config.API_BASE_URL : ('http://'+ location.host);

	if (host && /^(http(s)?:)?\/\/|^\/\//.test(url) === false) {
		url = host + url;
	}

	return url;
};

/**
 * 判断请求目标是否跨域
 * @return {Boolean} [description]
 */
P.util.isCrossDomain = function(url) {
	var rt = true;

	// 简单判断为同域（暂时忽略了protocol和port）
	if ((new RegExp('//'+location.host, 'i')).test(url)) {
		rt = false;
	}

	return rt;
};

/**
 * 深度复制
 */
P.util.copydata = function(obj, preventName) {
	if ((typeof obj) == 'object') {
		var res = P.util.isArray(obj) ? [] : {};
		for (var i in obj) {
			if (i != preventName)
				res[i] = P.util.copydata(obj[i], preventName);
		}
		return res;
	} else if ((typeof obj) == 'function') {
		return Object;
	}
	return obj;
};

/**
 * 是否为数组
 */
P.util.isArray = function(obj){
	return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()=='array';
};

/**
 * 字符串\转义，来自QZFL.string.escString
 */
P.util.escString = function(str){
	var m = {
			'\\\\'	: /\\/g,
			'\\/'	: /\//g,
			'\\n'	: /\n/g,
			''		: /\r/g,
			'\\t'	: /\t/g,
			'\\\''	: /\x27/g,
			'\\"'	 : /\x22/g
		};

	str = str.toString();
	for(var x in m) {
		str = str.replace(m[x], x);
	}

	return str;
};

/**
 * 字符串转换为JSON对象
 * Logic borrowed frome jQuery 1.6.2
 */
P.JSON.parse = function(data, opts) {
	if ( typeof data !== "string" || !data ) {
		return null;
	}

	// 如果包含空格，IE可能出错
	data = data.replace(/^\s+|\s+$/g, '');
	!opts && (opts = {
		// standardJSON	: true,	// =false，则允许解析非标准JSON
	});

	var rvalidchars = /^[\],:{}\s]*$/,
		rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
		rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
		rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
		rbrace = /^(?:\{.*\}|\[.*\])$/;

	if(rbrace.test( data )) {
		data = (data+'').replace(/^\s+|\s+$/g, '');

		if (window.JSON && window.JSON.parse) {
			try {
				return window.JSON.parse(data);
			} catch(err) {
				// 错误了就继续走下面的方式
				if (opts.standardJSON !== false) {
					throw 'invalid format that cannot convert to JSON.';
				}
			}
		}

		// Make sure the incoming data is actual JSON
		// borrowed from http://json.org/json2.js
		if ( rvalidchars.test(
				data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")
			) ) {

			return (new Function( "return " + data))();
		} else if (opts.standardJSON === false) {
			return (new Function( "return " + data))();
		} else {
			throw 'invalid format that cannot convert to JSON.';
		}
	} else {
		return data;
	}
};

/**
 * 对象转换为字符串，来自QZFL.lang.obj2str
 */
P.JSON.stringify = function(obj) {
	var t, sw;

	if (typeof(obj) == 'object') {
		if(obj === null){ return 'null'; }

		if(window.JSON && window.JSON.stringify){
			return JSON.stringify(obj);
		}

		sw = P.util.isArray(obj);
		t = [];
		for (var i in obj) {
			t.push((sw ? "" : ("\"" + P.util.escString(i) + "\":")) + P.JSON.stringify(obj[i]));
		}
		t = t.join();
		return sw ? ("["+t+"]") : ("{"+t+"}");
	} else if (typeof(obj) == 'undefined') {
		return 'undefined';
	} else if (typeof(obj) == 'number' || typeof(obj) == 'function') {
		return obj.toString();
	}
	return !obj ? "\"\"" : ("\"" + P.util.escString(obj) + "\"");
};

/*
	本地存储
	支持json格式数据的存储
*/
(function(ql) {
	var store = null,
		engine = null,
		searchOrder,
		engines;

	searchOrder = ['localStorage', 'userData'];//, 'globalStorage'];
	engines = {
		localStorage: {
			test: function () {
				return !!window.localStorage;
			},
			init: function () {
				store = window.localStorage;
			},
			getItem: function (key) {
				return (P.JSON.parse( store.getItem(key) ));
			},
			setItem: function (key, value) {
				typeof value==='object' && (value = P.JSON.stringify(value));

				return store.setItem(key, value);
			},
			removeItem: function (key) {
				return store.removeItem(key);
			}
		},
		userData: {
			test: function () {
				return window.ActiveXObject ? true : false;
			},
			init: function () {
				store = document.documentElement;
				store.addBehavior('#default#userdata');
			},
			getItem: function (key) {
				store.load(key);
				return P.JSON.parse( store.getAttribute(key) );
			},
			setItem: function (key, value) {
				typeof value==='object' && (value = P.JSON.stringify(value));

				store.load(key);
				store.setAttribute(key, value);
				return store.save(key);
			},
			removeItem: function (key) {
				store.load(key);
				store.expires = new Date(315532799000).toUTCString();
				return store.save(key);
			}
		}
	};
	for (var i = 0, l = searchOrder.length, engine; i < l; i++) {
		engine = engines[searchOrder[i]];

		// 防止读异常，都try下
		try {
			if (engine.test()) {
				engine.init();
				break;
			}
		} catch (ex) {
			engine = null;
		}
	}

	/**
	 * P.localStorage.set 存入
	 * @param	string	key		键
	 * @param	mix		data	值，可以是hashmap对象
	 */
	ql.set = function(key, value) {
		/* 这里对所有的读写都做try，原因：
			1. userdata的存储文件属性被修改为只读时，调用load方法时会失败。来自betawang
			2. ie10 for win7,访问window.localStorage时提示：The system cannot find the path specified。来自scorpionxu
		*/
		try {
			return engine.setItem(key, value);
		} catch(ex) {
			return false;
		}
	};

	/**
	 * P.localStorage.get 取出
	 * @param	string	key		键
	 * @return	mix		可能返回json对象，或字符串值
	 */
	ql.get = function(key) {
		try {
			return engine.getItem(key);
		} catch(ex) {
			return null;
		}
	};

	/**
	 * P.localStorage.remove 删除值
	 * @param	string	key		键
	 */
	ql.remove = function(key) {
		try {
			return engine.removeItem(key);
		} catch(ex) {
			return false;
		}
	};
})(P.localStorage = P.localStorage || {});


/* 存储管理 */
(function(qs) {
	var SMEDIA,
		_config = {
			_expire: 300000  // 有效时间默认5分钟,单位ms,如果为-1(小于零的数)，则永不过期。每个存储的数据都带有这个字段。
		},
		_isExpired,
		_allKeys = '_P_stored_keys_';  // 存储的所有字段

	// 存储介质，各自的存活周期不一样。根据业务需求取用适当的存储介质。
	SMEDIA = {
		// 内存变量，整页刷新时清除
		memory: (function(){
			var _datapool = {},
				_md;

			return {
				set: function(key, val){
					// 需要拷贝一份，避免被引用修改
					_datapool[key] = P.util.copydata(val);
				},
				get: function(key){
					// 不能直接返回，需要拷贝一份返回，避免原始数据被篡改
					return key in _datapool ? P.util.copydata(_datapool[key]) : null;
				},
				remove: function(key){
					_datapool[key] = null;
					delete _datapool[key];
				}
			}
		})(),
		// 本地存储，和页面跳转无关，始终有效
		local: {
			set: function(key, val){
				P.localStorage.set(key, val);
			},
			get: function(key){
				return P.localStorage.get(key);
			},
			remove: function(key){
				P.localStorage.remove(key);
			}
		}
	};

	// 当前数据是否有效
	_isExpired = function(data) {
		return data._expire>0 && ((new Date).getTime() - data._time > data._expire) ? true : false;
	};

	/**
	 * 获取数据
	 * @param	{string}	key		必须
	 * @param	{string}	media	可选，值可以为local或memory，前者从本地存储中取，后者从内存变量取
	 * @return	{mixed}
	 */
	qs.get = function(key, media) {
		var sdata;

		media && (sdata = SMEDIA[media].get(key));

		if(sdata){
			if(!_isExpired(sdata)) {
				// 还有效，则返回数据
				return sdata.data;
			} else {
				// 否则清理过期的数据
				//SMEDIA[media].remove(key);
				qs.del(key, media);
				return false;
			}
		} else {
			return false;
		}
	};

	/**
	 * 写入数据
	 * @param	{string}	key		必须
	 * @param	{string}	data	必须，数据
	 * @param	{object}	cfg		可选，media: 指定存储介质（local|memory），expire：存储的有效时间(ms)
	 * @return	{boolean}
	 */
	qs.set = function(key, data, cfg) {
		var sdata, skeys;

		typeof cfg === 'undefined' && (cfg = {});
		cfg.media === 'undefined' && (cfg.media = 'parent');  // 默认存储到parent上

		// 约定的存储结构
		sdata = {
			data: data,
			_time: (new Date).getTime(),  // 存储的当前时间
			_expire: cfg.expire || _config._expire  // 此数据的有效期
		};

		// 更新下已经存储的字段
		cfg.media == 'local' && key!=_allKeys && (
			skeys = qs.get(_allKeys, 'local') || {},
			skeys[key] = 1,  // 标明此key还可用
			qs.set(_allKeys, skeys, {media:'local', expire:-1})
		);

		return SMEDIA[cfg.media].set(key, sdata);
	};

	/**
	 * 删除数据
	 * @param	{string}	key		必须
	 * @return	{boolean}
	 */
	qs.del = function(key, media) {
		var sdata, skeys, rt = true;

		typeof media==='string' ?
			(sdata = SMEDIA[media].get(key))
			:
			// 未指定存储介质时，先检索memory有无此存储，若无则检查本地存储是否有
			(media='memory', sdata = SMEDIA[media].get(key)) || (media='local', sdata = SMEDIA[media].get(key));

		// 已有的存储，则删除
		if(sdata){
			rt = SMEDIA[media].remove(key);

			// 同时从字段列表中删除此字段
			media=='local' && (skeys = qs.get(_allKeys, 'local')||{});
			skeys && (key in skeys) && (
				skeys[key] = null, delete skeys[key],
				qs.set(_allKeys, skeys, {media:'local', expire:-1})
			);
		}

		return rt;
	};

	// 清除已过期的数据(仅本地存储的)
	qs.purge = function(){
		var skeys = qs.get(_allKeys, 'local');

		for(var k in skeys) {
			qs.get(k, 'local');  // get时会判断是否有效，并做清除
		}
	};

	// 内存变量存储
	/**
	 * P.storage.getMemory
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	qs.getMemory = function(key){
		return qs.get(key, 'memory');
	};

	/**
	 * P.storage.setMemory
	 * @param	{string}	key		必须
	 * @param	{string}	data	必须，数据
	 * @param	{object}	expire	可选，存储的有效时间(ms)。默认5分钟
	 * @return	{boolean}
	 */
	qs.setMemory = function(key, data, expire){
		return qs.set(key, data, {
			media : 'memory',
			expire: expire || _config._expire
		});
	};

	/**
	 * P.storage.deleteMemory
	 * @param	{string}	key		必须
	 * @return	{boolean}
	 */
	qs.deleteMemory = function(key) {
		return qs.del(key, 'memory');
	};

	// 本地存储
	/**
	 * P.storage.getLocal
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	qs.getLocal = function(key){
		return qs.get(key, 'local');
	};

	/**
	 * P.storage.setLocal
	 * @param	{string}	key		必须
	 * @param	{string}	data	必须，数据
	 * @param	{object}	expire	可选，存储的有效时间(ms)。默认5分钟
	 * @return	{boolean}
	 */
	qs.setLocal = function(key, data, expire){
		return qs.set(key, data, {
			media : 'local',
			expire: expire || _config._expire
		});
	};

	/**
	 * P.storage.deleteLocal
	 * @param	{string}	key		必须
	 * @return	{boolean}
	 */
	qs.deleteLocal = function(key) {
		return qs.del(key, 'local');
	};

	// 清理策略
	(function(){
		// 当前剩余空间判断（目前支持IE8+）
		if(typeof localStorage==='object' && 'remainingSpace' in localStorage){
			// 小于阀值(1M，共5M)，开始执行清理工作
			localStorage.remainingSpace<1000000 && setTimeout(P.storage.purge, 0);
		}

		// 停留时长超过20s，清理过期数据
		setTimeout(P.storage.purge, 20000);
	})();
})(P.storage);

/**
 * 函数队列
 */
P.fnQueue = function(context){
	this.queue = [];
	this.context = context || null;  // 执行环境
};
P.fnQueue.prototype = {
	// 保留式执行，执行完毕，队列尚在
	exec: function(context){
		var item;

		// 执行的时候，需要保持原来的context...
		for(var i=0, len=this.queue.length; i<len; i++){
			item = this.queue[i];
			item.length>1 ?
				item[0].apply(context||this.context, item[1])
				:
				item[0].apply(context||this.context);
		}
	},
	// 执行完毕，队列清空
	execOnce: function(context){
		this.exec(context);
		this.queue = [];
	},
	// 追加到当前队列的最后
	add: function(fn, args){
		typeof fn === 'function' && this.queue.push(args ? [fn, args] : [fn]);
		return this.queue.length-1;  // 返回当前函数在队列汇总的index
	},
	// 插入到前面
	insert: function(fn, args){
		typeof fn === 'function' && this.queue.unshift(args ? [fn, args] : [fn]);
		return 0;  // 这个时候已经在最前面啦
	},
	// 获取指定索引下的回调函数
	get: function(index){
		return index <= this.queue.length ? this.queue[index] : null;
	}
};

////////////////////////// 网络请求 //////////////////////////////


/**
 * 网络请求类，需要实例化使用
 * 支持通过代理页进行跨子域通信的方式，代理页需要通过iframe返回一个xhr实例，如：
 * <script type="text/javascript">
	document.domain = 'kaifage.com';
	frameElement.getTransport = function getTransport() {
		var xhr;

		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xhr = new ActiveXObject("Msxml2.XMLHTTP") || new ActiveXObject("Microsoft.XMLHTTP");
		}

		return xhr;
	};
	</script>

	代理页可以全局设置（P.network.config.xhrProxyUrl），
	也可以单个cgi设置(P.rest.GET('xxx', {}, function(){}, {
		xhr : xhrObject,	// 方法一：直接拿到了一个xhr对象时
		xhrProxyUrl: url,	// 方法二：代理页url
	}))
 */
P.network = {
	/**
	 * 真正的请求，需要通过new 来初始化，以隔离属性
	 * @todo 对接window.fetch
	 * @return {[type]}
	 */
	send	: function(method, url, requestParams, callback, opts) {
		var callbackName, ajaxParams = {},
			isCrossDomain, isUpload = false;

		opts = opts || {};
		this.url = P.util.getFullUrl(url, 'api');	// 补充完整的url
		isCrossDomain = P.util.isCrossDomain(this.url);

		// 是否需要开启子域代理模式：若是，则先获取到xhr，再调一次send()
		if (isCrossDomain && !opts.xhr && P.network.config.xhrProxyUrl && this.url.indexOf(document.domain)>-1) {
			P.network.proxy.call(this, method, url, requestParams, callback, opts);
			return;
		}

		this.method = method;
		this.params = requestParams || {};
		this.abort = false;

		ajaxParams.contentType = opts.contentType || 'application/json';

		// 识别文件上传
		$.each(this.params, function(k, v){
			if (typeof v==='object' && (v instanceof File)) {
				isUpload = true;
				return false;
			};
		});
		if (isUpload) {
			// @todo 暂未考虑不支持的情况
			this.params = new FormData();
			$.each(requestParams, (function(_m){
				return function(k, v){
					_m.params.append(k, v);
				};
			})(this));

			this.type				= 'POST';
			ajaxParams.enctype		= 'multipart/form-data';
			ajaxParams.cache		= false;
			ajaxParams.contentType	= false;
			ajaxParams.processData	= false;
		};

		this.opts		= opts || {};
		this.callback	= callback;

		P.network.config.requestHandler.exec(this)
		if(this.abort) {
			return false;
		}

		this.id	 = P.util.genHash(this.url +'?'+ P.JSON.stringify(this.params));

		if (!isCrossDomain || this.opts.crossDomain || this.opts.xhr) {	// xhr，同域 或 支持XOR 或xhr代理
			this.opts.xhr && (ajaxParams.xhr = this.opts.xhr);	// 使用第三方的xhr

			ajaxParams.dataType = this.opts.dataType || 'json';
			this.opts.crossDomain && (ajaxParams.crossDomain = true);

			ajaxParams.complete = this.complete = (function(m){
				return function(d){
					var retryId = 'Pretry-'+ m.id;

					// 拿到的可能为非标准JSON
					if (!d.responseJSON) {
						// @todo 在生产环境下，这里要去掉standardJSON，或设置为true
						try {
							d.responseJSON = P.JSON.parse(d.responseText, {standardJSON: false});
						} catch (err) {
							d.status = 599;
							d.statusText = 'JSON Parse Error'
							d.responseJSON = {
								ret : 599,
								msg : '返回格式错误，非标准JSON'
							};
						}
					};
					m.response = d;
					m.responseJSON = d.responseJSON;
					P.network.config.afterResponse.exec(m);

					P.network.config.responseHandler.exec(m);

					callback(m.response.responseJSON, {
						responseText	: d.responseText||'',
						status			: d.status||0,
						statusText		: d.statusText||'',
						// 重试id，便于点击时重新发起一次同样的请求
						retryId			: retryId
					});

					// retry
					// 对服务器错误的情形，如果能查到重试的dom id，则绑定重试行为
					// <a href="javascript:;" id="{RETRY_ID}">retry</a>
					if (d.status >= 500) {
						$(document.body).off('click', '#'+retryId)
							.on('click', '#'+retryId, (function(m){
								return function() {
									P.network.proxy.call(m, m.method, m.url, m.requestParams, m.callback, m.opts);
									return false;
								};
							})(m));
					}

					P.network.config.doneHandler.exec(m);
				};
			})(this);
		} else {	// JSONP跨域
			ajaxParams.dataType = this.opts.dataType || 'script';

			callbackName = this.opts.callbackName || ('callback_'+ this.id);	// 附加参数，以便不同

			this.url += '&callback='+callbackName;

			window[callbackName] = this.complete = (function(callback, callbackName, m) {
				return function(d){
					m.response = d;
					P.network.config.afterResponse.exec(m);

					P.network.config.responseHandler.exec(m);

					callback(m.response);
					window[callbackName] = null;
					delete window[callbackName];

					P.network.config.doneHandler.exec(m);
				};
			})(callback, callbackName, this);
		}

		ajaxParams.type = this.method;

		// 对于GET，请求参数需要放到URL，不能放到body
		// see http://stackoverflow.com/questions/978061/http-get-with-request-body
		if (this.method==='GET' || this.method==='DOWNLOAD' || this.method=='LOCATION') {
			this.url += (this.url.indexOf('?')>=0?'&':'?') + $.param(this.params);
		} else if (isUpload) {
			this.data = this.params;
		} else {
			this.data = P.JSON.stringify(this.params);
		}

		// 下载请求
		if (this.method === 'DOWNLOAD') {
			/*var ifr = $('<iframe src="about:blank" style="display:none"></iframe>');
			var ifr = $('<iframe src="about:blank" style="display:none"></iframe>');

			ifr.bind('load', function(){
				$(this).remove();
			});
			ifr.prop('src', this.url).appendTo('body');*/

			window.open(this.url);

			this.abort = true;
		} else if(this.method === 'LOCATION') {
			location.href = this.url;
			this.abort = true;
		}

		P.network.config.beforeRequest.exec(this);
		if(this.abort === true) {
			return false;
		}

		ajaxParams.url = this.url;
		ajaxParams.data = this.data;

		return $.ajax(ajaxParams);
	},

	/**
	 * 子域代理请求模式
	 * @type {[type]}
	 */
	_timerProxyXHRFactory: null,	// static
	proxy : function(method, url, requestParams, callback, opts) {
		var proxyHandler, id, callSendFn;

		opts = opts || {};

		clearTimeout(P.network._timerProxyXHRFactory);

		callSendFn = (function(_m){
			return function(transport) {
				if (transport) {
					opts.xhr = transport;
					opts.crossDomain = true;
					return new P.network.send(method, url, requestParams, callback, opts);
				} else {
					// not found, try it again
					setTimeout(function(){
						new P.network.send(method, url, requestParams, callback, opts);
					}, 100);
				}
			};
		})(this);

		proxyUrl = opts.xhrProxyUrl || P.network.config.xhrProxyUrl;
		id = 'proxyHandler' + P.util.genHash(proxyUrl);

		// 重复利用，也可以避免并发获取的情况
		proxyHandler = $('#'+ id);
		if (proxyHandler.size() > 0) {
			callSendFn(proxyHandler[0].getTransport);
		} else {
			$('<iframe id="'+ id +'" src="'+ proxyUrl +'" width="1px" height="1px" style="display:none"></iframe>')
				.on('load', (function(callSendFn){
					return function(){
						var xhr = this.getTransport;

						callSendFn(xhr);

						// 延时清理，快速请求的时候可以重用下
						P.network._timerProxyXHRFactory = setTimeout(function(){
							$('#'+ id).remove();
							id = null;
						}, 3600000);
						// @todo 这里清理的时间需要通过事件触发
					};
				})(callSendFn))
				.appendTo(document.body);
		}
	}
};

/**
 * 网络请求类的配置属性
 * @type static
 */
P.network.config = {
	// 几个请求切面，按照顺序发生。每个切面都是个队列
	// 内部的this指向请求实例
	requestHandler	: new P.fnQueue(),
	beforeRequest	: new P.fnQueue(),
	afterResponse	: new P.fnQueue(),
	responseHandler	: new P.fnQueue(),
	doneHandler		: new P.fnQueue(),

	// 跨域请求的代理页，需要在外部override
	xhrProxyUrl	: ''
};

// 显示loading
P.network.config.beforeRequest.add(function(){
	if (this.opts.showLoading) {
		this.opts.loadingId = P.uiPage.showLoading(this.opts.showLoading);
	};
});
P.network.config.afterResponse.add(function(){
	if (this.opts.showLoading) {
		P.uiPage.hideLoading(this.opts.loadingId);
	}
});

// 支持本地cache
P.network.config.beforeRequest.add(function(){
	// 先仅开放get
	if (this.method==='GET' &&  this.opts.expire>0) {
		var storageData = P.network.cache.get(this.id);

		// 如果存在数据
		if (storageData) {
			this.complete(storageData);
			this.dataSource = P.network.cache.name;
			this.abort = true;
		};
	}
});
P.network.config.afterResponse.add(function(){
	// 先仅开放get
	if (this.method === 'GET' && this.response.status===200 && this.responseJSON && this.responseJSON.code===0) {
		if (this.dataSource != P.network.cache.name && this.opts.expire>0) {
			P.network.cache.set(this.id, this.response, this.opts.expire);
			// @todo 主动清理方式
		};
	}
});

(function(Cache){
	Cache.name = Cache.prefix = 'PLocalCache';

	Cache.set = function(key, data, expire) {
		P.storage.setLocal(Cache.prefix+key, data, expire);
	};

	Cache.get = function(key) {
		return P.storage.getLocal(Cache.prefix+key);
	};

	Cache.delete = function(key) {
		P.storage.deleteLocal(Cache.prefix+key);
	};
})(P.network.cache = {});

////////////////////////// 系统级弹框 //////////////////////////////

/**
 * 替换系统的 alert
 * @param  {[type]}   msg      [description]
 * @param  {Function} callback [description]
 * @param  {[type]}   opts     [description]
 * @return {[type]}            [description]
 */
P.alert = function(msg, callback, opts) {
	if (!msg || $('div.bootbox-alert').size()>0) {
		// 阻止重复弹出
		return false;
	};
	opts = opts || {};
	!callback && (callback = function(){});

	return bootbox.alert(msg, callback);
};

/**
 * 替换系统的 prompt
 * @param  {[type]}   msg      [description]
 * @param  {Function} callback [description]
 * @param  {[type]}   opts     [description]
 * @return {[type]}            [description]
 */
P.prompt  = function(msg, callback, opts) {
	if (!msg || $('div.bootbox-prompt').size()>0) {
		return false;
	};
	opts = opts || {};
	!callback && (callback = function(){});

	return bootbox.prompt(msg, callback);
};

/**
 * 替换系统的 confirm
 * @param  {[type]}   msg      [description]
 * @param  {Function} callback [description]
 * @param  {[type]}   opts     [description]
 * @return {[type]}            [description]
 */
P.confirm = function(msg, callback, opts) {
	if (!msg || $('div.bootbox-confirm').size()>0) {
		return false;
	};
	opts = opts || {};
	!callback && (callback = function(){});

	return bootbox.confirm(msg, callback);
};

/**
 * 替换系统的 confirm
 * @param  {[type]}   msg      [description]
 * @param  {Function} callback [description]
 * @param  {[type]}   opts     [description]
 * @return {[type]}            [description]
 */

/**
 * 通用弹框，包含一段html
 *
 * @param  {[type]}   msg      [description]
 * @param  {Function} callback [description]
 * @param  {[type]}   opts     [description]
 * @return {[type]}            [description]
 */
P.dialog = function(msg, callback, opts) {
	var defaults;

	if (!msg) {
		return false;
	};

	opts = opts || {};
	!callback && (callback = function(){});

	defaults = {
		title: opts.title || '',
		message: msg,
		buttons: {
			success: {
				label: opts.label||'OK',
				callback: callback
			}
		}
	};

	opts.loading && (delete defaults.buttons);
	$.extend(defaults, opts);

	return bootbox.dialog(defaults);
};

/**
 * 关闭以上各种弹框
 * @param  {Boolean} isBubble 是否需要尝试向上查找关闭浮层（iframe使用场景时）
 * @return {[type]}           [description]
 */
P.closeDialog = function(isBubble) {
	bootbox && bootbox.hideAll();

	if (isBubble) {
		var _parent = parent,
			bubbleClose;

		bubbleClose = function() {
			try {
				_parent.bootbox.hideAll();
			} catch(err){}

			while (top !== _parent) {
				_parent = _parent.parent;
				bubbleClose();
			}
		};
	};
};

P.tips.error = function(msg, callback) {
	P.tips.show(msg, 'error', {callback:callback});
};

P.tips.success = function(msg, callback) {
	P.tips.show(msg, 'success', {callback:callback});
};

P.tips.info = function(msg, callback, opts) {
	opts = opts || {};
	P.tips.show(msg, 'info', {callback:callback, timeout:opts.timeout});
};

P.tips.loading = function(msg, callback, opts) {
	opts = opts || {};
	P.tips.show(msg, 'loading', {callback:callback, timeout: opts.timeout});
};


P.tips._timer = null;
P.tips.show = function(msg, type, opts) {
	clearTimeout(P.tips._timer);

	opts = opts || {};

	if (typeof opts.timeout==='undefined') {
		opts.timeout = (type === 'loading' ? 20000 : 2000);
	}

	// 延迟点出来，避免打堆
	P.tips._timer = setTimeout((function(msg, type, opts){
		return function(){
			var contentd, id='PTips',
				el, cssMapping, iconMapping;

			opts = opts || {};
			type = type || 'error';
			cssMapping = {
				'success'	: 'alert-success',
				'error'		: 'alert-danger',
				'info'		: 'alert-info',
				'loading'	: 'alert-loading'
			};
			iconMapping = {
				'success'	: 'fa-check-circle',
				'error'		: 'fa-times-circle',
				'info'		: 'fa-info-circle',
				'loading'	: 'fa-spin fa-spinner'
			};

			$('#'+id).remove();

			content = [
				'<div class="alert '+ cssMapping[type] +'" style="position:absolute;left:0;z-index:65535;" id="'+id+'">',
					'<i class="fa '+ iconMapping[type] +'" style="font-size: 20px;vertical-align: bottom;"></i> ',
					msg,
				'</div>'].join('');

			$(content).appendTo('body');

			el = $('#'+ id);
			el.css({
				transition: 'left 0.5s, opacity 0.5s',
				opacity: 1,
				left: ($(window).width()-el.width())/2 +'px',
				top: ($(window).height()-el.height())/2 + $(document).scrollTop() +'px'
			});

			if (opts.timeout > 0) {
			setTimeout((function(el, callback){
				return function(){
					el.remove();
					/*css({
						transition: 'opacity 1s',
						opacity: 0
						// left: $(window).width() - el.width() - 100 +'px',
					});*/

					callback && callback();
				}
			})(el, opts.callback), opts.timeout);
			}
		};
	})(msg, type, opts), 200);
};

P.tips.hide = function(){
	// 因为展示是延迟的，那隐藏也需要延迟，确保时序
	setTimeout(function(){
		$('#PTips').remove();
		/*css({
			transition: 'opacity 1s',
			opacity: 0
			// left: $(window).width() - el.width() - 100 +'px',
		});*/

	}, 250);

};

// bootbox 垂直居中
$(function(){
	if ($('Pbootbox-vertical').size() > 0) {
		return;
	};
	$('head').append('<style type="text/css" id="Pbootbox-vertical">' +
		[
			'.modal {text-align: center;}',
			'.modal:before {display: inline-block;vertical-align: middle;content: " ";height: 100%;}',
			'.modal-dialog {display: inline-block;text-align: left;vertical-align: middle;}'
		].join('')
	+'</style>');

	// 支持 ESC 关闭
	$(document).keyup(function(event){
		if (event.keyCode == 27) {
			P.closeDialog();
		}
	});
});

//////////////////////////  form 表单操作 //////////////////////////////

/**
 * 获取表单数据，支持：
 * 	1. 对象传入，key为字段名，value可以为HTML标签名，或者whatever
 * 	2. 数组传入
 * 	3. 字符串，单个字段
 * @param  {object} fields 需要获取的字段name，数组传入则批量获取
 * @param  {object} wrapper 可选，默认取form下的表单元素，但对一个页面有多个表单时，需要指定form，可以是ID
 * @return {[type]}        [description]
 */
P.form.getData = function(fields, wrapper) {
	var data = {}, paramsType, fieldsArray = [];

	// 支持多格式输入
	switch($.type(fields)) {
		case 'object' :
			$.each(fields, function(k, v){
				fieldsArray.push(k);
			});
			break;

		case 'string' :
			fieldsArray = [fields];
			break;

		default :
			fieldsArray = fields;
	}

	wrapper = typeof wrapper==='string' ? $('#'+wrapper) : (wrapper ? $(wrapper) : '');
	!wrapper && (wrapper = $(document));

	// 都格式化成数组来遍历
	$.each(fieldsArray, function(i, fieldName){
		var el, val, type, tagName;

		el = $('[name="'+ fieldName +'"],[name="'+ fieldName +'[]"]', wrapper);
		type = el.size()>0 ? (el.attr('type')||'').toUpperCase() : '';
		tagName = el.size()>0 ? el.get(0).tagName.toUpperCase() : '';

		// 可能取多组数据
		if (el.size() > 1) {
			val = [];
			$.each(el, function(i, v){
				var tv;

				v= $(v);
				if (v.attr('disabled')) {
					return;
				};

				// checkbox元素的默认转换
				if (type=='CHECKBOX' || type=='RADIO') {
					if (v.prop('checked')) {
						tv = $.trim(v.val());
					}
				} else {
					tv = $.trim(v.val());
				}
				tv!==undefined && tv!=='' && val.push(tv);
			});

			if (type=='RADIO' && val.length===1) {
				val = val.shift();
			};
		} else {
			if (el.attr('disabled')) {
				return;
			};
			if (tagName=='SELECT' && el.prop('multiple')) {
				val = el.val();
			} else {
				val = $.trim(el.val());
			}

			if (type=='CHECKBOX' || type=='RADIO') {
				if (el.prop('checked')) {
				} else {
					val = '';
				}
			}
		}

		typeof val!=='undefined' && (data[fieldName] = val);
	});

	return data;
};

/**
 * 表单设置值
 * @param {[type]} data [description]
 * @return {object} notSetList，未设置的值
 */
P.form.setData = function(data, opts) {
	var notSetList = {};

	opts = opts || {
		/*
		typeHandler: function(fieldElement, fieldValue){
			// 字段类型处理器
		},
		fieldHandler: function(fieldElement, fieldValue{
			// 具体字段处理器
		}
		*/
	};

	$.each(data, function(fieldName, fieldValue){
		var fieldElement = $('[name="'+ fieldName +'"]'),
			fieldType;

		if (fieldValue===null) {return};

		fieldType = ((fieldElement.get(0)||'').tagName||'').toUpperCase();
		fieldType=='INPUT' && (fieldType = fieldElement.attr('type').toUpperCase());

		switch (fieldType) {
			case 'RADIO':
				fieldElement.filter('[value="'+ fieldValue +'"]').prop('checked', true);
				break;

			case 'CHECKBOX':
				fieldElement.prop('checked', false);

				if ($.isArray(fieldValue)) {
					$.each(fieldValue, function(i, vv){
						fieldElement.filter('[value="'+ vv +'"]').prop('checked', true);
					});
				} else {
					fieldElement.filter('[value="'+ fieldValue +'"]').prop('checked', true);
				}
				break;

			case 'SELECT':
				if ($.isArray(fieldValue)) {
					$.each(fieldValue, function(i, vv){
						fieldElement.find('[value="'+ vv +'"]:last').prop('selected', true);
					});
				} else {
					fieldElement.val(fieldValue);
				}
				break;

			case 'TEXT':
			case 'TEXTAREA':
			case 'HIDDEN':
			default:
				if (typeof fieldValue !== 'object') {	// 叶子节点
					fieldElement.val(fieldValue);
				} else if ($.isPlainObject(fieldValue)) {	// 其他带层级化的
					var subSetResult = P.form.setData(fieldValue, opts);
					if (! $.isEmptyObject(subSetResult.notSetList)) {
						notSetList[fieldName] = {};
						$.extend(notSetList[fieldName], subSetResult.notSetList);
					};
				} else if ($.isArray(fieldValue) && fieldValue.length && $.isPlainObject(fieldValue[0])) {
					// 是数组，但是对象数组的
					$.each(fieldValue, function(ii, vv){
						var subSetResult = P.form.setData(vv, opts);
						if (! $.isEmptyObject(subSetResult.notSetList)) {
							!notSetList[fieldName] && (notSetList[fieldName] = []);
							notSetList[fieldName].push(subSetResult.notSetList);
						};
					});

				} else {
					notSetList[fieldName] = fieldValue;
				}
		}

		// 能找到的元素，才能识别type
		if (fieldElement.size() > 0) {
			fieldType && opts.typeHandler && opts.typeHandler[fieldType]
				&& opts.typeHandler[fieldType].call(null, fieldElement, fieldValue);
		};

		opts.fieldHandler && opts.fieldHandler[fieldName]
			&& opts.fieldHandler[fieldName].call(null, fieldElement, fieldValue);
	});
// console.log('-==============', notSetList);

	// notSetList 不准 @todo
	return {
		notSetList: notSetList
	}
};

/**
 * 填充select 下拉框
 * 支持两种数据格式：
 * 	1. key-value对，如{1：'角色',2:'棋牌'}
 * 	2. 数组，可保持顺序，如[{label:'角色',value:1},{label:'棋牌',value:2}]
 * 	3. 数组，值为下标，从0开始，如['角色', '棋牌']
 * 	4. 二级下拉，如[{label:'角色',value:1, list:{1:'aaa',2:'bbbb'}}]
 * @param  {[type]} id   元素本身或id
 * @param  {[type]} list [description]
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 */
P.form.fillSelect = function(id, list, opts){
	var el, txtField, valField, selected, dict = {},
		isObjectArray = false;

	list = list || [];
	el = typeof id=='string' ? $('#'+id) : $(id);
	opts = opts || {};

	// 不存在的元素，就跳过了
	if (el.size() === 0) {
		return false;
	};

	// 判断下是哪种输入的数据类型，只要识别类型2即可
	if ($.isArray(list) && $.isPlainObject(list[0])) {
		isObjectArray = true;
		txtField = opts.txtField || 'label';
		valField = opts.valField || 'value';
	}

	selected = opts.selected || '';
	!$.isArray(selected) && (selected = [selected]);

	el = el.get(0);
	// 是否清除原有的
	if (opts.clear) {
		el.options.length = 0;
	};

	if ('defaults' in opts) {
		var dftKey, dftVal;

		if ($.isArray(opts['defaults'])) {
			dftKey = opts['defaults'][0];
			dftVal = opts['defaults'][1];
		} else {
			dftKey = opts['defaults'];
			dftVal = '';
		}

		el.options.add(new Option(dftKey, dftVal, false, true));
	}

	$.each(list, function(i, v){
		var opt, optGroup, isSelected, key, val;

		isObjectArray ? (
			key = v[txtField],
			val = v[valField]
		) : (
			key = v,
			val = i
		);

		// 是否有下级
		if (v.list && typeof v.list==='object') {
			var isObjectArraySublist = false;
			if ($.isArray(v.list) && $.isPlainObject(v.list[0])) {
				isObjectArraySublist = true;
			}
			optGroup = document.createElement("optgroup");
			optGroup.setAttribute('label', v.name||'');

			$.each(v.list, function(kk, vv){
				var opt, keyk, valk, isSelected;

				if (isObjectArraySublist) {
					keyk = vv[opts.txtField || 'name'];
					valv = vv[opts.valField || 'code'];
				} else {
					keyk = vv,
					valk = kk
				}
				isKSelected = $.inArray(vv, selected) >= 0;

				opt = new Option(keyk||(valk+'(无名称)'), valk, false, isKSelected);
				optGroup.appendChild(opt);

				dict[valk] = keyk ;
			});
		} else {
			isSelected = $.inArray(val, selected) >= 0;
			opt = new Option(key||(val+'(无名称)'), val, false, isSelected);

			// 其他属性都加上去，方便以后用
			if ($.isPlainObject(v)) {
				$.each(v, function(kk, vv){
					opt.setAttribute('data-'+ kk, vv);
				});
			}
		}

		el.options.add(opt || optGroup);

		// 存一份到字典，备查
		dict[val] = key;
	});

	// 如果没有值，则给个默认
	if (el.options.length < (opts['defaults']?2:1)) {
		el.options.add(new Option('暂无数据', '', false, false));
	}

	// 存储到全局字典
	P.dict.set(el.name||valField, dict);
};

(function(){
	P.nameMapping = {};
})();

// 自动数据填充 @todo nameMapping 待整理
(function(){
	var autoFillDataMapping = {};
	var NAME_MAPPING = {};
	var ALL_KEY = 'ALL';

	var buildGetMethod = function(name, mapping){
		var methodName, nameCamelCase;

		nameCamelCase = name.replace(/[_\-]/g, ' ').replace(/\b\w+\b/g, function(word){
			return word.substring(0,1).toUpperCase()+word.substring(1);}
		).replace(/\s+/g, '');

		methodName = 'get'+ nameCamelCase;

		var findCasecadeValue = function(list, value){
			var result;

			$.each(list, function(i, v){
				if (v.value == value) {
					result = v.label;
					return false;
				} else if(typeof v.items !=='undefined') {
					// 深度优先搜索
					var rt = findCasecadeValue(v.items, value);
					if (rt) {
						result = rt;
						return false;
					};
				}
			});

			return result;
		}

		P.nameMapping[methodName] = function(value) {
			var result;

			if (value === ALL_KEY) {
				result = mapping;
			} else {
				// 是否无限层级化的结构
				if ($.isArray(mapping)) {
					result = findCasecadeValue(mapping, value);
				} else {
					// 最简单的k-v map
					result = mapping[value];
				}

			}

			return result||value;
		};
	};

	// 新增一类实例
	P.nameMapping.append =
	P.form.addNameMapping = function(name, mapping) {
		// 1. 对接P.form.autoFillData，自动填充到页面对应的DOM
		autoFillDataMapping[name] = function(el, callback, opts) {
			P.form.fillSelect(el, mapping);

			callback && callback.call(null, mapping);
		}
		NAME_MAPPING[name] = mapping;

		// 2. 字典的翻译功能，获取对应值的含义
		buildGetMethod.call(this, name, mapping);
	};

	P.form.initNameMapping =
	P.form.refreshNameMapping = function() {
		var ALL_KEY = 'ALL';	// 获取所有列表
		var m = this;

		$.each(NAME_MAPPING, function(name, mapping) {
			mapping = mapping || {};

			P.form.addNameMapping(name, mapping);
		});
	};

	// 调用入口
	P.form.autoFillData = function(dataName, element) {
		element && (element=$(element)) && (dataName in autoFillDataMapping) && (
			autoFillDataMapping[dataName].call(null, element, function(){
				// 告诉下大家，已经加载完毕了，该干嘛的都干嘛去
				P.event.publish('autoFill/'+ dataName);
			}, {
				arguments: element.attr('data-arguments')
			})
		);
	};

	// 重填某个元素
	P.form.refreshAutoFillData = function(dataName) {
		P.form.autoFillData(dataName, $('[data-fill='+ dataName +']'));
	};

})();

////////////////////////// 自定义事件的观察者模式 //////////////////////////////

(function(EVENT){
	var EVENT_POOL = $({});

	/**
	 * 订阅
	 * @return {[type]} [description]
	 */
	EVENT.subscribe = function () {
		EVENT_POOL.on.apply(EVENT_POOL, arguments);
	};

	/**
	 * 退订
	 * @return {[type]} [description]
	 */
	EVENT.unsubscribe = function () {
		EVENT_POOL.off.apply(EVENT_POOL, arguments);
	};

	/**
	 * 触发自定义事件
	 * @return {[type]} [description]
	 */
	EVENT.publish = function () {
		EVENT_POOL.trigger.apply(EVENT_POOL, arguments);
	};
})(P.event);

////////////////////////// 字典存储 //////////////////////////////

/**
 * 全局列表型数据的字典，只是个笼统的存储，后面可以扩展出来仅获取名称、某个字段的这种，或者反转
 * @todo  和nameMapping结合
 * @param  {[type]} P [description]
 * @return {[type]}     [description]
 */
(function(P){
	var DICTIONARY = {};

	P.dict = {};

	/**
	 * 获取字典值，支持批量
	 * @param  {[type]} dictName 字典名称
	 * @param  {[type]} key      需要获取的具体词条，可以数组形式获取多个
	 * @return {[type]}          [description]
	 */
	P.dict.get = function(dictName, key) {
		var result = '';

		if (dictName in DICTIONARY) {
			if (typeof key === 'undefined') {
				result = DICTIONARY[dictName];
			} else if (typeof key !== 'object') {
				result = key in DICTIONARY[dictName] ? DICTIONARY[dictName][key] : '';
			} else {
				result = [];
				$.each(key, function(i, k){
					result.push(k in DICTIONARY[dictName] ? DICTIONARY[dictName][k] : '');
				});
			}
		}

		return result;
	};

	/**
	 * 设置字典的词条
	 * @param {[type]} dictName        [description]
	 * @param {[type]} keyValueMapping [description]
	 */
	P.dict.set = function(dictName, keyValueMapping) {
		// 新建还是追加
		if (dictName in DICTIONARY) {
			$.each(keyValueMapping, function(k, v) {
				DICTIONARY[dictName][k] = v;
			});
		} else {
			DICTIONARY[dictName] = keyValueMapping || {};
		}
	};

	/**
	 * 清空指定字典的所有词条
	 * @param  {[type]} dictName [description]
	 * @return {[type]}          [description]
	 */
	P.dict.reset = function(dictName) {
		DICTIONARY[dictName] = {};
	};
})(P);


(function(P){
	var _CONFIG = {};
	var _TIMER = {};
	var _SINGTON_TIMER = null;

	/**
	 * 显示进度条，基于SVG，无资源依赖
	 * IE9+
	 * @param  {[type]} element [description]
	 * @return {[type]}         [description]
	 */
	P.uiPage.showLoading = function(element, opts){
		var loadingUI, config, wrapWidth, wrapHeight, loadingId;

		typeof element==='string' && (element = $('#'+ element));
		opts = opts || {};

		// 获取容器尺寸，决定显示icon的大小和位置
		wrapWidth = element.width();
		wrapHeight = element.height();

		// 默认的样式配色等
		config = {
			width		: wrapWidth +'px',	// 整体宽度
			iconSize	: '60px',			// icon尺寸，同宽高
			color		: '#8ac007',		// loading条颜色
			autoClose	: 10000,			// 单位ms，自动隐藏loading的延时时间
			singleton	: true				// 单例模式，同一个时刻只有一个
		};
		$.extend(config, opts);

		// 综合参数处理
		// icon上边距
		!config.iconMarginTop && (
			config.iconMarginTop = (Math.max(Math.min(wrapHeight, $(window).height()), parseInt(config.iconSize,10)) - parseInt(config.iconSize,10))/2 +'px'
		);
		// 整体高度
		!config.height && (
			config.height = Math.max(100, wrapHeight) +'px'
		);

		loadingId = 'P-loadingUI-'+ Math.floor((Math.random())*1e10);

		_CONFIG[loadingId] = config;
		loadingUI = [
			'<div class="P-loadingUI" id="'+ loadingId +'">',
			'	<style type="text/css">',
			'	.P-loadingUI{margin:0 0 2em;height:'+ config.height +';width:'+ config.width +';text-align:center;padding:1em;margin:'+ config.iconMarginTop +' auto;display:inline-block;vertical-align:top;filter:url(#P-loadingIcon)',
			'	svg path,svg rect{fill:'+ config.color +';}',
			'	</style>',
			'	<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="'+ config.iconSize +'" height="'+ config.iconSize +'" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">',
			'	<path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946',
			'	s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634',
			'	c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>',
			'	<path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0',
			'		C22.32,8.481,24.301,9.057,26.013,10.047z">',
			'		<animateTransform attributeType="xml"',
			'		  attributeName="transform"',
			'		  type="rotate"',
			'		  from="0 20 20"',
			'		  to="360 20 20"',
			'		  dur="0.5s"',
			'		  repeatCount="indefinite"/>',
			'		</path>',
			'	</svg>',
			'</div>'
		].join('');

		// 延时一点显示，有的返回很快的情况就不要了
		if (config.singleton) {
			clearTimeout(_SINGTON_TIMER);
		};

		var timer = setTimeout((function(loadingUI, element){
			return function() {
				$(loadingUI).insertBefore(element.first());
				loadingUI = null;
				element = null;
			};
		})(loadingUI, element), 300);

		if(config.singleton) {
			_SINGTON_TIMER = timer;
		} else {
			_TIMER[loadingId] = timer;
		};

		// 是否自动关闭
		if (config.autoClose > 0) {
			setTimeout(P.uiPage.hideLoading, config.autoClose);
		};

		return loadingId;
	};

	/**
	 * 隐藏加载进度条
	 * @param  {[type]} loadingId 需要隐藏的进度条ID，如果不传，则隐藏页面所有的loading
	 * @return {[type]}           [description]
	 */
	P.uiPage.hideLoading = function(loadingId){
		var config = _CONFIG[loadingId] || {};

		if (config.singleton) {
			clearTimeout(_SINGTON_TIMER);
			config = null;
			if (loadingId) {
				_CONFIG[loadingId] = null;
				delete _CONFIG[loadingId];
			};
		} else {
			clearTimeout(_TIMER[loadingId]);
		}

		if (typeof loadingId !== 'undefined') {
			$('#'+ loadingId).remove();
		} else {
			$('.P-loadingUI').remove();
		}
	};

})(P);


/**
 * 设置分页
 * @param {[type]} id       填充分页的元素或id
 * @param {[type]} pageConf [description]
 * @param {[type]} onTurn   [description]
 */
P.uiPage.setPagination = function(id, pageConf, onTurn) {
	var el = typeof id==='string' ? $('#'+ id) : $(id),
		cont = [],
		showPageCount = 5,	// 只显示5个翻页块
		page = pageConf.current_page,
		pageSize = pageConf.page_size,
		totalPage = pageConf.total_page;


	totalPage===undefined &&(totalPage = Math.ceil(pageConf.total_count/pageSize));

	// 小于二页，则不显示
	if (totalPage < 2) {
		$('.pagination', el).remove();
		return;
	}

	cont.push('<ul class="pagination">');
	cont.push('<li class="disabled"><a href="javascript:;">共'+ pageConf.total_count +'条</a></li>');
	cont.push('<li'+ (page==1?' class="disabled"':'') +'><a href="javascript:;" data-page="1" title="1" data-page-size="'+ pageSize +'">|←</a></li>');
	cont.push('<li'+ (page==1?' class="disabled"':'') +'><a href="javascript:;" data-page="'+ Math.max(1,page-1) +'" title="'+ Math.max(1,page-1) +'" data-page-size="'+ pageSize +'">&lt;</a></li>');

	if(page > showPageCount) {
		cont.push('<li class="disabled"><span>…</span></li>');
	}

	for(var i=page>showPageCount?showPageCount*(Math.ceil(page/showPageCount)-1)+1:1; i<=Math.ceil(page/showPageCount)*showPageCount; i++) {
		if(i>totalPage) {
			break;
		}

		if (i>showPageCount) {
			if (i <= page+showPageCount) {
				cont.push('<li'+ (i==page?' class="active"':'') +'><a href="javascript:;" data-page="'+ i +'" title="'+ i +'" data-page-size="'+ pageSize +'">'+ i +'</a></li>');
			} else {
				break;
			}
		} else {
			if (i<=showPageCount) {
				cont.push('<li'+ (i==page?' class="active"':'') +'><a href="javascript:;" data-page="'+ i +'" title="'+ i +'" data-page-size="'+ pageSize +'">'+ i +'</a></li>');
			} else {
				break;
			}
		}
	}
	if(Math.ceil(totalPage/showPageCount) > Math.ceil(page/showPageCount)) {
		cont.push('<li class="disabled"><span>…</span></li>');
	}
	cont.push('<li'+ (page==totalPage?' class="disabled"':'') +'><a href="javascript:;" data-page="'+ Math.min(totalPage,page+1) +'" title="'+ Math.min(totalPage,page+1) +'" data-page-size="'+ pageSize +'">&gt;</a></li>');
	cont.push('<li'+ (page==totalPage?' class="disabled"':'') +'><a href="javascript:;" data-page="'+ totalPage +'" title="'+ totalPage +'" data-page-size="'+ pageSize +'">→|</a></li>');
	cont.push('</ul>');

	$('.pagination', el).remove();
	$(cont.join('')).appendTo(el);

	// 翻页事件
	$('.pagination', el).delegate('a', 'click', function(){
		var pageConf = $(this).data();

		$('.pagination', el).remove();

		// 不能粗暴的滚到顶部
		// document.body.scrollTop = parent.document.body.scrollTop = 0;

		onTurn && onTurn.call(null, pageConf.page, pageConf.pageSize);
	});
};

})(window.P = window.P || {});
