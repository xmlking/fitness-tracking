/// <reference path="../../../../../public/app/headers/common.d.ts" />
import { QueryCtrl } from 'app/plugins/sdk';
export declare class OpenTsQueryCtrl extends QueryCtrl {
    static templateUrl: string;
    aggregators: any;
    fillPolicies: any;
    aggregator: any;
    downsampleInterval: any;
    downsampleAggregator: any;
    downsampleFillPolicy: any;
    errors: any;
    suggestMetrics: any;
    suggestTagKeys: any;
    suggestTagValues: any;
    addTagMode: boolean;
    /** @ngInject **/
    constructor($scope: any, $injector: any);
    targetBlur(): void;
    getTextValues(metricFindResult: any): any;
    addTag(): void;
    removeTag(key: any): void;
    editTag(key: any, value: any): void;
    validateTarget(): any;
}
