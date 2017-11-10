/**
 * 全局配置
 * @namespace Y.nameMapping
 */
(function(Y){
	Y.nameMapping = Y.nameMapping || {};

	$.extend(Y.nameMapping, {
		AdexchangeType : {
			512: '腾讯',
			1 : 'Tanx',
			// 2 : 'BES',
			4 : '硬核联盟', // MHA
			32: '柠檬网络',
			// 64: '搜狐',
			// 128: '网易有道',
			16384: '小米',
   			32768: 'OPPO'
		},
		AdexchangeTypeEn : {
			1 : 'tanx',
			2 : 'bes',
			 4 : 'wanka',
			32: 'yesdat',
			64: 'sohu',
			128: 'youdao',
			512: 'luna',
			16384: 'mi'
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
			512: 'Q'
		},

		SupportedPlatform : {
			1 : 'Android',
			2 : 'iOS',
			3 : 'Android应用(腾讯)'
			// 4 : '应用宝(腾讯)' // Luna暂不支持
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
			// 'media_category_ids'	: '媒体分类',
			// 'publisher_object_id'	: '媒体资源',
			'placement_ids'			: '推广位',

			// 暂不开放
			// 'gender_ids'			: '性别',
			// 'age_ids'				: '年龄',
			'area_ids'				: '当前所在地',
			'workplace_ids'			: '工作地址',
			'residence_ids'			: '家庭地址',
			'os_type_ids'			: '操作系统',
			'connection_type_ids'	: '联网方式',
			'app_category_ids'		: 'APP行为',
			'business_category_ids'	: '商业兴趣',
			// 主题标签（包含汽车资产）
			'tag_ids'				: '自定义人群',
			'exclude_user_label_ids': '排除人群',
			'device_ids'			: '设备机型',
			'agreement_constraint_id': '合约排期'
		},

		PresetTagId : [
			{value: '50000000017', label: 'topic_股票证券(6,180,893)'},
			{value: '50000000019', label: 'topic_基金理财(2,258,276)'},
			{value: '50000000021', label: 'topic_保险(3,120,137)'},
			{value: '50000000023', label: 'topic_小额借贷(6,181,689)'},
			{value: '50000000025', label: 'topic_学生贷款(701,442)'},
			{value: '50000000027', label: 'topic_幼教娱乐(13,331,635)'},
			{value: '50000000029', label: 'topic_幼儿园(13,961,202)'},
			{value: '50000000031', label: 'topic_K12教育(14,966,686)'},
			{value: '50000000037', label: 'topic_高中辅导(3,554,104)'},
			{value: '50000000039', label: 'topic_大学生(15,747,540)'},
			{value: '50000000041', label: 'topic_英语学习(5,470,346)'},
			{value: '50000000043', label: 'topic_语言学习(1,927,097)'},
			{value: '50000000045', label: 'topic_驾考(11,396,361)'},
			{value: '50000000047', label: 'topic_买车学车(6,556,574)'},
			{value: '50000000049', label: 'topic_租车专车(4,629,783)'},
			{value: '50000000051', label: 'topic_专车司机(15,462,475)'},
			{value: '50000000053', label: 'topic_货车司机(1,386,951)'},
			{value: '50000000055', label: 'topic_二手车买卖(8,191,332)'},
			{value: '50000000057', label: 'topic_直播交友(11,871,138)'},
			{value: '50000000059', label: 'topic_游戏直播(20,429,716)'},
			{value: '50000000061', label: 'topic_体育直播(3,081,096)'},
			{value: '50000000063', label: 'topic_直播影音(1,835,990)'},
			{value: '50000000065', label: 'topic_自拍短视频(26,848,234)'},
			{value: '50000000067', label: 'topic_VR应用(2,409,759)'},
			{value: '50000000069', label: 'topic_动作竞速游戏(22,160,654)'},
			{value: '50000000071', label: 'topic_休闲游戏(32,006,419)'},
			{value: '50000000073', label: 'topic_棋牌游戏(1,664,671)'},
			{value: '50000000075', label: 'topic_网易网游(1,028,594)'},
			{value: '50000000077', label: 'topic_婚恋交友(3,680,758)'},
			{value: '50000000079', label: 'topic_求职招聘(3,152,951)'},
			{value: '50000000081', label: 'topic_女性电商(15,606,690)'},
			{value: '50000000083', label: 'topic_潮流女性(51,785,377)'},
			{value: '50000000085', label: 'topic_贤惠女性(11,530,067)'},
			{value: '50000000087', label: 'topic_文艺高知(3,334,086)'},
			{value: '50000000089', label: 'topic_团购旅游(49,204,116)'},
			{value: '50000000091', label: 'topic_跑步健身(7,778,606)'},
			{value: '50000000093', label: 'topic_二次元娱乐(9,484,144)'},
			{value: '50000000095', label: 'topic_内容社区(10,569,152)'},
			{value: '50000000097', label: 'topic_高知社区(4,304,965)'},
			{value: '50000000099', label: 'topic_小说阅读(6,431,836)'},
			{value: '50000000101', label: 'topic_听书(5,663,272)'},
			{value: '50000000103', label: 'topic_免费小说(9,783,250)'},
			{value: '50000000105', label: 'topic_照片美化(2,177,633)'},
			{value: '50000000107', label: 'topic_公务员教师备考(1,238,041)'},
			{value: '50000000109', label: 'topic_医生助手(1,176,736)'},
			{value: '50000000111', label: 'topic_房地产(7,885,170)'},
			{value: '50000000113', label: 'topic_淘宝商家(4,701,421)'},
			{value: '50000000115', label: 'topic_团购商家(1,448,904)'},
			{value: '50000000117', label: 'topic_快递助手(1,382,141)'},
			{value: '50000000119', label: 'topic_风水彩票(4,303,650)'},
			{value: '50000000121', label: 'topic_电商优惠(4,921,779)'},
			{value: '50000000123', label: 'topic_返利(5,128,044)'},
			{value: '50000000125', label: 'topic_广告红包(2,361,005)'}
		],

		// 特性开关
		FeatureSwitch : {
			// 'promotion_object_url' : '安装包'
			'click_tracking_provider' : '点击监控'
		},

		AdvertiserAccountType : {
			'agency'	: '服务商',
			'dsp'		: 'DSP',
			'advertiser': '直客'
		},

		// 聚合报表客户列表(灰度)
		IntegratedReportCustomer : [
			{label : '测试账号', value : 50000000000}
		]
	});
})(Y);
/**
 * 全局配置
 * @namespace Y.nameMapping
 */
$.extend(Y.const, {
	// 字典服务的ID，不同环境不一样
	Dictionary_APP_BEHAVIOR : 3
});

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
