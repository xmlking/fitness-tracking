///<reference path="../../../headers/common.d.ts" />
System.register(['./bucket_agg', './metric_agg', 'angular', 'app/plugins/sdk'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var angular_1, sdk_1;
    var ElasticQueryCtrl;
    return {
        setters:[
            function (_1) {},
            function (_2) {},
            function (angular_1_1) {
                angular_1 = angular_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            }],
        execute: function() {
            ElasticQueryCtrl = (function (_super) {
                __extends(ElasticQueryCtrl, _super);
                /** @ngInject **/
                function ElasticQueryCtrl($scope, $injector, $rootScope, $timeout, uiSegmentSrv) {
                    _super.call(this, $scope, $injector);
                    this.$rootScope = $rootScope;
                    this.$timeout = $timeout;
                    this.uiSegmentSrv = uiSegmentSrv;
                    this.esVersion = this.datasource.esVersion;
                    this.queryUpdated();
                }
                ElasticQueryCtrl.prototype.getFields = function (type) {
                    var jsonStr = angular_1.default.toJson({ find: 'fields', type: type });
                    return this.datasource.metricFindQuery(jsonStr)
                        .then(this.uiSegmentSrv.transformToSegments(false))
                        .catch(this.handleQueryError.bind(this));
                };
                ElasticQueryCtrl.prototype.queryUpdated = function () {
                    var newJson = angular_1.default.toJson(this.datasource.queryBuilder.build(this.target), true);
                    if (newJson !== this.rawQueryOld) {
                        this.rawQueryOld = newJson;
                        this.refresh();
                    }
                    this.$rootScope.appEvent('elastic-query-updated');
                };
                ElasticQueryCtrl.prototype.handleQueryError = function (err) {
                    this.error = err.message || 'Failed to issue metric query';
                    return [];
                };
                ElasticQueryCtrl.templateUrl = 'public/app/plugins/datasource/elasticsearch/partials/query.editor.html';
                return ElasticQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("ElasticQueryCtrl", ElasticQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map