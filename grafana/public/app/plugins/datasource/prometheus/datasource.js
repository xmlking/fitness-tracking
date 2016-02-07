///<reference path="../../../headers/common.d.ts" />
System.register(['lodash', 'moment', 'app/core/utils/datemath'], function(exports_1) {
    var lodash_1, moment_1, dateMath;
    var durationSplitRegexp;
    /** @ngInject */
    function PrometheusDatasource(instanceSettings, $q, backendSrv, templateSrv) {
        this.type = 'prometheus';
        this.editorSrc = 'app/features/prometheus/partials/query.editor.html';
        this.name = instanceSettings.name;
        this.supportMetrics = true;
        this.url = instanceSettings.url;
        this.directUrl = instanceSettings.directUrl;
        this.basicAuth = instanceSettings.basicAuth;
        this.withCredentials = instanceSettings.withCredentials;
        this.lastErrors = {};
        this._request = function (method, url) {
            var options = {
                url: this.url + url,
                method: method
            };
            if (this.basicAuth || this.withCredentials) {
                options.withCredentials = true;
            }
            if (this.basicAuth) {
                options.headers = {
                    "Authorization": this.basicAuth
                };
            }
            return backendSrv.datasourceRequest(options);
        };
        // Called once per panel (graph)
        this.query = function (options) {
            var start = getPrometheusTime(options.range.from, false);
            var end = getPrometheusTime(options.range.to, true);
            var queries = [];
            options = lodash_1.default.clone(options);
            lodash_1.default.each(options.targets, lodash_1.default.bind(function (target) {
                if (!target.expr || target.hide) {
                    return;
                }
                var query = {};
                query.expr = templateSrv.replace(target.expr, options.scopedVars);
                var interval = target.interval || options.interval;
                var intervalFactor = target.intervalFactor || 1;
                target.step = query.step = this.calculateInterval(interval, intervalFactor);
                var range = Math.ceil(end - start);
                // Prometheus drop query if range/step > 11000
                // calibrate step if it is too big
                if (query.step !== 0 && range / query.step > 11000) {
                    target.step = query.step = Math.ceil(range / 11000);
                }
                queries.push(query);
            }, this));
            // No valid targets, return the empty result to save a round trip.
            if (lodash_1.default.isEmpty(queries)) {
                var d = $q.defer();
                d.resolve({ data: [] });
                return d.promise;
            }
            var allQueryPromise = lodash_1.default.map(queries, lodash_1.default.bind(function (query) {
                return this.performTimeSeriesQuery(query, start, end);
            }, this));
            var self = this;
            return $q.all(allQueryPromise)
                .then(function (allResponse) {
                var result = [];
                lodash_1.default.each(allResponse, function (response, index) {
                    if (response.status === 'error') {
                        self.lastErrors.query = response.error;
                        throw response.error;
                    }
                    delete self.lastErrors.query;
                    lodash_1.default.each(response.data.data.result, function (metricData) {
                        result.push(transformMetricData(metricData, options.targets[index], start, end));
                    });
                });
                return { data: result };
            });
        };
        this.performTimeSeriesQuery = function (query, start, end) {
            var url = '/api/v1/query_range?query=' + encodeURIComponent(query.expr) + '&start=' + start + '&end=' + end + '&step=' + query.step;
            return this._request('GET', url);
        };
        this.performSuggestQuery = function (query) {
            var url = '/api/v1/label/__name__/values';
            return this._request('GET', url).then(function (result) {
                return lodash_1.default.filter(result.data.data, function (metricName) {
                    return metricName.indexOf(query) !== 1;
                });
            });
        };
        this.metricFindQuery = function (query) {
            if (!query) {
                return $q.when([]);
            }
            var interpolated;
            try {
                interpolated = templateSrv.replace(query);
            }
            catch (err) {
                return $q.reject(err);
            }
            var label_values_regex = /^label_values\(([^,]+)(?:,\s*(.+))?\)$/;
            var metric_names_regex = /^metrics\((.+)\)$/;
            var url;
            var label_values_query = interpolated.match(label_values_regex);
            if (label_values_query) {
                if (!label_values_query[2]) {
                    // return label values globally
                    url = '/api/v1/label/' + label_values_query[1] + '/values';
                    return this._request('GET', url).then(function (result) {
                        return lodash_1.default.map(result.data.data, function (value) {
                            return { text: value };
                        });
                    });
                }
                else {
                    url = '/api/v1/series?match[]=' + encodeURIComponent(label_values_query[1]);
                    return this._request('GET', url)
                        .then(function (result) {
                        return lodash_1.default.map(result.data.data, function (metric) {
                            return {
                                text: metric[label_values_query[2]],
                                expandable: true
                            };
                        });
                    });
                }
            }
            var metric_names_query = interpolated.match(metric_names_regex);
            if (metric_names_query) {
                url = '/api/v1/label/__name__/values';
                return this._request('GET', url)
                    .then(function (result) {
                    return lodash_1.default.chain(result.data.data)
                        .filter(function (metricName) {
                        var r = new RegExp(metric_names_query[1]);
                        return r.test(metricName);
                    })
                        .map(function (matchedMetricName) {
                        return {
                            text: matchedMetricName,
                            expandable: true
                        };
                    })
                        .value();
                });
            }
            else {
                // if query contains full metric name, return metric name and label list
                url = '/api/v1/series?match[]=' + encodeURIComponent(interpolated);
                return this._request('GET', url)
                    .then(function (result) {
                    return lodash_1.default.map(result.data.data, function (metric) {
                        return {
                            text: getOriginalMetricName(metric),
                            expandable: true
                        };
                    });
                });
            }
        };
        this.testDatasource = function () {
            return this.metricFindQuery('metrics(.*)').then(function () {
                return { status: 'success', message: 'Data source is working', title: 'Success' };
            });
        };
        PrometheusDatasource.prototype.calculateInterval = function (interval, intervalFactor) {
            var m = interval.match(durationSplitRegexp);
            var dur = moment_1.default.duration(parseInt(m[1]), m[2]);
            var sec = dur.asSeconds();
            if (sec < 1) {
                sec = 1;
            }
            return Math.ceil(sec * intervalFactor);
        };
        function transformMetricData(md, options, start, end) {
            var dps = [], metricLabel = null;
            metricLabel = createMetricLabel(md.metric, options);
            var stepMs = parseInt(options.step) * 1000;
            var baseTimestamp = start * 1000;
            lodash_1.default.each(md.values, function (value) {
                var dp_value = parseFloat(value[1]);
                if (lodash_1.default.isNaN(dp_value)) {
                    dp_value = null;
                }
                var timestamp = value[0] * 1000;
                for (var t = baseTimestamp; t < timestamp; t += stepMs) {
                    dps.push([null, t]);
                }
                baseTimestamp = timestamp + stepMs;
                dps.push([dp_value, timestamp]);
            });
            var endTimestamp = end * 1000;
            for (var t = baseTimestamp; t <= endTimestamp; t += stepMs) {
                dps.push([null, t]);
            }
            return { target: metricLabel, datapoints: dps };
        }
        function createMetricLabel(labelData, options) {
            if (lodash_1.default.isUndefined(options) || lodash_1.default.isEmpty(options.legendFormat)) {
                return getOriginalMetricName(labelData);
            }
            var originalSettings = lodash_1.default.templateSettings;
            lodash_1.default.templateSettings = {
                interpolate: /\{\{(.+?)\}\}/g
            };
            var template = lodash_1.default.template(templateSrv.replace(options.legendFormat));
            var metricName;
            try {
                metricName = template(labelData);
            }
            catch (e) {
                metricName = '{}';
            }
            lodash_1.default.templateSettings = originalSettings;
            return metricName;
        }
        function getOriginalMetricName(labelData) {
            var metricName = labelData.__name__ || '';
            delete labelData.__name__;
            var labelPart = lodash_1.default.map(lodash_1.default.pairs(labelData), function (label) {
                return label[0] + '="' + label[1] + '"';
            }).join(',');
            return metricName + '{' + labelPart + '}';
        }
        function getPrometheusTime(date, roundUp) {
            if (lodash_1.default.isString(date)) {
                date = dateMath.parse(date, roundUp);
            }
            return Math.ceil(date.valueOf() / 1000);
        }
    }
    exports_1("PrometheusDatasource", PrometheusDatasource);
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (dateMath_1) {
                dateMath = dateMath_1;
            }],
        execute: function() {
            durationSplitRegexp = /(\d+)(ms|s|m|h|d|w|M|y)/;
        }
    }
});
//# sourceMappingURL=datasource.js.map