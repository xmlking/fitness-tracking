System.register(['./datasource', './query_ctrl'], function(exports_1) {
    var datasource_1, query_ctrl_1;
    var PrometheusConfigCtrl;
    return {
        setters:[
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            },
            function (query_ctrl_1_1) {
                query_ctrl_1 = query_ctrl_1_1;
            }],
        execute: function() {
            PrometheusConfigCtrl = (function () {
                function PrometheusConfigCtrl() {
                }
                PrometheusConfigCtrl.templateUrl = 'public/app/plugins/datasource/prometheus/partials/config.html';
                return PrometheusConfigCtrl;
            })();
            exports_1("Datasource", datasource_1.PrometheusDatasource);
            exports_1("QueryCtrl", query_ctrl_1.PrometheusQueryCtrl);
            exports_1("ConfigCtrl", PrometheusConfigCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map