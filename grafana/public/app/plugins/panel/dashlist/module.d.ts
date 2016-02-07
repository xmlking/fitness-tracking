/// <reference path="../../../../../public/app/headers/common.d.ts" />
import { PanelCtrl } from 'app/plugins/sdk';
declare class DashListCtrl extends PanelCtrl {
    private backendSrv;
    static templateUrl: string;
    dashList: any[];
    modes: any[];
    /** @ngInject */
    constructor($scope: any, $injector: any, backendSrv: any);
    initEditMode(): void;
    refresh(): any;
}
export { DashListCtrl, DashListCtrl as PanelCtrl };
