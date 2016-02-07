/// <reference path="../../../../../public/app/headers/common.d.ts" />
import TimeSeries from 'app/core/time_series2';
import { MetricsPanelCtrl } from 'app/plugins/sdk';
declare class SingleStatCtrl extends MetricsPanelCtrl {
    private $location;
    private linkSrv;
    private templateSrv;
    static templateUrl: string;
    series: any[];
    data: any[];
    fontSizes: any[];
    unitFormats: any[];
    /** @ngInject */
    constructor($scope: any, $injector: any, $location: any, linkSrv: any, templateSrv: any);
    initEditMode(): void;
    setUnitFormat(subItem: any): void;
    refreshData(datasource: any): any;
    loadSnapshot(snapshotData: any): void;
    dataHandler(results: any): void;
    seriesHandler(seriesData: any): TimeSeries;
    setColoring(options: any): void;
    invertColorOrder(): void;
    getDecimalsForValue(value: any): any;
    render(): void;
    setValues(data: any): void;
    removeValueMap(map: any): void;
    addValueMap(): void;
    link(scope: any, elem: any, attrs: any, ctrl: any): void;
}
declare function getColorForValue(data: any, value: any): any;
export { SingleStatCtrl, SingleStatCtrl as PanelCtrl, getColorForValue };
