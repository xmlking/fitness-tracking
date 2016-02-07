/// <reference path="../../../../public/app/headers/common.d.ts" />
import { PanelCtrl } from './panel_ctrl';
declare class MetricsPanelCtrl extends PanelCtrl {
    error: boolean;
    loading: boolean;
    datasource: any;
    $q: any;
    $timeout: any;
    datasourceSrv: any;
    timeSrv: any;
    timing: any;
    range: any;
    rangeRaw: any;
    interval: any;
    resolution: any;
    timeInfo: any;
    skipDataOnInit: boolean;
    datasources: any[];
    constructor($scope: any, $injector: any);
    initEditMode(): void;
    refreshData(data: any): any;
    loadSnapshot(data: any): any;
    refresh(): void;
    setTimeQueryStart(): void;
    setTimeQueryEnd(): void;
    updateTimeRange(): void;
    applyPanelTimeOverrides(): void;
    issueQueries(datasource: any): any;
    setDatasource(datasource: any): void;
    addDataQuery(datasource: any): void;
}
export { MetricsPanelCtrl };
