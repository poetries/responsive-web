(function(Y, Test){
	var FORM_ID = 'wrapTestForm',
		FU = FormUI,
		gFormInstance;

	function initSubmitForm() {
		var fieldsConfig, formInstance;

		fieldsConfig = {
			layout	: 'table',
			label	: '新建物料',
			buttons : {
				items	: [
					{
						label	: '提交',
						type	: 'submit'
					},
					{
						label	: '取消',
						type	: 'button',
						events	: {
							click : function() {
								Y.util.goBack();
								return false;
							}
						}
					},
					{
						type	: 'button',
						label	: '添加一行',
						className: 'pull-right btn-sm',
						style	: 'margin-top:-50px',
						events	: {
							click : function(){
								gFormInstance.addGroup('creative_group');
							}
						}
					}
				]
			},
			items : [
/*				{
					name	: 'asset_id',
					genre	: FU.GENRE_INT,
					type	: FU.TYPE_TEXT,
					label	: '一级',
				},*/
				{
					name	: 'creative_group',
					type	: 'group',
					generator: 'static',	// static：一次生成所有展示项，dynamic：动态生成。默认static
					repeat	: {
						times	: 3,
						replaces: {
							'{INDEX}' : function(currentIndex){
								return currentIndex ++;
							}
						}
					},
					items	: [
						{
							name	: 'creative_size_id{INDEX}',
							label	: '创意规格',
							required: true,
							genre	: FU.GENRE_INT,
							type	: FU.TYPE_SELECT,
							items	: [
								{label: '请选择规格', value: ''},
								{label: '320x50', value: '1'}
							]
						},
						{
							name	: 'file_name{INDEX}',
							label	: '名称',
							required: true,
							counter	: [1, 20],
							genre	: FU.GENRE_STRING,
							type	: FU.TYPE_TEXT
						},
						{
							name	: 'id{INDEX}',
							label	: '名称',
							required: true,
							genre	: FU.GENRE_STRING,
							type	: FU.TYPE_HIDDEN
						},
						{
							name	: 'preview{INDEX}',
							label	: '预览',
							genre	: FU.GENRE_STRING,
							type	: FU.TYPE_HTML,
							value	: '<h1 class="title_preview">title</h2><br><p>Hello, <strong>UUU</strong></p>',
							events	: {
								complete: function(){
									console.log(this, this.id);
								}
							}
						},
						{
							name  : 'create_experimental_group{INDEX}',
							label  : '创建实验广告',
							genre  : FormUI.GENRE_STRING,
							type  : 'checkbox',
							items  : [{
								label  : '是',
								value  : 1
							}]
						},
						{
							name	: 'remove{INDEX}',
							label	: '删除',
							type	: FU.TYPE_BUTTON,
							className: 'btn-sm ml-15',
							events	: {
								click : function(){
									gFormInstance.removeGroup(this);
								}
							}
						}
					]
				}
			]
		};
		gFormInstance = new FormUI.Construct(fieldsConfig, FORM_ID);
		gFormInstance.onSubmit = function(data){
			console.log(data)
			return false;
		};
	}

	Test.init = function(){
		initSubmitForm();
	};
})(Y, Y.modTest = {});