///<reference path="../../../headers/common.d.ts" />

import angular from 'angular';
import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import * as FileExport from 'app/core/utils/file_export';
import {MetricsPanelCtrl} from 'app/plugins/sdk';
import {transformDataToTable} from './transformers';
import {tablePanelEditor} from './editor';
import {TableRenderer} from './renderer';

var panelDefaults = {
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
  sort: {col: 0, desc: true},
};

class TablePanelCtrl extends MetricsPanelCtrl {
  static templateUrl = 'public/app/plugins/panel/table/module.html';

  pageIndex: number;
  dataRaw: any;
  table: any;

  /** @ngInject */
  constructor($scope, $injector, private annotationsSrv) {
    super($scope, $injector);
    this.pageIndex = 0;

    if (this.panel.styles === void 0) {
      this.panel.styles = this.panel.columns;
      this.panel.columns = this.panel.fields;
      delete this.panel.columns;
      delete this.panel.fields;
    }

    _.defaults(this.panel, panelDefaults);
  }

  initEditMode() {
    super.initEditMode();
    this.addEditorTab('Options', tablePanelEditor, 2);
  }

  getExtendedMenu() {
    var menu = super.getExtendedMenu();
    menu.push({text: 'Export CSV', click: 'ctrl.exportCsv()'});
    return menu;
  }

  refreshData(datasource) {
    this.pageIndex = 0;

    if (this.panel.transform === 'annotations') {
      return this.annotationsSrv.getAnnotations(this.dashboard).then(annotations => {
        this.dataRaw = annotations;
        this.render();
      });
    }

    return this.issueQueries(datasource)
    .then(this.dataHandler.bind(this))
    .catch(err => {
      this.render();
      throw err;
    });
  }

  toggleColumnSort(col, colIndex) {
    if (this.panel.sort.col === colIndex) {
      if (this.panel.sort.desc) {
        this.panel.sort.desc = false;
      } else {
        this.panel.sort.col = null;
      }
    } else {
      this.panel.sort.col = colIndex;
      this.panel.sort.desc = true;
    }

    this.render();
  }

  dataHandler(results) {
    this.dataRaw = results.data;
    this.pageIndex = 0;
    this.render();
  }

  render() {
    // automatically correct transform mode
    // based on data
    if (this.dataRaw && this.dataRaw.length) {
      if (this.dataRaw[0].type === 'table') {
        this.panel.transform = 'table';
      } else {
        if (this.dataRaw[0].type === 'docs') {
          this.panel.transform = 'json';
        } else {
          if (this.panel.transform === 'table' || this.panel.transform === 'json') {
            this.panel.transform = 'timeseries_to_rows';
          }
        }
      }
    }

    this.table = transformDataToTable(this.dataRaw, this.panel);
    this.table.sort(this.panel.sort);
    this.broadcastRender(this.table);
  }

  exportCsv() {
    FileExport.exportTableDataToCsv(this.table);
  }

  link(scope, elem, attrs, ctrl) {
    var data;
    var panel = ctrl.panel;
    var pageCount = 0;
    var formaters = [];

    function getTableHeight() {
      var panelHeight = ctrl.height || ctrl.panel.height || ctrl.row.height;
      if (_.isString(panelHeight)) {
        panelHeight = parseInt(panelHeight.replace('px', ''), 10);
      }
      if (pageCount > 1) {
        panelHeight -= 28;
      }

      return (panelHeight - 60) + 'px';
    }

    function appendTableRows(tbodyElem) {
      var renderer = new TableRenderer(panel, data, ctrl.dashboard.timezone);
      tbodyElem.empty();
      tbodyElem.html(renderer.render(ctrl.pageIndex));
    }

    function switchPage(e) {
      var el = $(e.currentTarget);
      ctrl.pageIndex = (parseInt(el.text(), 10)-1);
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

      var paginationList = $('<ul></ul>');

      for (var i = startPage; i < endPage; i++) {
        var activeClass = i === ctrl.pageIndex ? 'active' : '';
        var pageLinkElem = $('<li><a class="table-panel-page-link pointer ' + activeClass + '">' + (i+1) + '</a></li>');
        paginationList.append(pageLinkElem);
      }

      footerElem.append(paginationList);
    }

    function renderPanel() {
      var panelElem = elem.parents('.panel');
      var rootElem = elem.find('.table-panel-scroll');
      var tbodyElem = elem.find('tbody');
      var footerElem = elem.find('.table-panel-footer');

      elem.css({'font-size': panel.fontSize});
      panelElem.addClass('table-panel-wrapper');

      appendTableRows(tbodyElem);
      appendPaginationControls(footerElem);

      rootElem.css({'max-height': panel.scroll ? getTableHeight() : '' });
    }

    elem.on('click', '.table-panel-page-link', switchPage);

    scope.$on('$destroy', function() {
      elem.off('click', '.table-panel-page-link');
    });

    scope.$on('render', function(event, renderData) {
      data = renderData || data;
      if (data) {
        renderPanel();
      }
    });
  }
}

export {
  TablePanelCtrl,
  TablePanelCtrl as PanelCtrl
};
