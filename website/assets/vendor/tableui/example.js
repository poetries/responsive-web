/**
 * Example 1: base usage
 *
 * @todo 
 * - zebra crossing
 * - pagination
 * - fixed header
 * - column width flexible
 * - canvas screenshot
 * - column row reverse
 */
var table1 = new TableUI({
	appendTo: document.getElementById('example1'),
	id: 'table1',
	caption: 'Example 1',
	nowrap: true,  // 不允许这行，默认允许
	className: '',
	
	showTotal: true,
	showAverage: true,
	showPagination: false,

	currency: '¥',
	columns: [
		{
			label	: 'ID',
			name	: 'id',
			orderable: true,
			width	: '100px',
			total	: '总计',
			average	: '平均'
		},
		{
			label	: '名称',	
			name	: 'name',
			type	: 'string',
			className: 'username',
			total	: '-',
			average	: '-'
		},
		{
			label	: '价格',
			name	: 'price',
			type	: 'currency',
		},
		{
			label	: '数量',
			name	: 'count',
			type	: 'int',
		},
		{
			label	: '总价',
			name	: 'amount',
			type	: 'currency',
			value	: function(row, columns) {
				return TableUI.multiply(row.price, row.count);
			}
		},
		{
			label	: '比率',
			hint	: '总价/价格',
			name	: 'rate',
			type	: 'percent',
			value	: function(row, columns) {
				return TableUI.percent(row.price, row.amount);
			}
		},
		{
			label	: '备注',
			name	: 'comment',
			type	: 'string',
			default	: '点击可修改',
			style	: 'vertical-align:top',
			editable: { 
				api: function(newValue, oldValue) {
					console.log(newValue, oldValue)
				}
			},
			total	: false,
			average	: false
		},
		{
			label	: '时间',
			name	: 'created',
			type	: 'timestamp',
			format	: 'YYYY-MM-DD',
			total	: '',
			average	: ' '
		},
		{
			label	: '操作',
			name	: 'op',
			type	: 'html',
			value	: function(row){
				return '<button type="button" data-id="'+ row.id +'" tableui-flag="delete">删除</button>';
			},
			total	: '',
			average	: ' '
		}
	],
	rows: [
		{
			id: TableUI.stubInt(20000, 10000),
			name: '哈根达斯',
			price: TableUI.stubFloat(),
			count: TableUI.stubInt(),
			comment: '诶跟',
			created: TableUI.stubTimestamp()
		},
		{
			id: TableUI.stubInt(20000, 10000),
			name: '四个圈',
			price: 18.20,
			count: 12,
			comment: '',
			created: 1509418078495,
		},
		{
			id: TableUI.stubInt(20000, 10000),
			name: TableUI.stubString(),
			price: TableUI.stubFloat(),
			count: TableUI.stubInt(),
			comment: TableUI.stubString(),
			created: TableUI.stubTimestamp()
		},
		{
			id: TableUI.stubInt(20000, 10000),
			name: TableUI.stubString(),
			price: TableUI.stubFloat(),
			count: TableUI.stubInt(),
			comment: TableUI.stubString(),
			created: TableUI.stubTimestamp()
		}
	].concat(
		(function(){
			var list = [];

			for (var i=0; i<2; i++) {
				list.push({
					id: TableUI.stubInt(20000, 10000),
					name: TableUI.stubString(),
					price: TableUI.stubFloat(),
					count: TableUI.stubInt(),
					comment: TableUI.stubString(),
					created: TableUI.stubTimestamp()
				});
			}

			return list;
		})()
	),
	// 合并，以二维数组的下标描述需要合并的矩形范围
	mergeTbody: [
		// [[0, 'comment'], [2, 'created']],
		// [[0,6], [2,7]],
	],
	// 合并表头
	mergeThead: [
		// [[0, 'id'], [0, 'name']]
		// [[0, 0], [0, 1]]
	],
	mergeTfoot: [
		[[0, 0], [0, 1]],
		[[1, 0], [1, 1]]
	]
	// total: [
	// 	{
	// 		id: '平均',
	// 		name: '哈根达斯',
	// 		price: 42.20,
	// 		comment: '一般'
	// 	},
	// 	{
	// 		id: '总计',
	// 		name: '四个圈',
	// 		price: 118.20,
	// 		comment: ''
	// 	}
	// ]
});
// table1.addRow({
// 	id: 11111,
// 	name: '新增',
// 	price: TableUI.stubFloat(),
// 	count: TableUI.stubInt(),
// 	comment: TableUI.stubString(),
// 	created: TableUI.stubTimestamp()
// });
// table1.removeRow(table1.table.rows[1]);  // remove from <tr>
// table1.removeRow(table1.table.rows[1].cells[0]);  // remove from <td>

/*table1.updateRow(3, {
	name: '修改',
	price: 100.02
});*/

// console.table(table1.rows);
// console.table(table1.rawRows);

table1.on('clickcell', function(e){

	console.log('clickcell', this, e)
});
/*table1.on('delete', function(e){
	console.log('delete')
})
*/

// table1.setCellAttrs(table1.getCell('tbody', 1,1), {a:1});