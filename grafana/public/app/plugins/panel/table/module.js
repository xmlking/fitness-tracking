///<reference path="../../../headers/common.d.ts" />
System.register(['lodash', 'jquery', 'app/core/utils/file_export', 'app/plugins/sdk', './transformers', './editor', './renderer'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, jquery_1, FileExport, sdk_1, transformers_1, editor_1, renderer_1;
    var panelDefaults, TablePanelCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            },
            function (FileExport_1) {
                FileExport = FileExport_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (transformers_1_1) {
                transformers_1 = transformers_1_1;
            },
            function (editor_1_1) {
                editor_1 = editor_1_1;
            },
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            }],
        execute: function() {
            panelDefaults = {
                targets: [{}],
                transform: 'timeseries_to_columns',
                pageSize: null,
                showHeader: true,
                styles: [
                    {
                        type: 'date',
                        pattern: 'Time',
                        dateFormat: 'YYYY-MM-DD HH:mm:ss',
                    },
                    {
                        unit: 'short',
                        type: 'number',
                        decimals: 2,
                        colors: ["rgba(245, 54, 54, 0.9)", "rgba(237, 129, 40, 0.89)", "rgba(50, 172, 45, 0.97)"],
                        colorMode: null,
                        pattern: '/.*/',
                        thresholds: [],
                    }
                ],
                columns: [],
                scroll: true,
                fontSize: '100%',
                sort: { col: 0, desc: true },
            };
            TablePanelCtrl = (function (_super) {
                __extends(TablePanelCtrl, _super);
                /** @ngInject */
                function TablePanelCtrl($scope, $injector, annotationsSrv) {
                    _super.call(this, $scope, $injector);
                    this.annotationsSrv = annotationsSrv;
                    this.pageIndex = 0;
                    if (this.panel.styles === void 0) {
                        this.panel.styles = this.panel.columns;
                        this.panel.columns = this.panel.fields;
                        delete this.panel.columns;
                        delete this.panel.fields;
                    }
                    lodash_1.default.defaults(this.panel, panelDefaults);
                }
                TablePanelCtrl.prototype.initEditMode = function () {
                    _super.prototype.initEditMode.call(this);
                    this.addEditorTab('Options', editor_1.tablePanelEditor, 2);
                };
                TablePanelCtrl.prototype.getExtendedMenu = function () {
                    var menu = _super.prototype.getExtendedMenu.call(this);
                    menu.push({ text: 'Export CSV', click: 'ctrl.exportCsv()' });
                    return menu;
                };
                TablePanelCtrl.prototype.refreshData = function (datasource) {
                    var _this = this;
                    this.pageIndex = 0;
                    if (this.panel.transform === 'annotations') {
                        return this.annotationsSrv.getAnnotations(this.dashboard).then(function (annotations) {
                            _this.dataRaw = annotations;
                            _this.render();
                        });
                    }
                    return this.issueQueries(datasource)
                        .then(this.dataHandler.bind(this))
                        .catch(function (err) {
                        _this.render();
                        throw err;
                    });
                };
                TablePanelCtrl.prototype.toggleColumnSort = function (col, colIndex) {
                    if (this.panel.sort.col === colIndex) {
                        if (this.panel.sort.desc) {
                            this.panel.sort.desc = false;
                        }
                        else {
                            this.panel.sort.col = null;
                        }
                    }
                    else {
                        this.panel.sort.col = colIndex;
                        this.panel.sort.desc = true;
                    }
                    this.render();
                };
                TablePanelCtrl.prototype.dataHandler = function (results) {
                    this.dataRaw = results.data;
                    this.pageIndex = 0;
                    this.render();
                };
                TablePanelCtrl.prototype.render = function () {
                    // automatically correct transform mode
                    // based on data
                    if (this.dataRaw && this.dataRaw.length) {
                        if (this.dataRaw[0].type === 'table') {
                            this.panel.transform = 'table';
                        }
                        else {
                            if (this.dataRaw[0].type === 'docs') {
                                this.panel.transform = 'json';
                            }
                            else {
                                if (this.panel.transform === 'table' || this.panel.transform === 'json') {
                                    this.panel.transform = 'timeseries_to_rows';
                                }
                            }
                        }
                    }
                    this.table = transformers_1.transformDataToTable(this.dataRaw, this.panel);
                    this.table.sort(this.panel.sort);
                    this.broadcastRender(this.table);
                };
                TablePanelCtrl.prototype.exportCsv = function () {
                    FileExport.exportTableDataToCsv(this.table);
                };
                TablePanelCtrl.prototype.link = function (scope, elem, attrs, ctrl) {
                    var data;
                    var panel = ctrl.panel;
                    var pageCount = 0;
                    var formaters = [];
                    function getTableHeight() {
                        var panelHeight = ctrl.height || ctrl.panel.height || ctrl.row.height;
                        if (lodash_1.default.isString(panelHeight)) {
                            panelHeight = parseInt(panelHeight.replace('px', ''), 10);
                        }
                        if (pageCount > 1) {
                            panelHeight -= 28;
                        }
                        return (panelHeight - 60) + 'px';
                    }
                    function appendTableRows(tbodyElem) {
                        var renderer = new renderer_1.TableRenderer(panel, data, ctrl.dashboard.timezone);
                        tbodyElem.empty();
                        tbodyElem.html(renderer.render(ctrl.pageIndex));
                    }
                    function switchPage(e) {
                        var el = jquery_1.default(e.currentTarget);
                        ctrl.pageIndex = (parseInt(el.text(), 10) - 1);
                        renderPanel();
                    }
                    function appendPaginationControls(footerElem) {
                        footerElem.empty();
                        var pageSize = panel.pageSize || 100;
                        pageCount = Math.ceil(data.rows.length / pageSize);
                        if (pageCount === 1) {
                            return;
                        }
                        var startPage = Math.max(ctrl.pageIndex - 3, 0);
                        var endPage = Math.min(pageCount, startPage + 9);
                        var paginationList = jquery_1.default('<ul></ul>');
                        for (var i = startPage; i < endPage; i++) {
                            var activeClass = i === ctrl.pageIndex ? 'active' : '';
                            var pageLinkElem = jquery_1.default('<li><a class="table-panel-page-link pointer ' + activeClass + '">' + (i + 1) + '</a></li>');
                            paginationList.append(pageLinkElem);
                        }
                        footerElem.append(paginationList);
                    }
                    function renderPanel() {
                        var panelElem = elem.parents('.panel');
                        var rootElem = elem.find('.table-panel-scroll');
                        var tbodyElem = elem.find('tbody');
                        var footerElem = elem.find('.table-panel-footer');
                        elem.css({ 'font-size': panel.fontSize });
                        panelElem.addClass('table-panel-wrapper');
                        appendTableRows(tbodyElem);
                        appendPaginationControls(footerElem);
                        rootElem.css({ 'max-height': panel.scroll ? getTableHeight() : '' });
                    }
                    elem.on('click', '.table-panel-page-link', switchPage);
                    scope.$on('$destroy', function () {
                        elem.off('click', '.table-panel-page-link');
                    });
                    scope.$on('render', function (event, renderData) {
                        data = renderData || data;
                        if (data) {
                            renderPanel();
                        }
                    });
                };
                TablePanelCtrl.templateUrl = 'public/app/plugins/panel/table/module.html';
                return TablePanelCtrl;
            })(sdk_1.MetricsPanelCtrl);
            exports_1("TablePanelCtrl", TablePanelCtrl);
            exports_1("PanelCtrl", TablePanelCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map