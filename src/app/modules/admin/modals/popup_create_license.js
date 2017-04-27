'use strict';
angular.module('adminModule')
.controller('ModalCreateLicenseCtrl', function($scope, $uibModalInstance,
    categories)
{
    $scope.categories = categories;
    $scope.license = {
        name: '',
        email: '',
        assignment: '',
        point: '',
        validity: ''
    };
    $scope.createLicense = function()
    {
        $scope.license.categoryId = $scope.categories.selectedCategoy.id;
        $uibModalInstance.close($scope.license);
    };
    $scope.closePopup = function()
    {
        $uibModalInstance.dismiss('cancel');
    };
});