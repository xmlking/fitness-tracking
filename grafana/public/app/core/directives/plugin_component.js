///<reference path="../../headers/common.d.ts" />
System.register(['angular', 'lodash', 'app/core/config', 'app/core/core_module', 'app/plugins/panel/unknown/module'], function(exports_1) {
    var angular_1, lodash_1, config_1, core_module_1, module_1;
    /** @ngInject */
    function pluginDirectiveLoader($compile, datasourceSrv, $rootScope, $q, $http, $templateCache) {
        function getTemplate(component) {
            if (component.template) {
                return $q.when(component.template);
            }
            var cached = $templateCache.get(component.templateUrl);
            if (cached) {
                return $q.when(cached);
            }
            return $http.get(component.templateUrl).then(function (res) {
                return res.data;
            });
        }
        function getPluginComponentDirective(options) {
            return function () {
                return {
                    templateUrl: options.Component.templateUrl,
                    template: options.Component.template,
                    restrict: 'E',
                    controller: options.Component,
                    controllerAs: 'ctrl',
                    bindToController: true,
                    scope: options.bindings,
                    link: function (scope, elem, attrs, ctrl) {
                        if (ctrl.link) {
                            ctrl.link(scope, elem, attrs, ctrl);
                        }
                        if (ctrl.init) {
                            ctrl.init();
                        }
                    }
                };
            };
        }
        function loadPanelComponentInfo(scope, attrs) {
            var componentInfo = {
                name: 'panel-plugin-' + scope.panel.type,
                bindings: { dashboard: "=", panel: "=", row: "=" },
                attrs: { dashboard: "dashboard", panel: "panel", row: "row" },
            };
            var panelElemName = 'panel-' + scope.panel.type;
            var panelInfo = config_1.default.panels[scope.panel.type];
            var panelCtrlPromise = Promise.resolve(module_1.UnknownPanelCtrl);
            if (panelInfo) {
                panelCtrlPromise = System.import(panelInfo.module).then(function (panelModule) {
                    return panelModule.PanelCtrl;
                });
            }
            return panelCtrlPromise.then(function (PanelCtrl) {
                componentInfo.Component = PanelCtrl;
                if (!PanelCtrl || PanelCtrl.registered) {
                    return componentInfo;
                }
                ;
                if (PanelCtrl.templatePromise) {
                    return PanelCtrl.templatePromise.then(function (res) {
                        return componentInfo;
                    });
                }
                PanelCtrl.templatePromise = getTemplate(PanelCtrl).then(function (template) {
                    PanelCtrl.templateUrl = null;
                    PanelCtrl.template = "<grafana-panel ctrl=\"ctrl\">" + template + "</grafana-panel>";
                    return componentInfo;
                });
                return PanelCtrl.templatePromise;
            });
        }
        function getModule(scope, attrs) {
            switch (attrs.type) {
                // QueryCtrl
                case "query-ctrl": {
                    var datasource = scope.target.datasource || scope.ctrl.panel.datasource;
                    return datasourceSrv.get(datasource).then(function (ds) {
                        scope.datasource = ds;
                        return System.import(ds.meta.module).then(function (dsModule) {
                            return {
                                name: 'query-ctrl-' + ds.meta.id,
                                bindings: { target: "=", panelCtrl: "=", datasource: "=" },
                                attrs: { "target": "target", "panel-ctrl": "ctrl", datasource: "datasource" },
                                Component: dsModule.QueryCtrl
                            };
                        });
                    });
                }
                // QueryOptionsCtrl
                case "query-options-ctrl": {
                    return datasourceSrv.get(scope.ctrl.panel.datasource).then(function (ds) {
                        return System.import(ds.meta.module).then(function (dsModule) {
                            if (!dsModule.QueryOptionsCtrl) {
                                return { notFound: true };
                            }
                            return {
                                name: 'query-options-ctrl-' + ds.meta.id,
                                bindings: { panelCtrl: "=" },
                                attrs: { "panel-ctrl": "ctrl" },
                                Component: dsModule.QueryOptionsCtrl
                            };
                        });
                    });
                }
                // Annotations
                case "annotations-query-ctrl": {
                    return System.import(scope.currentDatasource.meta.module).then(function (dsModule) {
                        return {
                            name: 'annotations-query-ctrl-' + scope.currentDatasource.meta.id,
                            bindings: { annotation: "=", datasource: "=" },
                            attrs: { "annotation": "currentAnnotation", datasource: "currentDatasource" },
                            Component: dsModule.AnnotationsQueryCtrl,
                        };
                    });
                }
                // ConfigCtrl
                case 'datasource-config-ctrl': {
                    return System.import(scope.datasourceMeta.module).then(function (dsModule) {
                        return {
                            name: 'ds-config-' + scope.datasourceMeta.id,
                            bindings: { meta: "=", current: "=" },
                            attrs: { meta: "datasourceMeta", current: "current" },
                            Component: dsModule.ConfigCtrl,
                        };
                    });
                }
                // AppConfigCtrl
                case 'app-config-ctrl': {
                    return System.import(scope.ctrl.appModel.module).then(function (appModule) {
                        return {
                            name: 'app-config-' + scope.ctrl.appModel.appId,
                            bindings: { appModel: "=", appEditCtrl: "=" },
                            attrs: { "app-model": "ctrl.appModel", "app-edit-ctrl": "ctrl" },
                            Component: appModule.ConfigCtrl,
                        };
                    });
                }
                // Panel
                case 'panel': {
                    return loadPanelComponentInfo(scope, attrs);
                }
                default: {
                    return $q.reject({ message: "Could not find component type: " + attrs.type });
                }
            }
        }
        function appendAndCompile(scope, elem, componentInfo) {
            var child = angular_1.default.element(document.createElement(componentInfo.name));
            lodash_1.default.each(componentInfo.attrs, function (value, key) {
                child.attr(key, value);
            });
            $compile(child)(scope);
            elem.empty();
            elem.append(child);
        }
        function registerPluginComponent(scope, elem, attrs, componentInfo) {
            if (componentInfo.notFound) {
                elem.empty();
                return;
            }
            if (!componentInfo.Component) {
                throw { message: 'Failed to find exported plugin component for ' + componentInfo.name };
            }
            if (!componentInfo.Component.registered) {
                var directiveName = attrs.$normalize(componentInfo.name);
                var directiveFn = getPluginComponentDirective(componentInfo);
                core_module_1.default.directive(directiveName, directiveFn);
                componentInfo.Component.registered = true;
            }
            appendAndCompile(scope, elem, componentInfo);
        }
        return {
            restrict: 'E',
            link: function (scope, elem, attrs) {
                getModule(scope, attrs).then(function (componentInfo) {
                    registerPluginComponent(scope, elem, attrs, componentInfo);
                }).catch(function (err) {
                    $rootScope.appEvent('alert-error', ['Plugin Error', err.message || err]);
                    console.log('Plugin componnet error', err);
                });
            }
        };
    }
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (config_1_1) {
                config_1 = config_1_1;
            },
            function (core_module_1_1) {
                core_module_1 = core_module_1_1;
            },
            function (module_1_1) {
                module_1 = module_1_1;
            }],
        execute: function() {
            core_module_1.default.directive('pluginComponent', pluginDirectiveLoader);
        }
    }
});
//# sourceMappingURL=plugin_component.js.map