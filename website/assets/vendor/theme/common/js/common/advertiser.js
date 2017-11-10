(function(Y){
	Y.cgiQualifications = {
		list: function (data, callback, opts) {
			return P.rest.GET('/qualifications', data, callback, opts);
		},
		listByIndustry: function (data, callback, opts) {
			return P.rest.GET('/industry-qualifications', data, callback, opts);
		}
	};

	Y.cgiUploadImages = {
		upload: function(data, callback, opts) {
			return P.rest.POST('/upload-images', data, callback, opts);
		}
	};

	/**
	 * 广告主
	 * @type {Object}
	 */
	Y.cgiAdvertiser = {
		list: function(data, callback, opts) {
			data = data || {};
			data.page_size = 20;
			return P.rest.GET('/advertisers', data, callback, opts);
		},
		create: function(data, callback, opts) {
			return P.rest.POST('/advertisers', data, callback, opts);
		},
		update: function(data, callback, opts) {
			return P.rest.PUT('/advertisers/' + data.advertiser_id, data, callback, opts);
		},
		info: function(data, callback, opts) {
			data = data || {};
			return P.rest.GET('/advertisers/' + data.advertiser_id, data, callback, opts);
		},
		remove: function(data, callback, opts) {
			data = data || {};
			data.advertiser_status = 20;
			return P.rest.PATCH('/advertisers/' + data.advertiser_id, data, callback, opts);
		}
	};

	Y.cgiDictionary = {
		region: function(data, callback, opts) {
			data = data || {};
			data.dictionary_id = {
				id : Y.const.Dictionary_REGION
			};
			data.id = 0;
			data.including_itself = false;

			return P.rest.POST('/dictionaries', data, function(d){
				callback(_formatTree(d));
			}, opts);
		},
		advertiserCategory : function(data, callback, opts) {
			data = data || {};
			data.dictionary_id = {
				id : Y.const.Dictionary_ADVERTISER_CATEGORY
			};
			data.id = 0;
			data.including_itself = false;

			return P.rest.POST('/dictionaries', data, function(d){
				callback(_formatTree(d));
			}, opts);
		},
		sensitiveCategory : function(data, callback, opts) {
			data = data || {};
			data.dictionary_id = {
				id : Y.const.Dictionary_SENSITIVE_CATEGORY
			};
			data.id = 0;
			data.including_itself = false;

			return P.rest.POST('/dictionaries', data, function(d){
				callback(_formatTree(d));
			}, opts);
		}
	};

	/**
	 * 配置表
	 * @type {Object}
	 */
	Y.cgiAppendix = {
		advertiserCategory: Y.cgiDictionary.advertiserCategory,
		region: Y.cgiDictionary.region,
		sensitiveCategory: Y.cgiDictionary.sensitiveCategory
	};

})(Y);

/**
 * 本模块公共部分
 * @param  {[type]} Y      [description]
 * @param  {[type]} Common [description]
 * @return {[type]}        [description]
 */
(function(Y, Common) {
	var ADVERTISER_TYPE_COMPANY = 2,
		ADVERTISER_TYPE_PERSONAL = 1;

	Common.getQualificationTypeList = function(callback) {
		var dfd = $.Deferred();

		Y.cgiQualifications.list({}, function(d) {
			if (d.code === 0) {
				var list = [];
				$.each(d.data.list, function(i, v) {
					list.push({
						label: v.name,
						value: v.type
					});
				});
				Y.nameMapping.append('qualification_type', list);

				callback && callback(d);
				dfd.resolve();
			} else {
				P.alert('获取资质分类列表失败：' + d.message);
			}
		});

		return dfd;
	};

	Common.getQualificationHtml = function(qualifications) {
		var frag = [];

		if (qualifications.length) {
			$.each(qualifications, function(i, val) {
				frag = frag.concat([
					'<a href="javascript:;" style="display:inline-block;width:3em; height:2em; margin-right:2px;" class="_showFullImage"',
					' title="' + Y.nameMapping.getQualificationType(val.type) + '，有效期至 ' + moment(val.expired_date, 'YYYYMMDD').format('YYYY年MM月DD日') + '"',
					' data-url="' + val.url + '">',
					'<img src="' + val.url + '" style="max-width:100%;max-height:100%;">',
					'</a>'
				]);
			});
		} else {
			frag.push('<div class="text-muted" style="margin-top:9px;">未上传</div>');
		}

		return frag.join('');
	};

	Common.getFieldsConfig = function(isUpdate, data, opts){
		var items, isCompany,
			readonlyFiledsWhenUpdate = [],
			hideFieldsWhenCompany = [],
			showFieldsWhenCompany = [],
			getLicensePreviewHtml,
			icpUrl = data ? (((data.licenses_struct||{}).website || [])[0] || {}).icp_url : '',
			licenseUrl = data ? (((data.licenses_struct || {}).business || [])[0] || {}).license_url : '';

		!opts && (opts = {});

		getLicensePreviewHtml = function(url, title) {
			var frag = [];

			if (url) {
				frag = frag.concat([
					'<a href="javascript:;" style="display:inline-block;width:120px;" class="_showFullImage"',
					' data-url="' + url + '" data-title="'+ (title||'') +'">',
					'<img src="' + url + '" style="max-width:100%;">',
					'</a>'
				]);
			} else {
				frag.push('<div class="text-muted" style="margin-top:9px;">未上传</div>');
			}

			return frag.join('');
		};

		!data && (data = {});

		items = [
			{
				name: 'advertiser_id',
				label: 'ID',
				required: isUpdate ? true : false,
				type: 'hidden'
			},
			{
				name: 'basic_info',
				label: '基本信息',
				type: 'group',
				items: [
					{
						name: 'advertiser_name',
						label: '客户名称',
						required: true,
						genre: FormUI.GENRE_STRING,
						type: 'text'
					},
					{
						name: 'email',
						label: '登录邮箱',
						required: !isUpdate ? true : false,
						display: !isUpdate ? true : false,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'password',
						label: '密码',
						required: !isUpdate ? true : false,
						display: !isUpdate ? true : false,
						genre: FormUI.GENRE_STRING,
						type: 'password',
						attrs: {
							placeholder: '-'
						},
						hint: '至少6位，需要包含字母、数字和符号'
					},
					{
						name	: 'pkey',
						label	: '',
						type	: 'textarea',
						display	: false,
						value	: typeof JsBase64!=='undefined' && JsBase64.decode($('#security').val())
					},
					{
						name: 'certificate_type',
						label: '证件类型',
						required: true,
						genre: FormUI.GENRE_INT,
						type: 'chosen',
						items: (function() {
							var items = Y.nameMapping.getCertificateTypeItems();

							items.unshift({
								label: '请选择',
								value: ''
							});

							return items;
						})()
					},
					{
						name: 'certificate_no',
						label: '证件号码',
						required: true,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'legal_name',
						label: '法人名称',
						required: false,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'nacao_code',
						label: '统一社会信用代码',
						required: true,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						hint: '2015年10月1日起，企业使用统一社会信用代码',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'upload_license',
						label: '营业执照',
						type: 'file',
						required: licenseUrl ? false : true,
						events: {
							change: function() {
								var gfile = this.files[0];

								P.tips.loading('上传中，请稍候...');
								Y.cgiUploadImages.upload({
									upload_file: gfile
								}, function(d) {
									P.tips.hide();
									if (d.code === 0) {
										$('#license_preview').html(getLicensePreviewHtml(d.data.file_path, '营业执照'));
										$('#license_url').val(d.data.file_path);
									} else {
										P.alert(d.message);
									}
								});
							}
						},
						help: '图片大小：100KB以内；可用格式：JPG、PNG'
					},
					{
						name: 'license_preview',
						type: 'html',
						value: getLicensePreviewHtml(licenseUrl, '营业执照')
					},
					{
						name: 'license_url',
						label: '营业执照',
						required: true,
						type: 'hidden'
					},
					{
						name: 'advertiser_category',
						label: '行业类别',
						required: true,
						genre: FormUI.GENRE_INT,
						type: 'chosen',
						chosen: {
							max_selected_options: 1,
							no_results_text: '暂无结果',
							placeholder_text_multiple: '请选择分类',
							placeholder_text_single: '请选择分类',
							columns: 2,
							optgroup_selected_enable: true, // 允许选择optgroup，以兼容旧数据
							search_contains: true
						},
						hint: '<a href="javascript:;" class="_qualifications text-info">上传行业资质</a>',
						genre: 'int',
						// 升级到二级分类，原分类允许修改
						attrs: {
							// 老的行业分类允许修改，需要大于300
							// readonly: data.advertiser_category < 300 ? false : true
						}
					},
					{
						name: 'qualifications',
						label: '行业资质',
						type: 'html',
						value: Common.getQualificationHtml((data.licenses_struct||{}).qualification || [])
					},
					{
						name: 'advertiser_type',
						label: '账户类型',
						required: true,
						genre: FormUI.GENRE_INT,
						// type: 'chosen',
						type: 'hidden',
						value: ADVERTISER_TYPE_COMPANY,
						// items: [{
						// 	label: '个人',
						// 	value: ADVERTISER_TYPE_PERSONAL
						// }, {
						// 	label: '企业',
						// 	value: ADVERTISER_TYPE_COMPANY
						// }]
					},
					{
						name: 'city',
						label: '地区',
						genre: FormUI.GENRE_STRING,
						type: 'chosen',
						chosen: {
							max_selected_options: 1,
							no_results_text: '暂无结果',
							placeholder_text_multiple: '请选择地区',
							placeholder_text_single: '请选择地区',
							include_group_label_in_selected: true, // 包含optgroup文字
							search_contains: true,
							optgroup_selected_enable: true, // 允许选择optgroup
							is_default_collapse: true, // 默认收起
							columns: 3 // 显示为4列
						},
						attrs: {
							multiple: true
						}
					}
				]
			},
			{
				name: 'websites_info',
				label: '网站信息',
				type: 'group',
				items: [
					{
						name: 'web_name',
						label: '网站名',
						required: true,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'web_url',
						label: '网址',
						required: true,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						events: {
							change: function() {
								var url = $(this).val();

								if (url === '') {
									return false;
								} else if (url.match('^http(s)?://$')) {
									$(this).val('');
								} else {
									$(this).val('http://' + url);
								}
							}
						},
						attrs: {
							placeholder: 'http://'
						}
					},
					{
						name: 'record_number',
						label: 'ICP备案号',
						required: true,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'upload_icp',
						label: 'ICP证照',
						type: 'file',
						required: icpUrl ? false : true,
						help: '图片大小：100KB以内；可用格式：JPG、PNG',
						events: {
							change: function() {
								var gfile = this.files[0];

								P.tips.loading('上传中，请稍候...');
								Y.cgiUploadImages.upload({
									upload_file: gfile
								}, function(d) {
									P.tips.hide();
									if (d.code === 0) {
										$('#icp_preview').html(getLicensePreviewHtml(d.data.file_path), 'ICP证照');
										$('#icp_url').val(d.data.file_path);
									} else {
										P.alert(d.message);
									}
								});
							}
						}
					},
					{
						name: 'icp_preview',
						type: 'html',
						value: getLicensePreviewHtml(icpUrl, 'ICP证照')
					}, {
						name: 'icp_url',
						label: 'ICP证照',
						required: true,
						genre: FormUI.GENRE_STRING,
						type: 'hidden'
					}
				]
			},
			{
				name: 'contact_info',
				label: '联系方式',
				type: 'group',
				items: [
					{
						name: 'contact_name',
						label: '联系人',
						required: true,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'cellphone',
						label: '手机',
						required: true,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'job_title',
						label: '联系人职位',
						required: false,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'address',
						label: '公司地址',
						required: false,
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'telephone',
						label: '固话',
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					},
					{
						name: 'fax',
						label: '传真',
						genre: FormUI.GENRE_STRING,
						type: 'text',
						attrs: {
							placeholder: '-'
						}
					}
				]
			}
		];

		isCompany = data.advertiser_type!=ADVERTISER_TYPE_PERSONAL ? true : false;

		readonlyFiledsWhenUpdate= [
			'advertiser_name',
			'advertiser_type',
			'certificate_type',
			// 'legal_name',
			'certificate_no'
		];
		hideFieldsWhenCompany = [
			'certificate_type',
			'certificate_no'
		];
		/*showFieldsWhenCompany = [
			'legal_name',
			'nacao_code',
			'upload_license',
			'license_preview',
			'address',
			'job_title'
		];*/

		$.each(items, function(i, v){
			if (v.items) {
				$.each(v.items, function(ii, vv){
					if (isUpdate && $.inArray(vv.name, readonlyFiledsWhenUpdate) >= 0) {
						!vv.attrs && (vv.attrs = {});
						vv.attrs.readonly = true;
					}

					if (isCompany) {
						if ($.inArray(vv.name, hideFieldsWhenCompany) >= 0) {
							vv.display = false;
						}
					}
				});
			}
		});

		opts.fieldsConfigHandler &&(items = opts.fieldsConfigHandler(items));

		return items;
	};

	Common.getAdvertiserCategories = function(callback) {
		var dfd = $.Deferred();

		Y.cgiAppendix.advertiserCategory({}, function(d) {
			if (d.code === 0) {
				callback && callback(d.data.list);
				dfd.resolve();
			} else {
				P.alert(d.message);
			}
		});

		return dfd;
	};

	Common.getRegionList = function() {
		var dfd = $.Deferred();

		Y.cgiAppendix.region({}, function(dt) {
			if (dt.code === 0) {
				var elSelect = Y.form.buildSelectOptions($('#city'), dt.data.list, {
					filterItemValue: function(v) {
						if (v.list) {
							var originalList = v.list;
							v.list = [];
							$.each(originalList, function(i, item) {
								var label = item.name || item.label;
								// 直辖市、规划区域，统一提升一级。因为指代不明
								if (
									(
										label == '市辖区' || label == '县' || label == '省直辖县级行政区划' || label == '自治区直辖县级行政区划'
									) && item.list && item.list.length >= 1
								) {
									v.list = v.list.concat(item.list);
								} else {
									v.list.push(item);
								}
							});
						}
						return v;
					}
				});
				elSelect.trigger('chosen:updated');

				dfd.resolve();
			} else {
				P.alert(d.message);
			}
		});

		return dfd;
	};
})(Y, Y.modAdvertiserCommon = {});

/**
 * 创建广告主
 * @param  {[type]} Y      [description]
 * @param  {[type]} Create [description]
 * @return {[type]}        [description]
 */
(function(Y, Create) {
	var FORM_ID = 'wrapSubmitForm',
		gFormInstance,
		gGroupIndex = {},
		gQualifications,
		gAdvertiserCategories,
		gBussinessLicense;

	function initCreateForm(opts) {
		!opts && (opts = {});

		P.tips.loading('加载中，请稍候...');

		Y.modAdvertiserCommon.getQualificationTypeList(function() {
			var fieldsConfig, items;

			items = Y.modAdvertiserCommon.getFieldsConfig(false, {}, {
				fieldsConfigHandler: opts.fieldsConfigHandler
			});

			fieldsConfig = {
				label : '创建广告主',
				ratio: '3:9',
				buttons: {
					items: [{
						label: '提交',
						type: 'submit',
						display: false
					}, {
						label: '取消',
						type: 'button',
						events: {
							click: function() {
								history.back();
								return false;
							}
						}
					}]
				},
				items: items
			};

			gFormInstance = new FormUI.Construct(fieldsConfig, FORM_ID);
			gFormInstance.onSubmit = function() {
				return false;
			};

			$.when(
				Y.modAdvertiserCommon.getAdvertiserCategories(function(list){
					gAdvertiserCategories = list;
				}),
				Y.modAdvertiserCommon.getRegionList()
			).done(function() {
				P.tips.hide();
				Y.form.buildSelectOptions($('#advertiser_category'), gAdvertiserCategories).trigger('chosen:updated');

				bindEvents();
			});
		});
	};

	function bindEvents() {
		gFormInstance.onSubmit = function(data) {
			var fieldsToDelete = [
				'upload_license',
				'upload_icp',
				'web_name',
				'web_url',
				'record_number',
				'icp_url',
				'license_url',
				'license_preview',
				'icp_preview',
				'qualifications'
			];

			// 密码处理
			if (! /^(?![^a-zA-Z]+$)(?!\D+$)(?![a-zA-Z0-9]+$).{6,}$/.test(data.password)) {
				P.alert('密码太简单了，需要包含字母、数字和符号至少各一个，至少六位长度');
				return false;
			}

			var p = data.password;
			var pp = CryptoJS.MD5(p)+','+ (Y.vars.currentTime||Y.vars.current_time) +','+Math.random();
			var encrypt = new JSEncrypt();
			encrypt.setPublicKey(data.pkey);
			data.password = encodeURIComponent(encrypt.encrypt(pp));
			delete data.pkey;


			data.city = data.city ? data.city : '';
			data.province = data.city ? (Math.floor(data.city / 1000) * 1000).toString() : '';
			gFormInstance.disable();

			data.licenses_struct = {
				qualification: gQualifications || [],
				website: [],
				business: gBussinessLicense || []
			};

			if (data.web_url) {
				data.licenses_struct.website.push({
					web_name: data.web_name,
					url: data.web_url,
					record_number: data.record_number,
					icp_url: data.icp_url
				});
			}
			if (data.license_url) {
				data.licenses_struct.business[0] = data.licenses_struct.business[0] || {};
				data.licenses_struct.business[0].license_url = data.license_url;
			}

			$.each(fieldsToDelete, function (index, field) {
				delete data[field];
			});

			Y.cgiAdvertiser.create(data, function(d) {
				if (d.code === 0) {
					P.alert('提交成功', function() {
						P.util.goPage('advertiser');
					});
				} else {
					P.alert(d.message);
					gFormInstance.enable();
				}
			});
			return false;
		};

		$('#' + FORM_ID).on('click', '._qualifications', function(e) {
			if (!$('#advertiser_category').val()) {
				P.tips.error('请先选择行业类别');
				return false;
			};

			// 初始化资质上传页
			var selectedIndustry = $('#advertiser_category option:selected');
			Y.modQualification.init(
				gQualifications,
				{
					label: selectedIndustry.text(),
					value: selectedIndustry.val()
				},
				function(qualifications){
					gQualifications = qualifications;
					$('#qualifications').html(Y.modAdvertiserCommon.getQualificationHtml(qualifications));
				}
			);
		}).on('click', '._showFullImage', function() {
			var url = $(this).data('url'),
				info = $(this).attr('title'),
				content;

			if (url) {
				content = [
					'<div class="text-center"><img src="' + url + '" />',
					info ? '<div class="mt-15">' + info + '</div>' : '',
					'</div>'
				];
				P.confirm(content.join(''));
			}

			return false;
		});
	}

	Create.init = function(opts) {
		!opts && (opts = {});
		initCreateForm({
			fieldsConfigHandler: opts.fieldsConfigHandler
		});
	};
})(Y, Y.commonAdvertiserCreate = {});


/**
 * 编辑广告主资料
 * @param  {[type]} Y      [description]
 * @param  {[type]} Update [description]
 * @return {[type]}        [description]
 */
(function(Y, Update) {
	var FORM_ID = 'wrapSubmitForm',
		formInstance,
		gGroupIndex = {},
		gQualifications,
		gAdvertiserCategories,
		gBussinessLicense,
		gAdvertiserId;

	function initUpdateForm(opts) {
		var advertiserId = parseInt(location.pathname.split('/').pop(), 10);
		gAdvertiserId = advertiserId;

		!opts && (opts = {});

		P.tips.loading('加载中，请稍候...');
		Y.modAdvertiserCommon.getQualificationTypeList(function(d) {
			if (d.code === 0) {
				var types = [];

				$.each(d.data.list, function(i, v) {
					types.push({
						label: v.name,
						value: v.type
					});
				});
				Y.nameMapping.append('qualification_type', types);
			} else {
				P.tips.error('获取资质列表失败：' + d.message);
			}

			Y.cgiAdvertiser.info({
				advertiser_id: advertiserId
			}, function(d) {
				if (d.code == 0) {
					var fieldsConfig, items;

					P.tips.hide();

					gQualifications = (d.data.licenses_struct || {}).qualification || [];
					gBussinessLicense = (d.data.licenses_struct || {}).business || []; // 保留tanx_license_id等数据
					items = Y.modAdvertiserCommon.getFieldsConfig(true, d.data, {
						fieldsConfigHandler: opts.fieldsConfigHandler
					});

					fieldsConfig = {
						label : '编辑广告主',
						buttons: {
							items: [{
								label: '提交',
								type: 'submit',
								display: false
							}, {
								label: '取消',
								type: 'button',
								events: {
									click: function() {
										history.back();
										return false;
									}
								}
							}]
						},
						items: items
					};

					formInstance = new FormUI.Construct(fieldsConfig, FORM_ID);
					formInstance.onSubmit = function() {
						return false;
					};

					formInstance.disable();

					$.when(
						Y.modAdvertiserCommon.getAdvertiserCategories(function(list){
							gAdvertiserCategories = list;
						}),
						Y.modAdvertiserCommon.getRegionList()
					).done(function() {
						Y.form.buildSelectOptions($('#advertiser_category'), gAdvertiserCategories).trigger('chosen:updated');
						d.data.web_url = (((d.data.licenses_struct || {}).website || [])[0] || {}).url;

						FormUI.setData(d.data);

						if (d.data.advertiser_status!=Y.const.CommonStatus_DELETE) {
							$('#btnEnableUpdate, #btnDelete').removeClass('invisible');
						}

						bindEvents();
					});
				} else {
					P.alert(d.message);
				}
			});
		});
	};

	function bindEvents() {
		// 开启编辑模式
		$('#btnEnableUpdate').click(function() {
			var currentStatus = $(this).data('status');
			if (currentStatus !== 'enabled') {
				$(this).html('退出').data('status', 'enabled');
				formInstance.enable();

				formInstance.onSubmit = function(data) {
					var fieldsToDelete = [
						'upload_license',
						'upload_icp',
						'web_name',
						'web_url',
						'record_number',
						'icp_url',
						'license_url',
						'license_preview',
						'icp_preview',
						'qualifications'
					];

					data.city = data.city ? data.city : '';
					data.province = data.city ? (Math.floor(data.city / 1000) * 1000).toString() : '';
					formInstance.disable();

					data.licenses_struct = {
						qualification: gQualifications,
						website: [],
						business: gBussinessLicense
					};

					if (data.web_url) {
						data.licenses_struct.website.push({
							web_name: data.web_name,
							url: data.web_url,
							record_number: data.record_number,
							icp_url: data.icp_url
						});
					}
					if (data.license_url) {
						data.licenses_struct.business[0] = data.licenses_struct.business[0] || {};
						data.licenses_struct.business[0].license_url = data.license_url;
					}

					$.each(fieldsToDelete, function (index, field) {
						delete data[field];
					});

					Y.cgiAdvertiser.update(data, function(d) {
						if (d.code === 0) {
							P.alert('提交成功', function() {
								P.util.goPage('advertiser');
							});
						} else {
							P.alert(d.message);
							formInstance.enable();
						}
					});
					return false;
				};
			} else {
				$(this).html('编辑').data('status', 'disabled');
				formInstance.disable();
				formInstance.onSubmit = null;
			}
		});

		$('#' + FORM_ID).on('click', '._qualifications', function(e) {
			if (!$('#advertiser_category').val()) {
				P.tips.error('请先选择行业类别');
				return false;
			};

			// 初始化资质上传页
			var selectedIndustry = $('#advertiser_category option:selected');
			Y.modQualification.init(
				gQualifications,
				{
					label: selectedIndustry.text(),
					value: selectedIndustry.val()
				},
				function(qualifications){
					gQualifications = qualifications;
					$('#qualifications').html(Y.modAdvertiserCommon.getQualificationHtml(qualifications));
				}
			);
		}).on('click', '._showFullImage', function() {
			var url = $(this).data('url'),
				info = $(this).attr('title'),
				content;

			if (url) {
				content = [
					'<div class="text-center"><img src="' + url + '" />',
					info ? '<div class="mt-15">' + info + '</div>' : '',
					'</div>'
				];
				P.confirm(content.join(''));
			}

			return false;
		});

		$('#btnDelete').click(function(){
			P.confirm('确认删除此广告主吗？删除后不可恢复', function(rt) {
				if (rt === true) {
					Y.cgiAdvertiser.remove({
						advertiser_id: gAdvertiserId
					}, function(d){
						if (d.code === 0) {
							P.alert('删除成功', function(){
								history.back();
							});	
						} else {
							P.alert(d.message);
						}
					});
				}
			});
		});
	}

	Update.init = function(opts) {
		!opts && (opts = {});
		initUpdateForm({
			fieldsConfigHandler: opts.fieldsConfigHandler
		});
	};
})(Y, Y.commonAdvertiserUpdate = {});

(function(Y, Qualification){
	var QUALIFICATION_FORM_ID = 'qualificationForm',
		gQualificationForm,
		gIndustryQualificationList;

	function getIndustryQualification(industryId) {
		var dfd = $.Deferred();

		Y.cgiQualifications.listByIndustry({
			industry_id: industryId
		}, function(d) {
			if (d.code === 0) {
				gIndustryQualificationList = d.data.list;
			} else {
				P.tips.error('获取行业资质列表失败：' + d.message);
			}

			dfd.resolve();
		});

		return dfd;
	};
	
	function getQualificationUploader(qualificationType) {
		var items = [];

		if (qualificationType === 'other') {
			items.push({
				name: 'type-' + qualificationType + '-{INDEX}',
				label: '资质类型',
				type: 'chosen',
				value: '',
				required: true,
				items: [{ label: '请选择', value: '' }].concat(Y.nameMapping.getQualificationTypeItems()),
				chosen: {
					placeholder_text_multiple: '请选择',
					placeholder_text_single: '请选择'
				}
			});
		}

		items.push({
			name: 'file-' + qualificationType + '-{INDEX}',
			label: '上传文件',
			type: 'file',
			hint: '图片大小：100 KB以内；可用格式：JPG、PNG',
			required: true,
			events: {
				change: function(e) {
					var gfile = this.files[0],
						self = this,
						theField = $(this).attr('id');

					P.tips.loading('上传中，请稍候...')
					Y.cgiUploadImages.upload({
						upload_file: gfile
					}, function(d) {
						P.tips.hide();
						if (d.code === 0) {
							$(self).closest('div.form-group').siblings('div').find('img').attr('src', d.data.file_path);
							$(self).closest('fieldset').find('input[type="hidden"]').val(d.data.file_path);
						}

						FormUI.setFieldValidateStatus(d.code === 0 ? '' : 'error', theField);
						FormUI.setFieldAttributes([theField], {
							'help': d.code === 0 ? '图片大小：100 KB以内；可用格式：JPG、PNG' : '上传失败：' + d.message
						});
					});
				}
			}
		}, {
			name: 'url-' + qualificationType + '-{INDEX}',
			type: 'hidden'
		}, {
			name: 'expired_date-' + qualificationType + '-{INDEX}',
			label: '到期时间',
			type: 'calendar',
			required: true,
			value: Y.const.DATE_1_YEAR_AFTER,
			calendar: {
				minDate: Y.const.DATE_TODAY,
			}
		}, {
			name: 'preview-' + qualificationType + '-{INDEX}',
			label: '',
			type: 'html',
			value: '<img style="max-width:300px; max-height:100px;"/>'
		});

		return items;
	}

	function bindEvents() {
		var container = $('#' + QUALIFICATION_FORM_ID);

		$.each(container.find('._add-qualification'), function(i, btn) {
			if ($(btn).data('index') == 0) {
				$(btn).removeClass('none');
			}
		});

		container.on('click', '._add-qualification', function() {
			gQualificationForm.addGroup('group_' + $(this).data('type'));

			return false;
		}).on('click', '._remove-qualification', function() {
			var index = $(this).data('index'),
				type = $(this).data('type');

			if (index == 0) {
				$('#type-' + type + '-' + index).val('').trigger('chosen:updated');
				$('#file-' + type + '-' + index).val('');
				$('#expired_date-' + type + '-' + index).val(Y.const.DATE_1_YEAR_AFTER);
				$('#preview-' + type + '-' + index + ' img').attr('src', '');
				$('#url-' + type + '-' + index).val('');
			} else {
				gQualificationForm.removeGroup(this);
			}

			return false;
		}).on('click', '._industry', function() {
			var text = $(this).html();
			$(this).siblings('small').toggleClass('none');
			$(this).find('.fa-plus').toggleClass('none');
			$(this).find('.fa-minus').toggleClass('none');
		}).on('click', '._showFullImage', function() {
			var url = $(this).data('url'),
				info = $(this).attr('title'),
				content;

			if (url) {
				content = [
					'<div class="text-center"><img src="' + url + '" />',
					info ? '<div class="mt-15">' + info + '</div>' : '',
					'</div>'
				];
				P.confirm(content.join(''));
			}

			return false;
		});
	}

	Qualification.init = function(qualifications, industryCategoryInfo, callback) {
		!qualifications && (qualifications = []);
		!industryCategoryInfo && (industryCategoryInfo = {});

		$.when(
			getIndustryQualification(industryCategoryInfo.value)
		).done(function() {
			var fieldsConfig, dialogContent, theCategory = 'the_advertiser_category',
				typeCount = {},
				backupData, backupHtml, requiredTypes = [],
				supportedAdx = [
					{ text: '查看小米行业资质要求', url: '/assets/resource/xiaomi_industry_qualifications.xlsx' }
				];

			if (qualifications.length > 0) {
				backupData = {};
				backupHtml = {};

				$.each(qualifications, function(i, v) {
					var type = ($.inArray(parseInt(v.type, 10), requiredTypes) !== -1) ? v.type : 'other';

					typeCount[type] === undefined ? (typeCount[type] = 0) : (typeCount[type] += 1);
					backupData['expired_date-' + type + '-' + typeCount[type]] = moment(v.expired_date, 'YYYYMMDD').format('YYYY-MM-DD');
					backupData['url-' + type + '-' + typeCount[type]] = v.url;
					backupHtml['preview-' + type + '-' + typeCount[type]] = '<img src="' + v.url + '" style="max-width:300px; max-height:100px;"/>';
					type === 'other' && (backupData['type-' + type + '-' + typeCount[type]] = v.type);

				});
			}

			gIndustryQualificationList.length>0 && (requiredTypes = gIndustryQualificationList[0].qualification_type||[]);
			requiredTypes.push('other');

			fieldsConfig = {
				items: [{
					name: 'the_industry_id',
					type: 'group',
					items: [{
						name: theCategory,
						type: 'chosen',
						label: '已选行业',
						genre: FormUI.GENRE_INT,
						required: true,
						items: [industryCategoryInfo],
						hint: (function() {
							var hint = ['<a href="javascript:;" class="_industry text-info"><i class="fa fa-plus"></i><i class="fa fa-minus none"></i> 查看行业资质要求</a>'];

							$.each(supportedAdx, function(i, v) {
								hint.push('<small class="none"><br/><a class="text-info ml-15" target="_blank" href="' + v.url + '">' + v.text + '</a></small>')
							});

							return hint.join('');
						})(),
						attrs: {
							readonly: true
						}
					}]
				}]
			};

			$.each(requiredTypes, function(i, v) {
				var label = (Y.nameMapping.getQualificationType(v) === v ? '其他资质' : Y.nameMapping.getQualificationType(v));

				fieldsConfig.items.push({
					name: 'group_' + v,
					label: (function() {
						var theLabel = '<span class="label' + v + '">' + label + '</span>';

						theLabel += [
							'<button class="btn btn-sm pull-right mr-15 _add-qualification none" style="margin-top:-10px;" data-index={INDEX} data-type="' + v + '"><i class="fa fa-plus"></i> 添加</button>',
							'<button class="btn btn-sm pull-right mr-15 _remove-qualification" data-index={INDEX} style="margin-top:-10px;" data-type="' + v + '"><i class="fa fa-minus"></i> 删除</button>'
						].join('');

						return theLabel;
					})(),
					type: 'group',
					repeat: {
						times: (function() {
							return typeCount[v] === undefined ? 1 : (typeCount[v] + 1);
						})(),
						replaces: {
							'{INDEX}': function(currentIndex) {
								return currentIndex++;
							}
						}
					},
					items: getQualificationUploader(v)
				});
			});

			dialogContent = [
				'<div id="' + QUALIFICATION_FORM_ID + '" class="mt-15"></div>'
			].join('');

			P.confirm(dialogContent, function(rt) {
				if (rt) {
					gQualificationForm.submit();
				}
			});

			gQualificationForm = new FormUI.Construct(fieldsConfig, QUALIFICATION_FORM_ID);
			gQualificationForm.onChange = function(data) {
				return false;
			}
			gQualificationForm.onSubmit = function(data) {
				var qualifications = [];

				delete data.the_advertiser_category;
				$.each(data, function(key, val) {
					var keys = key.split('-'),
						field = keys[0],
						type = keys[1],
						index = keys[2];

					if ($.inArray(field, ['file', 'preview']) === -1) {
						if (type === 'other') {
							data[type + index] = data[type + index] || {};
							data[type + index][field] = (field === 'type' ? (parseInt(val, 10) || {}) : (val || {}));
						} else {
							data[index] = data[index] || {};
							data[index][field] = val || {};
							data[index].type = parseInt(type, 10);
						}
					}
					delete data[key];
				});

				$.each(data, function(k, v) {
					if (typeof v.url === 'string') {
						qualifications.push(v);
					}
				});

				if (qualifications.length) {
					$.each(qualifications, function(i, v) {
						v.expired_date = parseInt(moment(v.expired_date, 'YYYY-MM-DD').format('YYYYMMDD'), 10);
					});
				}

				// 传参回原页面
				callback && callback(qualifications);

				P.tips.info('资质已保存，请完成其他编辑后统一提交', null, { timeout: 3000 });
			};

			if (backupData) {
				FormUI.setData(backupData);
				$.each(backupHtml, function(key, val) {
					$('#' + key).html(val);
				});
			};

			bindEvents();
		});
	};
})(Y, Y.commonQualification = {});