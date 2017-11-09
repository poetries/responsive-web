(function(){
	// 仅允许chrome
	if (! /(chrom(e|ium))|(applewebkit)/i.test(navigator.userAgent)) {
		alert('推荐使用Chrome浏览器运行本系统！');
		location.href = 'http://rj.baidu.com/soft/detail/14744.html';
	}
})();

/**
 * 全局
 */

(function(Y) {

	/************************************/
	/*			通用功能函数			*/
	/************************************/
	Y.helper = Y.helper || {};
	Y.helper.tmpl = P.util.tmpl;
	Y.form = Y.form || {};
	Y.util = Y.util || {};
	Y.ui = Y.ui || {};


	/**
	 * 获取提交数据结果，以json格式返回
	 **/
	Y.helper.getFormResult = function(id, obj) {
		var cnt = $('#' + id);
		var arrs = cnt.find('input');
		obj = obj || {};
		if (arrs) {
			for (var i = 0, len = arrs.length; i < len; i++) {
				var item = arrs[i];
				var name = $(item).attr('name');
				var val = $(item).val();
				if (name) {
					obj[name] = val;
				}
			}
		}
		return obj;
	};

	/************************************/
	/*		UI 组件自动初始化			*/
	/************************************/
	Y.uiAutoInitComponentConfig = {
		calender: function(config) {
			return $.extend({
				"dateFormat": 'yy-mm-dd',
				// defaultDate: "+1w",
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
			}, config || {});
		},

		dateSelector: function(config) {
			return $.extend({
				0: [0, 0],
				1: [-1, -1],
				2: [-7, -1],
				3: [-10, -1],
				4: [-30, -1],
				5: []
			}, config || {});
		},


		slideSwitch: function(config) {
			return $.extend({
				size: 'mini',
				onColor: 'success',
				onText: '自定义',
				offText: '不限'
			}, config || {});
		}
	};

	// 本地存储的信息管理，提升用户体验
	(function(recall){
		var userId = (P.storage.get('auth', 'local')||{}).id||'',
			accountId = Y.vars.advertiser_id;

		var comboKeys = function(keysArray) {
			var keys = [userId, accountId].concat(keysArray || []);
			return keys.join('|');
		};

		recall.getDate = function(name) {
			return P.storage.getLocal(comboKeys(['date', name])) || '';
		};

		recall.updateDate = function(name, value) {
			// 默认存储3天
			return P.storage.setLocal(comboKeys(['date', name]), value, 259200000);
		};

		recall.getCampaignPreferColumns = function() {
			var data = P.storage.getLocal(comboKeys(['preferColumns', 'campaign']));
			return data ? data.split(',') : data;
		};

		recall.updateCampaignPreferColumns = function(values) {
			$.isArray(values) && (values = values.join(','));
			return P.storage.setLocal(comboKeys(['preferColumns', 'campaign']), values, 604800000);
		};

		recall.getAdgroupPreferColumns = function() {
			var data = P.storage.getLocal(comboKeys(['preferColumns', 'adgroup']));
			return data ? data.split(',') : data;
		};

		recall.updateAdgroupPreferColumns = function(values) {
			$.isArray(values) && (values = values.join(','));
			return P.storage.setLocal(comboKeys(['preferColumns', 'adgroup']), values, 604800000);
		};

		recall.getCreativePreferColumns = function() {
			var data = P.storage.getLocal(comboKeys(['preferColumns', 'creative']));
			return data ? data.split(',') : data;
		};

		recall.updateCreativePreferColumns = function(values) {
			$.isArray(values) && (values = values.join(','));
			return P.storage.setLocal(comboKeys(['preferColumns', 'creative']), values, 604800000);
		};

		recall.getPreferColumns = function() {
			// 从细粒度一直往上取，直到有值为止
			var data = recall.getCreativePreferColumns() || recall.getAdgroupPreferColumns() || recall.getCampaignPreferColumns();

			return data;
		};
	})(Y.recall = {});

	// 每个组件，都可以对应在Y.uiAutoInitComponentConfig有一份配置
	Y.uiAutoInitComponent = {
		// 启动器
		init: function() {
			$.each(Y.uiAutoInitComponent, function(componentName, fn) {
				// _下划线开头的是私有方法，不自动调用
				if (componentName != 'init' && componentName.indexOf('_') != 0) {
					fn.call();
				};
			});
			$('#nav-lst').find('li').removeClass('active').each(function(k, v) {
				var href = $(v).find('a').attr('href');
				var loc = document.location.href;
				if (loc.indexOf(href) != -1) {
					$(v).addClass('active');
				}
			})
		},

		// 自动填充下拉
		autoFill: function() {
			$('[data-fill]').each(function(i, el) {
				P.form.autoFillData(this.getAttribute('data-fill'), el);
				$(el).trigger('chosen:updated');
			});
		},

		refresh: function(componentName) {
			if (componentName in Y.uiAutoInitComponent) {
				Y.uiAutoInitComponent[componentName].call();
			};
		},

		calender: function() {
			/**
			 * Y.widget.xxxx.cbs.cb
			 * yamp控件，支持在cbs名称空间下的回调
			 * 比如在页面中使用了editable 。
			 * 可以注册回调方法 Y.widget.editable.cbs.iamcallback
			 * <div data-ydsp-widget="editable" data-ydsp-config='{"cb":"iamcallback"}'></div>
			 **/

			/**
			 * [calenderBuilder description]
			 * @param  {[type]} el	  [description]
			 * @param  {[type]} onClose [description]
			 * @return {[type]}		 [description]
			 * <input type="text" class="input-sm form-control" id="r" name="r" data-ydsp-widget="calendar" data-date-format="yymmdd" data-no-default-value="no"/>
			 */
			var calenderBuilder = function(el, onClose) {
				var self, selfConfig, config, unit, date;

				self = el;
				selfConfig = P.JSON.parse(el.attr('data-ydsp-config') || '', {
					standardJSON: false
				}) || el.data() || {};
				config = new Y.uiAutoInitComponentConfig.calender(selfConfig);

				config.onClose = onClose || function(selectedDate) {};
				el.datepicker(config);
				el.change(function(){
                    var data = $(this).data(),
                        beginDate,
                        endDate;

                    switch (data.ydspWidget) {
                        case "calender-start":
                            beginDate = this.value;
                            endDate = $(this).closest('div').find('input[data-ydsp-widget="calender-end"]').val();
                            break;

                        case "calender-end":
                            beginDate = $(this).closest('div').find('input[data-ydsp-widget="calender-start"]').val();
                            endDate = this.value;
                            break;
                    }

                    // 有开始结束日期的，合理的才存储
                    if (beginDate && endDate && beginDate > endDate) {
                        return;
                    }

					// 更新存储的日期
					Y.recall.updateDate(this.name, this.value);
				});

				typeof config.date === 'undefined' && (config.date = '0'); // 默认查一周前的，报表
				config.date = $.trim(config.date);
				switch (config.date.slice(-1)) {
					case 'm':
						unit = 'month';
						break;
					case 'd':
						unit = 'day';
						break;
					default:
						unit = '';
				}
				date = parseInt(config.date || '', 10);

				if (el.val()) {
					el.datepicker('setDate', new Date(el.val()));
				} else if (date !== 0) {
					el.datepicker(
						'setDate',
						new Date(moment()[date && date > 0 ? 'add' : 'subtract'](Math.abs(date), unit))
					);
				} else if (!config.noDefaultValue) {
					el.datepicker('setDate', Y.recall.getDate(self.attr('name'))||new Date());
				}

				// 设置最大值和最小值
				// if (config.minDate) {
				// 	//el.datepicker('option', 'minDate', config.minDate);
				// }
				// if (config.maxDate) {
				// 	//el.datepicker('option', 'maxDate', config.maxDate);
				// }
			};
			// 开始日期
			calenderBuilder($('[data-ydsp-widget="calendar-start"],[data-ydsp-widget="calender-start"]'), function(selectedDate) {
				var config = $(this).data();
				if (config.minDate) {
					selectedDate = Math.max(config.minDate, selectedDate);
				}
				$('[data-ydsp-widget="calendar-end"],[data-ydsp-widget="calender-end"]').datepicker('option', "minDate", selectedDate);
			});
			// 结束日期
			calenderBuilder($('[data-ydsp-widget="calendar-end"],[data-ydsp-widget="calender-end"]'), function(selectedDate) {
				var config = $(this).data();
				// if (config.minDate) {
				// 	//selectedDate = Math.min(config.maxDate, selectedDate);
				// }
				//$('[data-ydsp-widget="calender-start"]').datepicker('option', "maxDate", selectedDate);
			});

			// 其他常见日期
			$('[data-ydsp-widget="calendar"],[data-ydsp-widget="calender"]').each(function(k, v) {
				var el = $(v);
				calenderBuilder(el, function(selectedDate) {});
			});
		},

		editable: function() {
			$('[data-ydsp-widget="editable"]').each(function(k, v) {
				var self = $(v),
					cgifunc;

				var datas = self.data();

				var config = Y.uiAutoInitComponent._yconf(self);
				//self.attr('data-ydsp-config');
				//config = config ? P.JSON.parse(config, {standardJSON:false}) : {};

				//Enhance ability:
				var cgi = config.cgi || datas.yconfCgi;
				if (cgi && cgi.length) {
					cgi = cgi.split('.');
					var entity = cgi[0];
					var func = cgi[1] || 'update';
					cgifunc = Y[entity][func];
				}
				$(v).editable({
					mode: 'inline',
					send: 'never',
					url: function(params) {
						var d = new $.Deferred;
						var newValue = params.value;
						var data = config.sendobj || datas.yconfSendobj;
						if (!data) {
							return d.reject('');
						}
						if (typeof(data) == 'string') {
							data = P.JSON.parse(data, {
								standardJSON: false
							});
						}

						var name = config.name || datas.yconfName;

						var validtype = config.validtype || '';
						switch (validtype) {
							case 'int':
								if (!/^\d*$/.exec(newValue)) {
									//$(v).editable('activate');
									//P.alert('请填整数');
									return d.reject('请填整数');

								}
								data[name] = parseInt(newValue);

								break;
							case 'float':
								if (isNaN(newValue)) {
									//$(v).editable('activate');
									//P.alert('请填数字');
									return d.reject('请填数字');
								}
								data[name] = parseFloat(newValue);
								break;
							case 'currency':
								if (!/^\d+(\.\d{1,2})?$/.test(newValue)) {
									return d.reject('请填整数或两位以内的小数')
								}
								data[name] = newValue;
								break;
							default:
								data[name] = newValue;
						}

						cgifunc && cgifunc(data, function(res) {
							//暂时不知道callback里有什么
							if (res.code !== 0) {
								//P.alert(res.message);
								return d.reject(res.message);
								//$(v).editable('show');
							} else {
								P.tips.show('修改成功', 'success');
								//$(v).data('yconfOrigin',newValue);
								//$(v).attr('data-yconf-origin',newValue);
								d.resolve();
								//$(v).editable('hide');
							}
							var cb = config.cb || datas.yconfCb;

							cb && Y.widget.editable.cbs[cb](v, res, newValue);
						});
						return d.promise();

					},
					success: function(response, newValue) {
					}
				}).on('hidden', function(e, reason) {
					if (reason == 'cancel' || reason == 'onblur' || reason == 'nochange') {
						$(this).html($(this).data('yconfOrigin'));
						$(this).parent().find('.editableform').find('input').val($(this).data('yconfOrigin'))
					}
				});
			});
		},

		maxlength: function() {
			if ($.fn.maxlength) {
				$('[maxlength]').maxlength();
			};
		},

		popover: function() {
			if ($.fn.popover) {
				$('[data-toggle="popover"]').popover();
			};
	},
	optionGroups: function() {
	  $('[data-widget="optionGroups"]').each(function(i, el) {

		var k = $(el).data('map');
		var v = $(el).data('defaultVal');
		var m = Y.nameMapping[k];
		var re = [];
		_.each(m, function(v, k) {
		  re.push('<option value="' + k + '">' + v + '</option>')
		})
		$(el).html(re.join(''))

	  })
		},
		//uiAutoInitComponent的私有方法，调用可支持取出data-yconf- 前缀和data-ydsp-config 的数据，优先取data-ydsp-config 的配置
		_yconf: function(el) {
			var j = $(el);
			var data = j.data();
			var re = {};

			var obj = P.JSON.parse(data.ydspConfig || data.yampConfig || '', {
				standardJSON: false
			}) || {};
			var r = /^yconf([A-Z][a-z|0-9|A-Z]*)/;
			for (var key in data) {
				if ((k = r.exec(key))) {
					var name = k[1][0].toLowerCase() + k[1].slice(1);
					re[name] = data[key];
				}

			}
			$.extend(re, obj);
			return re;
		},
		_getFunctionFromString: function(string) {
			var scope = window;
			var scopeSplit = string.split('.');
			for (i = 0; i < scopeSplit.length - 1; i++) {
				scope = scope[scopeSplit[i]];

				if (scope == undefined) return;
			}

			return scope[scopeSplit[scopeSplit.length - 1]];
		},
		_string2obj: function(str, val) {
			var root = {};


			var arr = str.split('.');
			var obj = root;
			for (var i = 0, len = arr.length; i < len; i++) {
				var item = arr[i];
				if (!obj[item]) {
					obj[item] = {};
					if (i == len - 1) {
						obj[item] = val;
					}
					obj = obj[item];

				}

			}
			return root;
		},
		statusQuery: function() {
			$('[data-ydsp-widget="status-query"]').each(function(i, elItem) {
				var self, selfConfig, config;

				self = $(elItem);
				selfConfig = Y.uiAutoInitComponent._yconf(elItem);
				config = new Y.uiAutoInitComponentConfig.slideSwitch(selfConfig);


				var vars = Y.vars || {};
				var biztype = config.bizType?config.bizType: vars.biz_type.slice(0, vars.biz_type.length - 1) ;
				var bizid = config.bizId;

				if (config.rendered && config.rendered == 'true') {
					return;
				}
				self.attr('data-rendered', 'true');
			   var obj = {};
			   obj[biztype + '_id'] = bizid;

			   var cgi = 'cgi' + biztype[0].toUpperCase() + biztype.slice(1) + 'Status';
			   Y[cgi].info(obj, function(d) {
				   if (d.code === 0) {
					   var map = Y.nameMapping.CalculateStatus2Txt;
					   self.html(map[d.data.status]);
				   }
			   });
				// self.addClass('status-wrap').
				// html('<a href="javascript:;" ><i class="fa fa-question fa-lg" title="点击查询当前状态"></i></a>').
				// bind('click', function(evt) {
				// 	var obj = {};
				// 	obj[biztype + '_id'] = bizid;

				// 	var cgi = 'cgi' + biztype[0].toUpperCase() + biztype.slice(1) + 'Status';
				// 	Y[cgi].info(obj, function(d) {
				// 		if (d.code === 0) {
				// 			var map = Y.nameMapping.CalculateStatus2Txt;
				// 			self.html(map[d.data.status]).removeClass('status-wrap');
				// 		}
				// 	});

				// });
			});
		},
		// 滑动开关，增强为联动
		slideSwitch: function() {
			if ($.fn.bootstrapSwitch) {
				$('[data-ydsp-widget="slide-switch"]').each(function(i, elItem) {
					var self, selfConfig, config;

					self = $(elItem);
					selfConfig = Y.uiAutoInitComponent._yconf(elItem);
					config = new Y.uiAutoInitComponentConfig.slideSwitch(selfConfig);

					self.bootstrapSwitch(config).on('switchChange.bootstrapSwitch', function(event, state) {
						// 联动
						var el = $(this),
							related = el.attr('data-ydsp-related'),
							isOn = el.prop('checked');


						if (related) {
							var elRelated = $(related),
								isOn = el.prop('checked');

							if (isOn) {
								elRelated.slideDown();
							} else {
								elRelated.slideUp();

								// 关闭时，需要重置联动的选项
								if (config.resetOnOff) {
									elRelated.find('input[type=radio],input[type=checkbox]').prop('checked', false);
									elRelated.find('input[type=text],select,textarea').val('').trigger("chosen:updated");
								}
							}
						}
						config.onChange && config.onChange.call(el, isOn);

						//修改操作
						if (config.cgi) {
							var val = isOn ? config.on : config.off;
							var param = Y.uiAutoInitComponent._string2obj(config.name, val);
							//param[config.name] = val;
							param = $.extend(true, param, P.JSON.parse(config.sendobj, {
								standardJSON: false
							}));
							if ($.type(config.cgi) != 'function') {
								config.cgi = Y.uiAutoInitComponent._getFunctionFromString(config.cgi);
							}
							config.cgi.call(el, param, function(d) {
								// if (d.code !== 0) {

								// }
							});
						}
					});
				});
			};
		},

		// 自动补充http前缀
		prefixUrl: function() {
			$('[data-ydsp-widget="prefix-url"]').bind('keypress input', function() {
				var el, value;

				el = $(this);
				value = el.val();

				if (value.length > 3 && !(/^http(s)?/.test(value)) && /[\w\W]+\.[\w\W]{2,}/.test(value)) {
					el.focus().val('http://' + $.trim(value));
				}
			});
		},

		autosize: function() {
			if (typeof autosize !== 'undefined') {
				autosize($('[data-ydsp-widget="autosize"]'))
			};
		}
	};

	/**
	 * 表单数据清洗，如转换成整型
	 * @param  {[type]} data [description]
	 * @return {[type]}	  [description]
	 */
	Y.form.tidyData = function(data, fieldsConfig) {
		var fnConvert;

		!fieldsConfig && (fieldsConfig = {});

		fnConvert = function(value, type) {
			if (typeof type === 'string') {
				switch (type) {
					case 'string':
						break;
					case 'int':
						if (value === '' || isNaN(value)) {
							value = null;
						} else {
							value = parseInt(value, 10);
						}
						break;
					case 'float':
						if (value === '' || isNaN(value)) {
							value = null;
						} else {
							value = parseFloat(value, 10);
						}
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
				data[fieldName] = fnConvert(fieldValue, cfgItem.type);
			};
		});

		return data;
	};

	/**
	 * 转换为struct结构
	 * @param  {[type]} data		  [description]
	 * @param  {[type]} convertFields [description]
	 * @return {[type]}			   [description]
	 * @example
	 * 		Y.form.genStruct(data, {
	 * 			// 打包后的字段名 : 打包前的字段名
	 * 			campaign_struct : [
	 * 				'id',
	 * 				'name'
	 * 			],
	 * 			time_set_struct : 'time_set'
	 * 		});
	 */
	Y.form.genStruct = function(data, convertFields) {
		if ($.isPlainObject(convertFields)) {
			$.each(convertFields, function(structField, flatField) {
				if ($.isArray(flatField) || $.isPlainObject(flatField)) { // 打包为对象
					typeof data[structField] === 'undefined' && (data[structField] = {});
					$.each(flatField, function(i, field) {
						data[structField][field] = data[field];
						delete data[field];
					});
				} else { // 打包成数组
					data[structField] = data[flatField];
					delete data[flatField];
				}
			});
		}

		return data;
	};

	/**
	 * 表单校验和提交
	 * @param  {[type]} wrapId		 [description]
	 * @param  {[type]} fieldsConfig   [description]
	 * @param  {[type]} submitCallback [description]
	 * @return {[type]}				[description]
	 */
	Y.form.validator = function(wrapId, fieldsConfig, submitCallback, opts) {
		var formWrap, config;

		formWrap = typeof wrapId === 'string' ? $('#' + wrapId) : wrapId;

		config = {
			live: 'enabled',
			message: '错误的设置',
			feedbackIcons: {
				valid: null,
				invalid: null,
				validating: 'glyphicon glyphicon-refresh'
			},
			fields: { // 外部传入
				/*campaign_name: {
					validators: {
						notEmpty: {
							message: '请填写名称'
						}
					}
				}*/
			}
		};

		$.each(fieldsConfig, function(k, v) {
			if (v.notEmpty || v.required) {
				v.notEmpty = v.notEmpty || {};
				v.notEmpty.message = '不能为空';
			};

			config.fields[k] = {
				validators: P.util.copydata(v)
			};
		});

		opts = opts || {};
		$.extend(config, opts);

		// 表单校验和提交事件
		formWrap.bootstrapValidator(config)
			.on('success.form.bv', function(e) {
				e.preventDefault();

				var data = P.form.getData(fieldsConfig);

				// 清洗一次数据，严格按照类型来
				data = Y.form.tidyData(data, fieldsConfig);

				// Get the form instance
				var $form = $(e.target);
				// Get the BootstrapValidator instance
				var bv = $form.data('bootstrapValidator');

				submitCallback.call(bv, data);

				return false;
			});
	};

	/**
	 * 启用表单
	 * @return {[type]} [description]
	 */
	Y.form.enabledSubmit = function(bindFormElement) {
		typeof bindFormElement === 'string' && (bindFormElement = $('#' + bindFormElement));
		bindFormElement.bootstrapValidator('disableSubmitButtons', false);
	};

	/**
	 * 禁用表单
	 * @return {[type]} [description]
	 */
	Y.form.disabledSubmit = function(bindFormElement) {
		typeof bindFormElement === 'string' && (bindFormElement = $('#' + bindFormElement));
		bindFormElement.bootstrapValidator('disableSubmitButtons', true);
	};

	/**
	 * 层级化的select列表，目前仅支持2级
	 * @param  {[type]} items [description]
	 * @return {[type]}	  [description]
	 */
	Y.form.buildSelectOptions = function(element, items, opts) {
		var content = [], mapping = {},
			noOptgroup = true,
			elementId;

		if (typeof element === 'string') {
			elementId = element;
			element = $('#' + element);
		} else {
			element = $(element);
			elementId = element.attr('id') || '';
		}

		opts = opts || {
			// filterItemValue: function(v){return v};		// 第一级值过滤
			// filterSubItemValue: function(v){return v};	// 第二级值过滤
		};

		$.each(items, function(i, v) {
			var itms, label, value;

			opts.filterItemValue && (v = opts.filterItemValue(v));

			itms = v.items || v.list;
			label = v.label || v.name || '';
			value = v.value || v.code || '';

			mapping[value] = label;

			if (itms && itms.length > 0) {
				content.push('<optgroup label="' + label + '" value="' + value + '">');
				// 为 optgroup 可选择而预留
				content.push('<option value="' + value + '" data-role="optgroup" style="display:none">所有“' + label + '”</option>');
				$.each(itms, function(ii, vv) {
					var subLabel, subValue;

					opts.filterSubItemValue && (v = opts.filterSubItemValue(v));

					subLabel = vv.label || vv.name || '';
					subValue = vv.value || vv.code || '';

					content.push('<option value="' + subValue + '"' + (vv.disabled ? ' disabled' : '') + '>' + subLabel + '</option>');

					mapping[subValue] = subLabel;
				});
				content.push('</optgroup>');
			} else {
				content.push('<option value="' + value + '"' + (v.disabled ? ' disabled' : '') + '>' + label + '</option>');
			}
		});

		if (elementId) {
			Y.nameMapping.append(elementId, mapping);
		}

		return element.empty().append(content.join(''));
	};

	Y.util.getFixedAssetUrl = function(id, params) {
		var accountId = Y.vars.advertiser_id || Y.vars.account_id,
		// var accountId = Y.vars.account_id,
			auth = P.storage.get('auth', 'local')||{},
			local = (P.storage.get('userAccount|'+auth.id+'|'+accountId, 'local') || {}),
            query, url;

        query = params && !$.isEmptyObject(params) ? P.JSON.stringify(params) : '';

		url = P.config.API_BASE_URL + '/resources/' + id +'?'+ $.param({
            'user_id'       : auth.id||'',
            'account_id'    : accountId||'',
            'sign'          : local.sign||'',
            'access_token'  : auth.token||'',
            'q'             : query
        });
		return url;
	};

	// 跳转回上一页，带刷新
	Y.util.goBack = function() {
        // 如果是被iframe，则关闭；否则回到上一页
        if (document.referrer) {
			if (parent.location.href == document.referrer) {
                parent.P.closeDialog();
            } else {
                location.href = document.referrer;
            }
		} else {
			history.back();
		}
	};

	/**
	 * 跳转到指定页面
	 * @param  {[type]} module [description]
	 * @param  {[type]} id	 [description]
	 * @param  {[type]} params [description]
	 * @return {[type]}		[description]
	 */
	Y.util.goPage = function(module, id, params) {
		var url = Y.util.getPageUrl(module, id, params);

		location.href = url;
	};

	Y.util.getPageUrl = function(module, id, params) {
		var urlParts = [],
			pathNames = location.pathname.split('/');
		
		urlParts.push(pathNames[0], pathNames[1]);
		module && urlParts.push(module);
		id && urlParts.push(id);

		return urlParts.join('/') +($.isEmptyObject(params) ? '' : '?'+ $.param(params||{}));
	};

	/**
	 * 初始化页面面包屑
	 * 
		Y.util.initBreadcrumbs([
			{
				label : '推广管理',
				link : Y.util.getPageUrl('campaigns', '', {campaign_type: gCampaignInfo.campaign_type})
			},
			{
				label : '新建'
			}
		], container);
	 * @param  {[type]} data      [description]
	 * @param  {[type]} container [description]
	 * @return {[type]}           [description]
	 */
	Y.util.initBreadcrumbs = function(data, container) {
		var content;

		content = [
			'<ul class="breadcrumb">',
			(function(){
				var items = [], len = data.length;
				
				$.each(data, function(i, v){
					if (!v.link || i==len-1) {
						items.push('<li class="'+ (i==len-1 ? 'active' : '') +'">'+ v.label +'</li>');
					} else {
						items.push('<li><a href="'+ v.link +'">'+ v.label +'</a></li>');
					}
				});

				return items.join('');
			})(),
			'</ul>'
		].join('');

		$(content).insertBefore($(container).children(':first'));
	};

	/**
	 * 解析字典服务返回的结果，成为展示需要的树状结构
	 * 目前仅支持3级
	 * @param  {[type]} dictionaryData [description]
	 * @return {[type]}                [description]
	 */
	Y.util.formatDictionaryTree = function(dictionaryData) {
		var list = [], idIndexMapping = {}, secondIdIndexMapping = {}, parentIdTree = {};

		$.each(dictionaryData||[], function(i, v){
			parentIdTree[v.id] = v.parent_id;
			if (v.layer_id == 1) {
				idIndexMapping[v.id] = list.length;
				list.push({
					name: v.name,
					code: v.id,
					items: []
				});
			} else if(v.layer_id == 2) {
				secondIdIndexMapping[v.id] = list[idIndexMapping[v.parent_id]].items.length;
				list[idIndexMapping[v.parent_id]].items.push({
					name: v.name,
					code: v.id,
					items: []
				});
			} else if(v.layer_id == 3) {
				list[idIndexMapping[parentIdTree[v.parent_id]]].items[secondIdIndexMapping[v.parent_id]].items.push({
					name: v.name,
					code: v.id
				});
			}
		});

		return list;
	};

	/**
	 * 设置分页
	 * @param {[type]} id	   填充分页的定位元素或id，会在此元素后面插入分页
	 * @param {[type]} pageConf [description]
	 * @param {[type]} onTurn   [description]
	 */
	Y.ui.setPagination = function(id, pageConf, onTurn, opts) {
		var el = typeof id === 'string' ? $('#' + id) : $(id),
			container,
			content = [],
			page, totalCount, totalPage, size;

		opts = opts || {};
		pageConf = pageConf || {};

		// "pagination":{"current_page":1,"page_size":12,"total_count":"92"}

		container = el.parent();
		page = pageConf.current_page;
		size = pageConf.page_size;
		totalCount = pageConf.total_count;
		totalPage = Math.ceil(totalCount / size);

		// 小于二页，则不显示
		if (totalPage < 2) {
			$('.pagination', container).remove();
			return;
		}

		content.push('<div class="row text-center"><ul class="pagination">');
		content.push('<li' + (page == 1 ? ' class="disabled"' : '') + '><a href="javascript:;" data-page="' + Math.max(1, page - 1) + '">«</a></li>');

		// if (page > 5) {
		// 	content.push('<li><a href="javascript:;" data-page="'+  +'">…</a></li>');
		// }

		for (var i = page > 5 ? page : 1; i <= totalPage; i++) {
			// 只显示5个翻页块
			if (i > 5) {
				if (i < page + 5) {
					content.push('<li' + (i == page ? ' class="active"' : '') + '><a href="javascript:;" data-page="' + i + '">' + i + '</a></li>');
				} else {
					break;
				}
			} else {
				if (i < 5) {
					content.push('<li' + (i == page ? ' class="active"' : '') + '><a href="javascript:;" data-page="' + i + '">' + i + '</a></li>');
				} else {
					break;
				}
			}
		}
		content.push('<li' + (page == totalPage ? ' class="disabled"' : '') + '><a href="javaScript:;" data-page="' + Math.min(totalPage, page + 1) + '">»</a></li>');
		content.push('</ul></div>');

		$('.pagination', container).remove();
		$(content.join('')).insertAfter(el);


		// 翻页事件
		$('.pagination', container).delegate('a', 'click', function() {
			var page = this.getAttribute('data-page');
			// $('.pagination', container).remove();
			P.tips.info('处理中，请稍候...');
			document.body.scrollTop = parent.document.body.scrollTop = 0;

			onTurn && onTurn.call(null, page);
		});
	};

	// 初始化入口
	$(function() {
		Y.uiAutoInitComponent.init();
	});

	Y.convert = {
		// 将微元转换为元
		toYuan: function(money) {
			return isNaN(money) ? money : (money/1e6).toFixed(2);
		},

		toThousands: function(num) {
			var re=/\d{1,3}(?=(\d{3})+$)/g;
			return isNaN(num) ? num : (num || 0).toString().replace(/^(\d+)((\.\d+)?)$/, function (s,s1,s2) {return s1.replace(re,"$&,")+s2;});
		},
		toPercent: function(num) {
			return isNaN(num) ? num : (num*100).toFixed(2)+'%';
		},
		// 将8位或10位数字转为指定分隔符的日期（或默认格式）
		toDate: function(num, seperator) {
			var date = num.toString();

			switch (date.length) {
				case 8 :
					date = date.replace(/(\d{4})(\d{2})(\d{2})/, function (match, g1, g2, g3) {
						return g1 + (seperator || '年') + g2 + (seperator || '月') + g3 + (seperator ? '' : '日');
					});
					break;
				case 10 :
					date = date.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, function (match, g1, g2, g3, g4) {
						return g1 + (seperator || '年') + g2 + (seperator || '月') + g3 + (seperator ? ' ' : '日') + g4 + (seperator ? 'h' : '时');
					});
			}
			
			return date;
		},
		toChineseCapitalLetter: function (num) {
			if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(num)) {
	            return "数据非法";
			}

	        var unit = "千百拾亿千百拾万千百拾元角分", str = "";
	        
	        num += "00";
	        
	        var pos = num.indexOf('.');

	        if (pos >= 0) {
	        	num = num.substring(0, pos) + num.substr(pos + 1, 2);
	        }
	        
	        unit = unit.substr(unit.length - num.length);

	        for (var i = 0, len = num.length; i < len; i++) {
	        	str += '零壹贰叁肆伍陆柒捌玖'.charAt(num.charAt(i)) + unit.charAt(i);
	        }

	        return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
		}
	};
})(window.Y = window.Y || {});


(function(Y){
	/**
	 * 配置的解析引擎，2大场景：
	 *   1. 对接P.form.autoFillData，自动填充到页面对应的DOM
	 *   2. 字典的翻译功能，获取对应值的含义，Y.nameMapping.getXXXXX(value)
	 *   3. 对接FormUI，形成items选择项
	 *
	 * @param  {[type]} P	命名空间
	 * @return {[type]}
	 */
	var ALL_KEY = 'ALL';	// 获取所有列表
	Y.nameMapping = Y.nameMapping || {};
	Y.nameMapping.rebuild = function() {
		P.form = P.form || {};

		$.each(Y.nameMapping, function(name, mapping) {
			Y.nameMapping.append(name, mapping);
		});
	};
	Y.nameMapping.append = function(name, mapping) {
		mapping = mapping || {};

		// 1. 对接P.form.autoFillData，自动填充到页面对应的DOM
		P.form.addNameMapping(name, mapping);

		// 规范方法名，首字符大写
		name = name.replace(/_/g, ' ');
		name = name.replace(/\b\w+\b/g, function(word){
			return word.substring(0,1).toUpperCase()+word.substring(1);}
		);
		name = name.replace(/\s+/g, '');

		// 2. 字典的翻译功能，获取对应值的含义
		Y.nameMapping['get'+ name] = function(value) {
			var result = value;

			if (value === ALL_KEY) {
				result = mapping;
			} else {
				if (typeof mapping[value] !== 'undefined') {
					result = mapping[value];
				} else {
					$.each(mapping, function(k, v){
						var isFind = false, items = $.isArray(v) ? v : v.items;
						if(items && $.isArray(items)) {
							$.each(items, function(ii, vv){
								if (vv.value === value) {
									result = vv.label;
									isFind = true;
									return false;
								}
							});
						} else {
							v[value] && typeof v[value]==='object' && (result = v[value], isFind= true);
						}

						if (isFind) {
							return false;
						}
					});
				}
			}

			return result;
		};

		// 3. 列表子项构造，可用于select、radio等
		Y.nameMapping['get'+ name +'Items'] = function() {
			var items = [];

			$.each(mapping, function(k, v){
				if ($.isPlainObject(v) && v.label!==undefined && v.value!==undefined) {
					items.push(v);
				} else {
					items.push({
						'label' : v,
						'value' : k
					});
				}
			});
			return items;
		};
	};


	/**
	 * 封装百度图表，提供统一风格
	 * @param  {[type]} Chart [description]
	 * @return {[type]}	   [description]
	 */
	(function(Chart) {
		var _CHART_INSTANCES = {};
		var _CHART_WRAPS = {};
		var _CHART_DATAS = {};
		var _CHART_OPTS = {};

		Chart.config = {
			theme: 'macarons',
		};

		// 饼图快捷调用入口
		Chart.pie = function(wrapId, list, opts) {
			Chart.show('pie', wrapId, list, opts);
		};
		// 线图快捷调用入口
		Chart.line = function(wrapId, list, opts) {
			Chart.show('line', wrapId, list, opts);
		};
		// 柱图快捷调用入口
		Chart.bar = function(wrapId, list, opts) {
			Chart.show('bar', wrapId, list, opts);
		};
		// 双纵轴
		Chart.double = function (wrapId, list, opts) {
			Chart.show('double', wrapId, list, opts);
		};

		/**
		 * 图表实际总控入口，负责整体资源加载
		 * @param  {[type]} type   [description]
		 * @param  {[type]} wrapId [description]
		 * @param  {[type]} list   格式要求[{label:'名称',data:'数值'},{label:'名称2',data:'数值2'}]
		 * @param  {[type]} opts   [description]
		 * @return {[type]}		[description]
		 */
		Chart.show = function(type, wrapId, list, options) {
			var config = {},
				opts;
			opts = {
				labelField: 'label', // 名的字段
				dataField: 'data', // 值的字段
				config: {} // 百度echarts的原始配置
			};
			options = options || {};
			$.extend(opts, options);
			_CHART_OPTS[wrapId] = opts;

			$.extend(true, config, Chart.config);
			$.extend(config, opts.config);

			_CHART_DATAS[wrapId] = list;

			// 图表初始化
			require.config({
				paths: {
					echarts: '/assets/vendor/echarts/build/dist'
				}
			});
			require([
				'echarts',
				// 暂时全部加载一下
				'echarts/chart/line',
				'echarts/chart/pie',
				'echarts/chart/bar'
			], function(Echart) {
				var chartInstance, wrap;

				wrap = $('#' + wrapId);
				chartInstance = Echart.init(wrap.get(0), config.theme);

				_CHART_INSTANCES[wrapId] = chartInstance;
				_CHART_WRAPS[wrapId] = wrap;

				if (list.length < 1) {
					wrap.html('无数据');
					return false;
				}

				switch (type) {
					case 'pie':
						showChartPie(wrapId, list, opts);
						break;

					case 'bar':
						showChartBar(wrapId, list, opts);
						break;

					case 'line':
						showChartLine(wrapId, list, opts);
						break;
					case 'double': // 基本双纵轴图
						showChartDouble(wrapId, list, opts);
						break;
				}

				if (type !== 'double') {
					// 增加图表工具条
					showChartToolBar(wrapId, type);
				}
			});
		};

		// 支持基本的双纵轴图
		function showChartDouble(wrapId, list, opts) {
			var option,
				legendData = [],
				dataYAxis0 = [],
				dataYAxis1 = [],
				dataXAxis = [],
				chart = _CHART_INSTANCES[wrapId];

			$.each(list, function(i, v) {
				dataXAxis.push(v[opts.labelField]);
				dataYAxis0.push({
					value: v[opts.yAxis0.dataField],
					name: v[opts.yAxis0.labelField]=='-' ? 0 : v[opts.yAxis0.labelField]
				});
				dataYAxis1.push({
					value: v[opts.yAxis1.dataField],
					name: v[opts.yAxis1.labelField]=='-' ? 0 : v[opts.yAxis1.labelField]
				});
			});

			option = {
				tooltip: {
					trigger: 'axis'
				},
				legend: {
					x: 'center',
					data: [opts.yAxis0.dimensionLabel, opts.yAxis1.dimensionLabel]
				},
				toolbox: {
					show: false
				},
				calculable: true,
				xAxis : [
				    {
				        type : 'category',
				        data : dataXAxis
				    }
				],
				yAxis : [
				    {
				        type : 'value',
				    	name : opts.yAxis0.dimensionLabel,
				    },
				    {
				        type : 'value',
				        name : opts.yAxis1.dimensionLabel,
				        splitLine : {
				            show: false
				        }
				    }
				],
				series: [
					{
						name: opts.yAxis0.dimensionLabel,
						type: opts.yAxis0.type, // 暂支持bar或line
						data: dataYAxis0
					},
					{
						name: opts.yAxis1.dimensionLabel,
						type: opts.yAxis1.type, // 暂支持bar或line
						data: dataYAxis1,
                        yAxisIndex: 1 // 否则无法正常显示右侧纵轴
					}
				]
			};
			chart.clear();
			chart.setOption(option);
		}

		// 饼图
		function showChartPie(wrapId, list, opts) {
			var option,
				legendData = [],
				data = [],
				chart = _CHART_INSTANCES[wrapId];

			$.each(list, function(i, v) {
				// 图例
				legendData.push(v[opts.labelField]);

				// 数据
				data.push({
					value: v[opts.dataField],
					name: v[opts.labelField]=='-' ? 0 : v[opts.labelField]
				});
			});

			option = {
				title: {
					text: '',
					subtext: '',
					x: 'center'
				},
				tooltip: {
					trigger: 'item',
					formatter: "{a} <br/>{b} : {c} ({d}%)"
				},
				legend: {
					orient: 'vertical',
					x: 'left',
					data: legendData
				},
				toolbox: {
					show: false
				},
				calculable: true,
				series: [{
					name: opts.dimensionLabel,
					type: 'pie',
					radius: '60%',
					center: ['50%', '60%'],
					data: data
				}]
			};

			chart.clear();
			chart.setOption(option);
		}

		// 线图
		function showChartLine(wrapId, list, opts) {
			var option,
				chart = _CHART_INSTANCES[wrapId],
				legendData = [],
				seriesData = [],
				xAxisData = [],
				series = [];

			opts = opts || {};

			$.each(list, function(i, v) {
				legendData.push(v[opts.labelField]);
				xAxisData.push(v[opts.labelField]);

				// 如果是百分比数据，转化为小数
				var dataItem = v[opts.dataField];
				if (typeof dataItem==='string' && dataItem.substring(dataItem.length-1)=='%') {
					dataItem = (parseFloat(dataItem, 10) / 100).toFixed(2);
				}
				seriesData.push(dataItem=='-' ? 0 : dataItem);
			});

			option = {
				title: {
					text: '',
					subtext: ''
				},
				tooltip: {
					trigger: 'axis'
				},
				toolbox: {
					show: false
				},
				legend: {
					x: 'left',
					data: [opts.dimensionLabel || wrapId]
				},
				calculable: true,
				xAxis: [{
					type: 'category',
					data: xAxisData
				}],
				yAxis: [{
					type: 'value'
				}],
				series: [{
					name: opts.dimensionLabel,
					type: opts.type ? opts.type : 'line', // bar共用此处
					showAllSymbol: true,
					data: seriesData,
					markLine: {
						data: [{
							type: 'average',
							name: '平均值'
						}]
					}
				}]
			};

			chart.clear();
			chart.setOption(option);
		}

		// 柱图
		function showChartBar(wrapId, list, opts) {
			opts.type = 'bar';
			// 复用线图配置
			showChartLine(wrapId, list, opts);
		}

		function showChartToolBar(wrapId, currentType) {
			var template,
				wrap = _CHART_WRAPS[wrapId];

			template = [
				'<ul class="chart-tool-bar list-inline" style="display:none">',
				'<li class="' + (currentType == 'pie' ? 'current' : '') +
				'"><i dimension="' + wrapId +
				'" type="pie" class="fa fa-pie-chart" title="饼图"></i> </li>',
				'<li class="' + (currentType == 'bar' ? 'current' : '') +
				'"><i dimension="' + wrapId +
				'" type="bar" class="fa fa-bar-chart" title="柱图"></i> </li>',
				'<li class="' + (currentType == 'line' ? 'current' : '') +
				'"><i dimension="' + wrapId +
				'" type="line" class="fa fa-line-chart" title="线图"></i> </li>',
				// '<li><i class="fa fa-download" title="保存为图片"></i> </li>',
				// '<li><i class="fa fa-arrows-alt" title="放大图表"></i> </li>',
				'</ul>'
			].join('');

			$(template).appendTo(wrap).find('i').click(function(m) {
				var el = $(this),
					type = el.attr('type'),
					wrapId = el.attr('dimension'),
					list = _CHART_DATAS[wrapId],
					opts = _CHART_OPTS[wrapId];

				el.closest('ul').find('.current').removeClass('current');
				el.closest('li').addClass('current');

				switch (type) {
					case 'pie':
						showChartPie(wrapId, list, opts);
						break;

					case 'bar':
						opts.type = 'bar';
						showChartBar(wrapId, list, opts);
						break;

					case 'line':
						opts.type = 'line';
						showChartLine(wrapId, list, opts);
						break;
				}

				return false;
			});
		}
	})(Y.chart = {});

	Y.commonLogic = {
		/**
		 * [getPlacementListByGroup 按分组获取推广位]
		 * @param  {[type]} list           [description]
		 * @param  {[type]} filterFunction 需要过滤掉的子项
		 * @return {[type]}                [description]
		 */
		getPlacementListByGroup : function(list, filterFunction) {
			var groupedList = [], groupMapping = {};

			$.each(list, function(i, v){
				var key, label;
				
				if (filterFunction && !filterFunction(v)) {
					return;
				}
				
				key = [v.display_type, v.placement_width, v.placement_height].join('_');
				// 分组聚合
				typeof groupMapping[key]==='undefined' && (
					groupMapping[key] = {
						label : Y.nameMapping.getCreativeDisplayType(v.display_type) +' '+ ((v.placement_width && v.placement_height) ? (v.placement_width +'x'+ v.placement_height) : '未知尺寸'),
						value : key,
						items : []
					}
				);

				label = v.placement_name;
				v.status===Y.const.PlacementStatus_PAUSE && (label += ' (暂停)');
				v.status===Y.const.PlacementStatus_DEPRECATED && (label += ' (废弃)');

				groupMapping[key].items.push({
					value : v.placement_id,
					label : label
				});
			});

			$.each(groupMapping, function(k, v){
				groupedList.push(v);
			});

			return groupedList;
		}
	};
})(window.Y, window.P);
