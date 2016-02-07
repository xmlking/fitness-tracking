///<reference path="../../headers/common.d.ts" />
System.register(['app/core/config', 'jquery', 'lodash', 'app/core/utils/kbn', './panel_ctrl', 'app/core/utils/rangeutil', 'app/core/utils/datemath'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var config_1, jquery_1, lodash_1, kbn_1, panel_ctrl_1, rangeUtil, dateMath;
    var MetricsPanelCtrl;
    return {
        setters:[
            function (config_1_1) {
                config_1 = config_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (kbn_1_1) {
                kbn_1 = kbn_1_1;
            },
            function (panel_ctrl_1_1) {
                panel_ctrl_1 = panel_ctrl_1_1;
            },
            function (rangeUtil_1) {
                rangeUtil = rangeUtil_1;
            },
            function (dateMath_1) {
                dateMath = dateMath_1;
            }],
        execute: function() {
            MetricsPanelCtrl = (function (_super) {
                __extends(MetricsPanelCtrl, _super);
                function MetricsPanelCtrl($scope, $injector) {
                    _super.call(this, $scope, $injector);
                    // make metrics tab the default
                    this.editorTabIndex = 1;
                    this.$q = $injector.get('$q');
                    this.datasourceSrv = $injector.get('datasourceSrv');
                    this.timeSrv = $injector.get('timeSrv');
                    if (!this.panel.targets) {
                        this.panel.targets = [{}];
                    }
                }
                MetricsPanelCtrl.prototype.initEditMode = function () {
                    _super.prototype.initEditMode.call(this);
                    this.addEditorTab('Metrics', 'public/app/partials/metrics.html');
                    this.addEditorTab('Time range', 'public/app/features/panel/partials/panelTime.html');
                    this.datasources = this.datasourceSrv.getMetricSources();
                };
                MetricsPanelCtrl.prototype.refreshData = function (data) {
                    // null op
                    return this.$q.when(data);
                };
                MetricsPanelCtrl.prototype.loadSnapshot = function (data) {
                    // null op
                    return data;
                };
                MetricsPanelCtrl.prototype.refresh = function () {
                    var _this = this;
                    // ignore fetching data if another panel is in fullscreen
                    if (this.otherPanelInFullscreenMode()) {
                        return;
                    }
                    // if we have snapshot data use that
                    if (this.panel.snapshotData) {
                        if (this.loadSnapshot) {
                            this.updateTimeRange();
                            this.loadSnapshot(this.panel.snapshotData);
                        }
                        return;
                    }
                    // clear loading/error state
                    delete this.error;
                    this.loading = true;
                    // load datasource service
                    this.datasourceSrv.get(this.panel.datasource).then(function (datasource) {
                        _this.datasource = datasource;
                        return _this.refreshData(_this.datasource);
                    }).then(function () {
                        _this.loading = false;
                    }).catch(function (err) {
                        console.log('Panel data error:', err);
                        _this.loading = false;
                        _this.error = err.message || "Timeseries data request error";
                        _this.inspector = { error: err };
                    });
                };
                MetricsPanelCtrl.prototype.setTimeQueryStart = function () {
                    this.timing = {};
                    this.timing.queryStart = new Date().getTime();
                };
                MetricsPanelCtrl.prototype.setTimeQueryEnd = function () {
                    this.timing.queryEnd = new Date().getTime();
                };
                MetricsPanelCtrl.prototype.updateTimeRange = function () {
                    this.range = this.timeSrv.timeRange();
                    this.rangeRaw = this.timeSrv.timeRange(false);
                    this.applyPanelTimeOverrides();
                    if (this.panel.maxDataPoints) {
                        this.resolution = this.panel.maxDataPoints;
                    }
                    else {
                        this.resolution = Math.ceil(jquery_1.default(window).width() * (this.panel.span / 12));
                    }
                    var panelInterval = this.panel.interval;
                    var datasourceInterval = (this.datasource || {}).interval;
                    this.interval = kbn_1.default.calculateInterval(this.range, this.resolution, panelInterval || datasourceInterval);
                };
                ;
                MetricsPanelCtrl.prototype.applyPanelTimeOverrides = function () {
                    this.timeInfo = '';
                    // check panel time overrrides
                    if (this.panel.timeFrom) {
                        var timeFromInfo = rangeUtil.describeTextRange(this.panel.timeFrom);
                        if (timeFromInfo.invalid) {
                            this.timeInfo = 'invalid time override';
                            return;
                        }
                        if (lodash_1.default.isString(this.rangeRaw.from)) {
                            var timeFromDate = dateMath.parse(timeFromInfo.from);
                            this.timeInfo = timeFromInfo.display;
                            this.rangeRaw.from = timeFromInfo.from;
                            this.rangeRaw.to = timeFromInfo.to;
                            this.range.from = timeFromDate;
                            this.range.to = dateMath.parse(timeFromInfo.to);
                        }
                    }
                    if (this.panel.timeShift) {
                        var timeShiftInfo = rangeUtil.describeTextRange(this.panel.timeShift);
                        if (timeShiftInfo.invalid) {
                            this.timeInfo = 'invalid timeshift';
                            return;
                        }
                        var timeShift = '-' + this.panel.timeShift;
                        this.timeInfo += ' timeshift ' + timeShift;
                        this.range.from = dateMath.parseDateMath(timeShift, this.range.from, false);
                        this.range.to = dateMath.parseDateMath(timeShift, this.range.to, true);
                        this.rangeRaw = this.range;
                    }
                    if (this.panel.hideTimeOverride) {
                        this.timeInfo = '';
                    }
                };
                ;
                MetricsPanelCtrl.prototype.issueQueries = function (datasource) {
                    var _this = this;
                    this.updateTimeRange();
                    if (!this.panel.targets || this.panel.targets.length === 0) {
                        return this.$q.when([]);
                    }
                    var metricsQuery = {
                        range: this.range,
                        rangeRaw: this.rangeRaw,
                        interval: this.interval,
                        targets: this.panel.targets,
                        format: this.panel.renderer === 'png' ? 'png' : 'json',
                        maxDataPoints: this.resolution,
                        scopedVars: this.panel.scopedVars,
                        cacheTimeout: this.panel.cacheTimeout
                    };
                    this.setTimeQueryStart();
                    try {
                        return datasource.query(metricsQuery).then(function (results) {
                            _this.setTimeQueryEnd();
                            if (_this.dashboard.snapshot) {
                                _this.panel.snapshotData = results;
                            }
                            return results;
                        });
                    }
                    catch (err) {
                        return this.$q.reject(err);
                    }
                };
                MetricsPanelCtrl.prototype.setDatasource = function (datasource) {
                    var _this = this;
                    // switching to mixed
                    if (datasource.meta.mixed) {
                        lodash_1.default.each(this.panel.targets, function (target) {
                            target.datasource = _this.panel.datasource;
                            if (target.datasource === null) {
                                target.datasource = config_1.default.defaultDatasource;
                            }
                        });
                    }
                    else if (this.datasource && this.datasource.meta.mixed) {
                        lodash_1.default.each(this.panel.targets, function (target) {
                            delete target.datasource;
                        });
                    }
                    this.panel.datasource = datasource.value;
                    this.datasource = null;
                    this.refresh();
                };
                MetricsPanelCtrl.prototype.addDataQuery = function (datasource) {
                    var target = {
                        datasource: datasource ? datasource.name : undefined
                    };
                    this.panel.targets.push(target);
                };
                return MetricsPanelCtrl;
            })(panel_ctrl_1.PanelCtrl);
            exports_1("MetricsPanelCtrl", MetricsPanelCtrl);
        }
    }
});
//# sourceMappingURL=metrics_panel_ctrl.js.map