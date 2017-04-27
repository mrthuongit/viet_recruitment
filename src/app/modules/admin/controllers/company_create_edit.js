'use strict';
angular.module('adminModule').controller('AdminCompanyCreateEditController', function($scope, $admin,
    $translate, $rootScope, $q, toastr, localStorageService, $location, $common, $uibModal,_)
{
    var updateSuccess = $translate.instant("toarster.updateSuccess");
    var updateError = $translate.instant("toarster.updateError");

    var userAdmin = localStorageService.get('userAdmin');
    if(userAdmin.role !== 'admin') {
      $location.path('/admin/company');
    }
    $scope.isCreate = false;
    $scope.userUpdateId = null;
    $scope.showPass = false;
    $scope.newUser = {};
    $scope.doCancel = function()
    {
        $location.path("/admin/company");
    };
    $scope.allowRenewLicense = function()
    {
        $scope.allowRenew = !$scope.allowRenew;
    };
    var getLicenseInfo = function()
    {
        var defered = $q.defer();
        $admin.getLicenseInfo(
        {
            token: userAdmin.token,
            companyId: $scope.chooseCompany.id
        }, function(result)
        {
            if (result.status)
            {
                $scope.licenseInfo = result.data.licenseInfo;
                if (result.data.licenseInfo.license.state === 'active')
                {
                    $scope.state = true;
                }
                else
                {
                    $scope.state = false;
                }
            }
            defered.resolve();
        });
        return defered.promise;
    };
    var getLicense = function()
    {
        if (!localStorageService.get('licenseList'))
        {
            $admin.getLicense(
            {
                token: userAdmin.token
            }, function(result)
            {
                if (result.status)
                {
                    $scope.licenseList = result.data.licenseList;
                    localStorageService.set('licenseList', $scope.licenseList);
                }
            });
        }
        else
        {
            $scope.licenseList = localStorageService.get('licenseList');
        }
    };
    var getLicenseObj = function(licenseName, licenseList)
    {
        var selectedLicense = _.find(licenseList, function(license)
        {
            return (licenseName === license.name);
        });
        if (!selectedLicense)
        {
            selectedLicense = licenseList[0];
        }
        return {
            availableLicense: licenseList,
            selectedLicense: selectedLicense
        };
    };
    // var getCompanyList = function()
    // {
    //     var defered = $q.defer();
    //     $admin.getCompanyList(
    //     {
    //         token: $scope.userAdmin.token
    //     }, function(result)
    //     {
    //         if (result.status && result.data.result)
    //         {
    //             localStorageService.remove('companyList');
    //             localStorageService.set('companyList', result.data.companyList);
    //         }
    //         defered.resolve(localStorageService.get('companyList'));
    //     });
    //     return defered.promise;
    // };
    $scope.renewLicense = function()
    {
        $scope.allowRenew = !$scope.allowRenew;
        var info = {
            token: userAdmin.token,
            companyId: $scope.chooseCompany.id,
            licenseId: $scope.licenseObj.selectedLicense.id
        };
        $admin.renewLicense(info, function(result)
        {
            if (result.status)
            {
                toastr.success(updateSuccess);
                // getCompanyList();
            }
            else
            {
                toastr.error(updateError);
            }
        });
    };
    var init = function()
    {
        $scope.format = 'yyyy-MM-DD';
        $scope.altInputFormats = ['M!/d!/yyyy'];
        $scope.listUserForCompany = [];
        getLicense();
        if (localStorageService.get('chooseCompany'))
        {
            $scope.chooseCompany = localStorageService.get('chooseCompany');
            $scope.chooseCompany.licenseExpire2 = new Date($scope.chooseCompany.licenseExpire);
            $admin.getCompanyUser(
            {
                token: userAdmin.token,
                companyId: $scope.chooseCompany.id
            }, function(result)
            {
                if (result.status)
                {
                    $scope.listUserForCompany = result.data.userList;
                }
                getLicenseInfo().then(function()
                {
                    $scope.licenseObj = getLicenseObj($scope.licenseInfo.license.name, $scope.licenseList);
                });
            });
        }
        else
        {
            $scope.chooseCompany = {};
            getLicenseInfo().then(function()
            {
                $scope.licenseObj = getLicenseObj('Trial', $scope.licenseList);
            });
        }
    };

    var activeCompany = function()
    {
        var info = {
            token: userAdmin.token,
            companyId: $scope.chooseCompany.id
        };
        $admin.activateLicense(info, function(result)
        {
            if (result.status)
            {
                getLicenseInfo().then(function()
                {
                    $scope.licenseObj = getLicenseObj($scope.licenseInfo.license.name,$scope.licenseList);
                });
            }
        });
    };
    
    var _doSave = function(callback)
    {
        $scope.chooseCompany.licenseExpire = new Date($scope.chooseCompany.licenseExpire2);
        $scope.chooseCompany.licenseId = $scope.licenseObj.selectedLicense.id;
        if ($scope.chooseCompany.id)
        {
            $admin.updateCompany(
            {
                token: userAdmin.token,
                company: $scope.chooseCompany
            }, function(result)
            {
                if (result.status)
                {
                    toastr.success(updateSuccess);
                    callback(true);
                    // getCompanyList();
                }
                else
                {
                    toastr.error(updateError);
                    callback(false);
                }
            });
        }
        else
        {
            $admin.createCompany(
            {
                token: userAdmin.token,
                company: $scope.chooseCompany
            }, function(result)
            {
                if (result.status)
                {
                    $scope.chooseCompany.id = result.data.employerId;
                    localStorageService.set('chooseCompany', $scope.chooseCompany);
                    activeCompany();
                    toastr.success(updateSuccess);
                    callback(true);
                    // getCompanyList();
                }
                else
                {
                    toastr.error(updateError);
                    callback(false);
                }
            });
        }
    };
    $scope.doSave = function()
    {
        _doSave(function()
        {
            //$location.path("/admin/company");
        });
    };
    $scope.openModalDelete = function(user)
    {
        var openModalDelete = $uibModal.open(
        {
            animation: $scope.animationsEnabled,
            templateUrl: 'views/admin/popup_confirm_delete.html',
            controller: 'ModalDeleteCtrl',
            resolve:
            {
                info: function()
                {
                    return {
                        token: userAdmin.token,
                        userId: user.id
                    };
                }
            }
        });
        openModalDelete.result.then(function() {});
    };
    $scope.openPopupCreateUser = function()
    {
        $scope.isCreate = true;
        $scope.newUser = {};
    };
    $scope.createUser = function()
    {
        if ($scope.chooseCompany.id)
        {
            var info = {
                token: userAdmin.token,
                companyId: $scope.chooseCompany.id,
                user: $scope.newUser
            };
            $admin.createCompanyUser(info, function(result)
            {
                if (result.status)
                {
                    $scope.isCreate = false;
                    $scope.newUser.id = result.data.userId;
                    $scope.listUserForCompany.push($scope.newUser);
                    $scope.newUser = {};
                    toastr.success(updateSuccess);
                }
                else
                {
                    toastr.error(updateError);
                }
            });
        }
        else
        {
            toastr.warning(updateError);
        }
    };
    $scope.openPopupUpdateUser = function(userId)
    {
        $scope.userUpdateId = userId;
    };
    $scope.isUserUpdate = function(userId)
    {
        return (userId === $scope.userUpdateId);
    };
    $scope.updateUser = function(user)
    {
        var info = {
            token: userAdmin.token,
            user: user
        };
        $admin.updateCompanyUser(info, function(result)
        {
            if (result.status)
            {
                $scope.showPass = false;
                $scope.userUpdateId = null;
                toastr.success(updateSuccess);
            }
            else
            {
                toastr.error(updateError);
            }
        });
    };
    $scope.cancelUpdateUser = function()
    {
        $scope.showPass = false;
        $scope.userUpdateId = null;
    };
    $scope.cancelCreate = function()
    {
        $scope.isCreate = false;
    };
    $scope.delete = function(user)
    {
        $scope.delUser = user;
    };
    $scope.deleteCompanyUser = function()
    {
        var info = {
            token: userAdmin.token,
            userId: $scope.delUser.id
        };
        $admin.deleteCompanyUser(info, function(result)
        {
            if (result.status)
            {
                angular.element('#del-user-modal').modal('hide');
                toastr.success(updateSuccess);
                if (localStorageService.get('chooseCompany'))
                {
                    $scope.chooseCompany = localStorageService.get('chooseCompany');
                    $admin.getCompanyUser(
                    {
                        token: userAdmin.token,
                        companyId: $scope.chooseCompany.id
                    }, function(result)
                    {
                        if (result.status)
                        {
                            $scope.listUserForCompany = result.data.userList;
                        }
                        getLicenseInfo().then(function()
                        {
                            $scope.licenseObj = getLicenseObj($scope.licenseInfo.license.name, $scope.licenseList);
                        });
                    });
                }
            }
            else
            {
                toastr.error(updateError);
            }
        });
    };
    
    $scope.changeStateCompany = function(state)
        {
            if (state)
            {
                activeCompany();
            }
            else
            {
                $scope.deactivate();
            }
        };
  
    $scope.deactivate = function()
    {
        var info = {
            token: userAdmin.token,
            companyId: $scope.chooseCompany.id
        };
        $admin.deactivateLicense(info, function(result)
        {
            if (result.status)
            {
                getLicenseInfo().then(function()
                {
                    $scope.licenseObj = getLicenseObj($scope.licenseInfo.license.name,$scope.licenseList);
                });
            }
        });
    };
    init();
});