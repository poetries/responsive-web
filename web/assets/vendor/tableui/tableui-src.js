/**
 * TableUI
 *
 */
class TableUI {
	constructor(config = {}) {
		if (!config.columns) {
			throw TableUI.name +': call arguments error.';
		}

		this.config = config;
		this.table = null;  // instance

		if (config.id) {
			let oldElement = document.getElementById(config.id);
			oldElement && oldElement.parentNode.removeChild(oldElement);
		}

		// transform array to map for search
		{
			let mapping = new Map();
			config.columns.forEach((column, i) => {
				mapping.set(column.name, column);
			});
			this.columnsMapping = mapping;
		}
		this.columns = this.config.columns;

		// always keep original numeric data.
		this.rawRows = this.dataProcess(config.rows);
		this.rows = this.dataFormat(this.rawRows);

		this.tfoot =[];
		if (this.rawRows.length > 0) {
			if (config.showTotal) {
				let result = this.calculateTotal(this.rawRows);
				this.rawTotal = result.rawTotal;
				this.total = result.total;

				this.tfoot.push(this.total);
			}
			if (config.showAverage) {
				let result = this.calculateAverage(this.rawTotal, this.rawRows);
				this.rawAverage = result.rawAverage;
				this.average = result.average;

				this.tfoot.push(this.average);
			}
		}

		if (config.showPagination) {
			// @todo
			// this.tfoot.push();
		}

		// generate HTML dom
		this.content = this.genSkeleton();
		TableUI.setStyleSheet( this.getDefaultCSS() );
		this.render(this.content);
		
		// merge rows and columns on dom
		this.config.mergeThead && this.mergeCells('thead', this.config.mergeThead);
		this.config.mergeTfoot && this.mergeCells('tfoot', this.config.mergeTfoot);
		this.config.mergeTbody && this.mergeCells('tbody', this.config.mergeTbody);

		this.initEvents();
	}

	// @todo to make effection
	setConfig(config) {
		Object.assign(this.config, config);
	}

	genSkeleton() {
		let content = [];
		let {id, className} = this.config;

		content.push(`<table id="${this.config.id||''}" width="${this.config.width||'100%'}" class="tableui">`);
		this.config.caption && content.push(`<caption>${this.config.caption}</caption>`);
		content.push( this.getTheadContent(this.columns) );
		content.push( this.getTfootContent(this.tfoot, this.columns) );
		content.push( this.getTbodyContent(this.rows, this.columns, this.config) );
		content.push('</table>');

		return content.join("\n");
	}

	getTheadContent(columns = []) {
		let content = [],
			colContent = [];

		content.push('<thead class="tableui__thead">');
		content.push('<tr class="tableui__thead-tr">');
		colContent.push('<colgroup>');
		columns.forEach(column => {
			content.push([
				`<th class="tableui__thead-th`,
				`${column.className||''}"`,
				`style="width:${column.width || 'auto'}"`,
				`${column.orderable ? 'orderable="true"' : ''}`,
				`${column.hint ? 'title="'+column.hint+'"' : ''}>`,
				`${column.label}`,
				'<div class="tableui__dragable--width"></div>',
				`</th>`
			].join(' '));
			colContent.push(`<col class="tableui__col tableui__col--${column.name}">`);
		});
		content.push('</tr>');
		content.push('</thead>');
		colContent.push('</colgroup>');

		return colContent.concat(content).join("\n");
	}

	getTfootContent(tfootRows = [], columns=[]) {
		let content = [];

		content.push('<tfoot class="tableui__tfoot">');
		tfootRows.forEach(row => {
			content.push('<tr class="tableui__tfoot-tr">');
			columns.forEach(column => {
				content.push([
					`<th class="tableui__tfoot-th`,
					`${column.type ? 'tableui__cell--'+column.type : ''}`,
					`${column.className||''}">${row[column.name]}</th>`
				].join(' '));
			});
			content.push('</tr>');
		});
		content.push('</tfoot>');

		return content.join("\n");
	}

	getTbodyContent(rows = [], columns=[], config = this.config) {
		let content = [];

		content.push('<tbody class="tableui__tbody">');
		rows.forEach(row => {
			content.push(this.getTbodyRowContent(row, columns));
		});
		content.push('</tbody>');

		return content.join("\n");
	}

	getTbodyRowContent(row = {}, columns=[], config = this.config) {
		let content = [],
			rowId;

		typeof config.rowId==='function' && (rowId = config.rowId(row, columns));

		content.push(`<tr class="tableui__tbody-tr" data-row-id="${rowId||''}">`);
		columns.forEach(column => {
			content.push([
				`<td class="tableui__tbody-td`,
				`${column.type ? 'tableui__cell--'+ column.type : ''}`,
				`${column.editable ? 'tableui__editable' : ''}`,
				`${column.className||''}"`,
				`${column.style ? 'style="'+ column.style +'"' : ''}`,
				`${column.editable ? 'editable="true"' : ''}>${row[column.name]}</td>`
			].join(' '));
		});
		content.push('</tr>');
		
		return content.join("\n")
	}

	static setStyleSheet(styleContent) {
		let styleElement;

		styleElement = document.createElement('style');
		styleElement.type = 'text/css';
		if (styleElement.styleSheet){
			styleElement.styleSheet.cssText = styleContent;
		} else {
			styleElement.appendChild(document.createTextNode(styleContent));
		}

		(document.head || document.getElementsByTagName('head')[0]).appendChild(styleElement);
	}

	getDefaultCSS() {
		return `
.tableui,
.tableui__thead-th,
.tableui__tfoot-th,
.tableui__tbody-th,
.tableui__thead-td,
.tableui__tfoot-td,
.tableui__tbody-td{border:1px solid #ccc;border-collapse:collapse;padding:5px 5px;word-break:break-all;}

.tableui{table-layout:fixed}
.tableui__thead{background-color: #e4e7ec}
.tableui__thead-tr{}
.tableui__thead-th{position:relative;text-align:center;}
.tableui__thead-td{}
.tableui__tbody{}
.tableui__tbody-tr{}
.tableui__tbody-td{}
.tableui__tbody-th{}
.tableui__tfoot{background: #efefef}
.tableui__tfoot-tr{}
.tableui__tfoot-td{}
.tableui__tfoot-th{}

.tableui__tbody-td,
.tableui__tbody-th,
.tableui__tfoot-td,
.tableui__tfoot-th{${this.config.nowrap?'text-overflow:ellipsis;overflow:hidden;white-space:nowrap;max-width:0;':''}}

.tableui__cell--date,
.tableui__cell--timestamp,
.tableui__text--center{text-align:center;}

.tableui__cell--string,
.tableui__text--left{text-align:left;}

.tableui__cell--numeric,
.tableui__cell--int,
.tableui__cell--float,
.tableui__cell--percent,
.tableui__cell--currency,
.tableui__text--right{text-align:right;text-overflow:inherit}

.tableui__cell--currency:before{content:"${this.config.currency||'¥'}";font-weight:300;}

.tableui__editable{}
.tableui__editable:after{content:'↵';color:#aaa;font-family:arial;}

.tableui__dragable--width{position:absolute;top:0;bottom:0;right:0;width:5px;cursor:col-resize;}
`;
	}

	render(content) {
		let docContent = new DOMParser().parseFromString(content, 'text/html');
		this.table = docContent.body.firstChild;
		this.config.appendTo.appendChild(this.table);
		docContent = null;
	}

	initEvents() {
		this.config.columns.forEach((item, i) => {
			if (item.orderable) {
				this.on('clickcell', function(event){
					let indexes = TableUI.getIndex(this);
					if (indexes.rowIndex===0 && indexes.columnIndex==i) {
						console.log('orderable', TableUI.getIndex(this));
					}
				});
			}
			if (item.editable) {
				this.on('clickcell', function(event){
					if (this.parentNode.parentNode.tagName.toUpperCase()!='TBODY' || this.cellIndex!=i) {
						return false;
					}
					let oldValue = this.innerHTML.trim();

					this.setAttribute('contenteditable', true);
					this.focus();

					this.addEventListener('blur', function focusContenteditableCell() {
						this.removeEventListener('blur', focusContenteditableCell);

						let newValue = this.innerHTML.trim();

						this.setAttribute('contenteditable', false);

						// if changed
						if (newValue != oldValue) {
							item.editable.api.apply(this, [newValue, oldValue]);
							// @todo trigger relation: raw data, calculate
						}
						oldValue = null;
					});
				});
			}
		});

		// fixed thead and tfoot
		/*Array.from(this.table.tHead.rows[0].cells).forEach((cell, i) => {
			let width = cell.getBoundingClientRect().width + 'px';

			cell.style.width = width;
// @todo rowspan
			this.table.tBodies[0].rows[0].cells[i].style.width = width;
		});
		Array.from(this.table.tFoot.rows[0].cells).forEach((cell, i) => {
			cell.style.width = cell.getBoundingClientRect().width + 'px';
		});
		document.addEventListener('scroll', () => {
			let position = this.table.getBoundingClientRect();

			if (position.top < 0) {
				this.table.tHead.style = [
					'position:fixed',
					'top:0',
					'table-layout: fixed',
					`width:${position.width}px`,
					'z-index:9'
				].join(';');
			} else {
				this.table.tHead.style = '';
			}

			if (position.bottom > document.documentElement.clientHeight) {
				this.table.tFoot.style = [
					'position:fixed',
					'bottom:0',
					'table-layout: fixed',
					`width:${position.width}px`,
					'z-index:9'
				].join(';');
			} else {
				this.table.tFoot.style = '';
			}
			C('scroll', position)
		});*/

		// drag to adjust column width
		let currentMouseEventTarget = null,
			currentMouseEventStartOffset;

		// @todo save width for next time
		Array.from(this.table.tHead.rows[0].cells).forEach(column => {
			column.addEventListener('mousedown', function (event) {
				if (event.target.className.indexOf('tableui__dragable--width') >= 0) {
					currentMouseEventTarget = column;
					currentMouseEventStartOffset = column.offsetWidth - event.pageX;
				}
				// C('start',currentMouseEventStartOffset)
			});
			document.addEventListener('mousemove', function (e) {
				if (currentMouseEventTarget) {
					currentMouseEventTarget.style.width = currentMouseEventStartOffset + e.pageX + 'px';
				// C('move',currentMouseEventStartOffset)
				}
			});

			document.addEventListener('mouseup', function () {
				currentMouseEventTarget = null;
			});
		});
	}

	static getIndex(tdElement) {
		return {
			rowIndex: tdElement.parentNode.sectionRowIndex,
			columnIndex: tdElement.cellIndex
		}
	}
	// stub data for test/debug
	static stubInt(upper=100, lower=0) {
		return lower + Math.round(Math.random() * (upper - lower));
	}
	static stubFloat(upper='100.00', lower=0.00) {
		// '100.00' as string, avoid auto convert to 100.
		let decimal = upper.toString().split('.').pop().length;
		return parseFloat(lower + (Math.random() * (upper - lower)).toFixed(decimal), 10);
	}
	static stubTimestamp() {
		return (new Date).getTime() - Math.round(1e10*Math.random());
	}
	static stubString(){
		let pangram = 'The quick brown fox jumps over the lazy dog'.split(' '),
			start = Math.round(Math.random()*(pangram.length-1)),
			maxWordCount = 3;

		return pangram.slice(start, start + (Math.min(maxWordCount, Math.round((pangram.length-start)*Math.random()))||1)).join(' ');
	}

	static multiply(a, b, decimal=2) {
		return isNaN(a)||isNaN(b) ? '-' : (a * b).toFixed(decimal||2);
	}
	static divide(a, b, decimal=2) {
		return isNaN(a)||isNaN(b)||b===0 ? '-' : TableUI.multiply(a, 1/b, decimal);
	}
	static percent(a, b, decimal=2) {
		return isNaN(a)||isNaN(b)||b===0 ? '-' : TableUI.multiply(a, 100/b, decimal) +'%';
	}
	static thousands(a) {
		return isNaN(a) ? a : (a || 0).toString().replace(/^(\d+)((\.\d+)?)$/, (s,s1,s2) => s1.replace(/\d{1,3}(?=(\d{3})+$)/g,"$&,")+s2);
	}
	static formatTimestamp(timestampInput, format = 'YYYY-MM-DD') {
		let rules, timestamp, date;

		timestamp = parseInt(timestampInput, 10);
		if (!timestamp || isNaN(timestamp)) {
			return timestampInput;
		}

		// transform s to ms.
		timestamp>1000000000 && timestamp<9999999999 && (timestamp = timestamp*1000);

		date = new Date(timestamp);

		rules = {
			"M+": date.getMonth() + 1,
			"D+": date.getDate(),
			"h+": date.getHours(), 
			"m+": date.getMinutes(), 
			"s+": date.getSeconds(), 
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度 
			"S": date.getMilliseconds() //毫秒
		};
		
		if (/(Y+)/.test(format)) {
			format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		}

		Object.keys(rules).forEach(k => {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (rules[k]) : (("00" + rules[k]).substr(("" + rules[k]).length)));
			}
		});

		return format;
	}

	/**
	 * dataProcess for original data
	 * @param  {Array}  data    raw row data.
	 * @return {[type]}         original data
	 */
	dataProcess(data = [], columns = this.columns) {
		let result = [];

		// keep data original and pure
		data.forEach((item, i) => {
			// manual deep copy
			let row = Object.assign({}, item);
		
			columns.forEach((column, i) => {
				let field = column.name;

				if (typeof column.value === 'function') {
					row[field] = column.value(row);
				} else if (typeof column.value !== 'undefined') {
					row[field] = column.value;
				}

				switch (column.type) {
					case TableUI.TYPE_INT:
						if (!isNaN(row[field])) {
							row[field] = parseInt(Math.round(row[field]), 10);
						}
						break;
					case TableUI.TYPE_FLOAT:
					case TableUI.TYPE_CURRENCY:
						if (!isNaN(row[field])) {
							row[field] = TableUI.divide(row[field], 1, column.format>0 ? column.format.toString().split('.').pop().length : 2);
							row[field] = parseFloat(row[field], 10);
						}
						break;
				}

				if (typeof row[field]==='undefined' && column.default) {
					row[field] = column.default;
				}
			});

			result.push(row);
		});

		return result;
	}

	/**
	 * dataFormat output readability.
	 * @param  {Array}  data    raw row data.
	 * @return {Array}         formated data
	 */
	dataFormat(data = [], columns = this.columns) {
		let result = [],
			calculate;

		// keep data original and pure
		data.forEach((item, i) => {
			// manual deep copy
			let row = Object.assign({}, item);
		
			result.push(row);

			columns.forEach(column => {
				let field = column.name;
				switch (column.type) {
					case TableUI.TYPE_INT:
						typeof row[field]==='undefined' && (row[field] = 0);

						if (!isNaN(row[field])) {
							row[field] = Math.round(row[field]);
							row[field] = TableUI.thousands(row[field]);
						}
						break;

					case TableUI.TYPE_FLOAT:
						typeof row[field]==='undefined' && (row[field] = 0);
						row[field] = TableUI.thousands(row[field]);
						break;

					case TableUI.TYPE_CURRENCY:
						typeof row[field]==='undefined' && (row[field] = 0);
						row[field] = TableUI.thousands(TableUI.divide(row[field], 1, 2));
						break;

					case TableUI.TYPE_TIMESTAMP:
						typeof row[field]==='undefined' && (row[field] = '');
						row[field] = TableUI.formatTimestamp(row[field], column.format||'YYYY-MM-DD');
						break;

					default :
						row[field] = typeof row[field]==='string' || !isNaN(row[field]) ? row[field] : '';
				}
			});
		});

		return result;
	}

	calculateTotal(rawRows, columns = this.columns) {
		let rawTotal = {},
			result = {},
			total,
			columnsMapping = new Map(),
			totalColumns = [];

		// keep data original and pure
		rawRows.forEach((row, i) => {
			columns.forEach(column => {
				let name = column.name,
					cloneColumn,
					columnTotalType;

				columnTotalType = typeof column.total;
				if (columnTotalType !== 'undefined' && columnTotalType!=='boolean') {
					result[name] = column.total;
				} else {
					switch (column.type) {
						case TableUI.TYPE_INT:
						case TableUI.TYPE_FLOAT:
						case TableUI.TYPE_CURRENCY:
							typeof result[name]==='undefined' && (result[name] = 0);
							result[name] += isNaN(row[name]) ? 0 : row[name];
							break;
						
						default :
							result[name] = '';
							break;
					}
				}

				if (i === 0) {
					// reset some attrs
					cloneColumn = Object.assign({}, column);
					cloneColumn.editable = false;
					cloneColumn.value = null;
					delete cloneColumn.value;

					totalColumns.push(cloneColumn);

					columnsMapping.set(name, column);
				}
			});
		});

		Object.keys(result).forEach(name => {
			let column = columnsMapping.get(name);
			if (typeof column.value === 'function' && column.type!==TableUI.TYPE_HTML) {
				result[name] = column.value(result, columns);
			}
		});

		rawTotal = this.dataProcess([result], totalColumns)[0];
		total = this.dataFormat([rawTotal], totalColumns)[0];

		return {total, rawTotal};
	}

	calculateAverage(rawTotal, rawRows = this.rawRows, columns = this.columns, columnsMapping = this.columnsMapping) {
		let rawAverage = {},
			result = {},
			average = {},
			rowsCount = rawRows.length,
			averageColumns = [];

		if (! rawTotal) {
			let {rawTotal} = this.calculateTotal(rawRows);
			this.rawTotal = rawTotal;
		}

		// keep data original and pure
		Object.keys(rawTotal).forEach(name => {
			let column = columnsMapping.get(name),
				cloneColumn = Object.assign({}, column),
				columnAverageType;

			columnAverageType = typeof column.total;
			if (columnAverageType !== 'undefined' && columnAverageType!=='boolean') {
				result[name] = column.average;
			} else {
				switch (column.type) {
					case TableUI.TYPE_INT:
						cloneColumn.type = TableUI.TYPE_FLOAT;  // keep 1 decimal
						cloneColumn.format = 0.1;
					case TableUI.TYPE_FLOAT:
					case TableUI.TYPE_CURRENCY:
						!result[name] && (result[name] = 0);
						result[name] = rowsCount>0 ? rawTotal[name] / rowsCount : 0;
						break;
					
					default :
						result[name] = '';
						break;
				}
			}

			// reset some attrs
			cloneColumn.editable = false;
			cloneColumn.value = null;
			delete cloneColumn.value;

			averageColumns.push(cloneColumn);
		});

		Object.keys(result).forEach(name => {
			let column = columnsMapping.get(name);
			if (typeof column.value === 'function' && column.type!==TableUI.TYPE_HTML) {
				result[name] = column.value(result, columns);
			}
		});

		rawAverage = this.dataProcess([result], averageColumns)[0];
		average = this.dataFormat([rawAverage], averageColumns)[0];

		return {average, rawAverage};
	}

	getTable() {
		return this.table;
	}

	getRowByIndex(rowIndex) {
		let collection = this.table.tBodies[0];

		return collection && collection.rows.length>rowIndex ? collection.rows[rowIndex] : null;
	}

	getRowById(rowId) {
		let result = null;

		Array.from(this.table.tBodies[0].rows).find(row => {
			if (row.getAttribute('data-row-id') == rowId) {
				result = row;
				return true;
			}
		});

		return result;
	}

	/**
	 * getCell
	 * @param  {[type]} collectionType thead|tbody|tfoot
	 * @param  {[type]} rowIndex    [description]
	 * @param  {[type]} columnIndex [description]
	 * @return {[type]}             [description]
	 */
	getCell(collectionType, rowIndex, columnIndex) {
		let collection,
			result = null;

		collection = this.table[{
				'thead': 'tHead',
				'tfoot': 'tFoot',
				'tbody': 'tBodies'
			}[collectionType]];
		collection.length>0 && (collection = collection[0]);

		if (collection && collection.rows.length > rowIndex && collection.rows[rowIndex].cells.length > columnIndex) {
			result = collection.rows[rowIndex].cells[columnIndex];
		}
		return result;

		return this.table.rows[rowIndex].cells[columnIndex];
	}

	getTheadCell(rowIndex, columnIndex) {
		return this.getCell('thead', rowIndex, columnIndex);
	}

	getTfootCell(rowIndex, columnIndex) {
		return this.getCell('tfoot', rowIndex, columnIndex);
	}

	getTbodyCell(rowIndex, columnIndex) {
		return this.getCell('tbody', rowIndex, columnIndex);
	}

	setCellAttrs(cell, attrs) {
		if (cell) {
			for (const [attr, value] of Object.entries(attrs)) {
				cell.setAttribute(attr, value);
			}
		}
	}

	/**
	 * add row to tbody
	 * @param {[type]} row row config
	 */
	addRow(row) {
		// @todo recalculate total & average, same as updateRow()
		let proceededRows,
			formatedRows,
			tbody,
			newRow;

		// update internel data
		proceededRows = this.dataProcess([row]);
		this.rawRows.push(proceededRows[0]);

		formatedRows = this.dataFormat(proceededRows);
		this.rows.push(formatedRows[0]);

		tbody = this.table.tBodies[0];
		newRow = tbody.insertRow(tbody.rows.length);
		newRow.innerHTML = this.getTbodyRowContent(formatedRows[0], this.columnsMapping);

		// @todo 视觉反馈
		
		return newRow;
	}

	/**
	 * update row of tbody by index
	 * @param  {[type]} rowOrIndex  TR row element or rowIndex
	 * @param  {Object} row      [description]
	 * @return {[type]}          [description]
	 */
	updateRow(rowOrIndex, row = {}) {
		let tbody,
			proceededRows,
			formatedRows,
			replacedRow,
			rowIndex,
			rowId,
			targetRow,
			result = false;

		if (rowOrIndex.nodeType === 1) {
			rowIndex = rowOrIndex.sectionRowIndex;
			targetRow = rowOrIndex;
		}

		// if row exist
		tbody = this.table.tBodies[0];
		if (tbody && tbody.rows.length > rowIndex) {
			// update internel data, partion update
			proceededRows = this.dataProcess([Object.assign(this.rawRows[rowIndex], row)])[0];
			Object.assign(this.rawRows[rowIndex], proceededRows);
			
			formatedRows = this.dataFormat([proceededRows])[0];
			Object.assign(this.rows[rowIndex], formatedRows[0]);

			// replace old row with new one
			!targetRow && (targetRow = this.getRowByIndex(rowIndex));
			rowId = targetRow.getAttribute('data-row-id');

			tbody.deleteRow(rowIndex);
			replacedRow = tbody.insertRow(rowIndex);
			replacedRow.innerHTML = this.getTbodyRowContent(this.rows[rowIndex], this.columnsMapping);
			rowId && replacedRow.setAttribute('data-row-id', rowId);

			result = replacedRow;
		}

		return result;
	}

	removeRow(elementTdOrTr) {
		let rowIndex,
			tagName = (elementTdOrTr.tagName||'').toUpperCase();

		switch (tagName) {
			case 'TD' :
			case 'TH' :
				rowIndex = elementTdOrTr.parentNode.rowIndex;
				break;
			case 'TR' :
				rowIndex = elementTdOrTr.rowIndex;
				break;
		}

		this.table.deleteRow(rowIndex);
	}

	removeCell(cell) {
		cell && cell.parentNode.removeChild(cell);
	}

	getColumnIndexByName(name) {
		let index;

		index = this.columns.findIndex(column => {
			return column.name == name;
		});

		return index;
	}

	/**
	 * [mergeCells description]
	 * @param  {[type]} collectionType thead|tfoot|tbody
	 * @param  {[type]} rules       [description]
	 * @return {[type]}             [description]
	 */
	mergeCells(collectionType, rules) {
		// C(rules[0][0][1]);

		// rules.sort((a, b) => {
		// 	console.log(11111, a, b)
		// 	return a[0][1] >= b[0][0] ? 1 : -1;
		// });
// if (collectionType=='tbody') debugger;
		// C(rules[0][0][1]);
		// add colspan/rowspan, then remove redundance cells.
		(rules||[]).forEach((rectRule, index) => {
			let rowspan, colspan,
				panAttrs = {},
				[start, end] = rectRule,
				container,
				convertToIndex;

			// convert column name to index
			convertToIndex = arr => {
				arr.forEach((v, i) => {
					isNaN(v) && typeof v==='string' && (arr[i] = this.getColumnIndexByName(v));
				});
			};

			convertToIndex(start);
			convertToIndex(end);

			rowspan = end[0] - start[0];
			colspan = end[1] - start[1];

			rowspan>0 && (panAttrs.rowspan = rowspan + 1);
			colspan>0 && (panAttrs.colspan = colspan + 1);

			this.setCellAttrs(this.getCell(collectionType, start[0], start[1]), panAttrs);

			for (let i=end[0]; i>=start[0]; i--) {
				for (let j=end[1]; j>=start[1]; j--) {
					// keep the top left cell
					if (i===start[0] && j===start[1]) {
						continue;
					}
					this.removeCell(this.getCell(collectionType, i, j));
				}
			}
		});
	}

	getRowData(cell) {
		let {rowIndex} = TableUI.getIndex(cell);

		return this.rawRows[rowIndex];
	}

	// only table delegate
	on(eventName, callback) {
		this.table.addEventListener('click', function(event){
			switch (eventName) {
				case 'clickcell' :
					callback.call(event.target, event)
					break;
			}
		});
	}
}

// class property not implement yet.
TableUI.TYPE_INT		= 'int';
TableUI.TYPE_FLOAT		= 'float';
TableUI.TYPE_CURRENCY	= 'currency';
TableUI.TYPE_DATE		= 'date';
TableUI.TYPE_TIMESTAMP	= 'timestamp';
TableUI.TYPE_STRING		= 'string';
TableUI.TYPE_PERCENT	= 'percent';
TableUI.TYPE_HTML		= 'html',

/**
 * enhance console.log
 * 1. auto console.table
 * 2. auto get class name @todo
 * 3. inherit code line @todo
 * 4. break variable quote
 */
function C() {
	let result = [],
		outputTable = false,
		isPureObject,
		output = [];

	isPureObject = obj => obj && typeof obj==='object' && obj.toString()==='[object Object]';

	// try show in table, if meet the same struct.
	if (arguments.length === 1) {
		if (Array.isArray(arguments[0]) && arguments[0].length>0) {
			if (isPureObject(arguments[0][0])) {
				if (arguments[0].length === 1 || Object.keys(arguments[0][0]).join(',')===Object.keys(arguments[0][1]).join(',')) {
					outputTable = true;
				}
			}
		}
	}

	// break variable quote
	Array.from(arguments).forEach(item => {
		if (isPureObject(item)) {
			output.push(JSON.stringify(item, undefined, 2));
		} else {
			output.push(item);
		}
	});

	console[outputTable ? 'table' : 'log'].apply(null, output);
}
