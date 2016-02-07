///<reference path="../../../headers/common.d.ts" />
System.register(['lodash', 'app/core/utils/kbn', 'app/plugins/sdk'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, kbn_1, sdk_1;
    var OpenTsQueryCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (kbn_1_1) {
                kbn_1 = kbn_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            }],
        execute: function() {
            OpenTsQueryCtrl = (function (_super) {
                __extends(OpenTsQueryCtrl, _super);
                /** @ngInject **/
                function OpenTsQueryCtrl($scope, $injector) {
                    var _this = this;
                    _super.call(this, $scope, $injector);
                    this.errors = this.validateTarget();
                    this.aggregators = ['avg', 'sum', 'min', 'max', 'dev', 'zimsum', 'mimmin', 'mimmax'];
                    this.fillPolicies = ['none', 'nan', 'null', 'zero'];
                    if (!this.target.aggregator) {
                        this.target.aggregator = 'sum';
                    }
                    if (!this.target.downsampleAggregator) {
                        this.target.downsampleAggregator = 'avg';
                    }
                    if (!this.target.downsampleFillPolicy) {
                        this.target.downsampleFillPolicy = 'none';
                    }
                    this.datasource.getAggregators().then(function (aggs) {
                        this.aggregators = aggs;
                    });
                    // needs to be defined here as it is called from typeahead
                    this.suggestMetrics = function (query, callback) {
                        _this.datasource.metricFindQuery('metrics(' + query + ')')
                            .then(_this.getTextValues)
                            .then(callback);
                    };
                    this.suggestTagKeys = function (query, callback) {
                        _this.datasource.suggestTagKeys(_this.target.metric).then(callback);
                    };
                    this.suggestTagValues = function (query, callback) {
                        _this.datasource.metricFindQuery('suggest_tagv(' + query + ')')
                            .then(_this.getTextValues)
                            .then(callback);
                    };
                }
                OpenTsQueryCtrl.prototype.targetBlur = function () {
                    this.errors = this.validateTarget();
                    this.refresh();
                };
                OpenTsQueryCtrl.prototype.getTextValues = function (metricFindResult) {
                    return lodash_1.default.map(metricFindResult, function (value) { return value.text; });
                };
                OpenTsQueryCtrl.prototype.addTag = function () {
                    if (!this.addTagMode) {
                        this.addTagMode = true;
                        return;
                    }
                    if (!this.target.tags) {
                        this.target.tags = {};
                    }
                    this.errors = this.validateTarget();
                    if (!this.errors.tags) {
                        this.target.tags[this.target.currentTagKey] = this.target.currentTagValue;
                        this.target.currentTagKey = '';
                        this.target.currentTagValue = '';
                        this.targetBlur();
                    }
                    this.addTagMode = false;
                };
                OpenTsQueryCtrl.prototype.removeTag = function (key) {
                    delete this.target.tags[key];
                    this.targetBlur();
                };
                OpenTsQueryCtrl.prototype.editTag = function (key, value) {
                    this.removeTag(key);
                    this.target.currentTagKey = key;
                    this.target.currentTagValue = value;
                    this.addTag();
                };
                OpenTsQueryCtrl.prototype.validateTarget = function () {
                    var errs = {};
                    if (this.target.shouldDownsample) {
                        try {
                            if (this.target.downsampleInterval) {
                                kbn_1.default.describe_interval(this.target.downsampleInterval);
                            }
                            else {
                                errs.downsampleInterval = "You must supply a downsample interval (e.g. '1m' or '1h').";
                            }
                        }
                        catch (err) {
                            errs.downsampleInterval = err.message;
                        }
                    }
                    if (this.target.tags && lodash_1.default.has(this.target.tags, this.target.currentTagKey)) {
                        errs.tags = "Duplicate tag key '" + this.target.currentTagKey + "'.";
                    }
                    return errs;
                };
                OpenTsQueryCtrl.templateUrl = 'public/app/plugins/datasource/opentsdb/partials/query.editor.html';
                return OpenTsQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("OpenTsQueryCtrl", OpenTsQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map