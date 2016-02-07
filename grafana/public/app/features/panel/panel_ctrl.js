///<reference path="../../headers/common.d.ts" />
System.register(['app/core/config', 'lodash', 'angular'], function(exports_1) {
    var config_1, lodash_1, angular_1;
    var PanelCtrl;
    return {
        setters:[
            function (config_1_1) {
                config_1 = config_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (angular_1_1) {
                angular_1 = angular_1_1;
            }],
        execute: function() {
            PanelCtrl = (function () {
                function PanelCtrl($scope, $injector) {
                    var _this = this;
                    this.$injector = $injector;
                    this.$scope = $scope;
                    this.$timeout = $injector.get('$timeout');
                    this.editorTabIndex = 0;
                    var plugin = config_1.default.panels[this.panel.type];
                    if (plugin) {
                        this.pluginId = plugin.id;
                        this.pluginName = plugin.name;
                    }
                    $scope.$on("refresh", function () { return _this.refresh(); });
                }
                PanelCtrl.prototype.init = function () {
                    this.publishAppEvent('panel-instantiated', { scope: this.$scope });
                    this.refresh();
                };
                PanelCtrl.prototype.renderingCompleted = function () {
                    this.$scope.$root.performance.panelsRendered++;
                };
                PanelCtrl.prototype.refresh = function () {
                    return;
                };
                PanelCtrl.prototype.publishAppEvent = function (evtName, evt) {
                    this.$scope.$root.appEvent(evtName, evt);
                };
                PanelCtrl.prototype.changeView = function (fullscreen, edit) {
                    this.publishAppEvent('panel-change-view', {
                        fullscreen: fullscreen, edit: edit, panelId: this.panel.id
                    });
                };
                PanelCtrl.prototype.viewPanel = function () {
                    this.changeView(true, false);
                };
                PanelCtrl.prototype.editPanel = function () {
                    this.changeView(true, true);
                };
                PanelCtrl.prototype.exitFullscreen = function () {
                    this.changeView(false, false);
                };
                PanelCtrl.prototype.initEditMode = function () {
                    this.editorTabs = [];
                    this.addEditorTab('General', 'public/app/partials/panelgeneral.html');
                    this.editModeInitiated = true;
                };
                PanelCtrl.prototype.addEditorTab = function (title, directiveFn, index) {
                    var editorTab = { title: title, directiveFn: directiveFn };
                    if (lodash_1.default.isString(directiveFn)) {
                        editorTab.directiveFn = function () {
                            return { templateUrl: directiveFn };
                        };
                    }
                    if (index) {
                        this.editorTabs.splice(index, 0, editorTab);
                    }
                    else {
                        this.editorTabs.push(editorTab);
                    }
                };
                PanelCtrl.prototype.getMenu = function () {
                    var menu = [];
                    menu.push({ text: 'View', click: 'ctrl.viewPanel(); dismiss();' });
                    menu.push({ text: 'Edit', click: 'ctrl.editPanel(); dismiss();', role: 'Editor' });
                    menu.push({ text: 'Duplicate', click: 'ctrl.duplicate()', role: 'Editor' });
                    menu.push({ text: 'Share', click: 'ctrl.sharePanel(); dismiss();' });
                    return menu;
                };
                PanelCtrl.prototype.getExtendedMenu = function () {
                    return [{ text: 'Panel JSON', click: 'ctrl.editPanelJson(); dismiss();' }];
                };
                PanelCtrl.prototype.otherPanelInFullscreenMode = function () {
                    return this.dashboard.meta.fullscreen && !this.fullscreen;
                };
                PanelCtrl.prototype.broadcastRender = function (arg1, arg2) {
                    this.$scope.$broadcast('render', arg1, arg2);
                };
                PanelCtrl.prototype.toggleEditorHelp = function (index) {
                    if (this.editorHelpIndex === index) {
                        this.editorHelpIndex = null;
                        return;
                    }
                    this.editorHelpIndex = index;
                };
                PanelCtrl.prototype.duplicate = function () {
                    this.dashboard.duplicatePanel(this.panel, this.row);
                };
                PanelCtrl.prototype.updateColumnSpan = function (span) {
                    var _this = this;
                    this.panel.span = Math.min(Math.max(Math.floor(this.panel.span + span), 1), 12);
                    this.$timeout(function () {
                        _this.broadcastRender();
                    });
                };
                PanelCtrl.prototype.removePanel = function () {
                    var _this = this;
                    this.publishAppEvent('confirm-modal', {
                        title: 'Are you sure you want to remove this panel?',
                        icon: 'fa-trash',
                        yesText: 'Delete',
                        onConfirm: function () {
                            _this.row.panels = lodash_1.default.without(_this.row.panels, _this.panel);
                        }
                    });
                };
                PanelCtrl.prototype.editPanelJson = function () {
                    this.publishAppEvent('show-json-editor', {
                        object: this.panel,
                        updateHandler: this.replacePanel.bind(this)
                    });
                };
                PanelCtrl.prototype.replacePanel = function (newPanel, oldPanel) {
                    var _this = this;
                    var row = this.row;
                    var index = lodash_1.default.indexOf(this.row.panels, oldPanel);
                    this.row.panels.splice(index, 1);
                    // adding it back needs to be done in next digest
                    this.$timeout(function () {
                        newPanel.id = oldPanel.id;
                        newPanel.span = oldPanel.span;
                        _this.row.panels.splice(index, 0, newPanel);
                    });
                };
                PanelCtrl.prototype.sharePanel = function () {
                    var shareScope = this.$scope.$new();
                    shareScope.panel = this.panel;
                    shareScope.dashboard = this.dashboard;
                    this.publishAppEvent('show-modal', {
                        src: 'public/app/features/dashboard/partials/shareModal.html',
                        scope: shareScope
                    });
                };
                PanelCtrl.prototype.openInspector = function () {
                    var modalScope = this.$scope.$new();
                    modalScope.panel = this.panel;
                    modalScope.dashboard = this.dashboard;
                    modalScope.inspector = angular_1.default.copy(this.inspector);
                    this.publishAppEvent('show-modal', {
                        src: 'public/app/partials/inspector.html',
                        scope: modalScope
                    });
                };
                return PanelCtrl;
            })();
            exports_1("PanelCtrl", PanelCtrl);
        }
    }
});
//# sourceMappingURL=panel_ctrl.js.map