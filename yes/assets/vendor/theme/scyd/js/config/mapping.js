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

		MetroLine : [
			{
				label : '深圳',
				value : 440300,
				items : [
					{value: 440300010000, label:'深圳罗宝线'},
					{value: 440300020000, label:'深圳蛇口线'},
					{value: 440300030000, label:'深圳龙岗线'},
					{value: 440300040000, label:'深圳龙华线'},
					{value: 440300050000, label:'深圳环中线'},
					{value: 440300110000, label:'深圳11号线'}
				]
			},
			{
				label : '上海',
				value : 310000,
				items : [
					{value:310000010000, label:'上海1号线'},
					{value:310000020000, label:'上海2号线'},
					{value:310000030000, label:'上海3号线'},
					{value:310000040000, label:'上海4号线'},
					{value:310000050000, label:'上海5号线'},
					{value:310000060000, label:'上海6号线'},
					{value:310000070000, label:'上海7号线'},
					{value:310000080000, label:'上海8号线'},
					{value:310000090000, label:'上海9号线'},
					{value:310000100000, label:'上海10号线'},
					{value:310000110000, label:'上海11号线'},
					{value:310000120000, label:'上海12号线'},
					{value:310000130000, label:'上海13号线'},
					{value:310000160000, label:'上海16号线'}
				]
			},
			{
				label : '昆明',
				value : 530100,
				items : [
					{value:530100010000, label:'昆明1号线'},
					{value:530100020000, label:'昆明2号线'},
					{value:530100060000, label:'昆明6号线'}
				]
			},
			{
				label : '青岛',
				value : 370200,
				items : [
					{value:370200030000, label:'青岛3号线一期'},
				]
			},
			{
				label : '武汉',
				value : 420100,
				items : [
					{value:420100010000, label: '武汉1号线'},
					{value:420100020000, label: '武汉2号线'},
					{value:420100030000, label: '武汉3号线'},
					{value:420100040000, label: '武汉4号线'}
				]
			}
		],

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
			'area_ids'				: '地区',
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
			{value:'10000000036', label:'jpush-微贷/车贷/房贷/外汇/保险(288万)'},
			{value:'10000000037', label:'jpush-基金/期货(1028万)'},
			{value:'10000000038', label:'jpush-银行(1842万)'},
			{value:'10000000039', label:'jpush-P2P/其他借贷(1810万)'},
			{value:'10000000040', label:'jpush-融金所(1000万)'},
			{value:'10000000041', label:'jpush-动作竞技(1655万)'},
			{value:'10000000042', label:'jpush-酷跑(1660万)'},
			{value:'10000000043', label:'jpush-体育格斗(1492万)'},
			{value:'10000000044', label:'jpush-射击(1655万)'},
			{value:'10000000045', label:'jpush-角色扮演(1639万)'},
			{value:'10000000046', label:'jpush-卡牌(520万)'},
			{value:'10000000047', label:'jpush-南京(311万)'},
			{value:'10000000048', label:'jpush-大连(208万)'},
			{value:'10000000049', label:'jpush-重庆(689万)'},
			{value:'10000000050', label:'jpush-杭州(258万)'},
			{value:'10000000051', label:'jpush-济南(167万)'},
			{value:'10000000052', label:'jpush-上海(670万)'},
			{value:'10000000053', label:'jpush-郑州(511万)'},
			{value:'10000000054', label:'jpush-苏州(502万)'},
			{value:'10000000055', label:'jpush-彩票(1569万)'},
			{value:'10000000056', label:'jpush-学生(652万)'},
			{value:'10000000057', label:'jpush-戴尔画像人群(200万)'},
			{value:'10000000058', label:'jpush-戴尔匹配imei(4.6万)'},
			{value:'10000000059', label:'jpush-高端商务人士(306万)'},
			{value:'10000000001', label:'jpush-宜人贷'}
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
