'use strict';


angular.module('adminModule').controller('AdminLicenseController', 
	function ($scope, $rootScope, $q, $location, $routeParams,$admin, toastr,_,localStorageService, $uibModal, $translate, $log) {
    var updateSuccess = $translate.instant("toarster.updateSuccess");
    var updateError = $translate.instant("toarster.updateError");
    
    var userAdmin = localStorageService.get('userAdmin');
    $scope.licenseList = [];
    if(userAdmin.role !== 'admin') {
      $location.path('/admin/company');
    }
    var getLicense = function() {
      var deferred = $q.defer();

      if (!localStorageService.get('licenseList')) {
  	  	$admin.getLicense({token: userAdmin.token}, function(result){
          if(result.status){
            $scope.licenseList = result.data.licenseList;
            localStorageService.set('licenseList', $scope.licenseList);
            deferred.resolve($scope.licenseList);
          }
        });
      } else {
        $scope.licenseList = localStorageService.get('licenseList');
        deferred.resolve($scope.licenseList);
      }

      return deferred.promise;
    };

    var getLicenseCategoryList = function() {
      var deferred = $q.defer();

      if (!localStorageService.get('licenseCategoryList')) {
        var info = {
          token: userAdmin.token
        };

        $admin.getLicenseCategoryList(info, function(result) {
          var licenseCategoryList = [];
          licenseCategoryList.unshift({
            id: '',
            name: 'Select',
          });

          if (result) {
            licenseCategoryList = licenseCategoryList.concat(result.data.licenseCategoryList);
            deferred.resolve(licenseCategoryList);
          } else {
            // $log.info('Khong the lay duoc category list');
            deferred.resolve(null);
          }
        });
      } else {
        $scope.licenseCategoryList = localStorageService.get('licenseCategoryList');
        deferred.resolve($scope.licenseCategoryList);
      }

      return deferred.promise;
    }; 

    var getCategory = function(licenseCategoryId, licenseCategoryList) {        
        var category = _.find(licenseCategoryList, function(licenseCategory) {
          return (licenseCategoryId === licenseCategory.id);
        });

        return category;
    };

    getLicenseCategoryList().then(function(licenseCategoryList) {
      $scope.licenseCategoryList = licenseCategoryList;
      localStorageService.set('licenseCategoryList', licenseCategoryList);
      $scope.categories = {
        selectedCategoy: $scope.licenseCategoryList[0],
        availableCategories: $scope.licenseCategoryList
      };     
    }).then(function() {
      return getLicense();
    }).then(function(licenseList) {
      licenseList.map(function(license) {
        license.category = getCategory(license.categoryId, $scope.licenseCategoryList);
      });
    });

    $scope.newLicense = function(){
      var modalLicense = $uibModal.open({
        templateUrl: 'modalCreateLicense.html',
        controller: 'ModalCreateLicenseCtrl',
        resolve: {
          categories: function() {
            return $scope.categories;
          }
        }
      });
      modalLicense.result.then(function (license) {
        var info = {
          token: userAdmin.token,
          license: license
        };
        $admin.createLicense(info, function(result){
          if(result.status){
            localStorageService.remove('licenseList');
            getLicense().then(function(licenseList) {
              licenseList.map(function(license) {
                license.category = getCategory(license.categoryId, $scope.licenseCategoryList);
              });
            });
            toastr.success(updateSuccess);
          } else{
            toastr.error(updateError);
          }
        });
      }, function () {

      });
    };

    $scope.newLicenseCategory = function(){
      var modalLicenseCategory = $uibModal.open({
        templateUrl: 'modalCreateLicenseCategory.html',
        controller: 'ModalCreateLicenseCategoryCtrl',
        resolve: {
          
        }
      });
      modalLicenseCategory.result.then(function (licenseCategory) {
        var info = {
          token: userAdmin.token,
          licenseCategory: licenseCategory
        };

        $admin.createLicenseCategory(info, function(result){
          if (result.status) {
            localStorageService.remove('licenseCategoryList');
            getLicenseCategoryList().then(function(licenseCategoryList) {
              $scope.licenseCategoryList = licenseCategoryList;
              localStorageService.set('licenseCategoryList', licenseCategoryList);
              $scope.categories = {
                selectedCategoy: $scope.licenseCategoryList[0],
                availableCategories: $scope.licenseCategoryList
              };     
            });
          } else {
              toastr.error(updateError);
          }
        });
      }, function (err) {
        $log.info(err);
      });
    };
})
.controller('ModalCreateLicenseCategoryCtrl', function($scope, $uibModalInstance) {
  $scope.licenseCategory = {
    name: '',
    code: ''
  };

  $scope.createLicenseCategory = function () {
    $scope.licenseCategory.code = $scope.licenseCategory.code.toUpperCase();
    $uibModalInstance.close($scope.licenseCategory);
  };

  $scope.closePopup = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
