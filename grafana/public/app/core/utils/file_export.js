///<reference path="../../headers/common.d.ts" />
System.register(['lodash'], function(exports_1) {
    var lodash_1;
    function exportSeriesListToCsv(seriesList) {
        var text = 'Series;Time;Value\n';
        lodash_1.default.each(seriesList, function (series) {
            lodash_1.default.each(series.datapoints, function (dp) {
                text += series.alias + ';' + new Date(dp[1]).toISOString() + ';' + dp[0] + '\n';
            });
        });
        saveSaveBlob(text, 'grafana_data_export.csv');
    }
    exports_1("exportSeriesListToCsv", exportSeriesListToCsv);
    function exportTableDataToCsv(table) {
        var text = '';
        // add header
        lodash_1.default.each(table.columns, function (column) {
            text += column.text + ';';
        });
        text += '\n';
        // process data
        lodash_1.default.each(table.rows, function (row) {
            lodash_1.default.each(row, function (value) {
                text += value + ';';
            });
            text += '\n';
        });
        saveSaveBlob(text, 'grafana_data_export.csv');
    }
    exports_1("exportTableDataToCsv", exportTableDataToCsv);
    function saveSaveBlob(payload, fname) {
        var blob = new Blob([payload], { type: "text/csv;charset=utf-8" });
        window.saveAs(blob, fname);
    }
    exports_1("saveSaveBlob", saveSaveBlob);
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            ;
            ;
            ;
        }
    }
});
//# sourceMappingURL=file_export.js.map