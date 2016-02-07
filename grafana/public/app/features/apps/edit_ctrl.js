///<reference path="../../headers/common.d.ts" />
System.register(['angular', 'lodash'], function(exports_1) {
    var angular_1, lodash_1;
    var AppEditCtrl;
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            AppEditCtrl = (function () {
                /** @ngInject */
                function AppEditCtrl(backendSrv, $routeParams) {
                    var _this = this;
                    this.backendSrv = backendSrv;
                    this.$routeParams = $routeParams;
                    this.appModel = {};
                    this.backendSrv.get("/api/org/apps/" + this.$routeParams.appId + "/settings").then(function (result) {
                        _this.appModel = result;
                        _this.includedPanels = lodash_1.default.where(result.includes, { type: 'panel' });
                    });
                }
                AppEditCtrl.prototype.update = function (options) {
                    var updateCmd = lodash_1.default.extend({
                        appId: this.appModel.appId,
                        orgId: this.appModel.orgId,
                        enabled: this.appModel.enabled,
                        pinned: this.appModel.pinned,
                        jsonData: this.appModel.jsonData,
                        secureJsonData: this.appModel.secureJsonData,
                    }, options);
                    this.backendSrv.post("/api/org/apps/" + this.$routeParams.appId + "/settings", updateCmd).then(function () {
                        window.location.href = window.location.href;
                    });
                };
                AppEditCtrl.prototype.toggleEnabled = function () {
                    this.update({ enabled: this.appModel.enabled });
                };
                AppEditCtrl.prototype.togglePinned = function () {
                    this.update({ pinned: this.appModel.pinned });
                };
                return AppEditCtrl;
            })();
            exports_1("AppEditCtrl", AppEditCtrl);
            angular_1.default.module('grafana.controllers').controller('AppEditCtrl', AppEditCtrl);
        }
    }
});
//# sourceMappingURL=edit_ctrl.js.map