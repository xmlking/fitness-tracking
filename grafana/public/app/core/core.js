///<reference path="../headers/common.d.ts" />
///<reference path="./mod_defs.d.ts" />
System.register(["./directives/annotation_tooltip", "./directives/body_class", "./directives/confirm_click", "./directives/dash_edit_link", "./directives/dash_upload", "./directives/dropdown_typeahead", "./directives/grafana_version_check", "./directives/metric_segment", "./directives/misc", "./directives/ng_model_on_blur", "./directives/password_strenght", "./directives/spectrum_picker", "./directives/tags", "./directives/value_select_dropdown", "./directives/plugin_component", "./directives/rebuild_on_change", "./directives/give_focus", './jquery_extended', './partials', './components/grafana_app', './components/sidemenu/sidemenu', './components/search/search', './components/navbar/navbar', './directives/array_join', 'app/core/controllers/all', 'app/core/services/all', 'app/core/routes/all', './filters/filters', './core_module'], function(exports_1) {
    var grafana_app_1, sidemenu_1, search_1, navbar_1, array_join_1, core_module_1;
    return {
        setters:[
            function (_1) {},
            function (_2) {},
            function (_3) {},
            function (_4) {},
            function (_5) {},
            function (_6) {},
            function (_7) {},
            function (_8) {},
            function (_9) {},
            function (_10) {},
            function (_11) {},
            function (_12) {},
            function (_13) {},
            function (_14) {},
            function (_15) {},
            function (_16) {},
            function (_17) {},
            function (_18) {},
            function (_19) {},
            function (grafana_app_1_1) {
                grafana_app_1 = grafana_app_1_1;
            },
            function (sidemenu_1_1) {
                sidemenu_1 = sidemenu_1_1;
            },
            function (search_1_1) {
                search_1 = search_1_1;
            },
            function (navbar_1_1) {
                navbar_1 = navbar_1_1;
            },
            function (array_join_1_1) {
                array_join_1 = array_join_1_1;
            },
            function (_20) {},
            function (_21) {},
            function (_22) {},
            function (_23) {},
            function (core_module_1_1) {
                core_module_1 = core_module_1_1;
            }],
        execute: function() {
            exports_1("arrayJoin", array_join_1.arrayJoin);
            exports_1("coreModule", core_module_1.default);
            exports_1("grafanaAppDirective", grafana_app_1.grafanaAppDirective);
            exports_1("sideMenuDirective", sidemenu_1.sideMenuDirective);
            exports_1("navbarDirective", navbar_1.navbarDirective);
            exports_1("searchDirective", search_1.searchDirective);
        }
    }
});
//# sourceMappingURL=core.js.map