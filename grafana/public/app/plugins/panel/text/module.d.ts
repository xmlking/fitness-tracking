/// <reference path="../../../../../public/app/headers/common.d.ts" />
import { PanelCtrl } from 'app/plugins/sdk';
export declare class TextPanelCtrl extends PanelCtrl {
    private templateSrv;
    private $sce;
    static templateUrl: string;
    converter: any;
    content: string;
    /** @ngInject */
    constructor($scope: any, $injector: any, templateSrv: any, $sce: any);
    initEditMode(): void;
    refresh(): void;
    render(): void;
    renderText(content: any): void;
    renderMarkdown(content: any): void;
    updateContent(html: any): void;
}
export { TextPanelCtrl as PanelCtrl };
