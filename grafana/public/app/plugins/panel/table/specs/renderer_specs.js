System.register(['test/lib/common', 'app/core/table_model', '../renderer'], function(exports_1) {
    var common_1, table_model_1, renderer_1;
    return {
        setters:[
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (table_model_1_1) {
                table_model_1 = table_model_1_1;
            },
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            }],
        execute: function() {
            common_1.describe('when rendering table', function () {
                common_1.describe('given 2 columns', function () {
                    var table = new table_model_1.default();
                    table.columns = [
                        { text: 'Time' },
                        { text: 'Value' },
                        { text: 'Colored' },
                        { text: 'Undefined' },
                    ];
                    var panel = {
                        pageSize: 10,
                        styles: [
                            {
                                pattern: 'Time',
                                type: 'date',
                                format: 'LLL'
                            },
                            {
                                pattern: 'Value',
                                type: 'number',
                                unit: 'ms',
                                decimals: 3,
                            },
                            {
                                pattern: 'Colored',
                                type: 'number',
                                unit: 'none',
                                decimals: 1,
                                colorMode: 'value',
                                thresholds: [50, 80],
                                colors: ['green', 'orange', 'red']
                            }
                        ]
                    };
                    var renderer = new renderer_1.TableRenderer(panel, table, 'utc');
                    common_1.it('time column should be formated', function () {
                        var html = renderer.renderCell(0, 1388556366666);
                        common_1.expect(html).to.be('<td>2014-01-01T06:06:06+00:00</td>');
                    });
                    common_1.it('number column should be formated', function () {
                        var html = renderer.renderCell(1, 1230);
                        common_1.expect(html).to.be('<td>1.230 s</td>');
                    });
                    common_1.it('number style should ignore string values', function () {
                        var html = renderer.renderCell(1, 'asd');
                        common_1.expect(html).to.be('<td>asd</td>');
                    });
                    common_1.it('colored cell should have style', function () {
                        var html = renderer.renderCell(2, 40);
                        common_1.expect(html).to.be('<td style="color:green">40.0</td>');
                    });
                    common_1.it('colored cell should have style', function () {
                        var html = renderer.renderCell(2, 55);
                        common_1.expect(html).to.be('<td style="color:orange">55.0</td>');
                    });
                    common_1.it('colored cell should have style', function () {
                        var html = renderer.renderCell(2, 85);
                        common_1.expect(html).to.be('<td style="color:red">85.0</td>');
                    });
                    common_1.it('unformated undefined should be rendered as -', function () {
                        var html = renderer.renderCell(3, undefined);
                        common_1.expect(html).to.be('<td></td>');
                    });
                });
            });
        }
    }
});
//# sourceMappingURL=renderer_specs.js.map