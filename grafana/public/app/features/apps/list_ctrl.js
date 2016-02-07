///<reference path="../../headers/common.d.ts" />
System.register(['angular'], function(exports_1) {
    var angular_1;
    var AppListCtrl;
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            }],
        execute: function() {
            AppListCtrl = (function () {
                /** @ngInject */
                function AppListCtrl(backendSrv) {
                    this.backendSrv = backendSrv;
                }
                AppListCtrl.prototype.init = function () {
                    var _this = this;
                    this.backendSrv.get('api/org/apps').then(function (apps) {
                        _this.apps = apps;
                    });
                };
                return AppListCtrl;
            })();
            exports_1("AppListCtrl", AppListCtrl);
            angular_1.default.module('grafana.controllers').controller('AppListCtrl', AppListCtrl);
        }
    }
});
//# sourceMappingURL=list_ctrl.js.map