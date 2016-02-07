///<reference path="../../../../headers/common.d.ts" />
System.register(['../../../../../test/lib/common', '../module', '../../../../../test/specs/helpers'], function(exports_1) {
    var common_1, module_1, helpers_1;
    return {
        setters:[
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (module_1_1) {
                module_1 = module_1_1;
            },
            function (helpers_1_1) {
                helpers_1 = helpers_1_1;
            }],
        execute: function() {
            common_1.describe('GraphCtrl', function () {
                var ctx = new helpers_1.default.ControllerTestContext();
                common_1.beforeEach(common_1.angularMocks.module('grafana.services'));
                common_1.beforeEach(common_1.angularMocks.module('grafana.controllers'));
                common_1.beforeEach(ctx.providePhase());
                common_1.beforeEach(ctx.createPanelController(module_1.GraphCtrl));
                common_1.describe('get_data with 2 series', function () {
                    common_1.beforeEach(function () {
                        ctx.annotationsSrv.getAnnotations = common_1.sinon.stub().returns(ctx.$q.when([]));
                        ctx.datasource.query = common_1.sinon.stub().returns(ctx.$q.when({
                            data: [
                                { target: 'test.cpu1', datapoints: [[1, 10]] },
                                { target: 'test.cpu2', datapoints: [[1, 10]] }
                            ]
                        }));
                        ctx.ctrl.render = common_1.sinon.spy();
                        ctx.ctrl.refreshData(ctx.datasource);
                        ctx.scope.$digest();
                    });
                    common_1.it('should send time series to render', function () {
                        var data = ctx.ctrl.render.getCall(0).args[0];
                        common_1.expect(data.length).to.be(2);
                    });
                    common_1.describe('get_data failure following success', function () {
                        common_1.beforeEach(function () {
                            ctx.datasource.query = common_1.sinon.stub().returns(ctx.$q.reject('Datasource Error'));
                            ctx.ctrl.refreshData(ctx.datasource);
                            ctx.scope.$digest();
                        });
                    });
                });
            });
        }
    }
});
//# sourceMappingURL=graph_ctrl_specs.js.map