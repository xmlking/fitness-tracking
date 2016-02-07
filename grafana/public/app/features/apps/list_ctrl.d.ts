/// <reference path="../../../../public/app/headers/common.d.ts" />
export declare class AppListCtrl {
    private backendSrv;
    apps: any[];
    /** @ngInject */
    constructor(backendSrv: any);
    init(): void;
}
