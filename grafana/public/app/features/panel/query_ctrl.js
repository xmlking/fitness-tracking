///<reference path="../../headers/common.d.ts" />
System.register(['angular', 'lodash'], function(exports_1) {
    var angular_1, lodash_1;
    var QueryCtrl;
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            QueryCtrl = (function () {
                function QueryCtrl($scope, $injector) {
                    this.$scope = $scope;
                    this.$injector = $injector;
                    this.panel = this.panelCtrl.panel;
                    if (!this.target.refId) {
                        this.target.refId = this.getNextQueryLetter();
                    }
                }
                QueryCtrl.prototype.getNextQueryLetter = function () {
                    var _this = this;
                    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    return lodash_1.default.find(letters, function (refId) {
                        return lodash_1.default.every(_this.panel.targets, function (other) {
                            return other.refId !== refId;
                        });
                    });
                };
                QueryCtrl.prototype.removeQuery = function () {
                    this.panel.targets = lodash_1.default.without(this.panel.targets, this.target);
                    this.panelCtrl.refresh();
                };
                ;
                QueryCtrl.prototype.duplicateQuery = function () {
                    var clone = angular_1.default.copy(this.target);
                    clone.refId = this.getNextQueryLetter();
                    this.panel.targets.push(clone);
                };
                QueryCtrl.prototype.moveQuery = function (direction) {
                    var index = lodash_1.default.indexOf(this.panel.targets, this.target);
                    lodash_1.default.move(this.panel.targets, index, index + direction);
                };
                QueryCtrl.prototype.refresh = function () {
                    this.panelCtrl.refresh();
                };
                QueryCtrl.prototype.toggleHideQuery = function () {
                    this.target.hide = !this.target.hide;
                    this.panelCtrl.refresh();
                };
                return QueryCtrl;
            })();
            exports_1("QueryCtrl", QueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map