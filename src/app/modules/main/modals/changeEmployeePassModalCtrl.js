'use strict';
angular.module('mainModule')
.controller('ChangeEmployeePassController', function($scope, $translate, toastr,$uibModalInstance, $common, $q) {
  var emailNull = $translate.instant('toaster.emailNull');
  var sendEmailError = $translate.instant('employee.resetPass.sendEmailError');
  var sendEmailSuccess = $translate.instant('employee.changePassSuccess');

  $scope.closeDialog = function () {
    $uibModalInstance.close();
  };

  function sendEmailReset() {
    var defered = $q.defer();

    var info = {
      email: $scope.reset.email
    };

    $common.sendEmailReset(info, function(result) {
      if (result.status) {
        defered.resolve();
      } else {
        defered.reject();
      }        
    });

    return defered.promise;
  }
  
  $scope.sendEmailReset = function() {
    sendEmailReset()
      .then(function() {
        toastr.success(sendEmailSuccess, '');
        $scope.closeDialog();
      }).catch(function() {
        toastr.error(sendEmailError, '');
      })
  };

  function init() {       
    $scope.reset = {};
  }

  init();
});