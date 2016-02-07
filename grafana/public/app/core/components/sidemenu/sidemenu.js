///<reference path="../../../headers/common.d.ts" />
System.register(['app/core/config', '../../core_module'], function(exports_1) {
    var config_1, core_module_1;
    var SideMenuCtrl;
    function sideMenuDirective() {
        return {
            restrict: 'E',
            templateUrl: 'public/app/core/components/sidemenu/sidemenu.html',
            controller: SideMenuCtrl,
            bindToController: true,
            controllerAs: 'ctrl',
            scope: {},
        };
    }
    exports_1("sideMenuDirective", sideMenuDirective);
    return {
        setters:[
            function (config_1_1) {
                config_1 = config_1_1;
            },
            function (core_module_1_1) {
                core_module_1 = core_module_1_1;
            }],
        execute: function() {
            SideMenuCtrl = (function () {
                /** @ngInject */
                function SideMenuCtrl($scope, $location, contextSrv, backendSrv) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$location = $location;
                    this.contextSrv = contextSrv;
                    this.backendSrv = backendSrv;
                    this.isSignedIn = contextSrv.isSignedIn;
                    this.user = contextSrv.user;
                    this.appSubUrl = config_1.default.appSubUrl;
                    this.showSignout = this.contextSrv.isSignedIn && !config_1.default['authProxyEnabled'];
                    this.updateMenu();
                    this.$scope.$on('$routeChangeSuccess', function () {
                        _this.updateMenu();
                        if (!_this.contextSrv.pinned) {
                            _this.contextSrv.sidemenu = false;
                        }
                    });
                }
                SideMenuCtrl.prototype.getUrl = function (url) {
                    return config_1.default.appSubUrl + url;
                };
                SideMenuCtrl.prototype.setupMainNav = function () {
                    var _this = this;
                    this.mainLinks = config_1.default.bootData.mainNavLinks.map(function (item) {
                        return { text: item.text, icon: item.icon, img: item.img, url: _this.getUrl(item.url) };
                    });
                };
                SideMenuCtrl.prototype.openUserDropdown = function () {
                    var _this = this;
                    this.orgMenu = [
                        { section: 'You', cssClass: 'dropdown-menu-title' },
                        { text: 'Preferences', url: this.getUrl('/profile') },
                        { text: 'Profile', url: this.getUrl('/profile') },
                    ];
                    if (this.isSignedIn) {
                        this.orgMenu.push({ text: "Sign out", url: this.getUrl("/logout"), target: "_self" });
                    }
                    if (this.contextSrv.hasRole('Admin')) {
                        this.orgMenu.push({ section: this.user.orgName, cssClass: 'dropdown-menu-title' });
                        this.orgMenu.push({
                            text: "Preferences",
                            url: this.getUrl("/org"),
                        });
                        this.orgMenu.push({
                            text: "Users",
                            url: this.getUrl("/org/users"),
                        });
                        this.orgMenu.push({
                            text: "API Keys",
                            url: this.getUrl("/org/apikeys"),
                        });
                    }
                    this.orgMenu.push({ cssClass: "divider" });
                    if (this.contextSrv.isGrafanaAdmin) {
                        this.orgMenu.push({ text: "Grafana adminstration", icon: "fa fa-fw fa-cogs", url: this.getUrl("/admin/settings") });
                    }
                    this.backendSrv.get('/api/user/orgs').then(function (orgs) {
                        orgs.forEach(function (org) {
                            if (org.orgId === _this.contextSrv.user.orgId) {
                                return;
                            }
                            _this.orgMenu.push({
                                text: "Switch to " + org.name,
                                icon: "fa fa-fw fa-random",
                                click: function () {
                                    _this.switchOrg(org.orgId);
                                }
                            });
                        });
                        if (config_1.default.allowOrgCreate) {
                            _this.orgMenu.push({ text: "New organization", icon: "fa fa-fw fa-plus", url: _this.getUrl('/org/new') });
                        }
                    });
                };
                SideMenuCtrl.prototype.switchOrg = function (orgId) {
                    this.backendSrv.post('/api/user/using/' + orgId).then(function () {
                        window.location.href = window.location.href;
                    });
                };
                ;
                SideMenuCtrl.prototype.setupAdminNav = function () {
                    this.systemSection = true;
                    this.grafanaVersion = config_1.default.buildInfo.version;
                    this.mainLinks.push({
                        text: "System info",
                        icon: "fa fa-fw fa-info",
                        url: this.getUrl("/admin/settings"),
                    });
                    this.mainLinks.push({
                        text: "Stats",
                        icon: "fa fa-fw fa-bar-chart",
                        url: this.getUrl("/admin/stats"),
                    });
                    this.mainLinks.push({
                        text: "Users",
                        icon: "fa fa-fw fa-user",
                        url: this.getUrl("/admin/users"),
                    });
                    this.mainLinks.push({
                        text: "Organizations",
                        icon: "fa fa-fw fa-users",
                        url: this.getUrl("/admin/orgs"),
                    });
                };
                SideMenuCtrl.prototype.updateMenu = function () {
                    this.systemSection = false;
                    this.mainLinks = [];
                    this.orgMenu = [];
                    var currentPath = this.$location.path();
                    if (currentPath.indexOf('/admin') === 0) {
                        this.setupAdminNav();
                    }
                    else {
                        this.setupMainNav();
                    }
                };
                ;
                return SideMenuCtrl;
            })();
            exports_1("SideMenuCtrl", SideMenuCtrl);
            core_module_1.default.directive('sidemenu', sideMenuDirective);
        }
    }
});
//# sourceMappingURL=sidemenu.js.map