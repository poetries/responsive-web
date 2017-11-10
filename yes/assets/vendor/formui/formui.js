/**
 * FormUI, FU
 */
(function(FU) {
	var _FILE_LOADED_MAPPING = {};

	$.extend(FU, {
		// 常用展现类型
		TYPE_HIDDEN		: 'hidden',
		TYPE_TEXT		: 'text',
		TYPE_PASSWORD	: 'password',
		TYPE_EMAIL		: 'email',
		TYPE_NUMBER		: 'number',
		TYPE_URL		: 'url',
		TYPE_DATE		: 'date',
		TYPE_DATETIME	: 'datetime',
		TYPE_MONTH		: 'month',
		TYPE_TIME		: 'time',
		TYPE_WEEK		: 'week',
		TYPE_SEARCH		: 'search',
		TYPE_TEL		: 'tel',
		TYPE_COLOR		: 'color',
		TYPE_CALENDAR	: 'calendar',
		TYPE_CHECKBOX	: 'checkbox',
		TYPE_RADIO		: 'radio',
		TYPE_SELECT		: 'select',
		TYPE_TEXTAREA	: 'textarea',
		TYPE_FILE		: 'file',
		TYPE_SUBMIT		: 'submit',
		TYPE_BUTTON		: 'button',
		TYPE_RESET		: 'reset',
		TYPE_LABEL		: 'label',
		TYPE_HTML		: 'html',
		TYPE_GROUP		: 'group',
		// TYPE_ICON		: 'icon',  // @todo

		// 外部组件支持的复杂类型，注意需要实现：1.template 2.event初始化 3.disable/enable
		TYPE_CHOSEN		: 'chosen',
		TYPE_SLIDER 	: 'slider',
		TYPE_SELECTIZE	: 'selectize',  // @todo 取代chosen

		// 常用取值类型，其余复杂的组合类型自行传值
		GENRE_INT			: 'int',
		GENRE_FLOAT			: 'float',
		GENRE_STRING		: 'string',
		GENRE_BOOLEAN		: 'boolean',
		GENRE_INT_ARRAY		: ['int'],
		GENRE_FLOAT_ARRAY	: ['float'],
		GENRE_STRING_ARRAY	: ['string'],

		// 布局类型
		LAYOUT_INLINE	: 'inline',
		LAYOUT_BLOCK	: 'block',
		LAYOUT_TABLE	: 'table'
	});
	
	FU.defaultConfig = {
		layout: FU.LAYOUT_BLOCK, // inline|horizontal|table
		ratio: '2:10', // 比列
		theme: '', // 采用的皮肤，需要的对应资源见FU.themeConfig
		size: 'md', // sm md lg
		marked: '<strong class="formui-marked"> *</strong>', // 若字段配置了required:true，则使用此标记对应字段

		medthod: 'GET',
		action: '',

		buttons: { // 去掉按钮，则配置为false
			/*items	: [
				{
					label	: '提交',
					type	: 'submit'
				},
				{
					label	: '取消',
					type	: 'reset'
				}
			]*/
		}
	};

	FU.themeConfig = {
		/*'default'	: {
			'css'	: ['default.css']
		},
		'blue'	: {
			'css'	: ['blue.css'],
			'js'	: ['blue.js']
		}*/
	};

	var EventPool = (function(){
		var _POOL = [];

		var E = {
			list: function(){
				return _POOL;
			},

			// 追加
			append : function(fieldName, eventName, selector, callback) {
				_POOL.push({
					'field': fieldName,
					'event': eventName,
					'selector': selector,
					'callback': callback,
					'binded': false  // 是否绑定过了
				});

				return _POOL.length;
			},

			/**
			 * 将延迟绑定的事件生效
			 * @param  {[type]} fieldName 可选，仅绑定某个字段
			 * @return {[type]}           [description]
			 */
			bind : function(fieldName, isRebind) {
				$.each(_POOL, function(i, v) {
					var element;

					// 不重复绑定，且只对指定的字段绑定；如果是重新绑定，则忽略重复
					if ((v.binded && !isRebind) || (fieldName && v.field!=fieldName)) {
						return;
					}

					element = FU.getElement(v['selector']);  // 此时再去get，以免尚未插入dom
					element.bind(v['event'], v['callback']);
					v.binded = true;

					// 自定义事件需要手动触发
					if (v['event'] == 'complete') {
						element.trigger('complete');
					}
				});
			},

			rebind : function(fieldName) {
				EventPool.bind(fieldName, true);
			},

			// 直接执行
			execute : function(fieldName, eventName, selector, callback) {
				var element = FU.getElement(selector);

				element.bind(eventName, callback).trigger(eventName);

				// 只执行一次初始化行为
				if (eventName === 'complete') {
					element.unbind(eventName, callback);
				}
			},

			// 初始化完后执行，如果未初始化则等待complete事件
			executeWhenComplete : function(fieldName, selector, callback) {
				EventPool[FU.getElement(selector).size()>0 ? 'execute' : 'append'](fieldName, 'complete', selector, callback);
			}
		};

		return E;
	})();

	function loadJs(jsFile, callback) {
		var script = document.createElement("script")
		script.type = "text/javascript";

		if (_FILE_LOADED_MAPPING[jsFile]) {
			if (_FILE_LOADED_MAPPING[jsFile].isLoaded) {
				callback && callback();
			} else {
				_FILE_LOADED_MAPPING[jsFile].callbacks.push(callback)
			}
			return;
		};
		_FILE_LOADED_MAPPING[jsFile] = {
			isLoaded: false,
			callbacks: [callback]
		};

		if (script.readyState) { // IE
			script.onreadystatechange = function() {
				if (script.readyState == "loaded" || script.readyState == "complete") {
					var fn, callbackQueue = _FILE_LOADED_MAPPING[jsFile];

					callbackQueue.isLoaded = true;
					script.onreadystatechange = null;
					while (callbackQueue.callbacks.length > 0) {
						fn = callbackQueue.callbacks.shift()
						fn && fn();
					}
				}
			};
		} else { // Others
			script.onload = function() {
				var fn, callbackQueue = _FILE_LOADED_MAPPING[jsFile];

				callbackQueue.isLoaded = true;
				while (callbackQueue.callbacks.length > 0) {
					fn = callbackQueue.callbacks.shift()
					fn && fn();
				}
			};
		}

		script.src = jsFile;
		document.getElementsByTagName("head")[0].appendChild(script);
	}

	function loadCss(cssFile) {
		if (_FILE_LOADED_MAPPING[cssFile]) {
			return;
		};
		_FILE_LOADED_MAPPING[cssFile] = true;

		$('head').append('<link rel="stylesheet" href="' + cssFile +'" type="text/css" />');
	}

	function initPreferenceCss (containerId) {
		var prefix = '#'+ containerId +' form ',
			prefixDisabled = '#'+ containerId +' form[disabled] ',
			styleElementId = 'formui-'+ containerId,
			content = {};

		// global disabled, diable form element like text
		content[prefixDisabled +'button'] = 
		content[prefixDisabled +'input[type=file]'] = 
		content[prefixDisabled +'.formui-help'] = 
		content[prefixDisabled +'.formui-counter:after'] = {
			'display' : 'none'
		};
		// part disabled
		content[prefix +'input.form-control[disabled]'] = 
		content[prefix +'input.form-control[readonly]'] = 
		content[prefix +'textarea.form-control[disabled]'] = 
		content[prefix +'textarea.form-control[readonly]'] = 
		content[prefix +'select.form-control[disabled]'] = 
		content[prefix +'select.form-control[readonly]'] = 
		content[prefix +'.form-control[disabled]:focus'] = 
		content[prefix +'.form-control[readonly]:focus'] = {
			'cursor'		: 'text',
			'color'			: '#333',
			'background'	: 'transparent',
			'borderColor'	: 'transparent',
			'boxShadow'		: 'none',
			'outline'		: 0,
			'borderRadius'	: 0,
			'-webkit-border-radius'	: 0,
			'-moz-border-radius'	: 0,
			'-webkit-box-shadow'	: 'none',
		};
		content[prefix +'select.form-control[disabled]::-ms-expand'] = 
		content[prefix +'select.form-control[readonly]::-ms-expand'] = {
			'display' : 'none'
		};
		content[prefix +'select.form-control[disabled]'] = 
		content[prefix +'select.form-control[readonly]'] = {
			'textIndent'		: '0.01px',
			'textOverflow'		: ' ',
			'-webkit-appearance': 'none',
			'-moz-appearance'	: 'none'
		};

		// beautier show
		content[prefix +'input.form-control[type="radio"]'] = 
		content[prefix +'input.form-control[type="checkbox"]'] = {
			height		: '18px',
			width		: '18px',
			marginTop	: 0
		};
		content['#'+ containerId +' form.form-horizontal .radio'] = 
		content['#'+ containerId +' form.form-horizontal .checkbox'] = {
			display		: 'inline',
			marginRight	: '30px',
			top			: '8px'
		};
		content['#'+ containerId +' form.form-horizontal .formui-table .radio'] = 
		content['#'+ containerId +' form.form-horizontal .formui-table .checkbox'] = {
			marginRight	: '10px',
			top			: '0',
			display		: 'inherit'
		};

		// help text
		content['.formui-help'] = {
			fontSize: '90%',
			color: '#aaa',
			marginTop: '5px'
		};

		// table
		content['.formui-table'] = {
			width	: '100%'
		};
		content['.formui-table th, .formui-table td'] = {
			border	: '1px solid #eee',
			verticalAlign: 'middle',
			padding : '10px 15px'
		};
		content['.formui-table tfoot td'] = {
			border	: 'none'
		};
		content['.formui-table .form-group'] = {
			marginBottom: 0
		};
		content['.formui-table tbody label'] = {
			display: 'none'
		};
		content['.formui-table .radio label'] =
		content['.formui-table .checkbox label'] = {
			display: 'block'
		};
		content['.formui-table tfoot fieldset'] = {
			marginBottom: 0
		};

		// error
		content[
			[
				'.has-error .formui-help',
				'.has-error .chosen-choices',
				'.has-error .chosen-single'
			].join(',')
		] = {
			color: '#d9230f',
			borderColor: '#d9230f !important'
		};

		content[prefix +'.formui-marked'] = {
			color: '#f30'
		};

		setStyleSheet(styleElementId, content);
	}

	/**
	 * 解析当前皮肤配置，加载所需资源
	 * @param  {[type]} config [description]
	 * @return {[type]}		[description]
	 */
	function parseThemeConfig(config) {
		var themeConfig = FU.themeConfig[config.theme || 'default'] || {};

		$.each(themeConfig.css || [], function(i, cssFile) {
			loadCss(cssFile);
		});

		$.each(themeConfig.js || [], function(i, jsFile) {
			loadJs(jsFile);
		});
	}

	/**
	 * beforeParseHandler 切面
	 * @param  {[type]} fieldsConfig [description]
	 * @return {[type]}              [description]
	 */
	function beforeParseHandler (fieldsConfig) {
		switch(fieldsConfig.layout) {
			// 针对table，补全结构
			case FU.LAYOUT_TABLE:
				var theadContent = [], thFilled = false;

				!fieldsConfig.className && (fieldsConfig.className = 'formui-table');
				$.extend(fieldsConfig, {
					before		: '<fieldset><table class="'+ fieldsConfig.className +'" width="100%">',
					after		: '</table></fieldset>',
					marked		: '',  // 清空无关视觉
					ratio		: '0:12'
				});
				fieldsConfig.label && (fieldsConfig.before += '<caption>'+ fieldsConfig.label +'</caption>');
				$.each(fieldsConfig.items, function(i, v){
					v.before = '<tr style="{STYLE}" class="formui-group {NAME}">';
					v.after = '</tr>';

					$.each(v.items||[], function(ii, vv){
						// label放到表头去
						vv.attrs = vv.attrs || {};
						if (!vv.attrs.placeholder && vv.label) {
							var el = document.createElement('div');
							el.innerHTML = vv.label;
							vv.attrs.placeholder = el.innerText;
							el = null;
							delete el;
						}

						if (vv.type !== FU.TYPE_HIDDEN) {
							!thFilled && theadContent.push(vv.label||'');
						
							vv.before = '<td>';
							vv.after = '</td>';
						}
					});
					thFilled = true;
				});
				fieldsConfig.before += '<thead><th>'+ theadContent.join('</th><th>') + '</th></thead>';
				
				if (fieldsConfig.buttons.items && fieldsConfig.buttons.items.length>0) {
					!fieldsConfig.buttons.before && (fieldsConfig.buttons.before = '<tfoot><tr><td colspan="99">');
					!fieldsConfig.buttons.after && (fieldsConfig.buttons.after = '</td></tr></tfoot>');
				}
				break;

			default:
				$.extend(fieldsConfig, {
					before		: '<fieldset class="'+ (fieldsConfig.className||'') +'">',
					after		: '</fieldset>'
				});
				fieldsConfig.label && (fieldsConfig.before += '<legend>'+ fieldsConfig.label +'</legend>');

				$.each(fieldsConfig.items, function(i, v){
					if (v.type === FU.TYPE_GROUP) {
						v.before = '<fieldset style="{STYLE}" class="formui-group {NAME}">';
						v.after = '</fieldset>';

						v.items && v.items.length>0 && v.label && (v.before += '<legend>'+ v.label +'</legend>');
					}
				});
		}

		return fieldsConfig;
	}

	/**
	 * config parse main entrance
	 * @param  {[type]} fieldsConfig [description]
	 * @return {[type]}		[description]
	 */
	function parseConfig(fieldsConfig, parseCallback) {
		var content, fields = [],
			fieldsContent, buttonsContent;

		// 预处理配置
		fieldsConfig = beforeParseHandler(fieldsConfig);

		// 先解析皮肤资源
		parseThemeConfig(fieldsConfig);

		// generate form fields
		fieldsContent = parseFields(fieldsConfig, fieldsConfig, parseCallback);

		// generate form control buttons, like submit, cancel
		buttonsContent = genButtonStruct(fieldsConfig);

		// if set layout=table, tfoot must insert before tbody
		if (fieldsConfig.layout === FU.LAYOUT_TABLE) {
			fieldsContent = '<tbody>' + fieldsContent +'</tbody>';
			fields.push(buttonsContent, fieldsContent);
		} else {
			fields.push(fieldsContent, buttonsContent);
		}

		// generate form backbone, fill with fields
		content = genFormStruct(fieldsConfig).replace('{FIELDS}', fields.join('\n'));

		return content;
	}



	function parseFields(currentConfig, fieldsConfig, parseCallback) {
		var content, fieldsContent = [], fnReplace;

		// 批量替换函数
		fnReplace = function(inputStr, replaces, replacedIndex) {
			var result = inputStr;
			$.each(replaces || {}, function(match, replaced) {
				var reg = new RegExp(match, 'gi'), rep;
				
				switch (typeof replaced) {
					case 'object' :
						rep = replaced[replacedIndex];
						break;

					case 'function' :
						rep = replaced.call(null, replacedIndex);
						break;

					default :
						rep = replaced;
				}
				result = result.replace(reg, rep);
			});

			return result;
		};

		$.each(currentConfig.items || [], function(i, v) {
			// 是否为需要重复的字段
			var repeatTimes = v.repeat ? (parseInt(v.repeat.times, 10) || 1) : 1;

			// 不解析不显示的字段
			if (v.show === false) {
				return;
			};

			// 嵌套的组合表单,最终递归到单个字段处理的逻辑
			switch (v.type) {
				case FU.TYPE_GROUP:
					// 非重复的字段，视为重复1次
					for (var idx = 0; idx < repeatTimes; idx++) {
						var nestedContent, fieldsetConfig = {};
		
						!v.repeat && (v.repeat = {});
						isNaN(v.repeat.currentIndex) && (v.repeat.currentIndex = 0);
						$.each(v.items || {}, function(ii, vv) {
							// 将repeat属性继承下去,每个字段都有这些属性
							$.each(v.repeat, function(sk, sv) {
								!v.items[ii].repeat && (v.items[ii].repeat = {});
								sk === 'times' && (sv = 1);
								if (sk === 'replaces') {
									!v.items[ii].repeat.replaces && (v.items[ii].repeat.replaces = {});
									switch (typeof sv) {
										// field name from replace
										case 'object' :
											$.each(sv || {}, function(tk, tv) {
												v.items[ii].repeat.replaces[tk] = typeof tv === 'object' ? (tv[idx] || '') : tv;
											});
											break;

										default: 
											v.items[ii].repeat[sk] = sv;
									}
								}
							});


							if (v.generator==='dynamic' && idx > 0) {
								v.display = false;

								// 避免提交
								v.items[ii].attrs = v.items[ii].attrs||{};
								v.items[ii].attrs.disabled = true;
							}
						});

						$.each(v, function(attr, val) {
							fieldsetConfig[attr] = v.repeat && (typeof val === 'string') ? fnReplace(val, v.repeat.replaces, v.repeat.currentIndex||idx||0) : val;
							if (attr == 'buttons') {
								$.each(val.items||[], function(iii, vvv){
									fieldsetConfig[attr].items[iii].name = vvv.name || [fieldsetConfig.name, idx, 'buttons', iii].join('_');
								});
							}
						});
						fieldsetConfig.repeat.currentIndex = v.repeat.currentIndex;
						nestedContent = parseFields(fieldsetConfig, fieldsConfig, parseCallback);

						fieldsContent.push(genFieldsetStruct(fieldsetConfig, parseCallback).replace('{FIELDS}', nestedContent));

						// @20171107 重复增长?
						// v.repeat.currentIndex++;
					}
					break;

				default:
					// 单个字段解析
					for (var idx = 0; idx < repeatTimes; idx++) {
						var cloneConfig = {};

						$.each(v, function(kk, vv) {
							if (v.repeat && v.repeat.replaces && typeof v.repeat.replaces === 'object' && typeof vv === 'string') {
								vv = fnReplace(vv, v.repeat.replaces, currentConfig.repeat.currentIndex||idx||0);
							}
							cloneConfig[kk] = vv;
						});
						// 提前埋点
						cloneConfig.slotId = 'SLOT_' + (cloneConfig.name || Math.floor(Math.random() * 1e7));
						fieldsContent.push(
							(v.before||'') +
							genFieldStruct(cloneConfig, fieldsConfig) +
							(v.after||'')
						);

						parseCallback.call(null, cloneConfig);
					}
			}
		});

		content = fieldsContent.join('');

		return content;
	}


	/**
	 * 生成表单结构
	 * @param  {[type]} config [description]
	 * @return {[type]}		[description]
	 */
	function genFormStruct(config) {
		var content, layout, formClassName;

		formClassName = config.layout === FU.LAYOUT_INLINE ? 'form-inline' : 'form-horizontal';

		content = [
			'<form novalidate="novalidate" class="clearfix formui ' + formClassName + '" action="' + config.action + '" medthod="' +
			config.medthod + '">',
			config.before||'',
			'{FIELDS}',
			config.after||'',
			'</form>'
		].join('\n');

		return content;
	}

	function genFieldsetStruct(fieldsetConfig, parseCallback) {
		var content, className;

		!fieldsetConfig.size && (fieldsetConfig.size = FU.defaultConfig.size);
		!fieldsetConfig.ratio && (fieldsetConfig.ratio = FU.defaultConfig.ratio);
		!fieldsetConfig.style && (fieldsetConfig.style = '');
		fieldsetConfig.display === false && (fieldsetConfig.style = 'display:none');

		content = [
			fieldsetConfig.before||'',
			'{FIELDS}',
			fieldsetConfig.after||''
		].join('\n').replace(/{STYLE}/g, fieldsetConfig.style)
			.replace(/{NAME}/g, fieldsetConfig.name || '');

		return content;
	}

	/**
	 * 生成表单字段结构
	 * @param  {[type]} fieldConfig [description]
	 * @param  {[type]} wrap		[description]
	 * @return {string}			 [description]
	 */
	function genFieldStruct(fieldConfig, config, wrap) {
		var content, template, isButton = false,
			slotId = fieldConfig.slotId,
			rules = fieldConfig.rules || {},
			attrs = fieldConfig.attrs || {},
			min, max;

		wrap === undefined && (wrap =
			'<div class="form-group form-group-{SIZE} clearfix" ' +
				(config.layout === FU.LAYOUT_INLINE ? 'style="margin-right:10px;{STYLE}"' : 'style="{STYLE}"') +
			' id="{SLOT_ID}">{CONTENT}</div>');

		switch (fieldConfig.type) {
			case FU.TYPE_HIDDEN:
				wrap = '';
			case FU.TYPE_TEXT:
			case FU.TYPE_EMAIL:
			case FU.TYPE_PASSWORD:
			case FU.TYPE_DATE:
			case FU.TYPE_DATETIME:
			case FU.TYPE_MONTH:
			case FU.TYPE_TIME:
			case FU.TYPE_WEEK:
			case FU.TYPE_NUMBER:
			case FU.TYPE_URL:
			case FU.TYPE_SEARCH:
			case FU.TYPE_TEL:
			case FU.TYPE_COLOR:
				template = [
					'<input type="{TYPE}" class="form-control {CLASSNAME} input-{SIZE}" id="{NAME}" name="{NAME}" value="{VALUE}" {REQUIRED} {STYLE} {PLACEHOLDER} {TITLE} {READONLY} {DISABLED} {MAX} {MIN} {DATA}>'
				].join('');
				break;

			case FU.TYPE_CALENDAR:
				template = [
					'<input type="text" class="form-control {CLASSNAME} input-{SIZE}" id="{NAME}" name="{NAME}" value="{VALUE}" {REQUIRED} {STYLE} {PLACEHOLDER} {TITLE} {READONLY} {DISABLED} {MAX} {MIN} {DATA}>'
					// '<input type="calendar" class="form-control {CLASSNAME} input-{SIZE}" id="{NAME}" name="{NAME}" value="{VALUE}" {STYLE} {PLACEHOLDER} {TITLE} {READONLY} {DISABLED} {MAX} {MIN}>',
				].join('');
				break;

			case FU.TYPE_CHECKBOX:
			case FU.TYPE_RADIO:
				template = (function() {
					var items = [],
						value = fieldConfig.value ? ($.isArray(fieldConfig.value) ?
							fieldConfig.value : [fieldConfig.value]) : [];

					$.each(fieldConfig.items || [], function(i, v) {
						var isChecked = $.inArray(v.value, value) >= 0 ? 'checked' : '',
							isDisabled = attrs.disabled || (v.attrs && v.attrs.disabled) ?
							'disabled' : '',
							isReadonly = attrs.readonly || (v.attrs && v.attrs.readonly) ?
							'readonly' : '',
							dataAttrs = [];

						// data-属性
						$.each((v.attrs || {}).data || {}, function(ak, av) {
							dataAttrs.push('data-' + ak + '=' + av);
						});
						dataAttrs = dataAttrs.join(' ');

						// 不同布局的结构不同
						if (fieldConfig.layout == FU.LAYOUT_INLINE) {
							items.push([
								'<label class="form-control {TYPE}-inline" for="{NAME}_' + i +
								'" style="margin-right:10px">',
								'<input type="{TYPE}" class="form-control {CLASSNAME}" name="{NAME}' + (
									fieldConfig.type == 'checkbox' ? '[]' : '') + '" id="{NAME}_' +
								i + '" value="' + v.value + '" {STYLE} ' + [isChecked,
									isReadonly, isDisabled
								].join(' ') + ' ' + dataAttrs + '>',
								v.label,
								'</label>'
							].join(''));
						} else {
							items.push([
								'<div class="{TYPE} {DISABLED}">',
								'<label for="{NAME}_' + i + '">',
								'<input type="{TYPE}" class="form-control {CLASSNAME}" name="{NAME}' + (
									fieldConfig.type == 'checkbox' ? '[]' : '') + '" id="{NAME}_' +
								i + '" value="' + v.value + '" {STYLE} ' + [isChecked,
									isReadonly, isDisabled
								].join(' ') + ' ' + dataAttrs + '>',
								v.label,
								'</label>',
								'</div>'
							].join(''));
						}
					});

					return items.join('');
				})();
				break;

			case FU.TYPE_CHOSEN: // 体验增强型：tag选择方式
			case FU.TYPE_SELECTIZE:
			case FU.TYPE_SELECT:
				template = [
					(
						fieldConfig.type===FU.TYPE_SELECTIZE
						?
						'<select id="{NAME}" name="{NAME}" {MULTIPLE} {REQUIRED} {READONLY} {DISABLED} {STYLE} {DATA}>'
						:
						'<select class="form-control input-{SIZE}" id="{NAME}" name="{NAME}" {MULTIPLE} {REQUIRED} {READONLY} {DISABLED} {STYLE} {DATA}>'
					), (
						function() {
							var items = [],
								value = fieldConfig.value ? ($.isArray(fieldConfig.value) ?
									fieldConfig.value : [fieldConfig.value]) : [];

							$.each(fieldConfig.items || [], function(i, v) {
								var selected = false,
									itemValue = v.value;

								if (v.items && ($.isArray(v.items) || $.isPlainObject(v.items))) {
									items.push('<optgroup label="'+ v.label +'" value="'+ (itemValue||'') +'">');
									// 为 optgroup 可选择而预留
									items.push('<option value="' + (itemValue||'') + '" data-role="optgroup" style="display:none">所有“' + v.label + '”</option>');
									$.each(v.items||[], function(ii, vv){
										var subSelected = false,
											subItemValue;

										if (vv && typeof vv==='object') {
											subItemValue = vv.value;

											subSelected = $.inArray(subItemValue, value) >= 0;
											items.push('<option value="' + subItemValue + '" ' + (subSelected ?
												'selected' : '') + '>' + vv.label + '</option>');
										} else {
											subItemValue = ii;

											subSelected = $.inArray(subItemValue, value) >= 0;
											items.push('<option value="' + subItemValue + '" ' + (subSelected ?
												'selected' : '') + '>' + vv + '</option>');
										}
										
									});
									items.push('</optgroup>');
								} else {
									selected = $.inArray(itemValue, value) >= 0;
									items.push('<option value="' + itemValue + '" ' + (selected ?
										'selected' : '') + '>' + v.label + '</option>');
								}
							});

							return items.join('');
						})(),
					'</select>'
				].join('');
				break;

			case FU.TYPE_TEXTAREA:
				var sizeMapping = {
					xs: 3,
					sm: 3,
					md: 5,
					lg: 10
				};
				// @todo {SIZE}
				template = [
					'<textarea class="form-control" id="{NAME}" name="{NAME}" rows="'+ (attrs.rows || sizeMapping[config.size]) +
					'" {REQUIRED} {STYLE} {PLACEHOLDER} {TITLE} {READONLY} {DISABLED} {MAX} {MIN} {DATA}>{VALUE}</textarea>'
				].join('');
				break;

			case FU.TYPE_LABEL:
				template = [
					'<p class="form-control-static input" {STYLE} {TITLE}>' + (attrs.innerHTML ?
						attrs.innerHTML : '{VALUE}') + '</p>',
					'<input type="hidden" name="{NAME}" value="{VALUE}" {DATA}>',
				].join('');
				break;

			case FU.TYPE_HTML:
				template = '<div id="{NAME}">{VALUE}</div>';
				break;

			case FU.TYPE_FILE:
				template = [
					'<input type="file" class="form-control {CLASSNAME}" id="{NAME}" name="{NAME}" {REQUIRED} {STYLE} {READONLY} {TITLE} {DATA}>'
				].join('');
				break;

			case FU.TYPE_SLIDER:
				var sliderConfig = $.extend({
					range : ['', ''],
					value : [0, 0]
				}, fieldConfig.slider||{});
				template = [
					'<widget type="slider" class="nstSlider {CLASSNAME}" id="{NAME}" ',
						'data-range_min="'+ (sliderConfig.range[0]) +'" ',
						'data-range_max="'+ (sliderConfig.range[1]) +'" ',
						'data-cur_min="'+ (sliderConfig.value[0]) +'" ',
						sliderConfig.value[1] ? 'data-cur_max="'+ (sliderConfig.value[1]) +'"' : '',
						'>',
						'<div class="bar"></div>',
						'<div class="leftGrip"></div>',
						'<div class="rightGrip"></div>',
						'<div class="leftLabel" />',
						'<div class="rightLabel" />',
					'</widget>',
					'<input type="hidden" name="{NAME}" value="{VALUE}" {DATA}>'
				].join('');
				document.createElement('widget');
				break;

			case FU.TYPE_SUBMIT:
			case FU.TYPE_BUTTON:
			case FU.TYPE_RESET:
				isButton = true;
				// 将submit改写为button，使用js提交，避免触发form提交时的validation对隐藏元素的报错
				template = '<button data-name="'+ (fieldConfig.name||'') +'" '+ (fieldConfig.type=='submit' ? 'type="button" data-formui-button="submit"' : 'type="{TYPE}"') +' class="btn ' + (fieldConfig.type ===
						'submit' ? (fieldConfig.className || 'btn-primary') : '{CLASSNAME}') +' btn-{SIZE}" {STYLE} {TITLE} {READONLY} {DISABLED} {DATA}>{LABEL}</button>';
				break;

			default:
				template = '';
		}

		// 前后元素
		template = '{PREFIX}' + template + '{POSTFIX}';

		// 开关，开启后才能选择后续操作
		if (fieldConfig.switcher) {
			template = [
				'<div class="switcher switcher-md">',
				'<input type="checkbox" id="{NAME}_switcher" class="cmn-toggle cmn-toggle-round">',
				'<label for="{NAME}_switcher"></label>',
				'<div class="switcher-items" style="display:none">',
				template,
				'</div>',
				'</div>'
			].join('\n');

			initWidgetSwitcher(fieldConfig, {delay: true});
		} else if (fieldConfig.counter) {
			initWidgetCounter(fieldConfig, {delay: true});
		}

		var fieldType = fieldConfig.type;
		fieldConfig.url && (fieldType = 'url');

		switch (fieldType) {
			case FU.TYPE_CHOSEN :
			case FU.TYPE_SELECTIZE :
			case FU.TYPE_SELECT :
				initFieldSelect(fieldConfig, {
					layout: config.layout
				});
				break;

			case FU.TYPE_URL :
				initFieldUrl(fieldConfig);
				break;

			// 日历
			case FU.TYPE_CALENDAR :
				initFieldCalendar(fieldConfig);
				break;

			case FU.TYPE_SLIDER :
				initFieldSlider(fieldConfig);
				break;

			// 按钮的事件单独在这里绑定
			case FU.TYPE_HTML:
			case FU.TYPE_SUBMIT:
			case FU.TYPE_BUTTON:
			case FU.TYPE_RESET:
				$.each(fieldConfig.events||{}, function(eventType, callback){
					EventPool.append(fieldConfig.name, eventType, '[id="' + slotId +'"]', callback);
				});
				break;
		}

		// 拼装label 和 input部分
		(function() {
			var labelClassName = '',
				fieldClassName = '',
				fieldOffsetClassName = '',
				labelWidth, fieldWidth, t,
				isLayoutInline = config.layout === FU.LAYOUT_INLINE;

			// 文字和表单的栅格化宽度比，12栅格
			t = config.ratio.split(':');
			labelWidth = 12 * parseInt(t[0], 10) / (parseInt(t[0], 10) + parseInt(t[1], 10));
			fieldWidth = 12 * parseInt(t[1], 10) / (parseInt(t[0], 10) + parseInt(t[1], 10));

			if (! isLayoutInline) {
				labelClassName = ['col', config.size, labelWidth].join('-');
				fieldClassName = ['col', config.size, fieldWidth].join('-');
				fieldOffsetClassName = ['col', config.size, 'offset', labelWidth].join('-');
			}

			if (!isButton && fieldConfig.type !== 'hidden') {
				template = [
					'<label for="{NAME}" class="' + labelClassName + ' control-label ' + (
						isLayoutInline ? 'show' : '') + '">{LABEL}' + (fieldConfig.required ?
						config.marked || '' : '') + '</label>',
					!isLayoutInline ? '<div class="' + fieldClassName + '">' : '',
					template,
					!isLayoutInline ? '</div>' : '',
					'<p class="formui-help ' + fieldClassName +' '+fieldOffsetClassName + '" style="'+ ((fieldConfig.hint||fieldConfig.help) ? '':'display:none') +'">{HINT}</p>',
				].join('\n');
			}
		})();

		!fieldConfig.style && (fieldConfig.style = attrs.style || '');
		fieldConfig.display === false && (fieldConfig.style = 'display:none');

		// 模板替换
		content = wrap ? wrap.replace('{CONTENT}', template) : template;
		content = content.replace(/{NAME}/g, fieldConfig.name || '')
			.replace(/{LABEL}/g, fieldConfig.label || '')
			.replace(/{TYPE}/g, fieldConfig.type || '')
			.replace(/{VALUE}/g, fieldConfig.value !== undefined ? fieldConfig.value : '')
			.replace(/{HINT}/g, fieldConfig.hint || fieldConfig.help || '')
			.replace(/{CLASSNAME}/g, fieldConfig.className || '')
			.replace(/{REQUIRED}/g, fieldConfig.required ? 'required' : '')
			.replace(/{STYLE}/g, fieldConfig.style ? fieldConfig.style : '')
			.replace(/{PLACEHOLDER}/g, attrs.placeholder ? 'placeholder="'+ attrs.placeholder + '"' : '')
			.replace(/{TITLE}/g, attrs.title ? 'title="' + attrs.title + '"' : '')
			.replace(/{READONLY}/g, attrs.readonly ? 'readonly' : '')
			.replace(/{DISABLED}/g, attrs.disabled ? 'disabled' : '')
			.replace(/{MULTIPLE}/g, attrs.multiple ? 'multiple' : '')
			.replace(/{MAX}/g, rules.max !== undefined ? 'max="'+ rules.max.value + '"' : '')
			.replace(/{MIN}/g, rules.min !== undefined ? 'min="'+ rules.min.value + '"' : '')
			.replace(/{SIZE}/g, config.size)
			.replace(/{DATA}/g, (function() {
				var datas = [];

				$.each(attrs.data || {}, function(k, v) {
					datas.push('data-' + k + '="' + v + '"');
				});

				return datas.join(' ');
			})())
			.replace(/{PREFIX}/, fieldConfig.prefix || '')
			.replace(/{POSTFIX}/, fieldConfig.postfix || '')
			.replace(/{SLOT_ID}/, slotId);

		return content;
	}

	function initWidgetSwitcher(fieldConfig, opts) {
		loadCss('/assets/vendor/pf/css/p.css');

		// 事件延后绑定
		EventPool.append(fieldConfig.name, 'change', '#' + fieldConfig.name + '_switcher', function() {
			var wrapItems = $(this).closest('.switcher').find('.switcher-items'),
				inputs = $('input,select,textarea,button', wrapItems);

			if (this.checked) {
				FU.setFormStatus('enabled', wrapItems);
				wrapItems.slideDown('fast');
			} else {
				wrapItems.slideUp('fast');
				FU.setFormStatus('disabled', wrapItems);
			}
		});

		// 还原值的时候，激活开关
		EventPool.append(fieldConfig.name, '_setdata', '[name="' + fieldConfig.name +'"]', function(event, value) {
			var isValued = false;
			if (value) {
				switch ($.type(value)) {
					case 'array':
						isValued = value.length>0 ? true : false;
						break;

					case 'object':
						isValued = !$.isEmptyObject(value);
						break;

					default:
						isValued = !!value;
				}
			}

			$('#' + fieldConfig.name + '_switcher').prop('checked', isValued).trigger('change');
		});
	}

	function initWidgetCounter(fieldConfig, opts) {
		var styleId = 'formui-counter',
			styleSheetId = 'formui-counter__'+ fieldConfig.name,
			counterClassName = 'formui-counter__'+ fieldConfig.name +'-wrap',
			counterMin, counterMax;

		opts = opts || {};

		if ($('#'+ styleId).size() < 1) {
			$('head').append([
				'<style type="text/css" id="'+ styleId +'">',
				'.formui-counter{position:relative}',
				'.formui-counter:after{color:#ddd;font-weight:300;font-size:12px;position:absolute;right:24px;margin-top:-15px}',
				'</style>'
			].join(''));
		}

		// 优先取counter配置，否则取rule的min和max
		if($.isArray(fieldConfig.counter)) {
			counterMin = fieldConfig.counter[0];
			counterMax = fieldConfig.counter[1];

			// 事件延后绑定
			EventPool[opts.delay ? 'append' : 'execute'](fieldConfig.name, 'complete', '[id="' + fieldConfig.name +'"]', (function(fieldName, min, max) {
				return function() {
					var styleSheetContent = {},
						el = $(this);

					styleSheetContent['.'+ counterClassName +':after'] = {
						content : '"'+ [min, max].join('/') +'"',
					};

					setStyleSheet(styleSheetId, styleSheetContent);
					el.parent().addClass(counterClassName).addClass('formui-counter');
					if (el.val()) {
						setTimeout(function(){
							el.trigger('change');
						}, 0);
					}
				};
			})(fieldConfig.name, counterMin, counterMax));
			EventPool[opts.delay ? 'append' : 'execute'](fieldConfig.name, 'change input blur', '[id="' + fieldConfig.name +'"]', (function(fieldName, min, max) {
				return function() {
					var len = (this.value||'').length,
						styleSheetContent = {};

					if (len<min || len>max) {
						styleSheetContent['.'+ counterClassName +':after'] = {
							content : '"'+ [len, max].join('/') +'"',
							color: '#f00',
							fontWeight: 700
						};
						setStyleSheet(styleSheetId, styleSheetContent);
					} else {
						styleSheetContent['.'+ counterClassName +':after'] = {
							content : '"'+ [len, max].join('/') +'"',
						};
						setStyleSheet(styleSheetId, styleSheetContent);
					}
					$(this).closest('form').triggerHandler.call(this, 'validate');
				};
			})(fieldConfig.name, counterMin, counterMax));
		}
	}

	function initFieldSelect(fieldConfig, opts) {
		var fieldType = fieldConfig.type,
			attrs = fieldConfig.attrs || {},
			initCallback;

		initCallback = function(){
			EventPool.executeWhenComplete(fieldConfig.name, '[id="' + fieldConfig.name +'"]', function() {
				var element = $(this);

				// @todo 时序保证
				// 异步化，不然这里非常耗时
				setTimeout((function(element, fieldConfig, layout) {
					return function() {
						var config, elInstance;

						switch (fieldType) {
							case FU.TYPE_CHOSEN :
								config = $.extend({
									no_results_text: '暂无结果',
									placeholder_text_multiple: '输入关键字或拼音，快速检索',
									placeholder_text_single: '输入关键字或拼音，快速检索',
									optgroup_selected_enable: false,
									is_default_collapse: false,
									search_contains: true
								}, fieldConfig.chosen || {});
								elInstance = element.chosen(config);

								if (attrs.readonly) {
									element.prop('readonly', true).trigger('chosen:updated');
								}

							case FU.TYPE_SELECT:
								if(layout === FU.LAYOUT_INLINE) {
									// 宽度和原始的一致
									element.bind("chosen:updated", function(evt) {
										// inline才需要宽度，否则100%
										setTimeout(function(){
											element.next('.chosen-container').css('width', element.width());
										}, 200);
									});
								} else {
									setTimeout(function(){
										element.next('.chosen-container').css('width', '100%');
									}, 500);
								}
								break;

							case FU.TYPE_SELECTIZE :
								// params see: https://github.com/selectize/selectize.js/blob/master/docs/usage.md
								config = $.extend({
									create	: true  // 允许自定义搜索内容
								}, fieldConfig.selectize);
								elInstance = element.selectize(config);

								// 当原始select元素变更时，可重建
								element.on('selectize:updated', function(){
									var selectEl = this;

									selectEl.selectize.clear();  // 清空已选
									selectEl.selectize.clearOptions();  // 清空选项

									$(selectEl).find('option').each(function(i, el){
										selectEl.selectize.addOption({value:el.value, text:el.text});
									});

									selectEl.selectize.addItem(this.value);  // 同步选中值

									selectEl.selectize.refreshOptions(false);  // param 1 set true will trigger dropdown
								});

								
								setStyleSheet('formui-selectize', {
									// 修正右侧箭头被文字遮挡问题
									'.selectize-input' : {
										paddingRight : '28px'
									},
									// 修正自动高度造成的对齐问题
									'.selectize-control' : {
										height: '36px',
										minWidth: '100px'
									}
								});
								break;
						}
						
					};
				})(element, fieldConfig, opts.layout), 0);
			});
		};

		switch (fieldType) {
			case FU.TYPE_CHOSEN :
				loadCss('/assets/vendor/chosen-bootstrap/chosen.bootstrap.css');
				loadJs('/assets/vendor/pinyin/pinyin.js');
				loadJs('/assets/vendor/chosen/chosen.jquery.js', initCallback);
				break;

			case FU.TYPE_SELECTIZE :
				loadCss('/assets/vendor/selectize/dist/css/selectize.css');
				loadJs('/assets/vendor/selectize/dist/js/standalone/selectize.min.js', initCallback);
				break;

			case FU.TYPE_SELECT : 
				initCallback();
		}
	}

	function initFieldUrl(fieldConfig, opts) {
		EventPool.append(fieldConfig.name, 'keypress input', '[id="' + fieldConfig.name +'"]', function() {
			var el, value;

			el = $(this);
			value = el.val();

			if (value.length > 3 && !(/^http(s)?/.test(value)) && /[\w\W]+\.[\w\W]{2,}/.test(value)) {
				el.focus().val('http://' + $.trim(value));
			}
		});
	}

	function initFieldCalendar(fieldConfig, opts) {
		EventPool.append(fieldConfig.name, 'complete',  '[id="' + fieldConfig.name +'"]', function() {
			var el = $(this), value,
				config, onSelect;

			config = $.extend({
				"dateFormat": 'yy-mm-dd',
				numberOfMonths: 2,
				changeYear: true,
				dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
				monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
				monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
				beforeShow: function() {
					setTimeout(function() {
						$('.ui-datepicker').css('z-index', 9999);
					}, 0);
				}
			}, fieldConfig.calendar || {});

			if (fieldConfig.value) {
				config.value = fieldConfig.value;
			}

			// 关联日期
			if (fieldConfig.calendar && fieldConfig.calendar.related && fieldConfig.calendar.related.name) {
				onSelect = fieldConfig.calendar.onSelect;
				config.onSelect = function(value){
					var optionKey = ''
					switch (fieldConfig.calendar.related.relation) {
						case 'less':
							optionKey = 'minDate';
							break;

						case 'more':
							optionKey = 'maxDate';
							break;
					}
					optionKey && FU.getElement(fieldConfig.calendar.related.name).datepicker('option', optionKey, value);

					onSelect && onSelect.apply(this, arguments);
					
					$(this).closest('form').trigger('change');
				};
			}

			el.datepicker(config);
		});
	}

	function initFieldSlider(fieldConfig, opts) {
		var styleId = 'formui-slider';

		loadCss('/assets/vendor/jquery-nstslider/dist/jquery.nstSlider.min.css');

		// 覆盖样式
		if ($('#'+ styleId).size() < 1) {
			$('head').append([
				'<style type="text/css" id="'+ styleId +'">',
				'widget{display:block;margin:25px 0;}',
				'.nstSlider{height:2px;background:#ccc}',
				'.nstSlider .bar{background:#8ce196;height:4px;top:-1px;}',
				'.nstSlider .leftGrip, .nstSlider .rightGrip{border:2px solid #ccc;top:-8px;}',
				'.leftLabel{position:absolute;top:10px}',
				'.rightLabel{position:absolute;top:10px;left:280px}',
				'</style>'
			].join(''));
		}

		EventPool.append(fieldConfig.name, 'complete', '[id="' + fieldConfig.name +'"]', function() {
			var element = $(this);

			loadJs('/assets/vendor/jquery-nstslider/dist/jquery.nstSlider.min.js', function(){
				element.nstSlider({
					"left_grip_selector": ".leftGrip",
					"right_grip_selector": ".rightGrip",
					"value_bar_selector": ".bar",
					"value_changed_callback": function(cause, leftValue, rightValue) {
						var element = $(this);

						element.parent().find('.leftLabel').text(leftValue).parent().find('.rightLabel').text(rightValue);
						if (cause != 'init') {
							element.closest('.form-group').find('[name="'+ fieldConfig.name +'"]').val('['+ leftValue +','+ rightValue +']');
						}
					}
				});
			});
		});
		EventPool.append(fieldConfig.name, '_setdata',  '[name="' + fieldConfig.name +'"]', function(event, value) {
			if (value && value.length>0) {
				$(this).closest('.form-group').find('widget').nstSlider('set_position', value[0], value[value.length-1]);
			}
		});
	}

	/**
	 * 绑定字段事件
	 * @param  {[type]} fieldConfig [description]
	 * @param  {[type]} config      [description]
	 * @param  {[type]} wrap        [description]
	 * @return {[type]}             [description]
	 */
	function bindFormEvents(instance) {
		var submitButton = instance.container.find('button[data-formui-button="submit"]'),
			fnSubmit;

		fnSubmit = function(event){
			var validateQueuen = [],
				formEl, isPressEnter = (event.keyCode || event.which) == 13;

			// 支持回车提交
			if (event.type!='click' && !isPressEnter) {
				return;
			} else if (isPressEnter && event.target.tagName.toUpperCase()==='TEXTAREA') {
				// 如果是Textarea，则要排除
				return;
			}
			formEl = $(this).closest('form');

			$.each(instance.fieldsMapping||[], function(fieldName, fieldConfig){
				var el,
					defer,
					result;

				if (!fieldConfig.validate && !fieldConfig.required || !fieldName) {
					return;
				}

				el = FU.getElement('[name="'+ fieldName +'"]');

				// 隐藏元素需要检测，整体元素都隐藏的才不检测
				if (! el.closest('.form-group').is(':visible')) {
					return;
				}

				defer = new $.Deferred();

				el.get(0).validate = (function(defer, fieldName){
					return function(isSuccess){
						if (isSuccess) {
							defer.resolve(fieldName);
						} else {
							defer.reject(fieldName);
						}
					};
				})(defer, fieldName);

				formEl.triggerHandler.call(el, 'validate');
				validateQueuen.push(defer);
			});

			// 校验完成后提交
			if (validateQueuen.length > 0) {
				$.when.apply(null, validateQueuen).done((function(_m){
					return function() {
						formEl.submit();
						// formEl.triggerHandler('submit');
					}
				})(this)).fail(function(fieldName){
					var top = $("#SLOT_" + fieldName).offset().top;
					$("html,body").animate({scrollTop:top > 100 ? top - 100 : 0}, 500);
					throw 'Params validation failed: '+ fieldName;
				});
			} else {
				formEl.submit();
			}
		};

		if (submitButton.size() > 0) {
			EventPool.append('SUBMIT', 'click keypress', submitButton, fnSubmit);
		}
		EventPool.append('SUBMIT', 'keypress', instance.container.find('form'), fnSubmit);

		// 内容字段
		bindFieldEvents(instance.fieldsMapping);

		// 提交事件
		FU.bindEvents([
			[instance.container.find('form'), 'submit', (function(_m) {
				return function() {
					_m.onSubmit && _m.onSubmit.call(this, FU.getData(_m.fieldsMapping));
				};
			})(instance), {
				// 默认阻止提交
				preventDefault: instance.config.preventDefault === false ? false : true
			}],
			[instance.container.find('form'), 'change', (function(_m) {
				return function() {
					var data = FU.getData(_m.fieldsMapping);

					_m.config.refreshUrlHashEnabled && FU.refreshUrlHash(data);
					_m.onChange && _m.onChange.call(this, data);
				};
			})(instance)],
			[instance.container.find('form'), 'reset', (function(_m) {
				return function() {
					_m.onReset && _m.onReset.call(this, FU.getData(_m.fieldsMapping));
				};
			})(instance)]
		], instance.container);

		// readonly hack
		$(instance.container).delegate(
			'input[type="checkbox"][readonly],input[type="radio"][readonly]', 'click',
			function() {
				return false;
			});
	}

	/**
	 * 绑定字段事件
	 * @param  {[type]} fieldsMapping [description]
	 * @return {[type]}               [description]
	 */
	function bindFieldEvents(fieldsMapping) {
		// 内容字段
		$.each(fieldsMapping, function(fieldName, fieldConfig){
			// 用户事件
			$.each(fieldConfig.events || {}, function(event, callback) {
				// 这里需要enum，因为button没有name
				EventPool.append(fieldConfig.name, event,  [, 'input,', 'select,', 'textarea,', 'button,', '.input'].join('#' + fieldConfig.slotId + ' '), callback);
			});

			// 实时校验, validate是一个自定义事件，可以触发本字段的校验
			EventPool.append(fieldConfig.name, 'blur input change validate', '[id="' + fieldConfig.slotId + '"] [name="'+ fieldConfig.name +'"]', (function(fieldConfig){
				return function(){
					var defer, result, hint,
						value = this.value;

					// label不检查
					if (fieldConfig.type == FU.TYPE_LABEL) {
						this.validate && this.validate(true);
						return;
					}

					if (this.tagName.toUpperCase() == 'INPUT') {
						switch (this.getAttribute('type')) {
							case 'radio':
							case 'checkbox':
								value = FU.getData([fieldConfig.name])[fieldConfig.name]
								break;
						}
					}

					if (fieldConfig.required) {
						if (! value) {
							FU.setFieldValidateStatus('error', this.name, this.parentNode);
							this.validate && this.validate(false);
							return false;
						} else {
							FU.setFieldValidateStatus('', this.name, this.parentNode);
						}
					}

					if (value) {
						var isValidated = true,
							checkInt = function(value) {
								return value != parseInt(value, 10);
							},
							checkFloat = function(value) {
								return isNaN(value);
							},
							checkedValue = typeof value==='string' ?  value.split(',') : value;

						switch(fieldConfig.genre) {
							case FU.GENRE_INT :
							case FU.GENRE_INT_ARRAY :
								$.each(checkedValue, function(i, v){
									if (checkInt(v)) {
										isValidated = false;
										return false;
									}
								});
								break;

							case FU.GENRE_FLOAT:
							case FU.GENRE_FLOAT_ARRAY:
								$.each(checkedValue, function(i, v){
									if (checkFloat(v)) {
										isValidated = false;
										return false;
									}
								});
								break;
						}
// @todo 动态属性没有生效
						// 检查rules @todo 不断完善
						if (isValidated && fieldConfig.counter &&
							(
								value.toString().length<fieldConfig.counter[0]
								|| value.toString().length>fieldConfig.counter[1]
							)
						) {
							isValidated = false;
						}

						// 检查自定义校验器，仅支持同步
						if (fieldConfig.validator && typeof fieldConfig.validator==='function') {
							var customValidatorResult = fieldConfig.validator.call(this, value);

							// 只有返回True的才算通过
							if (customValidatorResult !== true) {
								isValidated = false;

								// show error message
								typeof customValidatorResult==='string' && customValidatorResult.length>0 && FU.setFieldAttributes([this.name], {
									'help'	: customValidatorResult
								});
							} else {
								FU.setFieldAttributes([this.name], {
									'help'	: ''
								});
							}
						}

						if (! isValidated) {
							FU.setFieldValidateStatus('error', this.name, this.parentNode);
							this.validate && this.validate(false);
							return false;
						}
					}

					if (! fieldConfig.validate) {
						this.validate && this.validate(true);
						return;
					} else {
						result = fieldConfig.validate.call(this, value);
						if ( typeof result === 'boolean') {
							this.validate && this.validate(true);
						}
					}
				};
			})(fieldConfig));
		});

		// 延迟绑定的事件生效
		EventPool.bind();
	}

	/**
	 * 生成按钮结构
	 * @param  {[type]} config [description]
	 * @return {[type]}		[description]
	 */
	function genButtonStruct(config, parseCallback) {
		var content = [],
			buttonsConfig = config.buttons;

		if (buttonsConfig && buttonsConfig.items && buttonsConfig.items.length>0) {
			content.push(buttonsConfig.before || '');
			content.push('<div class="form-group clearfix formui-buttons">');

			if (buttonsConfig.className) {
				content.push('<div class="' + buttonsConfig.className + '">');
			} else {
				var defaultClass, ratio;

				ratio = config.ratio.split(':');
				defaultClass = 'col-' + config.size + '-offset-' + ratio[0] + ' col-' +
					config.size + '-' + ratio[1];

				content.push('<div class="' + defaultClass + '">');
			}

			$.each(buttonsConfig.items || [], function(i, v) {
				v.slotId = 'SLOT_' + (v.name || Math.floor(Math.random() * 1e7));
				content.push(genFieldStruct(v, config, '<span id="{SLOT_ID}">{CONTENT}</span>'));
				parseCallback && parseCallback.call(null, v);
			});
			content.push('</div>');
			content.push('</div>');
			content.push(buttonsConfig.after || '');
		}

		return content.join('\n');
	}

	FU.setFormStatus = function(status, container) {
		var isDisabled = status === 'disabled' ? true : false,
			selector, formEl = $(container).find('form');

		// 提交按钮处理
		$('button,[type="submit"],[type="reset"],[type="button"],[type="button"]',
			container).prop('disabled', isDisabled);

		// 表单元素处理，需要区别本身是disabled的，以备enable
		if (isDisabled) {
			$('input,select,textarea,button,widget', container).each(function(i, el) {
				el = $(el);
				if (!el.prop('disabled')) {
					el.attr('locked', 'locked').prop('disabled', true);
				}

				switch (el.get(0).tagName.toUpperCase()) {
					case 'SELECT' :
						el.trigger('chosen:updated');	// @todo
						break;

					case 'WIDGET' :
						if (el.attr('type') == 'slider') {
							el.nstSlider('disable');
						}
						break;
				}
			});

			formEl.attr('disabled', 'disabled');
		} else {
			$('input[locked],select[locked],textarea[locked],button[locked],widget[locked]', container).each(function(i, el) {
				el = $(el);
				if (el.attr('locked') && el.prop('disabled')) {
					el.removeAttr('locked').prop('disabled', false);
				}
				switch (el.get(0).tagName.toUpperCase()) {
					case 'SELECT' :
						el.trigger('chosen:updated');	// @todo
						break;

					case 'WIDGET' :
						if (el.attr('type') == 'slider') {
							el.nstSlider('enable');
						}
						break;
				}
			});
			formEl.removeAttr('disabled');
		}
	};

	/**
	 * 设置字段的颜色
	 * @param {[type]} fieldName [description]
	 * @param {[type]} status	枚举：success/warning/error
	 */
	FU.setFieldValidateStatus = function(status, fieldName, container) {
		var element;

		!container && (container = document);

		if (!status || (status in {
				'success': 'has-success',
				'warning': 'has-warning',
				'error': 'has-error'
			})) {

			element = FU.getFormElement('[name="' + fieldName + '"]', container).closest('.form-group');
			element.removeClass('has-success has-warning has-error');

			status && element.addClass('has-' + status);
		}
	};

	/**
	 * 显示进度条，基于SVG，无资源依赖
	 * IE9+
	 * @param  {[type]} element [description]
	 * @return {[type]}		 [description]
	 */
	FU.showLoading = function(element, opts) {
		var loadingUI, config, wrapWidth, wrapHeight;

		element = FU.getElement(element);
		opts = opts || {};

		// 获取容器尺寸，决定显示icon的大小和位置
		wrapWidth = element.width();
		wrapHeight = element.height();

		// 默认的样式配色等
		config = {
			width: wrapWidth + 'px', // 整体宽度
			iconSize: '60px', // icon尺寸，同宽高
			color: '#8ac007', // loading条颜色
			autoClose: 10000 // 单位ms，自动隐藏loading的延时时间
		};
		$.extend(config, opts);

		// 综合参数处理
		// icon上边距
		!config.iconMarginTop && (
			config.iconMarginTop = (Math.max(Math.min(wrapHeight, $(window).height()),
				parseInt(config.iconSize, 10)) - parseInt(config.iconSize, 10)) / 2 +
			'px'
		);
		// 整体高度
		!config.height && (
			config.height = Math.max(100, wrapHeight) + 'px'
		);

		loadingUI = [
			'<div class="P-loadingUI">',
			'	<style type="text/css">',
			'	.P-loadingUI{margin:0 0 2em;height:' + config.height + ';width:' +
			config.width + ';text-align:center;padding:1em;margin:' + config.iconMarginTop +
			' auto;display:inline-block;vertical-align:top;filter:url(#P-loadingIcon)}',
			'	svg path,svg rect{fill:' + config.color + ';}',
			'	</style>',
			'	<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="' +
			config.iconSize + '" height="' + config.iconSize +
			'" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">',
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
		clearTimeout(FU.showLoading._timer);
		FU.showLoading._timer = setTimeout((function(loadingUI, element) {
			return function() {
				// $(loadingUI).insertBefore(element.first());
				$(loadingUI).appendTo(element);
				loadingUI = null;
				element = null;
			};
		})(loadingUI, element), 300);

		// 是否自动关闭
		if (config.autoClose > 0) {
			setTimeout(FU.hideLoading, config.autoClose);
		};
	};

	/**
	 * 隐藏加载进度条
	 * @return {[type]} [description]
	 */
	FU.hideLoading = function() {
		clearTimeout(FU.showLoading._timer);
		$('.P-loadingUI').remove();
	};

	/**
	 * 寻找元素，支持[]的转义，以及过滤<meta name="">
	 * @param  {[type]} selectOrElement [description]
	 * @param  {[type]} container       [description]
	 * @return {[type]}                 [description]
	 */
	FU.getElement = function(selectOrElement, container) {
		var element = null;

		if (! selectOrElement) {
			return null;
		}

		if (typeof selectOrElement === 'string') {
			// 替换掉ID内容的中括号 @todo 区分 $('[name=a[name]]')的情况
			/*selectOrElement = selectOrElement.replace(/\[/g, '\[')
								.replace(/\]/g, '\]');*/

			// 兼容传统id传递方式
			/^([a-zA-Z_]{1,1})[\w]*$/.test(selectOrElement) && (selectOrElement = '[id="'+ selectOrElement +'"]');
		}

		// 此处依赖name来查询表单元素，但和<meta>冲突的情况时，傻傻分不清楚
		element = $(selectOrElement, container || document).not('meta');

		return element;
	};

	/**
	 * 仅获取表单元素
	 * @param  {[type]} selectOrElement [description]
	 * @param  {[type]} container       [description]
	 * @return {[type]}                 [description]
	 */
	FU.getFormElement = function(selectOrElement, container) {
		var element = FU.getElement(selectOrElement, container);

		// fieldset 为显示/隐藏type=group时用到
		return element ? element.filter('input,textarea,button,select,fieldset') : null;
	};

	FU.showField = function(fieldsName) {
		return FU.setFieldAttributes(fieldsName, {
			'display' : true
		});
	};
	FU.hideField = function(fieldsName) {
		return FU.setFieldAttributes(fieldsName, {
			'display' : false
		});
	};

	FU.enableField = function(fieldsName) {
		return FU.setFieldAttributes(fieldsName, {
			'disabled' : false
		});
	};
	FU.disableField = function(fieldsName) {
		return FU.setFieldAttributes(fieldsName, {
			'disabled' : true
		});
	};

	FU.resetField = function(fieldsName) {
		return FU.setFieldAttributes(fieldsName, {
			'value' : ''
		});
	};

	/**
	 * Set Field Attrbutes, like readonly, disable, etc
	 * @param {[type]} fieldsName [description]
	 * @param {[type]} value      [description]
	 */
	FU.setFieldAttributes = function(fieldsName, values) {
		var targetElements = [];

		!$.isArray(fieldsName) && (fieldsName = [fieldsName]);
		$.each(fieldsName, function(i, field) {
			var fieldElements, commonElement;

			if (typeof field === 'string') {
				fieldElements = FU.getFormElement('[name="'+ field +'"],[name="' + field + '[]"]');
				fieldElements.size() < 1 && (fieldElements = FU.getFormElement('fieldset [id="'+ field +'"]'));
				fieldElements.size() < 1 && (fieldElements = $('#SLOT_' + field)); // 类型为 html 时适用
			} else {
				fieldElements = $(field);
			}

			fieldElements.each(function(i, el) {
				var tagName = el.tagName,
					el = $(el);
				targetElements.push(el);

				$.each(values, function(key, value) {
					switch(key) {
						case 'disabled' : 
							el.prop('disabled', !!value);
							break;

						case 'readonly' : 
							el.prop('readonly', !!value);
							break;

						case 'display' :
							if (el.get(0).tagName.toUpperCase()==='FIELDSET') {
								el[!!value ? 'slideDown' : 'slideUp']();
							} else if (el.closest('[id^=SLOT_]')) {
								el.closest('[id^=SLOT_]')[!!value ? 'slideDown' : 'slideUp']();
							} 
							else {
								el[!!value ? 'slideDown' : 'slideUp']();
							}
							break;

						case 'hint' :
						case 'help'	:
							el.closest('[id^=SLOT_]').find('.formui-help').html(value)[value ? 'slideDown':'slideUp']();
							break;

						case 'value' :
							var params = {};
							params[field] = value;
							FU.setData(params);
							break;

						case 'counter' :
							initWidgetCounter({
								name: field,
								counter : value
							});
							break;
					}
					tagName.toUpperCase() === 'SELECT' && $(el).trigger('chosen:updated');
				});
			});
		});

		return $(targetElements);
	};

	/**
	 * 触发字段的事件
	 * @param  {[type]} fieldsName [description]
	 * @param  {[type]} eventName  [description]
	 * @return {[type]}			[description]
	 */
	FU.trigger = function(fieldsName, eventName) {
		!$.isArray(fieldsName) && (fieldsName = [fieldsName]);
		$.each(fieldsName, function(i, field) {
			FU.getFormElement('[name="' + field + '"]').each(function(i, el) {
				if (el.tagName=='INPUT' && (el.type=='checkbox' || el.type=='radio') && !el.checked) {
					return;
				}
				$(el).trigger(eventName);
			});
		});
	};


	/**
	 * 设置字段属性，支持批量
	 * @param {[type]} fieldsName   [description]
	 * @param {[type]} attrsMapping {attrName : attrValue}
	 */
	// 未测试，需要时打开
	/*FU.setFieldAttributes = function(fieldsName, attrsMapping) {
		!$.isArray(fieldsName) && (fieldsName = [fieldsName]);
		$.each(fieldsName, function(i, field) {
			$('[name="' + field + '"]').filter('input,textarea,button,select').each(function(ii, el) {
				$.each(attrsMapping, function(key, val){
					$(el).prop(key, val);
				});
			});
		});
	};*/

	/**
	 * 获取表单数据，支持：
	 * 	1. 对象传入，key为字段名，value可以为HTML标签名，或者whatever
	 * 	2. 数组传入
	 * 	3. 字符串，单个字段
	 * @param  {object} fields 需要获取的字段name，数组传入则批量获取
	 * @param  {object} wrapper 可选，默认取form下的表单元素，但对一个页面有多个表单时，需要指定form，可以是ID
	 * @return {[type]}		[description]
	 */
	FU.getData = function(fields, wrapper, opts) {
		var result, data = {},
			paramsType, fieldsArray = [],
			defaultOpts;

		defaultOpts = {
			isStructed: true // 将带有下标的name（x[0]），转化成数组；字符则转换为对象
		};

		opts = $.extend(defaultOpts, opts);

		// @todo 对接JQ的$.serializeArray()

		// 支持多格式输入
		switch ($.type(fields)) {
			case 'object':
				$.each(fields, function(k, v) {
					fieldsArray.push(k);
				});
				break;

			case 'string':
				fieldsArray = [fields];
				break;

			default:
				fieldsArray = fields;
		}

		wrapper = FU.getElement(wrapper);
		!wrapper && (wrapper = $(document));

		// 都格式化成数组来遍历
		$.each(fieldsArray, function(i, fieldName) {
			var el, val, type, tagName, isButton = false;

			el = FU.getFormElement('[name="' + fieldName + '"],[name="' + fieldName + '[]"]', wrapper);
			type = el.size() > 0 ? (el.attr('type') || '').toUpperCase() : '';
			tagName = el.size() > 0 ? el.get(0).tagName.toUpperCase() : '';

			// 可能取多组数据
			if (el.size() > 1) {
				val = [];
				$.each(el, function(i, v) {
					var tv;

					v = $(v);
					// disabled的值，不会传递到server;readonly可以传递
					if (v.attr('disabled')) {
						return;
					};
					// checkbox元素的默认转换
					switch (type) {
						case 'CHECKBOX':
						case 'RADIO':
							if (v.prop('checked')) {
								tv = $.trim(v.val());
							}
							break;

						case 'submit':
						case 'button':
						case 'reset':
							isButton = true;
							break;

						default:
							tv = $.trim(v.val());
					}
					tv !== undefined && tv !== '' && val.push(tv);
				});

				if (type == 'RADIO') {
					val = val.length > 0 ? val[0] : '';
				};
			} else {
				if (el.attr('disabled')) {
					return;
				};
				if (tagName == 'SELECT' && el.prop('multiple')) {
					val = el.val();
				} else if(tagName=='submit' || tagName=='button' || tagName=='reset') {
					isButton = true;
				} else {
					val = $.trim(el.val());
				}

				if (type == 'CHECKBOX' || type == 'RADIO') {
					if (el.prop('checked')) {} else {
						val = '';
					}
				}
			}

			typeof val !== 'undefined' && !isButton && (data[fieldName] = val);
		});

		// 类似PHP的模式，将x[0]、x[1]打包为数组
		if (opts.isStructed) {
			result = {};
			$.each(data, function(name, value) {
				// 只支持
				var matches = name.match(
						/(?:\[(\w*)\])?(?:\[(\w*)\])?(?:\[(\w*)\])?(?:\[(\w*)\])*$/),
					index, lastIndex, item,
					matchedStr = matches.shift();

				if (matchedStr) {
					item = result;
					lastIndex = name.replace(matchedStr, '');
					while (typeof(index = matches.shift()) !== 'undefined') {
						if (typeof item[lastIndex] === 'undefined') {
							item[lastIndex] = isNaN(index) ? {} : [];
						};

						item = item[lastIndex];
						lastIndex = index;
					}
					item[lastIndex] = value;
				} else {
					result[name] = value;
				}
			});
		} else {
			result = data;
		}

		// 数据按照类型转换
		FU.tidyData(result, fields);

		return result;
	};

	/**
	 * 表单设置值
	 * @param {[type]} data [description]
	 * @return {object} notSetList，未设置的值
	 */
	FU.setData = function(data, opts) {
		var notSetList = {};

		opts = opts || {
			/*
			typeHandler: {
				// 字段类型处理器
				'SELECT' : function(fieldElement, fieldValue) {
					fieldElement.val(fieldValue).trigger("chosen:updated");
				}
			},
			fieldHandler: {
				// 具体字段处理器
				'name' : function(fieldElement, fieldValue) {
					fieldElement.prop('readonly', true);
				}
			}
			*/
		};

		$.each(data, function(fieldName, fieldValue) {
			var fieldElement = FU.getFormElement('[name="' + fieldName + '"]'),
				fieldType;

			if (fieldValue === null) {
				return
			};

			if (fieldElement.size() === 0) {
				var selector = [];

				$.each($.isArray(fieldValue) ? fieldValue : [fieldValue], function(i, value){
					selector.push('[name="' + fieldName + '[]"][value="'+ value +'"]');
				});
				fieldElement = FU.getFormElement(selector.join(','));
			}

			if (fieldElement) {
				fieldType = ((fieldElement.size()>0 ? fieldElement.get(0) : {}).tagName || '').toUpperCase();
				fieldType == 'INPUT' && (fieldType = fieldElement.attr('type').toUpperCase());
			}

			switch (fieldType) {
				case 'RADIO':
					fieldElement.filter('[value="' + fieldValue + '"]').prop('checked',
						true);
					break;

				case 'CHECKBOX':
					fieldElement.prop('checked', false);

					if ($.isArray(fieldValue)) {
						$.each(fieldValue, function(i, vv) {
							fieldElement.filter('[value="' + vv + '"]').prop('checked', true);
						});
					} else {
						fieldElement.filter('[value="' + fieldValue + '"]').prop('checked',
							true);
					}
					break;

				case 'SELECT':
					if ($.isArray(fieldValue)) {
						$.each(fieldValue, function(i, vv) {
							// 兼容一下，实际应只有一个
							fieldElement.find('[value="' + vv + '"]:last').prop('selected',
								true).trigger('chosen:updated');
						});
					} else {
						fieldElement.val(fieldValue).trigger('chosen:updated');
					}
					break;

				case 'WIDGET':  // @todo, trigger change : counter
					break;

				case 'TEXT':
				case 'TEXTAREA':
				case 'HIDDEN':
				default:
					if (typeof fieldValue !== 'object') { // 叶子节点
						fieldElement.val(fieldValue);
					} else if ($.isPlainObject(fieldValue)) { // 其他带层级化的
						var subSetResult = FU.setData(fieldValue, opts);
						if (!$.isEmptyObject(subSetResult.notSetList)) {
							notSetList[fieldName] = {};
							$.extend(notSetList[fieldName], subSetResult.notSetList);
						};
					} else if ($.isArray(fieldValue) && fieldValue.length && $.isPlainObject(fieldValue[0])) {
						// 是数组，但是对象数组的
						$.each(fieldValue, function(ii, vv) {
							var subSetResult = FU.setData(vv, opts);
							if (!$.isEmptyObject(subSetResult.notSetList)) {
								!notSetList[fieldName] && (notSetList[fieldName] = []);
								notSetList.push(subSetResult.notSetList);
							};
						});
					} else {
						notSetList[fieldName] = fieldValue;
					}
			}

			// 能找到的元素，才能识别type
			if (fieldElement && fieldElement.size() > 0) {
				fieldElement.trigger('_setdata', [fieldValue]);	// 触发自定义事件

				fieldType && opts.typeHandler && opts.typeHandler[fieldType] && opts.typeHandler[
					fieldType].call(null, fieldElement, fieldValue);
			};

			opts.fieldHandler && opts.fieldHandler[fieldName] && opts.fieldHandler[
				fieldName].call(null, fieldElement, fieldValue);
		});

		// notSetList 不准 @todo
		return {
			notSetList: notSetList
		}
	};

	/**
	 * 表单数据清洗，如转换成整型
	 * @param  {[type]} data [description]
	 * @return {[type]}	  [description]
	 */
	FU.tidyData = function(data, fieldsConfig) {
		var fnConvert;

		!fieldsConfig && (fieldsConfig = {});

		fnConvert = function(value, type) {
			if (typeof type === 'string') {
				switch (type) {
					case FU.GENRE_STRING:
						value = value == null ? '' : value.toString().trim();
						break;
					case FU.GENRE_INT:
						if (value === '' || isNaN(value)) {
							value = null;
						} else {
							value = parseInt(value, 10);
						}
						break;
					case FU.GENRE_FLOAT:
						if (value === '' || isNaN(value)) {
							value = null;
						} else {
							value = parseFloat(value, 10);
						}
						break;
					case FU.GENRE_BOOLEAN:
						value = value==='false' ? false : !!value;
						break;
				}
			} else if ($.isArray(type)) { // 对打包数组的情况
				if ((value==='' || (value&&value.length===1&&value[0]==='')) && type.length === 1 && type[0] !== 'string') {
					// 排除['']和''
					return [];
				} else if (typeof value !== 'object') {
					if (type[0] == 'int' || type[0] == 'string') {
						value = value.split(',');
					} else {
						value = [value];
					}
				}

				if (value !== null) {
					var newValue = [];
					$.each(value, function(k, v) {
						// 排除空
						if (v==='') {
							return;
						}
						newValue.push(fnConvert(v, type[0]));
					});
					value = newValue;
				}
			}

			return value;
		}

		$.each(data, function(fieldName, fieldValue) {
			var cfgItem = fieldsConfig[fieldName];

			if (cfgItem) {
				data[fieldName] = fnConvert(fieldValue, cfgItem.genre);
			};
		});

		return data;
	};

	/**
	 * 填充select 下拉框
	 * 支持两种数据格式：
	 * 	1. key-value对，如{1：'角色',2:'棋牌'}
	 * 	2. 数组，可保持顺序，如[{name:'角色',code:1},{name:'棋牌',code:2}]
	 * 	3. 数组，值为下标，从0开始，如['角色', '棋牌']
	 * 	4. 二级下拉，如[{name:'角色',code:1, list:{1:'aaa',2:'bbbb'}}]
	 * @param  {[type]} id   元素本身或id
	 * @param  {[type]} list [description]
	 * @param  {[type]} opts [description]
	 * @return {[type]}	  [description]
	 */
	FU.fillSelect = function(id, list, opts) {
		var el, txtField, valField, selected, dict = {},
			isObjectArray = false;

		list = list || [];
		el = typeof id == 'string' ? $('#' + id) : $(id);
		// 不存在的元素，就跳过了
		if (el.size() === 0) {
			return false;
		}
		
		opts = opts || {
			// itemsField: 'items',	// 下级列表的字段名
			// labelField: 'label',	// 取此字段显示为文本
			// valueField: 'value',	// 取此字段显示为value
			// filterItemValue: function(v){return v},		// 第一级值过滤
			// filterSubItemValue: function(v){return v},	// 第二级值过滤
			// defaults: '请选择',	// 或['请选择',''] 默认值
		};

		// 判断下是哪种输入的数据类型，只要识别类型2即可
		if ($.isArray(list) && $.isPlainObject(list[0])) {
			isObjectArray = true;
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

		$.each(list, function(i, v) {
			var opt, optGroup, isSelected, key, val, items;

			opts.filterItemValue && (v = opts.filterItemValue(v));

			isObjectArray ? (
				key = v[opts.labelField] || v.label || v.name,
				val = v[opts.valueField] || v.value || v.code
			) : (
				key = v,
				val = i
			);

			// 是否有下级
			items = v[opts.itemsField] || v.items || v.list;
			if (items && typeof items === 'object') {
				var isObjectArraySublist = false, defaultAll;

				if ($.isArray(items) && $.isPlainObject(items[0])) {
					isObjectArraySublist = true;
				}
				optGroup = document.createElement("optgroup");
				optGroup.setAttribute('label', key || '');
				optGroup.setAttribute('value', val);

				defaultAll = new Option(('所有“' + key + '”'), val, false);
				defaultAll.style = 'display:none';
				defaultAll.setAttribute('data-role', 'optgroup');
				optGroup.appendChild(defaultAll);

				$.each(items, function(kk, vv) {
					var opt, keyk, valk, isSelected;

					opts.filterSubItemValue && (vv = opts.filterSubItemValue(vv));

					if (isObjectArraySublist) {
						keyk = vv[opts.labelField] || vv.label || vv.name;
						valk = vv[opts.valueField] || vv.value || vv.code;
					} else {
						keyk = vv;
						valk = kk;
					}
					isKSelected = $.inArray(vv, selected) >= 0;

					opt = new Option(keyk || (valk + '(无名称)'), valk, false, isKSelected);
					optGroup.appendChild(opt);

					dict[valk] = keyk;
				});
			} else {
				isSelected = $.inArray(val, selected) >= 0;
				opt = new Option(key || (val + '(无名称)'), val, false, isSelected);

				// 其他属性都加上去，方便以后用
				if ($.isPlainObject(v)) {
					$.each(v, function(kk, vv) {
						opt.setAttribute('data-' + kk, vv);
					});
				}
			}

			el.options.add(opt || optGroup);

			// 存一份到字典，备查
			dict[val] = key;
		});

		// 如果没有值，则给个默认
		if (el.options.length < (opts['defaults'] ? 2 : 1)) {
			el.options.add(new Option('暂无数据', '', false, false));
		}

		// 存储到全局字典
		// P.dict.set(el.name||valField, dict);
		
		return el;
	};

	/**
	 * 过滤XSS字符
	 * @param  {[type]} string [description]
	 * @return {[type]}        [description]
	 */
	FU.tidyXssCode = function(string) {
		return string.toString().replace(/[<>\'\"&']/g, '');
	};

	/**
	 * 获取URL参数，支持数组格式来批量获取
	 * 优先从querystring获取，其次为fragment
	 * @param  {[type]} params [description]
	 * @return {[type]}		[description]
	 */
	FU.getUrlParams = function(params){
		var result, ps = {},
			search = location.search.substring(1).split('&')||[],
			hash;

		hash = location.hash;
		hash.substring(0,2)=='#!' && (hash = hash.substring(1));  // 支持下#!的情况
		hash = hash.substring(1).split('&')||[];

		// 优先取search，再取hash
		$.each(hash.concat(search), function(k, v){
			var t;

			if (v) {
				t = v.split('=');
				ps[t[0]] = t.length>1 ? FU.tidyXssCode(t[1]||'') : '';
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
	 * 更新地址栏url hash部分
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	FU.refreshUrlHash = function(data) {
		var hash = {}, hashString;

		hashString = location.hash;
		hashString.substring(0,2)=='#!' && (hashString = hashString.substring(1));  // 支持下#!的情况;
		hashString = hashString.substring(1);

		$.each(hashString && hashString.split('&'), function(i, v){
			var t = v.split('=');
			hash[t[0]] = FU.tidyXssCode(t[1]||'') || '';
		});
		$.each(data||{}, function(k, v){
			hash[k] = FU.tidyXssCode(v||'');
		});

		location.hash = $.param(hash);
	};

	/**
	 * 从URL恢复页面
	 * @param  {[type]} config [description]
	 * @return {[type]}		[description]
	 */
	FU.restoreFormUrl = function(config, fieldsMapping) {
		var params = FU.getUrlParams();

		// 从url获取的参数比较危险，但对text类型填充的情况，允许做decode
		$.each(params || {}, function(field, value) {
			if (value && fieldsMapping[field] && (fieldsMapping[field].type in {
					'textarea': true,
					'text': true,
					// 'email',
					// 'password',
					// 'date',
					// 'datetime',
					// 'month',
					// 'time',
					// 'week',
					// 'number',
					'url': true,
					'search': true,
					// 'tel',
					'color': true
				})) {
				params[field] = decodeURIComponent(value);
			};
		});

		FU.setData(params);
	};

	/**
	 * set stylesheet, support pseudo element
	 */
	function setStyleSheet (styleSheetId, styles) {
		var content = [];

		$.each(styles, function(k, v){
			if (typeof v === 'string') {
				content.push(k +'{'+ v +'}');
			} else {
				var properties = [];
				$.each(v||{}, function(name, value){
					var formatName = name.replace(/([A-Z])/g,"-$1").toLowerCase();
					properties.push([formatName, value].join(':'));
				});
				content.push(k +'{'+ properties.join(';') +'}');
			}
		});

		$('#'+ styleSheetId).remove();
		$('head').append('<style type="text/css" id="'+ styleSheetId +'">'+ content.join("\n") +'</style>');
	}

	/**
	 * 事件绑定
	 * @return {[type]} [description]
	 */
	FU.bindEvents = function(eventsConfig, container) {
		$.each(eventsConfig || {}, function(i, v) {
			var el = $(v[0]),
				evt = v[1],
				callback = v[2],
				opts = v[3] || {},
				tagName;

			tagName = el.get(0).tagName.toUpperCase();
			switch (tagName) {
				case 'form':
					el = evt === 'change' ? $('input,textarea,select', container) : $(el, container);
				default:
					el.bind(evt, function() {
						callback.call(this);
						if (opts.preventDefault) {
							return false;
						};
					});
			}
		});
	};

	FU._INSTANCES = {}; // 以元素ID为key，存储实例
	/**
	 * 获取表单实例
	 * @param  {[type]} containerId [description]
	 * @return {[type]}			 [description]
	 */
	FU.getInstance = function(containerId) {
		return FU._INSTANCES[containerId] || null;
	};

	// -------------------- 以下为动态方法 --------------------

	// 动态构建
	FU.Construct = function(config, container) {
		var defaultConfig = {}, contentEl;

		this.config = {};
		this.container = null;
		this.containerId = '';
		this.fieldsMapping = {};
		this.content = [];

		this.container = FU.getElement(container);
		this.containerId = this.container.attr('id');
		if (!this.containerId) {
			this.containerId = '_FUContainer' + Math.floor(Math.random() * 2E7);
			this.container.attr('id', this.containerId);
		}

		// loading
		FU.showLoading(this.container);

		initPreferenceCss(this.containerId);

		$.extend(true, defaultConfig, FU.defaultConfig);
		$.extend(defaultConfig, config);
		config = defaultConfig;

		content = parseConfig(config, (function(_m) {
			return function(itemConfig) {
				_m.fieldsMapping[itemConfig.name] = itemConfig;
			};
		})(this));
		this.config = config;

		contentEl = $(content);
		contentEl.hide().appendTo(this.container);
		setTimeout((function(_m){
			return function(){
				contentEl.slideDown();
				_m.container.fadeIn();
			};
		})(this), config.delay || 0);

		// 字段事件绑定
		bindFormEvents(this);

		// 从URL还原参数
		if (this.config.restoreFormUrl !== false) {
			FU.restoreFormUrl(this.config, this.fieldsMapping);
		};

		this.config = config;

		FU._INSTANCES[this.containerId] = this;

		FU.hideLoading(this.container);

		return this;
	};

	/**
	 * 以group为单位，增加一组元素
	 * @param {[type]} groupName [description]
	 */
	FU.Construct.prototype.addGroup = function(groupName) {
		var fieldsMapping = this.fieldsMapping || {},
			groupConfig,
			content = '',
			addedFieldsMapping = {},
			insertReferNode,
			configItems = this.config.items;

		$.each(configItems, function(i, fieldItem){
			if (fieldItem.type == FU.TYPE_GROUP && fieldItem.name==groupName) {
				var baseNode = $('.formui-group.'+ fieldItem.name);
				insertReferNode = baseNode.size()>0 ? baseNode.last() : (i >0 ? $('#SLOT_'+ configItems[i-1].name) : null);
				groupConfig = fieldItem;
				return false;
			}
		});

		if (groupConfig) {
			var fieldsetConfig = {},
				cloneConfig = {};
			
			groupConfig.repeat && (
				groupConfig.repeat.times = 1,
				groupConfig.repeat.currentIndex ++
			); // 重置为只复制一次
			$.extend(true, cloneConfig, groupConfig);
			$.extend(true, fieldsetConfig, this.config);
			fieldsetConfig.items = [cloneConfig];

			content = parseFields(fieldsetConfig, this.config, (function(_m) {
				return function(itemConfig) {
					_m.fieldsMapping[itemConfig.name] = itemConfig;
					addedFieldsMapping[itemConfig.name] = itemConfig;
				};
			})(this));

			$(content).insertAfter(insertReferNode);

			// 字段事件绑定
			bindFieldEvents(addedFieldsMapping);
		}

		return content ? true : false;
	};

	/**
	 * 以group为单位，删除一组表单
	 * @param  {[type]} element group下的任意一个元素
	 * @return {[type]}         [description]
	 */
	FU.Construct.prototype.removeGroup = function(element) {
		var wrapper = $(element).closest('.formui-group'),
			fieldElements = FU.getElement('input,textarea,button,select,fieldset', wrapper),
			fieldsMapping = this.fieldsMapping||{};

		$.each(fieldElements||[], function(i, el){
			var elName = el.name||el.getAttribute('data-name')||'';
			fieldsMapping[elName] = null;
			delete fieldsMapping[elName];
		});

		wrapper.remove();
	};

	/**
	 * 重建表单项
	 * @param  {[type]} config    [description]
	 * @return {[type]}           [description]
	 */
	FU.Construct.prototype.rebuildField = function(fieldConfig) {
		var content, fieldEl, fieldWrapEl;

		!fieldConfig && (fieldConfig = this.fieldsMapping[fieldConfig.name]);

		fieldEl = FU.getElement('[name='+ fieldConfig.name +']');
		fieldEl.attr('id', fieldEl.attr('id') +'__replacing');
		fieldWrapEl = fieldEl.closest('.form-group');

		content = parseFields({items: [fieldConfig]}, this.config, (function(_m) {
			return function(itemConfig) {
				_m.fieldsMapping[itemConfig.name] = itemConfig;
			};
		})(this));

		// @todo repeated字段，组件字段等事件处理

		fieldWrapEl.replaceWith(content);
		EventPool.rebind(fieldConfig.name)

		return this;
	};

	FU.Construct.prototype.removeField = function(fieldName) {
		FU.getElement('[name="'+ fieldName +'"]').closest('.form-group').remove();

		// @todo 移除events
	};

	/**
	 * 启用表单
	 * @return {[type]} [description]
	 */
	FU.Construct.prototype.enable = function() {
		FU.setFormStatus('enabled', this.container);
		this.container.find('[type=submit]').closest('.form-group').css('opacity', 1);
	};

	/**
	 * 禁用表单
	 * @return {[type]} [description]
	 */
	FU.Construct.prototype.disable = function() {
		FU.setFormStatus('disabled', this.container);
		this.container.find('[type=submit]').closest('.form-group').css('opacity', 0);
	};

	FU.Construct.prototype.submit = function() {
		this.container.find('form').trigger('submit');
	};

	FU.Construct.prototype.reset = function() {
		this.container.find('form').trigger('reset');
	};

	FU.Construct.prototype.reload = function() {

	};

	FU.Construct.prototype.refresh = function() {

	};

	FU.Construct.prototype.getData = function() {
		return FU.getData(this.fieldsMapping, this.container);
	};

})(window.FormUI = window.FormUI || {});

/*
	var formConfig = {
		// layout	: 'horizontal',
		ratio	: '2:10',	// 比列
		theme	: '',	// 采用的皮肤，需要的对应资源见FU.themeConfig
		size	: 'md',	// sm md lg
		refreshUrlHashEnabled: true,	// 查询条件反馈到url hash

		label	: '申请数据ID',
		className: 'pull-right',

		marked: '<strong style="color:red"> *</strong>',	// 若字段配置了required:true，则使用此标记对应字段

		buttons	: {
			className: 'col-lg-2 col-lg-offset-2',
			items	: [
				{
					label	: '提交',
					type	: 'submit'
				},
				{
					label	: '取消',
					type	: 'reset'
				}
			]
		},

		items	: [
			{
				type	: 'group',
				name	: 'demographics',
				label	: '人口学信息',
				items	: [
					{
						name	: 'data_name',
						label	: '统计名称',
						type	: 'text',
						counter	: [1, 32],
						prefix	: '',
						postfix	: '<button>重名检测</buttomn>',
						required: true
					},
					{
						name	: 'data_id',
						label	: 'ID',
						type	: 'text',
						display : false,
						attrs	: {
							readonly : true
						}
					},
					{
						name	: 'area',
						label	: '地区',
						type	: 'chosen',
						chosen	: {  // 组件的配置
							columns: 2,
							max_selected_options: 100,
						},
						items	: [
							{
								label	: '湖南',
								value	: '1'
							},
							{
								label	: '广东',
								value	: '2'
							}
						],
						attrs	: {
							multiple	: true
						},
						events	: {
							complete : function(){
							},
							change : function(){
							},
							click : function(){
							}
						}
					},
					{
						name	: 'begin_time',
						label	: '开始时间',
						genre	: FormUI.GENRE_STRING,
						type	: FormUI.TYPE_CALENDAR,
						calendar: {
							minDate: Y.const.DATE_TODAY,
							related: {
								name : 'end_time',
								relation: 'less'
							}
						}
					},
					{
						name	: 'end_time',
						label	: '投放结束时间',
						genre	: FormUI.GENRE_STRING,
						type	: FormUI.TYPE_CALENDAR,
						calendar: {
							minDate: Y.const.DATE_TODAY,
							related: {
								name : 'begin_time',
								relation: 'more'
							}
						}
					},
					{
						name	: 'type',
						label	: '类型',
						type	: 'radio',
						validator: function(value){
							var result = true;

							if (value != 1) {
								result = '当前只允许选择A';
							}

							return result;
						},
						items	: [
							{
								label : '个人',
								value : 1,
								events : {
									click : function(){
										this.checked && $('#no').show();
									}
								}
							},
							{
								label : '企业',
								value : 2,
								events: {
									click : function(){
										this.checked && $('#no').hide();
									}
								}
							}
						]
					},
					{
						type	: 'group',
						label	: '层级 {INDEX}',
						generator: 'static',	// static：一次生成所有展示项，dynamic：动态生成。默认static
						repeat	: {
							times	: 5,
							replaces: {
								'{INDEX}'	: [1, 2, 3, 4, 5]
							}
						},
						items	: [
							{
								name	: 'layer_name{INDEX}',
								label	: '参数 ',
								type	: 'text',
								attrs	: {
									placeholder : '上报的参数名，如：imei'
								}
							}
						]
					}
				]
			},
			{}	// repeated
		]
	};

	var formInstance = new FormUI.Construct(formConfig, container);	// 创建一个表单
	formInstance.onSubmit = function(){
	};
	formInstance.onChange = function(){
		this.submit();
	};

	var formInstance = FormUI.getInstance(containerId);	// 获取当前的FormUI实例
 */
