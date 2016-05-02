/**
 * A small grid nested within a parent grid's row.
 *
 * See the [Kitchen Sink](http://dev.sencha.com/extjs/5.0.1/examples/kitchensink/#customer-grid) for example usage.
 */
Ext.define('Ext.ux.grid.SubTable', {
    extend: 'Ext.grid.plugin.RowExpander',

    alias: 'plugin.subtable',

    rowBodyTpl: ['<table class="' + Ext.baseCSSPrefix + 'grid-subtable">', '{%', 'this.owner.renderTable(out, values);', '%}', '</table>'],

    init: function(grid) {
        var me = this,
            columns = me.columns,
            len, i, columnCfg;

        me.callParent(arguments);

        me.columns = [];
        if (columns) {
            for (i = 0, len = columns.length; i < len; ++i) {
                // Don't register with the component manager, we create them to use
                // their rendering smarts, but don't want to treat them as real components
                columnCfg = Ext.apply({
                    preventRegister: true
                }, columns[i]);
                columnCfg.xtype = columnCfg.xtype || 'gridcolumn';
                me.columns.push(Ext.widget(columnCfg));
            }
        }
    },

    destroy: function() {
        var columns = this.columns,
            len, i;

        if (columns) {
            for (i = 0, len = columns.length; i < len; ++i) {
                columns[i].destroy();
            }
        }
        this.columns = null;
        this.callParent();
    },

    getRowBodyFeatureData: function(record, idx, rowValues) {
        this.callParent(arguments);
        rowValues.rowBodyCls += ' ' + Ext.baseCSSPrefix + 'grid-subtable-row';
    },

    renderTable: function(out, rowValues) {
        var me = this,
            columns = me.columns,
            numColumns = columns.length,
            associatedRecords = me.getAssociatedRecords(rowValues.record),
            recCount = associatedRecords.length,
            rec, column, i, j, value;

        out.push('<thead>');
        for (j = 0; j < numColumns; j++) {
            out.push('<th class="' + Ext.baseCSSPrefix + 'grid-subtable-header">', columns[j].text, '</th>');
        }
        out.push('</thead><tbody>');
        for (i = 0; i < recCount; i++) {
            rec = associatedRecords[i];
            out.push('<tr>');
            for (j = 0; j < numColumns; j++) {
                column = columns[j];
                value = rec.get(column.dataIndex);
                if (column.renderer && column.renderer.call) {
                    value = column.renderer.call(column.scope || me, value, {}, rec);
                }
                out.push('<td class="' + Ext.baseCSSPrefix + 'grid-subtable-cell"');
                if (column.width != null) {
                    out.push(' style="width:' + column.width + 'px"');
                }
                out.push('><div class="' + Ext.baseCSSPrefix + 'grid-cell-inner">', value, '</div></td>');
            }
            out.push('</tr>');
        }
        out.push('</tbody>');
    },

    getRowBodyContentsFn: function(rowBodyTpl) {
        var me = this;
        return function(rowValues) {
            rowBodyTpl.owner = me;
            return rowBodyTpl.applyTemplate(rowValues);
        };
    },

    getAssociatedRecords: function(record) {
        return record[this.association]().getRange();
    }
});

Ext.define('Safety', {
    extend: 'Ext.data.Model',

    idProperty: 'station',
    fields: ['station', 'sstation', 'type', 'description']
});

Ext.define('SubSafety', {
    extend: 'Ext.data.Model',

    fields: ['d', 'dd', {
        name: 'stationId',
        reference: {
            parent: 'Safety',
            inverse: {
                associationKey: 'subSafety'
            }
        }
    }]
});

Ext.application({
    name: 'Fiddle',

    launch: function() {
        Ext.create({

            xtype: 'panel',
            renderTo: document.body,
            width: 500,
            height: 500,
            items: [{
                xtype: 'grid',
                title: 'station',
                plugins: [{
                    ptype: "subtable",
                    association: 'stationSubSafeties',
                    headerWidth: 24,
                    columns: [{
                        text: "Une Donnée",
                        dataIndex: 'd'
                    }, {
                        text: "Une Autre Donnée",
                        dataIndex: 'dd'
                    }]

                }],
                store: {
                    model: 'Safety',
                    autoLoad: true,
                    proxy: {
                        type: 'memory',
                        data: [{
                            station: 1,
                            sstation: "blabla",
                            type: "fekzdn",
                            description: "vsvdrgdgs",
                            subSafety: [{
                                stationId: 1,
                                d: "plop1",
                                dd: "truc"
                            }]


                        }, {
                            station: 2,
                            sstation: "blablabla",
                            type: "fe",
                            description: "vsvjgrdg",
                            subSafety: [{
                                stationId: 2,
                                d: "plop2",
                                dd: "truc2"

                            }]

                        }, {
                            station: 3,
                            sstation: "bla",
                            type: "fekzrgdgdn",
                            description: "vsvjbsjbs",
                            subSafety: [{
                                stationId: 3,
                                d: "plop3",
                                dd: "truc3"
                            }]
                        }]
                    },
                },

                columns: [{
                    text: 'Station',
                    dataIndex: 'station'
                }, {
                    text: 'Sous-Station',
                    dataIndex: 'sstation',
                }, {
                    text: 'Type',
                    dataIndex: 'type',
                }, {
                    text: 'Description',
                    dataIndex: 'description',
                }],

            }]
        })
    }
});
