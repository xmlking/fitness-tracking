///<reference path="../../headers/common.d.ts" />
System.register(['angular'], function(exports_1) {
    var angular_1;
    var AdminStatsCtrl;
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            }],
        execute: function() {
            AdminStatsCtrl = (function () {
                /** @ngInject */
                function AdminStatsCtrl(backendSrv) {
                    this.backendSrv = backendSrv;
                }
                AdminStatsCtrl.prototype.init = function () {
                    var _this = this;
                    this.backendSrv.get('/api/admin/stats').then(function (stats) {
                        _this.stats = stats;
                    });
                };
                return AdminStatsCtrl;
            })();
            exports_1("AdminStatsCtrl", AdminStatsCtrl);
            angular_1.default.module('grafana.controllers').controller('AdminStatsCtrl', AdminStatsCtrl);
        }
    }
});
//# sourceMappingURL=adminStatsCtrl.js.map