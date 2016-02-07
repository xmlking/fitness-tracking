///<reference path="../../headers/common.d.ts" />
System.register(['angular'], function(exports_1) {
    var angular_1;
    var module;
    /** @ngInject **/
    function queryEditorRowDirective() {
        return {
            restrict: 'E',
            templateUrl: 'public/app/features/panel/partials/query_editor_row.html',
            transclude: true,
            scope: { ctrl: "=" },
        };
    }
    return {
        setters:[
            function (angular_1_1) {
                angular_1 = angular_1_1;
            }],
        execute: function() {
            module = angular_1.default.module('grafana.directives');
            module.directive('queryEditorRow', queryEditorRowDirective);
        }
    }
});
//# sourceMappingURL=query_editor_row.js.map