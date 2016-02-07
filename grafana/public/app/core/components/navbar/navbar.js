///<reference path="../../../headers/common.d.ts" />
System.register(['../../core_module'], function(exports_1) {
    var core_module_1;
    var NavbarCtrl;
    function navbarDirective() {
        return {
            restrict: 'E',
            templateUrl: 'public/app/core/components/navbar/navbar.html',
            controller: NavbarCtrl,
            bindToController: true,
            controllerAs: 'ctrl',
            transclude: true,
            scope: {
                title: "@",
                titleUrl: "@",
            },
            link: function (scope, elem, attrs, ctrl) {
                ctrl.icon = attrs.icon;
                ctrl.subnav = attrs.subnav;
            }
        };
    }
    exports_1("navbarDirective", navbarDirective);
    return {
        setters:[
            function (core_module_1_1) {
                core_module_1 = core_module_1_1;
            }],
        execute: function() {
            NavbarCtrl = (function () {
                /** @ngInject */
                function NavbarCtrl($scope, contextSrv) {
                    this.$scope = $scope;
                    this.contextSrv = contextSrv;
                }
                return NavbarCtrl;
            })();
            exports_1("NavbarCtrl", NavbarCtrl);
            core_module_1.default.directive('navbar', navbarDirective);
        }
    }
});
//# sourceMappingURL=navbar.js.map