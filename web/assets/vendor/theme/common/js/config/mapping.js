/**
 * 全局配置
 * @namespace Y.nameMapping
 */
(function(Y){
	Y.nameMapping = Y.nameMapping || {};

	$.extend(Y.nameMapping, {
		CreativeSizeType : {
            1 : '文字链',
            2 : '图片',
            3 : '图文',
            4 : '图文描述',
            6 : '视频',
    		8 : '图多文',
			9 : '组图'
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
			16 : '南方银谷'
		},

		AdexchangeTypeShort : {
			1 : 'T',
			2 : 'B',
			4 : 'W',
			16: 'S'
		},

		AdvertiserApprovalStatus : {
			1 : '通过',
			2 : '待审',
			3 : '拒绝'
		},

		CreativeApprovalStatus : {
			1 : '通过',
			2 : '待审',
			3 : '拒绝'
		},

		AdxCreativeApprovalStatus : {
			1 : '通过',
			2 : '待审',
			3 : '拒绝'
		},

		LunaCreativeApprovalStatus : {
			'AD_STATUS_NORMAL' 	: '通过',
			'AD_STATUS_PENDING'	: '待审',
			'AD_STATUS_DENIED'	: '拒绝',
			'AD_STATUS_FROZEN'	: '冻结',
			'AD_STATUS_SUSPEND'	: '暂停',
			'AD_STATUS_PREPARE'	: '预备',
			'AD_STATUS_DELETED'	: '弃用'
		},

		CertificateType : {
			1 : '身份证',
			2 : '护照',
			3 : '港澳通行证',
			4 : '台湾通行证'
		},

		CampaignType : {
			1 : '竞价',
			2 : '合约'
		},

		PromotionObjectType : {
			1 : '手机应用',
			2 : '移动网站',
			65535: '-'
		},

		OS : {
			1 : 'Android',
			2 : 'iOS'
		},

		// 出价类型全集，一般仅做翻译用
		BidType : {
			1 : 'CPC',
			2 : 'aCPM',
			3 : 'CPA',
			5 : 'CPT',
			6 : 'CPM'
		},

		// 自有流量竞价广告
		BidTypeForAuction : {
			1 : 'CPC',
			6 : 'CPM'
		},
		// ADX竞价广告
		BidTypeForADXAuction : {
			2 : 'aCPM'
		},
		// 合约广告
		BidTypeForAgreement : {
    		1 : '合约CPC',
    		5 : '合约CPT',
    		6 : '合约CPM'
		},
		// 普通腾讯广告
		BidTypeForLuna : {
			1 : 'CPC'
		},
		// 应用宝广告（开平广告Android应用，需综合上BidTypeForLuna）
		BidTypeForLunaMyApp : {
			3 : 'CPA'
		},

		BusinessType: {
			0: '聚合流量',
			1: '腾讯流量'
		},
		
		MetroLine : {},

		ConnectionType : [
			{value :2, label: 'Wi-Fi'},
			{value :5, label: '4G'},
			{value :4, label: '3G'},
			{value :3, label: '2G'}
		],

		EducationBackground : [
			{value :1, label: '小学'},
			{value :2, label: '初中'},
			{value :3, label: '高中'},
			{value :4, label: '大学本科'},
			{value :5, label: '研究生'},
			{value :6, label: '博士'}
		],

		RelationshipStatus : {
		},
		VehicleStatus : {
		},
		Gender : {
		},

		FileType : {
			1 : '图片',
			3 : '视频'
		},

		Order2Css: {
			'up':'fa fa-long-arrow-up text-primary',
			'down':'fa fa-long-arrow-down text-success'
		},

		SyncStatus: {
			1 : '待同步',
			2 : '同步中',
			3 : '同步成功',
			4 : '同步失败',
			5 : '已撤销'
		},

		// 聚合报表客户列表(灰度)
		IntegratedReportCustomer : [],

		// 落地页互动类型
		InteractionType: {
			0 : '未知',
			1 : '点击',
			2 : '下载',
			3 : '电话',
			4 : '地图'
		}
	});
})(Y);

/**
 * 全局常量设置
 * @param  {[type]} Y [description]
 * @return {[type]}   [description]
 */
(function(Y){
	Y.const = Y.const || {};

	$.extend(Y.const, {
		// 字典服务的ID，不同环境不一样
		Dictionary_APP_BEHAVIOR : 4,
		Dictionary_APP_CATEGORY	: 3,
		Dictionary_DEVICE_MODEL	: 2,
		Dictionary_REGION		: 1,
		Dictionary_ADVERTISER_CATEGORY: 8,	// 广告主行业分类
		Dictionary_SENSITIVE_CATEGORY: 9,  // 敏感分类
		Dictionary_BUSINESS_INTEREST: 10,  // 商业兴趣分类

		PromotionObjectType_APP			: 1,	// 应用
		PromotionObjectType_MOBILE_SITE	: 2,	// 移动网站
		PromotionObjectType_NULL		: 65535,	// 无

		AppendixType_APP				: 1,	// APP分类
		AppendixType_BIZ_INTEREST		: 2,	// 商业兴趣分类
		AppendixType_REGION				: 3,	// 地域
		AppendixType_SENSITIVE_CATEGORY	: 4,	// 敏感分类
		AppendixType_ADVERTISER_CATEGORY: 5,	// 广告主行业分类

		CreativeSizeType_TEXT 		: 1,
		CreativeSizeType_IMAGE		: 2,
		CreativeSizeType_IMAGE_TEXT	: 3,
		CreativeSizeType_IMAGE_TEXT_DESC: 4,
		CreativeSizeType_VIDEO		: 6,
		CreativeSizeType_IMAGE_TEXT_DESC_EXT: 8,
		CreativeSizeType_IMAGE_SET_TEXT	: 9,

        CreativeSizeCallToAction_DOWNLOAD		: 1,
        CreativeSizeCallToAction_OPEN_WEBPAGE	: 2,

		CreativeSizeExtension_LOGO : 1,

		SupportedPlatform_ANDROID	: 1,
		SupportedPlatform_IOS		: 2,
		SupportPlatform_ANDROID_LUNA_OPEN : 3,   // 腾讯开平移动应用
		SupportPlatform_ANDROID_LUNA_MYAPP: 4,   // 应用宝通道

		AccountType_ADVERTISER	: 1,
		AccountType_DSP			: 2,
		AccountType_AGENCY		: 5,

		CampaignType_AUCTION	: 1,
		CampaignType_AGREEMENT	: 2,

		AdexchangeType_TANX	: 1,
		AdexchangeType_BES	: 2,
		AdexchangeType_WANKA: 4,
		AdexchangeType_NFYG	: 16,
		AdexchangeType_YESDAT: 32,
		AdexchangeType_SOHU	: 64,
		AdexchangeType_YEX : 128,
		AdexchangeType_LUNA	: 512,
		AdexchangeType_MI : 16384,
		AdexchangeType_OPPO : 32768,

		// 推广位状态
		PlacementStatus_PAUSE: 10,
		PlacementStatus_DEPRECATED: 19,

		FileType_IMAGE : 1,
		FileType_VIDEO : 3,
		
		DATE_TODAY: moment().format('YYYY-MM-DD'),
		DATE_YESTERDAY: moment().subtract(1, 'days').format('YYYY-MM-DD'),
		DATE_1_WEEK_BEFORE: moment().subtract(1, 'weeks').format('YYYY-MM-DD'),
		DATE_2_WEEKS_BEFORE: moment().subtract(2, 'weeks').format('YYYY-MM-DD'),
		DATE_3_WEEKS_BEFORE: moment().subtract(3, 'weeks').format('YYYY-MM-DD'),
		DATE_1_MONTH_BEFORE: moment().subtract(1, 'months').format('YYYY-MM-DD'),
		DATE_2_MONTH_BEFORE: moment().subtract(2, 'months').format('YYYY-MM-DD'),
		DATE_3_MONTHS_BEFORE: moment().subtract(3, 'months').format('YYYY-MM-DD'),
		DATE_1_YEAR_BEFORE: moment().subtract(1, 'years').format('YYYY-MM-DD'),

		DATE_3_MONTHS_AFTER: moment().add(3, 'months').format('YYYY-MM-DD'),
		DATE_1_YEAR_AFTER: moment().add(1, 'year').format('YYYY-MM-DD'),

		DATE_FIRST_DAY_OF_MONTH: moment().startOf('month').format('YYYY-MM-DD'),
		DATE_LAST_DAY_OF_MONTH: moment().endOf('month').format('YYYY-MM-DD'),

		DATE_7_DAYS_BEFORE: moment().subtract(7, 'days').format('YYYY-MM-DD'),
		DATE_30_DAYS_BEFORE: moment().subtract(30, 'days').format('YYYY-MM-DD'),
		DATE_90_DAYS_BEFORE: moment().subtract(90, 'days').format('YYYY-MM-DD'),
		DATE_100_DAYS_BEFORE: moment().subtract(100, 'days').format('YYYY-MM-DD'),

		SyncStatus_INITIAL		: 1,
		SyncStatus_PROCESSING	: 2,		// 表示部分同步,未结束
		SyncStatus_SUCCESS		: 3,		// 表示同步成功,已经全部同步,
		SyncStatus_FAILED		: 4,
		SyncStatus_WITHDRAW		: 5		// 撤销同步
	});

})(Y);
