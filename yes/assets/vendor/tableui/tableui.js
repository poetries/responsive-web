'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * TableUI
 *
 */
var TableUI = function () {
	function TableUI() {
		var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, TableUI);

		if (!config.columns) {
			throw TableUI.name + ': call arguments error.';
		}

		this.config = config;
		this.table = null; // instance

		if (config.id) {
			var oldElement = document.getElementById(config.id);
			oldElement && oldElement.parentNode.removeChild(oldElement);
		}

		// transform array to map for search
		{
			var mapping = new Map();
			config.columns.forEach(function (column, i) {
				mapping.set(column.name, column);
			});
			this.columnsMapping = mapping;
		}
		this.columns = this.config.columns;

		// always keep original numeric data.
		this.rawRows = this.dataProcess(config.rows);
		this.rows = this.dataFormat(this.rawRows);

		this.tfoot = [];
		if (this.rawRows.length > 0) {
			if (config.showTotal) {
				var result = this.calculateTotal(this.rawRows);
				this.rawTotal = result.rawTotal;
				this.total = result.total;

				this.tfoot.push(this.total);
			}
			if (config.showAverage) {
				var _result = this.calculateAverage(this.rawTotal, this.rawRows);
				this.rawAverage = _result.rawAverage;
				this.average = _result.average;

				this.tfoot.push(this.average);
			}
		}

		if (config.showPagination) {}
		// @todo
		// this.tfoot.push();


		// generate HTML dom
		this.content = this.genSkeleton();
		TableUI.setStyleSheet(this.getDefaultCSS());
		this.render(this.content);

		// merge rows and columns on dom
		this.config.mergeThead && this.mergeCells('thead', this.config.mergeThead);
		this.config.mergeTfoot && this.mergeCells('tfoot', this.config.mergeTfoot);
		this.config.mergeTbody && this.mergeCells('tbody', this.config.mergeTbody);

		this.initEvents();
	}

	// @todo to make effection


	_createClass(TableUI, [{
		key: 'setConfig',
		value: function setConfig(config) {
			Object.assign(this.config, config);
		}
	}, {
		key: 'genSkeleton',
		value: function genSkeleton() {
			var content = [];
			var _config = this.config,
			    id = _config.id,
			    className = _config.className;


			content.push('<table id="' + (this.config.id || '') + '" width="' + (this.config.width || '100%') + '" class="tableui">');
			this.config.caption && content.push('<caption>' + this.config.caption + '</caption>');
			content.push(this.getTheadContent(this.columns));
			content.push(this.getTfootContent(this.tfoot, this.columns));
			content.push(this.getTbodyContent(this.rows, this.columns, this.config));
			content.push('</table>');

			return content.join("\n");
		}
	}, {
		key: 'getTheadContent',
		value: function getTheadContent() {
			var columns = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			var content = [],
			    colContent = [];

			content.push('<thead class="tableui__thead">');
			content.push('<tr class="tableui__thead-tr">');
			colContent.push('<colgroup>');
			columns.forEach(function (column) {
				content.push(['<th class="tableui__thead-th', (column.className || '') + '"', 'style="width:' + (column.width || 'auto') + '"', '' + (column.orderable ? 'orderable="true"' : ''), (column.hint ? 'title="' + column.hint + '"' : '') + '>', '' + column.label, '<div class="tableui__dragable--width"></div>', '</th>'].join(' '));
				colContent.push('<col class="tableui__col tableui__col--' + column.name + '">');
			});
			content.push('</tr>');
			content.push('</thead>');
			colContent.push('</colgroup>');

			return colContent.concat(content).join("\n");
		}
	}, {
		key: 'getTfootContent',
		value: function getTfootContent() {
			var tfootRows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
			var columns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

			var content = [];

			content.push('<tfoot class="tableui__tfoot">');
			tfootRows.forEach(function (row) {
				content.push('<tr class="tableui__tfoot-tr">');
				columns.forEach(function (column) {
					content.push(['<th class="tableui__tfoot-th', '' + (column.type ? 'tableui__cell--' + column.type : ''), (column.className || '') + '">' + row[column.name] + '</th>'].join(' '));
				});
				content.push('</tr>');
			});
			content.push('</tfoot>');

			return content.join("\n");
		}
	}, {
		key: 'getTbodyContent',
		value: function getTbodyContent() {
			var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			var _this = this;

			var columns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
			var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

			var content = [];

			content.push('<tbody class="tableui__tbody">');
			rows.forEach(function (row) {
				content.push(_this.getTbodyRowContent(row, columns));
			});
			content.push('</tbody>');

			return content.join("\n");
		}
	}, {
		key: 'getTbodyRowContent',
		value: function getTbodyRowContent() {
			var row = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var columns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
			var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config;

			var content = [],
			    rowId = void 0;

			typeof config.rowId === 'function' && (rowId = config.rowId(row, columns));

			content.push('<tr class="tableui__tbody-tr" data-row-id="' + (rowId || '') + '">');
			columns.forEach(function (column) {
				content.push(['<td class="tableui__tbody-td', '' + (column.type ? 'tableui__cell--' + column.type : ''), '' + (column.editable ? 'tableui__editable' : ''), (column.className || '') + '"', '' + (column.style ? 'style="' + column.style + '"' : ''), (column.editable ? 'editable="true"' : '') + '>' + row[column.name] + '</td>'].join(' '));
			});
			content.push('</tr>');

			return content.join("\n");
		}
	}, {
		key: 'getDefaultCSS',
		value: function getDefaultCSS() {
			return '\n.tableui,\n.tableui__thead-th,\n.tableui__tfoot-th,\n.tableui__tbody-th,\n.tableui__thead-td,\n.tableui__tfoot-td,\n.tableui__tbody-td{border:1px solid #ccc;border-collapse:collapse;padding:5px 5px;word-break:break-all;}\n\n.tableui{table-layout:fixed}\n.tableui__thead{background-color: #e4e7ec}\n.tableui__thead-tr{}\n.tableui__thead-th{position:relative;text-align:center;}\n.tableui__thead-td{}\n.tableui__tbody{}\n.tableui__tbody-tr{}\n.tableui__tbody-td{}\n.tableui__tbody-th{}\n.tableui__tfoot{background: #efefef}\n.tableui__tfoot-tr{}\n.tableui__tfoot-td{}\n.tableui__tfoot-th{}\n\n.tableui__tbody-td,\n.tableui__tbody-th,\n.tableui__tfoot-td,\n.tableui__tfoot-th{' + (this.config.nowrap ? 'text-overflow:ellipsis;overflow:hidden;white-space:nowrap;max-width:0;' : '') + '}\n\n.tableui__cell--date,\n.tableui__cell--timestamp,\n.tableui__text--center{text-align:center;}\n\n.tableui__cell--string,\n.tableui__text--left{text-align:left;}\n\n.tableui__cell--numeric,\n.tableui__cell--int,\n.tableui__cell--float,\n.tableui__cell--percent,\n.tableui__cell--currency,\n.tableui__text--right{text-align:right;text-overflow:inherit}\n\n.tableui__cell--currency:before{content:"' + (this.config.currency || '¥') + '";font-weight:300;}\n\n.tableui__editable{}\n.tableui__editable:after{content:\'\u21B5\';color:#aaa;font-family:arial;}\n\n.tableui__dragable--width{position:absolute;top:0;bottom:0;right:0;width:5px;cursor:col-resize;}\n';
		}
	}, {
		key: 'render',
		value: function render(content) {
			var docContent = new DOMParser().parseFromString(content, 'text/html');
			this.table = docContent.body.firstChild;
			this.config.appendTo.appendChild(this.table);
			docContent = null;
		}
	}, {
		key: 'initEvents',
		value: function initEvents() {
			var _this2 = this;

			this.config.columns.forEach(function (item, i) {
				if (item.orderable) {
					_this2.on('clickcell', function (event) {
						var indexes = TableUI.getIndex(this);
						if (indexes.rowIndex === 0 && indexes.columnIndex == i) {
							console.log('orderable', TableUI.getIndex(this));
						}
					});
				}
				if (item.editable) {
					_this2.on('clickcell', function (event) {
						if (this.parentNode.parentNode.tagName.toUpperCase() != 'TBODY' || this.cellIndex != i) {
							return false;
						}
						var oldValue = this.innerHTML.trim();

						this.setAttribute('contenteditable', true);
						this.focus();

						this.addEventListener('blur', function focusContenteditableCell() {
							this.removeEventListener('blur', focusContenteditableCell);

							var newValue = this.innerHTML.trim();

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
			var currentMouseEventTarget = null,
			    currentMouseEventStartOffset = void 0;

			// @todo save width for next time
			Array.from(this.table.tHead.rows[0].cells).forEach(function (column) {
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
	}, {
		key: 'dataProcess',


		/**
   * dataProcess for original data
   * @param  {Array}  data    raw row data.
   * @return {[type]}         original data
   */
		value: function dataProcess() {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
			var columns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.columns;

			var result = [];

			// keep data original and pure
			data.forEach(function (item, i) {
				// manual deep copy
				var row = Object.assign({}, item);

				columns.forEach(function (column, i) {
					var field = column.name;

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
								row[field] = TableUI.divide(row[field], 1, column.format > 0 ? column.format.toString().split('.').pop().length : 2);
								row[field] = parseFloat(row[field], 10);
							}
							break;
					}

					if (typeof row[field] === 'undefined' && column.default) {
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

	}, {
		key: 'dataFormat',
		value: function dataFormat() {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
			var columns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.columns;

			var result = [],
			    calculate = void 0;

			// keep data original and pure
			data.forEach(function (item, i) {
				// manual deep copy
				var row = Object.assign({}, item);

				result.push(row);

				columns.forEach(function (column) {
					var field = column.name;
					switch (column.type) {
						case TableUI.TYPE_INT:
							typeof row[field] === 'undefined' && (row[field] = 0);

							if (!isNaN(row[field])) {
								row[field] = Math.round(row[field]);
								row[field] = TableUI.thousands(row[field]);
							}
							break;

						case TableUI.TYPE_FLOAT:
							typeof row[field] === 'undefined' && (row[field] = 0);
							row[field] = TableUI.thousands(row[field]);
							break;

						case TableUI.TYPE_CURRENCY:
							typeof row[field] === 'undefined' && (row[field] = 0);
							row[field] = TableUI.thousands(TableUI.divide(row[field], 1, 2));
							break;

						case TableUI.TYPE_TIMESTAMP:
							typeof row[field] === 'undefined' && (row[field] = '');
							row[field] = TableUI.formatTimestamp(row[field], column.format || 'YYYY-MM-DD');
							break;

						default:
							row[field] = typeof row[field] === 'string' || !isNaN(row[field]) ? row[field] : '';
					}
				});
			});

			return result;
		}
	}, {
		key: 'calculateTotal',
		value: function calculateTotal(rawRows) {
			var columns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.columns;

			var rawTotal = {},
			    result = {},
			    total = void 0,
			    columnsMapping = new Map(),
			    totalColumns = [];

			// keep data original and pure
			rawRows.forEach(function (row, i) {
				columns.forEach(function (column) {
					var name = column.name,
					    cloneColumn = void 0,
					    columnTotalType = void 0;

					columnTotalType = _typeof(column.total);
					if (columnTotalType !== 'undefined' && columnTotalType !== 'boolean') {
						result[name] = column.total;
					} else {
						switch (column.type) {
							case TableUI.TYPE_INT:
							case TableUI.TYPE_FLOAT:
							case TableUI.TYPE_CURRENCY:
								typeof result[name] === 'undefined' && (result[name] = 0);
								result[name] += isNaN(row[name]) ? 0 : row[name];
								break;

							default:
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

			Object.keys(result).forEach(function (name) {
				var column = columnsMapping.get(name);
				if (typeof column.value === 'function' && column.type !== TableUI.TYPE_HTML) {
					result[name] = column.value(result, columns);
				}
			});

			rawTotal = this.dataProcess([result], totalColumns)[0];
			total = this.dataFormat([rawTotal], totalColumns)[0];

			return { total: total, rawTotal: rawTotal };
		}
	}, {
		key: 'calculateAverage',
		value: function calculateAverage(rawTotal) {
			var rawRows = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.rawRows;
			var columns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.columns;
			var columnsMapping = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.columnsMapping;

			var rawAverage = {},
			    result = {},
			    average = {},
			    rowsCount = rawRows.length,
			    averageColumns = [];

			if (!rawTotal) {
				var _calculateTotal = this.calculateTotal(rawRows),
				    _rawTotal = _calculateTotal.rawTotal;

				this.rawTotal = _rawTotal;
			}

			// keep data original and pure
			Object.keys(rawTotal).forEach(function (name) {
				var column = columnsMapping.get(name),
				    cloneColumn = Object.assign({}, column),
				    columnAverageType = void 0;

				columnAverageType = _typeof(column.total);
				if (columnAverageType !== 'undefined' && columnAverageType !== 'boolean') {
					result[name] = column.average;
				} else {
					switch (column.type) {
						case TableUI.TYPE_INT:
							cloneColumn.type = TableUI.TYPE_FLOAT; // keep 1 decimal
							cloneColumn.format = 0.1;
						case TableUI.TYPE_FLOAT:
						case TableUI.TYPE_CURRENCY:
							!result[name] && (result[name] = 0);
							result[name] = rowsCount > 0 ? rawTotal[name] / rowsCount : 0;
							break;

						default:
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

			Object.keys(result).forEach(function (name) {
				var column = columnsMapping.get(name);
				if (typeof column.value === 'function' && column.type !== TableUI.TYPE_HTML) {
					result[name] = column.value(result, columns);
				}
			});

			rawAverage = this.dataProcess([result], averageColumns)[0];
			average = this.dataFormat([rawAverage], averageColumns)[0];

			return { average: average, rawAverage: rawAverage };
		}
	}, {
		key: 'getTable',
		value: function getTable() {
			return this.table;
		}
	}, {
		key: 'getRowByIndex',
		value: function getRowByIndex(rowIndex) {
			var collection = this.table.tBodies[0];

			return collection && collection.rows.length > rowIndex ? collection.rows[rowIndex] : null;
		}
	}, {
		key: 'getRowById',
		value: function getRowById(rowId) {
			var result = null;

			Array.from(this.table.tBodies[0].rows).find(function (row) {
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

	}, {
		key: 'getCell',
		value: function getCell(collectionType, rowIndex, columnIndex) {
			var collection = void 0,
			    result = null;

			collection = this.table[{
				'thead': 'tHead',
				'tfoot': 'tFoot',
				'tbody': 'tBodies'
			}[collectionType]];
			collection.length > 0 && (collection = collection[0]);

			if (collection && collection.rows.length > rowIndex && collection.rows[rowIndex].cells.length > columnIndex) {
				result = collection.rows[rowIndex].cells[columnIndex];
			}
			return result;

			return this.table.rows[rowIndex].cells[columnIndex];
		}
	}, {
		key: 'getTheadCell',
		value: function getTheadCell(rowIndex, columnIndex) {
			return this.getCell('thead', rowIndex, columnIndex);
		}
	}, {
		key: 'getTfootCell',
		value: function getTfootCell(rowIndex, columnIndex) {
			return this.getCell('tfoot', rowIndex, columnIndex);
		}
	}, {
		key: 'getTbodyCell',
		value: function getTbodyCell(rowIndex, columnIndex) {
			return this.getCell('tbody', rowIndex, columnIndex);
		}
	}, {
		key: 'setCellAttrs',
		value: function setCellAttrs(cell, attrs) {
			if (cell) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = Object.entries(attrs)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var _step$value = _slicedToArray(_step.value, 2),
						    attr = _step$value[0],
						    value = _step$value[1];

						cell.setAttribute(attr, value);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}
		}

		/**
   * add row to tbody
   * @param {[type]} row row config
   */

	}, {
		key: 'addRow',
		value: function addRow(row) {
			// @todo recalculate total & average, same as updateRow()
			var proceededRows = void 0,
			    formatedRows = void 0,
			    tbody = void 0,
			    newRow = void 0;

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

	}, {
		key: 'updateRow',
		value: function updateRow(rowOrIndex) {
			var row = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			var tbody = void 0,
			    proceededRows = void 0,
			    formatedRows = void 0,
			    replacedRow = void 0,
			    rowIndex = void 0,
			    rowId = void 0,
			    targetRow = void 0,
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
	}, {
		key: 'removeRow',
		value: function removeRow(elementTdOrTr) {
			var rowIndex = void 0,
			    tagName = (elementTdOrTr.tagName || '').toUpperCase();

			switch (tagName) {
				case 'TD':
				case 'TH':
					rowIndex = elementTdOrTr.parentNode.rowIndex;
					break;
				case 'TR':
					rowIndex = elementTdOrTr.rowIndex;
					break;
			}

			this.table.deleteRow(rowIndex);
		}
	}, {
		key: 'removeCell',
		value: function removeCell(cell) {
			cell && cell.parentNode.removeChild(cell);
		}
	}, {
		key: 'getColumnIndexByName',
		value: function getColumnIndexByName(name) {
			var index = void 0;

			index = this.columns.findIndex(function (column) {
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

	}, {
		key: 'mergeCells',
		value: function mergeCells(collectionType, rules) {
			var _this3 = this;

			// C(rules[0][0][1]);

			// rules.sort((a, b) => {
			// 	console.log(11111, a, b)
			// 	return a[0][1] >= b[0][0] ? 1 : -1;
			// });
			// if (collectionType=='tbody') debugger;
			// C(rules[0][0][1]);
			// add colspan/rowspan, then remove redundance cells.
			(rules || []).forEach(function (rectRule, index) {
				var rowspan = void 0,
				    colspan = void 0,
				    panAttrs = {},
				    _rectRule = _slicedToArray(rectRule, 2),
				    start = _rectRule[0],
				    end = _rectRule[1],
				    container = void 0,
				    convertToIndex = void 0;

				// convert column name to index
				convertToIndex = function convertToIndex(arr) {
					arr.forEach(function (v, i) {
						isNaN(v) && typeof v === 'string' && (arr[i] = _this3.getColumnIndexByName(v));
					});
				};

				convertToIndex(start);
				convertToIndex(end);

				rowspan = end[0] - start[0];
				colspan = end[1] - start[1];

				rowspan > 0 && (panAttrs.rowspan = rowspan + 1);
				colspan > 0 && (panAttrs.colspan = colspan + 1);

				_this3.setCellAttrs(_this3.getCell(collectionType, start[0], start[1]), panAttrs);

				for (var i = end[0]; i >= start[0]; i--) {
					for (var j = end[1]; j >= start[1]; j--) {
						// keep the top left cell
						if (i === start[0] && j === start[1]) {
							continue;
						}
						_this3.removeCell(_this3.getCell(collectionType, i, j));
					}
				}
			});
		}
	}, {
		key: 'getRowData',
		value: function getRowData(cell) {
			var _TableUI$getIndex = TableUI.getIndex(cell),
			    rowIndex = _TableUI$getIndex.rowIndex;

			return this.rawRows[rowIndex];
		}

		// only table delegate

	}, {
		key: 'on',
		value: function on(eventName, callback) {
			this.table.addEventListener('click', function (event) {
				switch (eventName) {
					case 'clickcell':
						callback.call(event.target, event);
						break;
				}
			});
		}
	}], [{
		key: 'setStyleSheet',
		value: function setStyleSheet(styleContent) {
			var styleElement = void 0;

			styleElement = document.createElement('style');
			styleElement.type = 'text/css';
			if (styleElement.styleSheet) {
				styleElement.styleSheet.cssText = styleContent;
			} else {
				styleElement.appendChild(document.createTextNode(styleContent));
			}

			(document.head || document.getElementsByTagName('head')[0]).appendChild(styleElement);
		}
	}, {
		key: 'getIndex',
		value: function getIndex(tdElement) {
			return {
				rowIndex: tdElement.parentNode.sectionRowIndex,
				columnIndex: tdElement.cellIndex
			};
		}
		// stub data for test/debug

	}, {
		key: 'stubInt',
		value: function stubInt() {
			var upper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
			var lower = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

			return lower + Math.round(Math.random() * (upper - lower));
		}
	}, {
		key: 'stubFloat',
		value: function stubFloat() {
			var upper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '100.00';
			var lower = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.00;

			// '100.00' as string, avoid auto convert to 100.
			var decimal = upper.toString().split('.').pop().length;
			return parseFloat(lower + (Math.random() * (upper - lower)).toFixed(decimal), 10);
		}
	}, {
		key: 'stubTimestamp',
		value: function stubTimestamp() {
			return new Date().getTime() - Math.round(1e10 * Math.random());
		}
	}, {
		key: 'stubString',
		value: function stubString() {
			var pangram = 'The quick brown fox jumps over the lazy dog'.split(' '),
			    start = Math.round(Math.random() * (pangram.length - 1)),
			    maxWordCount = 3;

			return pangram.slice(start, start + (Math.min(maxWordCount, Math.round((pangram.length - start) * Math.random())) || 1)).join(' ');
		}
	}, {
		key: 'multiply',
		value: function multiply(a, b) {
			var decimal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

			return isNaN(a) || isNaN(b) ? '-' : (a * b).toFixed(decimal || 2);
		}
	}, {
		key: 'divide',
		value: function divide(a, b) {
			var decimal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

			return isNaN(a) || isNaN(b) || b === 0 ? '-' : TableUI.multiply(a, 1 / b, decimal);
		}
	}, {
		key: 'percent',
		value: function percent(a, b) {
			var decimal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

			return isNaN(a) || isNaN(b) || b === 0 ? '-' : TableUI.multiply(a, 100 / b, decimal) + '%';
		}
	}, {
		key: 'thousands',
		value: function thousands(a) {
			return isNaN(a) ? a : (a || 0).toString().replace(/^(\d+)((\.\d+)?)$/, function (s, s1, s2) {
				return s1.replace(/\d{1,3}(?=(\d{3})+$)/g, "$&,") + s2;
			});
		}
	}, {
		key: 'formatTimestamp',
		value: function formatTimestamp(timestampInput) {
			var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'YYYY-MM-DD';

			var rules = void 0,
			    timestamp = void 0,
			    date = void 0;

			timestamp = parseInt(timestampInput, 10);
			if (!timestamp || isNaN(timestamp)) {
				return timestampInput;
			}

			// transform s to ms.
			timestamp > 1000000000 && timestamp < 9999999999 && (timestamp = timestamp * 1000);

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

			Object.keys(rules).forEach(function (k) {
				if (new RegExp("(" + k + ")").test(format)) {
					format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? rules[k] : ("00" + rules[k]).substr(("" + rules[k]).length));
				}
			});

			return format;
		}
	}]);

	return TableUI;
}();

// class property not implement yet.


TableUI.TYPE_INT = 'int';
TableUI.TYPE_FLOAT = 'float';
TableUI.TYPE_CURRENCY = 'currency';
TableUI.TYPE_DATE = 'date';
TableUI.TYPE_TIMESTAMP = 'timestamp';
TableUI.TYPE_STRING = 'string';
TableUI.TYPE_PERCENT = 'percent';
TableUI.TYPE_HTML = 'html',

/**
 * enhance console.log
 * 1. auto console.table
 * 2. auto get class name @todo
 * 3. inherit code line @todo
 * 4. break variable quote
 */
function C() {
	var result = [],
	    outputTable = false,
	    isPureObject = void 0,
	    output = [];

	isPureObject = function isPureObject(obj) {
		return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj.toString() === '[object Object]';
	};

	// try show in table, if meet the same struct.
	if (arguments.length === 1) {
		if (Array.isArray(arguments[0]) && arguments[0].length > 0) {
			if (isPureObject(arguments[0][0])) {
				if (arguments[0].length === 1 || Object.keys(arguments[0][0]).join(',') === Object.keys(arguments[0][1]).join(',')) {
					outputTable = true;
				}
			}
		}
	}

	// break variable quote
	Array.from(arguments).forEach(function (item) {
		if (isPureObject(item)) {
			output.push(JSON.stringify(item, undefined, 2));
		} else {
			output.push(item);
		}
	});

	console[outputTable ? 'table' : 'log'].apply(null, output);
};
