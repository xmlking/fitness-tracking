/// <reference path="../../../../../public/app/headers/common.d.ts" />
export declare class SideMenuCtrl {
    private $scope;
    private $location;
    private contextSrv;
    private backendSrv;
    isSignedIn: boolean;
    showSignout: boolean;
    user: any;
    mainLinks: any;
    orgMenu: any;
    systemSection: any;
    grafanaVersion: any;
    appSubUrl: string;
    /** @ngInject */
    constructor($scope: any, $location: any, contextSrv: any, backendSrv: any);
    getUrl(url: any): any;
    setupMainNav(): void;
    openUserDropdown(): void;
    switchOrg(orgId: any): void;
    setupAdminNav(): void;
    updateMenu(): void;
}
export declare function sideMenuDirective(): {
    restrict: string;
    templateUrl: string;
    controller: typeof SideMenuCtrl;
    bindToController: boolean;
    controllerAs: string;
    scope: {};
};
