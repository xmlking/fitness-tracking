/// <reference path="../../../../public/app/headers/common.d.ts" />
export declare class AppEditCtrl {
    private backendSrv;
    private $routeParams;
    appModel: any;
    includedPanels: any;
    /** @ngInject */
    constructor(backendSrv: any, $routeParams: any);
    update(options: any): void;
    toggleEnabled(): void;
    togglePinned(): void;
}
