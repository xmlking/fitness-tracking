///<reference path="../../../headers/common.d.ts" />
System.register(['lodash', 'app/plugins/sdk'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, sdk_1;
    var panelDefaults, DashListCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            }],
        execute: function() {
            // Set and populate defaults
            panelDefaults = {
                mode: 'starred',
                query: '',
                limit: 10,
                tags: []
            };
            DashListCtrl = (function (_super) {
                __extends(DashListCtrl, _super);
                /** @ngInject */
                function DashListCtrl($scope, $injector, backendSrv) {
                    _super.call(this, $scope, $injector);
                    this.backendSrv = backendSrv;
                    lodash_1.default.defaults(this.panel, panelDefaults);
                    if (this.panel.tag) {
                        this.panel.tags = [$scope.panel.tag];
                        delete this.panel.tag;
                    }
                }
                DashListCtrl.prototype.initEditMode = function () {
                    _super.prototype.initEditMode.call(this);
                    this.modes = ['starred', 'search'];
                    this.icon = "fa fa-star";
                    this.addEditorTab('Options', function () {
                        return { templateUrl: 'public/app/plugins/panel/dashlist/editor.html' };
                    });
                };
                DashListCtrl.prototype.refresh = function () {
                    var _this = this;
                    var params = { limit: this.panel.limit };
                    if (this.panel.mode === 'starred') {
                        params.starred = "true";
                    }
                    else {
                        params.query = this.panel.query;
                        params.tag = this.panel.tags;
                    }
                    return this.backendSrv.search(params).then(function (result) {
                        _this.dashList = result;
                        _this.renderingCompleted();
                    });
                };
                DashListCtrl.templateUrl = 'public/app/plugins/panel/dashlist/module.html';
                return DashListCtrl;
            })(sdk_1.PanelCtrl);
            exports_1("DashListCtrl", DashListCtrl);
            exports_1("PanelCtrl", DashListCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map