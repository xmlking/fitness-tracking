///<reference path="../../headers/common.d.ts" />

import angular from 'angular';
import _ from 'lodash';

export class AppEditCtrl {
  appModel: any;
  includedPanels: any;

  /** @ngInject */
  constructor(private backendSrv: any, private $routeParams: any) {
    this.appModel = {};

    this.backendSrv.get(`/api/org/apps/${this.$routeParams.appId}/settings`).then(result => {
      this.appModel = result;
      this.includedPanels = _.where(result.includes, {type: 'panel'});
    });
  }

  update(options) {
    var updateCmd = _.extend({
      appId: this.appModel.appId,
      orgId: this.appModel.orgId,
      enabled: this.appModel.enabled,
      pinned: this.appModel.pinned,
      jsonData: this.appModel.jsonData,
      secureJsonData: this.appModel.secureJsonData,
    }, options);

    this.backendSrv.post(`/api/org/apps/${this.$routeParams.appId}/settings`, updateCmd).then(function() {
      window.location.href = window.location.href;
    });
  }

  toggleEnabled() {
    this.update({enabled: this.appModel.enabled});
  }

  togglePinned() {
    this.update({pinned: this.appModel.pinned});
  }
}

angular.module('grafana.controllers').controller('AppEditCtrl', AppEditCtrl);

