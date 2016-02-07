/// <reference path="../../../../../public/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
declare class TablePanelCtrl extends MetricsPanelCtrl {
    private annotationsSrv;
    static templateUrl: string;
    pageIndex: number;
    dataRaw: any;
    table: any;
    /** @ngInject */
    constructor($scope: any, $injector: any, annotationsSrv: any);
    initEditMode(): void;
    getExtendedMenu(): {
        text: string;
        click: string;
    }[];
    refreshData(datasource: any): any;
    toggleColumnSort(col: any, colIndex: any): void;
    dataHandler(results: any): void;
    render(): void;
    exportCsv(): void;
    link(scope: any, elem: any, attrs: any, ctrl: any): void;
}
export { TablePanelCtrl, TablePanelCtrl as PanelCtrl };
