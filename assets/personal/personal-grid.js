Ext.Loader.setConfig({ enabled: true });

Ext.require([
    'Ext.grid.*',
    'Ext.data.*'
]);

Ext.define('Task', {
    extend: 'Ext.data.Model',
    idProperty: 'finan_id',
    fields: [
        {name: 'pad_finan_id', type: 'int'},
        {name: 'pad_finan_nombre', type: 'string'},
        {name: 'finan_grupo', type: 'string'},
        {name: 'pad_finan_orden', type: 'float'},
        {name: 'finan_id', type: 'int'},
        {name: 'finan_nombre', type: 'string'},
        {name: 'finan_orden', type: 'float'},
        {name: 'ingreso1', type: 'float'},
        {name: 'ingreso2', type: 'float'}
    ]
});

Ext.onReady(function(){
    var store = Ext.create('Ext.data.Store', {
        model: 'Task',
        //autoLoad: true,
        //autoSync: true,
        remoteSort: true,
        proxy: {
            type: 'ajax',
            url: '/application/indicadores-financieros/json-data',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        },
        sorters: {property: 'due', direction: 'ASC'},
        //groupers: ['finan_grupo', 'pad_finan_nombre']
        groupField: 'pad_finan_nombre'
    });
    
    var grid = Ext.create('Ext.grid.Panel', {
        width: '100%',
        height: 530,
        store: store,
        plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })],
        //columnLines : true,
        selModel: {
            selType: 'cellmodel'
        },
        //dockedItems: [],
        features: [{
            id: 'group',
            ftype: 'groupingsummary',
            groupHeaderTpl: '{name}',
            hideGroupedHeader: true,
            enableGroupingMenu: true
        }, {
            ftype: 'summary',
            dock: 'bottom'
        }],
        columns: [{
            text: '',
            flex: 1,
            sortable: true,
            tdCls: 'task',
            dataIndex: 'finan_nombre',
            hideable: false,
            summaryType: 'count',
            summaryRenderer: function(value, summaryData, dataIndex) {
                return '<b>Total de Ingresos</b>';
            }
        }, {
            hideable: false,
            header: 'Project',
            width: 20,
            sortable: true,
            dataIndex: 'pad_finan_nombre'
        }, {
            header: 'Año 1',
            width: 95,
            sortable: false,
            dataIndex: 'ingreso1',
            summaryType: 'sum',
            align: 'center',
            field: {
                xtype: 'numberfield'
            }
        }, {
            header: 'Año 2',
            width: 95,
            sortable: false,
            dataIndex: 'ingreso2',
            summaryType: 'sum',
            align: 'center',
            field: {
                xtype: 'numberfield'
            }
        }]
    });
    
    grid.on('edit', function(editor,e) {
        // commit the changes right after editing finished
        sum1 = 0; sum2 = 0;
        var stores = grid.getStore();
        stores.each(function(record,index){
            sum1 += record.get('ingreso1')
            sum2 += record.get('ingreso2')
        });
        var stores2 = gridDos.getStore();
        stores2.each(function(record,index){
            sum1 += record.get('ingreso1')
            sum2 += record.get('ingreso2')
        });
        
        Ext.getCmp('ind_deudas_1').setValue(sum1);
        Ext.getCmp('ind_deudas_2').setValue(sum2);
    });
    
    var storeDos = Ext.create('Ext.data.Store', {
        model: 'Task',
        //autoLoad: true,
        remoteSort: true,
        proxy: {
            type: 'ajax',
            url: '/application/indicadores-financieros/json-data-dos',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        },
        sorters: {property: 'due', direction: 'ASC'},
        groupField: 'pad_finan_nombre'
    });

    var gridDos = Ext.create('Ext.grid.Panel', {
        width: '100%',
        height: 600,
        store: storeDos,
        hideHeaders: true,
        plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })],
        //columnLines : true,
        selModel: {
            selType: 'cellmodel'
        },
        features: [{
            id: 'group',
            ftype: 'groupingsummary',
            groupHeaderTpl: '{name}',
            hideGroupedHeader: true,
            enableGroupingMenu: true
        }, {
            ftype: 'summary',
            dock: 'bottom'
        }],
        columns: [{
            text: '',
            flex: 1,
            sortable: true,
            tdCls: 'task',
            dataIndex: 'finan_nombre',
            hideable: false,
            summaryType: 'count',
            summaryRenderer: function(value, summaryData, dataIndex) {
                return '<b>Total de Gastos</b>';
            }
        }, {
            hideable: false,
            header: 'Project',
            width: 20,
            sortable: true,
            dataIndex: 'pad_finan_nombre'
        }, {
            header: '',
            width: 95,
            sortable: false,
            dataIndex: 'ingreso1',
            summaryType: 'sum',
            align: 'center',
            field: {
                xtype: 'numberfield'
            }
        }, {
            header: '',
            width: 95,
            sortable: false,
            //summaryRenderer: Ext.util.Format.usMoney,
            dataIndex: 'ingreso2',
            summaryType: 'sum',
            align: 'center',
            field: {
                xtype: 'numberfield'
            }
        }]
    });
    
    gridDos.on('edit', function(editor,e) {
        ing1 = 0; ing2 = 0;gasto1 = 0; gasto2 = 0;
        libertad1 = 0; libertad2 = 0;
        var stores = grid.getStore();
        stores.each(function(record,index){
            ing1 += record.get('ingreso1');
            ing2 += record.get('ingreso2');
            if(record.get('finan_codigo') == 'grupo-dos') {
                libertad1 += record.get('ingreso1')
                libertad2 += record.get('ingreso2')
            }
        });
        var stores2 = gridDos.getStore();
        stores2.each(function(record,index){
            gasto1 += record.get('ingreso1')
            gasto2 += record.get('ingreso2')
        });
        if(gasto1 > 0){
            Ext.getCmp('ind_deudas_1').setValue(ing1/gasto1);
            Ext.getCmp('ind_riqueza_1').setValue((ing1 - gasto1)/gasto1);
            Ext.getCmp('ind_libertad_1').setValue(libertad1/gasto1);
        }
        if(gasto2 > 0){
            Ext.getCmp('ind_deudas_2').setValue(ing2/gasto2);
            Ext.getCmp('ind_riqueza_2').setValue((ing2 - gasto2)/gasto2);
            Ext.getCmp('ind_libertad_1').setValue(libertad2/gasto1);
        }
    });

    grid.store.load({params:{},
        callback: function(r,options,success) {
            gridDos.store.load({params:{},
                callback: function(r,options,success) {
                    ing1 = 0; ing2 = 0;gasto1 = 0; gasto2 = 0;
                    libertad1 = 0; libertad2 = 0;
                    var stores = grid.getStore();
                    stores.each(function(record,index){
                        ing1 += record.get('ingreso1');
                        ing2 += record.get('ingreso2');
                        if(record.get('finan_codigo') == 'grupo-dos') {
                            libertad1 += record.get('ingreso1')
                            libertad2 += record.get('ingreso2')
                        }
                    });
                    var stores2 = gridDos.getStore();
                    stores2.each(function(record,index){
                        gasto1 += record.get('ingreso1')
                        gasto2 += record.get('ingreso2')
                    });
                    if(gasto1 > 0){
                        Ext.getCmp('ind_deudas_1').setValue(ing1/gasto1);
                        Ext.getCmp('ind_riqueza_1').setValue((ing1 - gasto1)/gasto1);
                        Ext.getCmp('ind_libertad_1').setValue(libertad1/gasto1);
                    }
                    if(gasto2 > 0){
                        Ext.getCmp('ind_deudas_2').setValue(ing2/gasto2);
                        Ext.getCmp('ind_riqueza_2').setValue((ing2 - gasto2)/gasto2);
                        Ext.getCmp('ind_libertad_2').setValue(libertad2/gasto2);
                    }
                }
            });
        }
    });

    Ext.create('Ext.Panel', {
        renderTo: 'container',
        width: '100%',
        height: 1360,
        items: [
            {
                weight: 1,
                xtype: 'toolbar',
                dock: 'top',
                ui: 'footer',
                items: ['->', {
                    iconCls: 'icon-save',
                    text: 'Guardar',
                    scope: this,
                    handler: function(){
                        saveData = '';
                        var editRecords = grid.store.getUpdatedRecords();
                        if(editRecords.length > 0) {
                            for (var i=0; i<editRecords.length; i++) {
                                record = editRecords[i];
                                saveData += String(record.get('finan_id')) + '::' + String(record.get('ingreso1')) 
                                    + '::' + String(record.get('ingreso2')) + '*';
                            }
                        }
                        var editRecords = gridDos.store.getUpdatedRecords();
                        if(editRecords.length > 0) {
                            for (var i=0; i<editRecords.length; i++) {
                                record = editRecords[i];
                                saveData += String(record.get('finan_id')) + '::' + String(record.get('ingreso1')) 
                                    + '::' + String(record.get('ingreso2')) + '*';
                            }
                        }
                        if(saveData.length > 0){
                            saveData =  saveData.substring(0,saveData.length-1);	
                            Ext.Ajax.request({
                                url: '/application/indicadores-financieros/save-data',
                                method : 'POST',
                                params : {'data':saveData},              
                                success : function(response) {
                                    var respObj = Ext.JSON.decode(response.responseText);
                                    //alert(respObj.success);
                                    grid.store.load();
                                    alert('Guardado...')
                                },
                                failure : function(response) {
    //                                var respObj = Ext.JSON.decode(response.responseText);
    //                                Ext.Msg.alert("Error", respObj.status.statusMessage);
                                }
                            });
                        }
                    }
                }]
            },
            grid, {
                id: 'GridUno',
                region: 'center'
            },
            gridDos, {
                id: 'GridDos',
                region: 'center'
            }
        ],
        dockedItems: [
            {
                xtype: 'toolbar',
                dock: 'bottom',
                items: [
                    {xtype:'tbtext', text: '<b>Indicador de libertad financiera</b>',width: '70%'},
                    {xtype: 'field',id: 'ind_libertad_1',name: 'ind_libertad_1',width: '15%',value: 0,
                        style: 'margin-left:200px;font-weight: bold;color:#fff'},
                    {xtype: 'field',id: 'ind_libertad_2',name: 'ind_libertad_2',width: '15%',
                        value: 0,style: 'margin-left:15px;font-weight: bold;color:#fff'
                    }
                ]
            },
            {
                xtype: 'toolbar',
                dock: 'bottom',
                items: [
                    {xtype:'tbtext', text: '<b>Indicador de riqueza y pobreza</b>',width: '70%'},
                    {xtype: 'field',id: 'ind_riqueza_1',name: 'ind_riqueza_1',width: '15%',value: 0,
                        style: 'margin-left:200px;font-weight: bold;color:#fff'},
                    {xtype: 'field',id: 'ind_riqueza_2',name: 'ind_riqueza_2',width: '15%',
                        value: 0,style: 'margin-left:15px;font-weight: bold;color:#fff'
                    }
                ]
            },
            {
                xtype: 'toolbar',
                dock: 'bottom',
                items: [
                    {xtype:'tbtext', text: '<b>Indicador de cobertura de deudas</b>',width: '70%'},
                    {xtype: 'field',id: 'ind_deudas_1',name: 'ind_deudas_1',width: '15%',value: 0,
                        style: 'margin-left:200px;font-weight: bold;color:#fff'},
                    {xtype: 'field',id: 'ind_deudas_2',name: 'ind_deudas_2',width: '15%',
                        value: 0,style: 'margin-left:15px;font-weight: bold;color:#fff'
                    }
                ]
            }
        ],
    });
});