'use strict';
angular.module('employerModule')
.controller('ModalPremiumSuggestCtrl', function($scope, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});