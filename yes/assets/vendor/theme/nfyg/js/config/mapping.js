/**
 * 全局配置
 * @namespace Y.nameMapping
 */
(function(Y){
	Y.nameMapping = Y.nameMapping || {};

	$.extend(Y.nameMapping, {
		AdexchangeType : {
			16 : '南方银谷'
		},

		SupportedPlatform : {
			1 : 'Android',
			2 : 'iOS'
		},

		AdexchangeTypeShort : {
			16: ' '
		},
		SSPAdexchangeType:{
			16	: '南方银谷'
		},

		BidTypeForAuction : {
			1 : 'CPC',
    		6 : 'CPM'
		},

		BidTypeForAgreement : {
    		1 : '合约CPC',
    		5 : '合约CPT',
    		6 : '合约CPM'
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

		TargetingSegment : {
			'metro_station_ids'		: '地铁线',
			'area_ids'				: '地区',
			'os_type_ids'			: '操作系统',
			'placement_ids'			: '推广位'
		},

		// 特性开关
		FeatureSwitch : {
			'promotion_object_url' : '安装包'
		},

		AdvertiserAccountType : {
			'agency'	: '服务商',
			'dsp'		: 'DSP',
			'advertiser': '直客'
		}
	});
})(Y);
