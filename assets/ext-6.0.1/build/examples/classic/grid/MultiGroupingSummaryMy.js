/**
 * This feature adds an aggregate summary row at the bottom of each group that is provided
 * by the {@link Ext.grid.feature.Grouping} feature. There are two aspects to the summary:
 *
 * ## Calculation
 *
 * The summary value needs to be calculated for each column in the grid. This is controlled
 * by the summaryType option specified on the column. There are several built in summary types,
 * which can be specified as a string on the column configuration. These call underlying methods
 * on the store:
 *
 *  - {@link Ext.data.Store#count count}
 *  - {@link Ext.data.Store#sum sum}
 *  - {@link Ext.data.Store#min min}
 *  - {@link Ext.data.Store#max max}
 *  - {@link Ext.data.Store#average average}
 *
 * Alternatively, the summaryType can be a function definition. If this is the case,
 * the function is called with an array of records to calculate the summary value.
 *
 * ## Rendering
 *
 * Similar to a column, the summary also supports a summaryRenderer function. This
 * summaryRenderer is called before displaying a value. The function is optional, if
 * not specified the default calculated value is shown. The summaryRenderer is called with:
 *
 *  - value {Object} - The calculated value.
 *  - summaryData {Object} - Contains all raw summary values for the row.
 *  - field {String} - The name of the field we are calculating
 *
 * ## Example Usage
 *
 *     @example
 *     Ext.define('TestResult', {
 *         extend: 'Ext.data.Model',
 *         fields: ['student', 'subject', {
 *             name: 'mark',
 *             type: 'int'
 *         }]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         width: 200,
 *         height: 240,
 *         renderTo: document.body,
 *         features: [{
 *             groupHeaderTpl: 'Subject: {name}',
 *             ftype: 'groupingsummary'
 *         }],
 *         store: {
 *             model: 'TestResult',
 *             groupField: 'subject',
 *             data: [{
 *                 student: 'Student 1',
 *                 subject: 'Math',
 *                 mark: 84
 *             },{
 *                 student: 'Student 1',
 *                 subject: 'Science',
 *                 mark: 72
 *             },{
 *                 student: 'Student 2',
 *                 subject: 'Math',
 *                 mark: 96
 *             },{
 *                 student: 'Student 2',
 *                 subject: 'Science',
 *                 mark: 68
 *             }]
 *         },
 *         columns: [{
 *             dataIndex: 'student',
 *             text: 'Name',
 *             summaryType: 'count',
 *             summaryRenderer: function(value){
 *                 return Ext.String.format('{0} student{1}', value, value !== 1 ? 's' : '');
 *             }
 *         }, {
 *             dataIndex: 'mark',
 *             text: 'Mark',
 *             summaryType: 'average'
 *         }]
 *     });
 */
 
 
 
 
 /**
 * GroupingSummary with TotalRow for Ext 4.0.7
 *
 * @author Mcaveti
 * @version 0.5
 * For Ext 4.0.7
 * 
 * This Extension adds a total summary row at the bottom of the view or at the last group
 * and adds a new property for the columns and GroupingSummary class.
 *
 * ## Example Usage
 *
 *  features: [
 *      {
 *          ftype: 'groupingsummary',       // this for example - not new property
 *          totalSummary: 'fixed',          // Can be: 'fixed', true, false. Default: false
 *          totalSummaryTopLine: true,      // Default: true
 *          totalSummaryColumnLines: true,  // Default: false
 *      }
 *  ]
 *
 *  columns: [
 *      {
 *          totalSummaryType: 'sum',        // Can be any summaryType. Default: summaryType
 *          totalSummaryText: 'Total:',     // Can be any text or Html
 *          summaryText: 'Total of group:', // Can be any text or Html
 *      }
 *  ]
 */
 
 
 
 
Ext.define('Ext.ux.grid.feature.MultiGroupingSummaryMy', {

    /* Begin Definitions */

    extend: 'Ext.ux.grid.feature.MultiGrouping',

    alias: 'feature.multigroupingsummarymy',

    mixins: {
        summary: 'Ext.grid.feature.AbstractSummary'
    },

    /* End Definitions */

    init: function() {
        this.mixins.summary.init.call(this);
    },

   /**
    * Modifies the row template to include the summary row.
    * @private
    * @return {String} The modified template
    */

   getFeatureTpl: function() {
        var tpl = this.callParent(arguments);

        if (this.showSummaryRow) {
            // lop off the end </tpl> so we can attach it
            tpl = tpl.replace('</tpl>', '');
            tpl += '{[this.printSummaryRowMy(xindex)]}</tpl>';
        }
        return tpl;
    },
		
    /**
     * Gets any fragments needed for the template.
     * @private
     * @return {Object} The fragments
     */
    getFragmentTpl: function() {
        var me = this,
            fragments = me.callParent();

        Ext.apply(fragments, me.getSummaryFragments());
        if (me.showSummaryRow) {
            // this gets called before render, so we'll setup the data here.
            // me.summaryGroups = me.view.store.getGroups();
            me.summaryGroups = me.flattenGroups(me.view.store.getGroupData(false));
            me.summaryData = me.generateSummaryData();
            me.TotalSummaryData = me.generateTotalSummaryData(); // fix for total row
        }
        return fragments;
    },

	getSummaryFragments: function(){
		var fragments = {};
		if (this.showSummaryRow) {
			Ext.apply(fragments, {
				printSummaryRowMy: Ext.bind(this.printSummaryRowMy, this)
			});
		}
		return fragments;
	},
	
    printSummaryRowMy: function(index){
        var inner = this.view.getTableChunker().metaRowTpl.join(''),
            prefix = Ext.baseCSSPrefix;
        
        if(this.summaryGroups[index - 1].depth == 0) {
            inner = inner.replace(prefix + 'grid-row', prefix + 'grid-row-summary');
        } else {
            inner = inner.replace(prefix + 'grid-row', prefix + 'grid-row-summary ' + prefix+'grid-group-collapsed');
        }
        inner = inner.replace('{{id}}', '{gridSummaryValue}');
        inner = inner.replace(this.nestedIdRe, '{id$1}');  
        inner = inner.replace('{[this.embedRowCls()]}', '{rowCls}');
        inner = inner.replace('{[this.embedRowAttr()]}', "{rowAttr}"+" id='summary-"+this.getGroupHeaderId(this.summaryGroups[index - 1].name)+"'");
        inner = Ext.create('Ext.XTemplate', inner, {
            firstOrLastCls: Ext.view.TableChunker.firstOrLastCls
        });


// print total row

        if (this.summaryGroups.length == index && this.totalSummary) {
            var totalInner = this.view.getTableChunker().metaRowTpl.join('');

            totalInner = totalInner.replace(prefix + 'grid-row', prefix + 'grid-row-totalsummary');
            totalInner = totalInner.replace('{{id}}', '{gridSummaryValue}');
            totalInner = totalInner.replace(this.nestedIdRe, '{id$1}');
            totalInner = totalInner.replace('{[this.embedRowCls()]}', '{rowCls}');
            totalInner = totalInner.replace('{[this.embedRowAttr()]}', '{rowAttr}');
            totalInner = totalInner.replace('{id-tdAttr}', '{id-tdAttr}style="font-weight: bold;"');
            if (this.totalSummaryTopLine || this.totalSummaryTopLine == undefined) totalInner = totalInner.replace('{id-tdAttr}style="', '{id-tdAttr}style="border-top: 1px solid #BCB1B0;');
            if (this.totalSummaryColumnLines) totalInner = totalInner.replace('{id-tdAttr}style="', '{id-tdAttr}style="border-right: 1px solid #BCB1B0;');

            if (this.totalSummary == 'fixed') {
                var rowID = this.view.id + "-totalsummaryrow",
                    cols = this.getPrintTotalData()

                totalInner = totalInner.replace('{id-tdAttr}style="', '{id-tdAttr}style="width:{width}px;');
                totalInner = Ext.create('Ext.XTemplate', totalInner, {
                    firstOrLastCls: Ext.view.TableChunker.firstOrLastCls
                });

                fixedSummaryRow = this.view.fixedSummaryRow = document.createElement('table');
                fixedSummaryRow.className = 'x-component x-grid-view x-component-default x-unselectable x-fit-item x-grid-row-totalsummary';
                fixedSummaryRow.id = rowID;
                fixedSummaryRow.cellspacing = 0;
                fixedSummaryRow.cellpadding = 0;
                fixedSummaryRow.style.borderRight = '2px solid #BCB1B0';
                fixedSummaryRow.style.tableLayout = 'fixed';
                fixedSummaryRow.style.left = '-1px';
                for (i in cols) {
                    if (cols[i].width === 0) cols[i].width = '0px;display:none;';
                }
                fixedSummaryRow.innerHTML = totalInner.applyTemplate({
                    columns: cols
                });

                if (!this.view.refreshCount) this.view.refreshCount = 0;
                if (!this.view.EWA) {
                    this.view.EWA = true;

                    Ext.util.CSS.createStyleSheet(".x-grid-row-totalsummary {background-color:#d3e1f1;color:blue;}", 'x-grid-row-totalsummary');

                    function Do(ct, c, w, ev) {
                        var row = Ext.get(rowID).dom;
                        row.style.width = ct.view.el.dom.children[0].clientWidth;
                        var tr = row.lastChild.lastChild;
                        var td = getElementsByClass('x-grid-cell-' + c.id, tr)[0].style;
                        switch (ev) {
                            case 'r': td.width = w + 'px'; break;
                            case 's': td.display = ''; td.width = c.width + 'px'; break;
                            case 'h': td.display = 'none'; row.style.height = row.offsetHeight + 'px'; break;
                        }
                    }

                    var id = this.view.el.dom.parentNode.id.replace('-body', ''),
                    grid = Ext.getCmp(id);
                    grid.on('columnresize', function (ct, column, width) {
                        Do(ct, column, width, 'r');
                    })
                    grid.on('columnshow', function (ct, column, width) {
                        Do(ct, column, '', 's');
                    })
                    grid.on('columnhide', function (ct, column) {
                        Do(ct, column, '', 'h');
                    })
                    grid.view.on('refresh', function () {
                        if (Ext.get(rowID)) Ext.get(rowID).destroy();
                        this.el.dom.appendChild(this.fixedSummaryRow);
                        var me = this;
                        if (!me.wasrefreshed) {
                            setTimeout(function () {
                                me.wasrefreshed = true;
                                me.fireEvent('refresh');
                            }, 12)
                        }
                        if (this.refreshCount != 3) this.refreshCount += 1;
                        this.fireEvent('resize');
                    })
                    this.view.on('resize', function () {
                        var gridwidth = this.el.dom.children[0].clientWidth,
                        row = Ext.get(rowID);
                        row.dom.style.width = gridwidth + 'px';
                        if (this.refreshCount == 3 && !Ext.isOpera) row.dom.style.left = '';
                        var dom = this.el.dom,
                        totalsummary = dom.lastChild;
                        if (totalsummary.summary === "") {
                            var top = dom.clientHeight - dom.children[0].clientHeight - dom.children[1].clientHeight + dom.scrollTop;
                            totalsummary.style.top = top + 'px';
                        }
                        this.Top = top;
                    })
                    this.view.on('groupcollapse', function () {
                        this.fireEvent('resize');
                    })
                    this.view.on('groupexpand', function () {
                        this.fireEvent('resize');
                    })
                }
                var LastInner = inner.applyTemplate({ columns: this.getPrintData(index) });
                return LastInner + '<tr><td style="height: 22px;"></td></tr>';
            }
            totalInner = Ext.create('Ext.XTemplate', totalInner, {
                firstOrLastCls: Ext.view.TableChunker.firstOrLastCls
            });
            return inner.applyTemplate({ columns: this.getPrintData(index) }) + 
                   totalInner.applyTemplate({ columns: this.getPrintTotalData() });
        }

//  -------



        
        return inner.applyTemplate({
            columns: this.getPrintData(index)
        });
    },	


    /**
     * Gets the data for printing a template row
     * @private
     * @param {Number} index The index in the template
     * @return {Array} The template values
     */
    getPrintData: function(index){
        var me = this,
            columns = me.view.headerCt.getColumnsForTpl(),
            i = 0,
            length = columns.length,
            data = [],
            name = me.summaryGroups[index - 1].name,
            active = me.summaryData[name],
            record,
            activeMy,
            column;

	        for (; i < length; ++i) {
	            column = columns[i];
	            column.gridSummaryValue = this.getColumnValue(column, active);
	            data.push(column);
	        }

        return data;
    },


    getPrintTotalData: function () { // new method for this class
        var me = this,
            columns = me.view.headerCt.getColumnsForTpl(),
            i = 0,
            length = columns.length,
            data = [],
            active = me.TotalSummaryData,
            column;

        for (; i < length; ++i) {
            column = columns[i];
            column.gridSummaryValue = this.getColumnValue(column, active);
            data.push(column);
        }
        return data;
    },
        

    generateTotalSummaryData: function () { // new method for this class
        var me = this,
            data = {},
            store = me.view.store,
            columns = me.view.headerCt.getColumnsForTpl(),
            i = 0,
            length = columns.length,
            fieldData, key, comp;

        for (i = 0, length = columns.length; i < length; ++i) {
            comp = Ext.getCmp(columns[i].id);
            data[comp.id] = comp.totalSummaryText ? comp.totalSummaryText : me.getSummary(store, (comp.totalSummaryType ? comp.totalSummaryType : comp.summaryType), comp.dataIndex, false);
        }
        return data;
    },    

    /**
     * Generates all of the summary data to be used when processing the template
     * @private
     * @return {Object} The summary data
     */
    generateSummaryData: function(){
        var me = this,
            data = {},
            remoteData = {},
            store = me.view.store,
            groupField = this.getGroupField(),
            reader = store.proxy.reader,
            groups = me.summaryGroups,
            columns = me.view.headerCt.getColumnsForTpl(),
            remote,
            i,
            length,
            fieldData,
            root,
            key,
            comp,
            summaryRows,
            s,
            sLen,
            convertedSummaryRow;

        for (i = 0, length = groups.length; i < length; ++i) {
            data[groups[i].name] = {};
        }

        /**
         * @cfg {String} [remoteRoot=undefined]
         * The name of the property which contains the Array of summary objects.
         * It allows to use server-side calculated summaries.
         */
        if (me.remoteRoot && reader.rawData) {
            // reset reader root and rebuild extractors to extract summaries data
            root = reader.root;
            reader.root = me.remoteRoot;
            reader.buildExtractors(true);
            summaryRows = reader.getRoot(reader.rawData);
            sLen      = summaryRows.length;

            // Ensure the Reader has a data conversion function to convert a raw data row into a Record data hash
            if (!reader.convertRecordData) {
                reader.buildExtractors();
            }

            for (s = 0; s < sLen; s++) {
                convertedSummaryRow = {};

                // Convert a raw data row into a Record's hash object using the Reader
                reader.convertRecordData(convertedSummaryRow, summaryRows[s]);
                remoteData[convertedSummaryRow[groupField]] = convertedSummaryRow;
            }

            // restore initial reader configuration
            reader.root = root;
            reader.buildExtractors(true);
        }

        for (i = 0, length = columns.length; i < length; ++i) {
            comp = Ext.getCmp(columns[i].id);
            fieldData = me.getSummary(store, comp.summaryType, comp.dataIndex, true);

            for (key in fieldData) {
                if (fieldData.hasOwnProperty(key)) {
                    data[key][comp.id] = fieldData[key];
                }
            }

            for (key in remoteData) {
                if (remoteData.hasOwnProperty(key)) {
                    remote = remoteData[key][comp.dataIndex];
                    if (remote !== undefined && data[key] !== undefined) {
                        data[key][comp.id] = remote;
                    }
                }
            }
        }
        return data;
    }
});
