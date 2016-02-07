/// <reference path="../../../../../public/app/headers/common.d.ts" />
import TimeSeries from 'app/core/time_series2';
import { MetricsPanelCtrl } from 'app/plugins/sdk';
declare class GraphCtrl extends MetricsPanelCtrl {
    private annotationsSrv;
    static templateUrl: string;
    hiddenSeries: any;
    seriesList: any;
    logScales: any;
    unitFormats: any;
    annotationsPromise: any;
    datapointsCount: number;
    datapointsOutside: boolean;
    datapointsWarning: boolean;
    colors: any;
    /** @ngInject */
    constructor($scope: any, $injector: any, annotationsSrv: any);
    initEditMode(): void;
    getExtendedMenu(): {
        text: string;
        click: string;
    }[];
    setUnitFormat(axis: any, subItem: any): void;
    refreshData(datasource: any): any;
    zoomOut(evt: any): void;
    loadSnapshot(snapshotData: any): void;
    dataHandler(results: any): void;
    seriesHandler(seriesData: any, index: any): TimeSeries;
    render(data?: any): void;
    changeSeriesColor(series: any, color: any): void;
    toggleSeries(serie: any, event: any): void;
    toggleSeriesExclusiveMode(serie: any): void;
    toggleYAxis(info: any): void;
    addSeriesOverride(override: any): void;
    removeSeriesOverride(override: any): void;
    toggleLegend(): void;
    legendValuesOptionChanged(): void;
    exportCsv(): void;
}
export { GraphCtrl, GraphCtrl as PanelCtrl };
