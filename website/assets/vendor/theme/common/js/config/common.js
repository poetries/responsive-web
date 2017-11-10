/**
 * PF 配置
 * @param  {[type]} P [description]
 * @return {[type]}   [description]
 */
(function(P, Y){
	Y.vars = Y.vars || {};
	
	$.extend(P.config, {
		API_PROTOCOL: 'http',
		API_HOST	: Y.vars.apiDomain||location.host,
		API_PATH	: '',
		API_VERSION	: 'v1'
	});

	// 跨子域的通信代理
	var regexp = new RegExp("(.*\\.)?"+ Y.vars.staticDomain);
	P.config.API_HOST = location.host.replace(regexp, "$1"+ Y.vars.apiDomain);
	P.network.config.xhrProxyUrl = 'http://'+ P.config.API_HOST +'/v1/proxy';

	P.config.API_BASE_URL = [
		P.config.API_PROTOCOL,
		'://',
		P.config.API_HOST,
		'/',
		P.config.API_PATH,
		P.config.API_PATH ? '/':'',
		P.config.API_VERSION
	].join('');

	// 对GET请求，将参数处理成q=ENCODED_JSON_STRING的形式
	P.network.config.requestHandler.add(function(){
		var params,
			accountId = Y.vars.account_id||Y.vars.advertiser_id,//||this.params.account_id, 只取来自模板的变量
			auth = P.storage.get('auth', 'local')||{},
			local = P.storage.get('userAccount|'+auth.id+'|'+accountId, 'local') || {};

		// 检测下多用户登录后互串的问题：此时auth存储的id（userId)已经变化了
		// @todo 这个问题并没有解决，因为会导致服务商过来的登录失效(此时无local)，先注释掉 20170719
		/* if (accountId && auth.id && !local) {
			// 终止请求
			this.abort = true;
			P.tips.error('当前账户对应的登录状态已失效，请重新登录', function(){
				top.location = 'http://'+ Y.vars.staticDomain;
			});
			return;
		}*/

		params = {
			'user_id'		: auth.id||'',
			'account_id'	: accountId||'',
			'sign'			: local.sign||'',
			'access_token'	: auth.token||''
		};

		// 日期相关参数统一，去掉连接符
		$.each(this.params, (function(m){
			return function(k, v){
				if (v && /(_time\b)|(_date\b)/.test(k.toString())) {
					m.params[k] = parseInt(v.toString().replace(/\-/g, ''), 10);
				}
			};
		})(this));

		if (this.method==='GET' || this.method==='DOWNLOAD') {
			var current_page, page_size;

			// 需要把翻页参数拿出来，成为独立参数
			this.params.current_page && (current_page = this.params.current_page, delete this.params.current_page);
			this.params.page_size && (page_size = this.params.page_size, delete this.params.page_size);

			this.params.q = $.isEmptyObject(this.params) ? '' : P.JSON.stringify(this.params);  // 这里不需要encode，在network会统一做
			current_page && (this.params.current_page = current_page);
			page_size && (this.params.page_size = page_size);
			$.extend(this.params, params);
		} else {
			this.url += (this.url.indexOf('?')>-1 ? '&' : '?') + $.param(params);
		}
	});

	// 统一加工所有的出错返回信息
	P.network.config.afterResponse.add(function(){
		// HTTP错误
		if (this.response.status != 200) {
			var httpError = false, httpMessage = '', httpCallback;
			
			switch(this.response.status) {
				case 403:
				case 401:
					httpError = true;
					httpMessage = '您没有此权限或已过期，请尝试重新登录';
					httpCallback = function() {
						location.href = '//' + Y.vars.staticDomain;
					};
					// 清除存储
					var accountId = Y.vars.account_id||Y.vars.advertiser_id,
						userId = (P.storage.get('auth', 'local')||{}).id;

					P.storage.del('userAccount|'+userId+'|'+accountId, 'local');
					P.storage.del('auth', 'local');
					break;
					
				case 404:
					httpError = true;
					httpMessage = '对应资源不存在';
					break;

				case 500:
					httpError = true;
					httpMessage = '服务器错误，请稍后再试';
					break;
			}
			if (this.opts.ignoreError !== true) {
				httpMessage && P.alert(httpMessage, function(){
					httpCallback && httpCallback();
				});
				return;
			}
		}

		!this.responseJSON && (this.responseJSON = {});
		if ($.isArray(this.responseJSON)) {
			this.responseJSON.code = 0;
		}
		if (typeof this.responseJSON.code === 'undefined') {
			this.responseJSON.code = 598;
			!this.responseJSON.message && (this.responseJSON.message = '返回数据格式错误');
		}
		if (this.responseJSON.code !== 0) {
			// 附加返回码，便于问题定位
			this.responseJSON.message_detail = this.responseJSON.message;

			// 如果返回码=50003，则直接展示服务端错误信息
			if (this.responseJSON.code != 50003) {
				this.responseJSON.message = [
					(Y.config.errorCommonCodeMapping||{})[this.responseJSON.code]
						|| (Y.config.errorCodeMapping||{}) [this.responseJSON.code]
						|| (Y.config.returnCodeMapping||{})[this.responseJSON.code]
						|| '系统异常，请稍后再试',
					'('+ this.responseJSON.code +')'
				].join('');
			}

			var gotoHomePage = function() {
				top.location = 'http://'+ Y.vars.staticDomain;
			};

			if(this.responseJSON.code === 21006 || this.responseJSON.code === 21005) {
				P.tips.error('登录状态失效，请重新登录……');
				window.setTimeout(gotoHomePage, 3000);
			} else if(this.responseJSON.code === 21013) {
				P.alert(this.responseJSON.message || '当前账户未通过审核', function(){
					gotoHomePage();
				});
			}
		}

		// 兼容后端返回的空结果
		if (this.responseJSON.code === 0) {
			if(!this.responseJSON.data) {
				this.responseJSON.data = {};
			}

			if(
				($.isArray(this.responseJSON.data) && this.responseJSON.data.length===0)	// PHP区分不了{} 和 []
				||
				this.responseJSON.data.list===null
			) {
				this.responseJSON.data = {list:[]};
			}
		}
	});

	// 弹框组件语言设置
	bootbox && (
		bootbox.addLocale('zh_CN', {
			"OK"		: '关闭',
			"CANCEL"	: '取消',
			"CONFIRM"	: '确认'
		}),
		bootbox.setDefaults("locale", 'zh_CN')
	);
	
	// config DataTable
	$.fn.dataTable && $.extend($.fn.dataTable.defaults, {
		searching: false,
		lengthChange: false,
		pagingType: "numbers",
		orderClasses: true,
		pageLength: 20,		// 默认每页20条
		language: {
			processing	: "处理中，请稍候...",
			lengthMenu	: "每页条数：_MENU_",
			info		: "共 _TOTAL_ 条数据",	// _START_ ~ _END_
			infoEmpty	: "",
			infoFiltered: "",
			infoPostFix	: "",
			loadingRecords: "加载中……",
			zeroRecords	: "暂无此数据",
			emptyTable	: "",
			paginate	: {
				first	: "首页",
				previous: "上页",
				next	: "下页",
				last	: "尾页"
			},
			aria: {
				sortAscending	: "",
				sortDescending	: ""
			}
		},
		// 标记删除的行
		/*rowCallback: function(row, data, index) {
			if (data.user_status==Y.nameMapping.CommonStatus) {
				$(row).addClass('deleted').attr('title', '已删除');
			}
		},*/
		sorting: [],	// 默认不排序
		/*columnDefs: [{
			// 此处不生效
			orderSequence: ['desc', 'asc'],
			targets: "_all"
		}]*/
	});

	// hack DataTable
	var tempDataTable = $.fn.dataTable;
	$.fn.dataTable = function(options) {
		var container = $(this);

		options = options || {};

		options.columnDefs = [{
			orderSequence: ['desc', 'asc'],
			targets: "_all"
		}];

		/**
		 * 增强功能
		 * 1. 支持点击编辑：
		 {
		 	ediable: true,		// 开启此功能
		 	placeholder: '', 	// 为空时的现实	
		 	cgi: 'Y.cgiReport.setField',	// 编辑完成后（blur或回车），此cgi处理数据，默认入参：newVal,oldVal,callback
		 	validate: function(val){return true;}	// 值校验，返回bool值，暂不支持异步
		 }
		 */

		$([
			'<style type="text/css">',
				// fixed column
				// '.dataTable .fixed{',
				// '	position:fixed !important;background-color:#eee !important;z-index:999;width:20% !important;opacity:0.9;',
				// '	overflow:hidden;text-overflow: ellipsis;white-space: nowrap;',
				// '}',
				// total
				'.dataTable .total{background-color:#eee;font-style:italic}',
				// editable
				'.dataTable .editable{',
				'	border-bottom:1px dashed #337ab7;color:inherit;padding:0 3px;',
				'}',
				'.dataTable .editable.focus{',
				// '	padding: 2px 8px;',
				'	display:inline-block;',
				'	border: none;',
				'	transition:border linear .2s,box-shadow linear .5s;',
				'	-moz-transition:border linear .2s,-moz-box-shadow linear .5s;',
				'	-webkit-transition:border linear .2s,-webkit-box-shadow linear .5s;',
				'	outline:none;',
				'	border-color:rgba(28,132,198,.75);',
				'	box-shadow:0 0 8px rgba(28,132,198,.5);',
				'	-moz-box-shadow:0 0 8px rgba(28,132,198,.5);',
				'	-webkit-box-shadow:0 0 8px rgba(28,132,198,3);',
				'}',
				'.dataTable .editable.error{',
				'	color:#ff3300;',
				'	border-color:rgba(255,51,0,.75);',
				'	box-shadow:0 0 8px rgba(255,51,00,.5);',
				'	-moz-box-shadow:0 0 8px rgba(255,51,0,.5);',
				'	-webkit-box-shadow:0 0 8px rgba(255,51,0,3);',
				'}',

			'</style>'
		].join('')).appendTo("head");

		// 支持后台翻页
		if (typeof options.data === 'function') {
			var fnGetData = options.data;
			options.data = null;	// 归还占用的data配置

			$.extend(options, {
				processing		: true,
				serverSide		: true,
				sAjaxDataProp	: 'data.list',	// 借助1.9-的兼容特性来做hack
				ajax			: function(data, callback, settings) {
					var fnCallback = function(d){
						!d.data && (d.data  = {});
						!d.data.list && (d.data.list = []);
						if (d.code === 0 && d.data.pagination) {
							d.recordsTotal = d.data.pagination.total_count;
							d.recordsFiltered = d.data.pagination.total_count;
						} else {
							d.recordsTotal = d.recordsFiltered = 0;
						}
						callback(d);
					}, params, orderFieldName;

					// 分页
					params = {
						current_page: data.start/data.length + 1,
						page_size: data.length
					};
					// 排序
					if (data.order.length > 0) {
						orderFieldName = data.columns[data.order[0].column].data;
						if (orderFieldName) {
							params['query_optional'] = {};
							params['query_optional'][orderFieldName] = {'ORDER_BY': (data.order[0].dir||'').toUpperCase()};
						}
					}

					fnGetData.call(null, params, fnCallback);
				}
			});
		};

		// 将值翻译成中文，增加nameMapping功能
		var needEditable = false;
		$.each(options.columns || {}, function(i, row){
			// 对接formUI
			row.name && (row.data = row.name);
			row.label && (row.title = row.label);
			if (row.items) {
				row.dataMapping = function(value){
					var result = value;

					if ($.isArray(row.items)) {
						$.each(row.items, function(i, v){
							if (v.value == value) {
								result = v.label;
								return false;
							}
						});
					} else if(typeof row.items === 'function') {
						result = row.items(value);
					} else {
						result = row.items[value] || value;
					}

					return result;
				};
			}
			
			// 支持单元格编辑
			if (row.editable) {
				// 埋点可编辑
				var originalDataMapping = row.dataMapping || function(val){return val;},
					placeholder = row.placeholder || '点击编辑',
					fieldName = row.data,
					column = i;

				row.dataMapping = function(val) {
					var content = originalDataMapping.call(null, val) || '';

					// 如果已经包含有标签，则跳过
					if (/<\w+[^>]*>/.test(content)) {
						return content;
					} else {
						return '<span class="editable" data-field="'+ fieldName +'" data-value="'+ encodeURIComponent(content) +'" data-column="'+ column +'" title="'+ placeholder +'">'+ content +'</span>';
					}
				};
				needEditable = true;
			}

			if (row.data && row.dataMapping) {
				!options.columnDefs && (options.columnDefs = []);

				// 字符串和函数形式都支持
				switch (typeof row.dataMapping) {
					case 'string' : 
						options.columnDefs.push({
							targets	: i,
							data	: row.data,
							render	: function (data, type, full, meta) {
								return type=='display' ? P.nameMapping['get'+ row.dataMapping].call(null, data) : data;
							}
						});
						break;

					case 'function':
						options.columnDefs.push({
							targets	: i,
							data	: row.data,
							render	: function(data, type, full, meta) {
								return row.dataMapping.call(null, data, type, full, meta);
							}
						});
						break;
				}
			};
		});

		// 支持总计行
		var needCaculateTotal = false;
		$.each(options.columns || {}, function(i, row){
			if(needCaculateTotal=row.total) {
				return false;
			}
		});
		if(needCaculateTotal === true) {
			$.extend(options, {
				"drawCallback": function ( settings ) {
		            // console.log(settings);
		            // console.log(settings.aoData);
		        },

				"footerCallback": function ( row, data, start, end, display ) {
		            var api = this.api(), data;

					// 避免重复计算，翻页时
		            if ($(this).find('tfoot.total').size() > 0) {
		            	return;
		            }

		            // 获取配置，哪些列需要做total
		            var settings = this.fnSettings();
					var tfootContent = [];
					// Remove the formatting to get integer data for summation
		            var intVal = function ( i ) {
		                return typeof i === 'string' ?
		                    i.replace(/[\$,]/g, '')*1 :
		                    typeof i === 'number' ?
		                        i : 0;
		            };
					var totalResult = {};

		            $.each(settings.aoColumns, function(columnIndex, v){
		            	var total, pageTotal;
		            	if(! api.column(columnIndex).visible()) {
		            		// 隐藏的列，跳过
		            		return;
		            	} else if (columnIndex === 0) {
		            		tfootContent.push('<td class="' + settings.aoColumns[columnIndex].className + '">总计</td>');
		            		return;
						} else if(v.dataMapping && typeof v.dataMapping == 'function'){
							tfootContent.push(v.dataMapping);
							return;
		            	} else if (v.total !== true) {
		            		tfootContent.push('<td class="' + settings.aoColumns[columnIndex].className + '">-</td>');
		            		return;
		            	}

			            // Total over all pages
			            total = api
			                .column( columnIndex )
			                .data()
			                .reduce( function (a, b) {
				                return intVal(a) + intVal($.isArray(b) ? b[0] : b);
			                }, 0 );

			            // Total over this page
			            /*pageTotal = api
			                .column( columnIndex, { page: 'current'} )
			                .data()
			                .reduce( function (a, b) {
			                    return intVal(a) + intVal(b);
			                }, 0 );*/

			            // Update footer
			            // $( api.column( columnIndex ).footer() ).html(
			            //     '$'+pageTotal +' ( $'+ total +' total)'
			            // );
			            
			            

			            // 如果不是整型的加法，小数点后会有浮动
			            if (!isNaN(total) && total != Math.floor(total)) {
			            	total = parseFloat(total, 10).toFixed(2);
			            }
						if(isNaN(total)){
							total = '-';
						}
						if (settings.aoColumns[columnIndex].dataMapping) {
			            	total = settings.aoColumns[columnIndex].dataMapping(total);
			            }
						totalResult[v.field] = total;

			            tfootContent.push('<td class="' + settings.aoColumns[columnIndex].className + '">' + total + '</td>');
		            });
					$.each(tfootContent,function(k,v){
						if(typeof v == 'function'){
							tfootContent[k] = v(totalResult);
						}	
					});

		    		$(this).append('<tfoot class="total"><tr class="text-right">'+ tfootContent.join('') +'</tr></tfoot>');
		        },
		    });
		}

		// 体验提升：柔和展现
		container.css('display', 'none');
		container = tempDataTable.call(container, options);
		container.fadeIn('container');

		// 支持单元格编辑
		if (needEditable) {
			container.delegate('td', 'click', function(){
				$(this).find('.editable').trigger('click');
			}).delegate('span.editable', 'click', function(evt){
				var el = $(this);

				el.addClass('focus').removeClass('error');
				el.attr('contenteditable', true).trigger('focus');

				window.event && (window.event.cancelBubble = true);
				evt.stopPropagation && evt.stopPropagation();  
			}).delegate('span.editable', 'blur keydown', function(event){
				// 失去焦点/回车，生效
				if(event.type==='keydown' && event.keyCode!==13) {
					return true;
				}

				var el = $(this),
					attrData = el.data(),
					value = $.trim(el.text()),
					cgi = options.columns[attrData['column']].cgi,
					callback = options.columns[attrData['column']].callback,
					validate = options.columns[attrData['column']].validate;

				el.attr('contenteditable', false);
				if (validate && !validate.call(null, value)) {
					el.addClass('error');
					return false;
				}

				if (cgi) {
					// 找到这一行的所有数据，覆盖关键数据，提交
					var data = container.api().row(el.closest('tr')).data();
					data[attrData['field']] = value || '';

					cgi.call(null, data, function(d){
						if (d.code === 0) {
							el.removeClass('focus');
						} else {
							el.addClass('error');
							el.attr('contenteditable', true);
						}
						callback && callback(d);
					});
				}
			});
		}

		return container;
	};

})(window.P = window.P || {}, window.Y = window.Y || {});

(function(Y){
	Y.config = Y.config || {};
	Y.config.returnCodeMapping = {
		// 0	: '操作成功',
	}
})(window.Y);


