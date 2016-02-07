System.register(['./datasource', './query_ctrl'], function(exports_1) {
    var datasource_1, query_ctrl_1;
    var OpenTsConfigCtrl;
    return {
        setters:[
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            },
            function (query_ctrl_1_1) {
                query_ctrl_1 = query_ctrl_1_1;
            }],
        execute: function() {
            OpenTsConfigCtrl = (function () {
                function OpenTsConfigCtrl() {
                }
                OpenTsConfigCtrl.templateUrl = 'public/app/plugins/datasource/opentsdb/partials/config.html';
                return OpenTsConfigCtrl;
            })();
            exports_1("Datasource", datasource_1.OpenTsDatasource);
            exports_1("QueryCtrl", query_ctrl_1.OpenTsQueryCtrl);
            exports_1("ConfigCtrl", OpenTsConfigCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map