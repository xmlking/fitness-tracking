System.register(['test/lib/common', 'moment', 'test/specs/helpers', '../datasource'], function(exports_1) {
    var common_1, moment_1, helpers_1, datasource_1;
    return {
        setters:[
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (helpers_1_1) {
                helpers_1 = helpers_1_1;
            },
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            }],
        execute: function() {
            common_1.describe('PrometheusDatasource', function () {
                var ctx = new helpers_1.default.ServiceTestContext();
                var instanceSettings = { url: 'proxied', directUrl: 'direct', user: 'test', password: 'mupp' };
                common_1.beforeEach(common_1.angularMocks.module('grafana.core'));
                common_1.beforeEach(common_1.angularMocks.module('grafana.services'));
                common_1.beforeEach(common_1.angularMocks.inject(function ($q, $rootScope, $httpBackend, $injector) {
                    ctx.$q = $q;
                    ctx.$httpBackend = $httpBackend;
                    ctx.$rootScope = $rootScope;
                    ctx.ds = $injector.instantiate(datasource_1.PrometheusDatasource, { instanceSettings: instanceSettings });
                }));
                common_1.describe('When querying prometheus with one target using query editor target spec', function () {
                    var results;
                    var urlExpected = 'proxied/api/v1/query_range?query=' +
                        encodeURIComponent('test{job="testjob"}') +
                        '&start=1443438675&end=1443460275&step=60';
                    var query = {
                        range: { from: moment_1.default(1443438674760), to: moment_1.default(1443460274760) },
                        targets: [{ expr: 'test{job="testjob"}' }],
                        interval: '60s'
                    };
                    var response = {
                        status: "success",
                        data: {
                            resultType: "matrix",
                            result: [{
                                    metric: { "__name__": "test", job: "testjob" },
                                    values: [[1443454528, "3846"]]
                                }]
                        }
                    };
                    common_1.beforeEach(function () {
                        ctx.$httpBackend.expect('GET', urlExpected).respond(response);
                        ctx.ds.query(query).then(function (data) { results = data; });
                        ctx.$httpBackend.flush();
                    });
                    common_1.it('should generate the correct query', function () {
                        ctx.$httpBackend.verifyNoOutstandingExpectation();
                    });
                    common_1.it('should return series list', function () {
                        common_1.expect(results.data.length).to.be(1);
                        common_1.expect(results.data[0].target).to.be('test{job="testjob"}');
                    });
                });
                common_1.describe('When querying prometheus with one target which return multiple series', function () {
                    var results;
                    var start = 1443438675;
                    var end = 1443460275;
                    var step = 60;
                    var urlExpected = 'proxied/api/v1/query_range?query=' +
                        encodeURIComponent('test{job="testjob"}') +
                        '&start=' + start + '&end=' + end + '&step=' + step;
                    var query = {
                        range: { from: moment_1.default(1443438674760), to: moment_1.default(1443460274760) },
                        targets: [{ expr: 'test{job="testjob"}' }],
                        interval: '60s'
                    };
                    var response = {
                        status: "success",
                        data: {
                            resultType: "matrix",
                            result: [
                                {
                                    metric: { "__name__": "test", job: "testjob", series: 'series 1' },
                                    values: [
                                        [start + step * 1, "3846"],
                                        [start + step * 3, "3847"],
                                        [end - step * 1, "3848"],
                                    ]
                                },
                                {
                                    metric: { "__name__": "test", job: "testjob", series: 'series 2' },
                                    values: [
                                        [start + step * 2, "4846"]
                                    ]
                                },
                            ]
                        }
                    };
                    common_1.beforeEach(function () {
                        ctx.$httpBackend.expect('GET', urlExpected).respond(response);
                        ctx.ds.query(query).then(function (data) { results = data; });
                        ctx.$httpBackend.flush();
                    });
                    common_1.it('should be same length', function () {
                        common_1.expect(results.data.length).to.be(2);
                        common_1.expect(results.data[0].datapoints.length).to.be((end - start) / step + 1);
                        common_1.expect(results.data[1].datapoints.length).to.be((end - start) / step + 1);
                    });
                    common_1.it('should fill null until first datapoint in response', function () {
                        common_1.expect(results.data[0].datapoints[0][1]).to.be(start * 1000);
                        common_1.expect(results.data[0].datapoints[0][0]).to.be(null);
                        common_1.expect(results.data[0].datapoints[1][1]).to.be((start + step * 1) * 1000);
                        common_1.expect(results.data[0].datapoints[1][0]).to.be(3846);
                    });
                    common_1.it('should fill null after last datapoint in response', function () {
                        var length = (end - start) / step + 1;
                        common_1.expect(results.data[0].datapoints[length - 2][1]).to.be((end - step * 1) * 1000);
                        common_1.expect(results.data[0].datapoints[length - 2][0]).to.be(3848);
                        common_1.expect(results.data[0].datapoints[length - 1][1]).to.be(end * 1000);
                        common_1.expect(results.data[0].datapoints[length - 1][0]).to.be(null);
                    });
                    common_1.it('should fill null at gap between series', function () {
                        common_1.expect(results.data[0].datapoints[2][1]).to.be((start + step * 2) * 1000);
                        common_1.expect(results.data[0].datapoints[2][0]).to.be(null);
                        common_1.expect(results.data[1].datapoints[1][1]).to.be((start + step * 1) * 1000);
                        common_1.expect(results.data[1].datapoints[1][0]).to.be(null);
                        common_1.expect(results.data[1].datapoints[3][1]).to.be((start + step * 3) * 1000);
                        common_1.expect(results.data[1].datapoints[3][0]).to.be(null);
                    });
                });
                common_1.describe('When performing metricFindQuery', function () {
                    var results;
                    var response;
                    common_1.it('label_values(resource) should generate label search query', function () {
                        response = {
                            status: "success",
                            data: ["value1", "value2", "value3"]
                        };
                        ctx.$httpBackend.expect('GET', 'proxied/api/v1/label/resource/values').respond(response);
                        ctx.ds.metricFindQuery('label_values(resource)').then(function (data) { results = data; });
                        ctx.$httpBackend.flush();
                        ctx.$rootScope.$apply();
                        common_1.expect(results.length).to.be(3);
                    });
                    common_1.it('label_values(metric, resource) should generate series query', function () {
                        response = {
                            status: "success",
                            data: [
                                { __name__: "metric", resource: "value1" },
                                { __name__: "metric", resource: "value2" },
                                { __name__: "metric", resource: "value3" }
                            ]
                        };
                        ctx.$httpBackend.expect('GET', 'proxied/api/v1/series?match[]=metric').respond(response);
                        ctx.ds.metricFindQuery('label_values(metric, resource)').then(function (data) { results = data; });
                        ctx.$httpBackend.flush();
                        ctx.$rootScope.$apply();
                        common_1.expect(results.length).to.be(3);
                    });
                    common_1.it('metrics(metric.*) should generate metric name query', function () {
                        response = {
                            status: "success",
                            data: ["metric1", "metric2", "metric3", "nomatch"]
                        };
                        ctx.$httpBackend.expect('GET', 'proxied/api/v1/label/__name__/values').respond(response);
                        ctx.ds.metricFindQuery('metrics(metric.*)').then(function (data) { results = data; });
                        ctx.$httpBackend.flush();
                        ctx.$rootScope.$apply();
                        common_1.expect(results.length).to.be(3);
                    });
                });
            });
        }
    }
});
//# sourceMappingURL=datasource_specs.js.map