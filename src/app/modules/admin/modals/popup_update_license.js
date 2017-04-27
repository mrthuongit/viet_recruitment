'use strict';
angular.module('adminModule').controller('ModalUpdateLicenseController', function($scope, $uibModalInstance,
    license)
{
    $scope.license = license;
    $scope.updateLicense = function()
    {
        $uibModalInstance.close($scope.license);
    };
    $scope.closePopup = function()
    {
        $uibModalInstance.dismiss('cancel');
    };
});