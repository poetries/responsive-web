/**
 * 全局配置
 * @namespace Y.nameMapping
 */
(function(Y){
	Y.nameMapping = Y.nameMapping || {};

	$.extend(Y.nameMapping, {
		AdexchangeType : {
			1 : 'Tanx',
			2 : 'BES',
			4 : '硬核联盟', // MHA
			32: '柠檬网络',
			64: '搜狐',
			128: '网易有道',
			// 256: '腾讯ADX',
			512: '腾讯',
			// 1024: '广点通ADX',
			4096: '一点资讯'
			// 8192: '今日头条'
		},
		AdexchangeTypeEn : {
			1 : 'tanx',
			2 : 'bes',
			4 : 'wanka',
			32: 'yesdat',
			64: 'sohu',
			128: 'youdao',
			512: 'luna',
			4096: 'ydzx'
		},
		SSPAdexchangeType:{
			32	: '柠檬网络'
		},
		AdexchangeTypeShort : {
			1 : 'T',
			2 : 'B',
			4 : 'W',
			32: 'Y',
			64: 'S',
			128: 'N',
			512: 'Q',
			4096: '1'
		},

		SupportedPlatform : {
			1 : 'Android',
			2 : 'iOS',
			3 : 'Android应用(腾讯)',
			4 : '应用宝(腾讯)'
		},

		ConnectionType : [
			{value :2, label: 'Wi-Fi'},
			{value :5, label: '4G'},
			{value :4, label: '3G'},
			{value :3, label: '2G'}
		],

		RelationshipStatus : {
			1: '单身',
			2: '已婚'/*,
			3: '离婚'*/
		},
		VehicleStatus : {
			1 : '有车一族'
		},
		Gender : {
			1 : '男',
			2 : '女'
		},

		TargetingSegment : {
			// 'metro_station_ids'		: '地铁线',
			'gender_ids'			: '性别',
			'age_ids'				: '年龄',
			'area_ids'				: '当前所在地',
			'workplace_ids'			: '工作地址',
			'residence_ids'			: '家庭地址',
			'os_type_ids'			: '操作系统',
			'connection_type_ids'	: '联网方式',
			'app_category_ids'		: 'APP行为',
			'business_category_ids'	: '商业兴趣',
			// 'user_label_ids'		: '用户标签',
			'tag_ids'				: '自定义人群',
			'exclude_user_label_ids': '排除人群',
			'media_category_ids'	: '媒体分类',
			'publisher_object_id'	: '媒体资源',
			'placement_ids'			: '推广位',
			'relation_status_ids'	: '婚姻状态',
			'vehicle_status_ids'	: '汽车资产',
			'device_ids'			: '设备机型'
		},

		PresetTagId : [
		],

		// 特性开关
		FeatureSwitch : {
			// 'promotion_object_url' : '安装包'
		},

		AdvertiserAccountType : {
			'agency'	: '服务商',
			// 'dsp'		: 'DSP',
			'advertiser': '直客'
		}
	});
})(Y);
/**
 * 全局配置
 * @namespace Y.nameMapping
 */


/**
 * 配置的解析引擎，2大场景：
 *   1. 对接P.form.autoFillData，自动填充到页面对应的DOM
 *   2. 字典的翻译功能，获取对应值的含义，Y.nameMapping.getXXXXX(value)
 *
 * @param  {[type]} P	命名空间
 * @return {[type]}
 */
(function(P) {
	$.each(Y.nameMapping, function(name, mapping) {
		P.form.addNameMapping(name, mapping || {});
	});
})(window.P = window.P || {});
