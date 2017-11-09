/**
 * 全局配置
 * @namespace Y.nameMapping
 */
(function(Y){
	Y.nameMapping = Y.nameMapping || {};

	$.extend(Y.nameMapping, {
		CreativeSizeType : {
            1 : '文字',
            2 : '图片',
            3 : '图文',
            4 : '图文描述',
    		8 : '图多文'
		},

		CreativeDisplayType : {
            1 : 'Banner',
            2 : '插屏',
            3 : '开屏',
            4 : '文字链',
            5 : '应用墙',
            6 : '视频贴片',
            7 : '视频暂停',
            8 : '信息流',
            9 : '原生广告',
            10: '固定',
			11: '视频前贴片',
			12: '视频中贴片',
			13: '视频后贴片',
			14: '轮播图',
            15: '悬浮'
		},

		AdexchangeType : {
			1 : 'Tanx',
			2 : 'BES',
			4 : '硬核联盟',
			32: '柠檬网络'/*,
			100: '搜狐',
			101: '腾讯'*/
		},
		SSPAdexchangeType:{
				32	: '柠檬网络'
		},
		AdexchangeTypeShort : {
			1 : 'T',
			2 : 'B',
			4 : 'W',
			32: 'Y'
		},

		PromotionObjectType : {
			1 : 'APP',
			2 : '移动网站'
		},

		SupportedPlatform : {
			1 : 'Android',
			2 : 'iOS'
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
			'area_ids'				: '地区',
			'os_type_ids'			: '操作系统',
			'connection_type_ids'	: '联网方式',
			'app_category_ids'		: 'APP兴趣',
			// 'user_label_ids'		: '用户标签',
			'tag_ids'				: '自定义人群',
			'exclude_user_label_ids': '排除人群',
			'media_category_ids'	: '媒体分类',
			'publisher_object_id'	: '媒体资源',
			'placement_ids'			: '推广位',
			'relation_status_ids'	: '婚姻状态',
			'vehicle_status_ids'	: '汽车资产',
			'device_ids'			: '设备机型',
			'workplace_ids'			: '工作地址',
			'residence_ids'			: '家庭地址',
			'gender_ids'			: '性别'
		},

		PresetTagId : [
		]
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
