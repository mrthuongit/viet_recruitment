'use strict';
angular.module('adminModule').controller('AdminAssignmentDetailController', function($scope, $admin,
    $translate, $rootScope, toastr, localStorageService, $location, $q, $common, _)
{
    // var alert = $translate.instant('toarster.alert');
    var updateSuccess = $translate.instant("toarster.updateSuccess");
    var updateError = $translate.instant("toarster.updateError");
    var required = $translate.instant('toarster.required');
    
    var getCompany = function()
    {
        if (!localStorageService.get('companyList'))
        {
            $admin.getCompanyList(
            {
                token: $scope.userAdmin.token
            }, function(result)
            {
                if (result.status && result.data.result)
                {
                    //$log.info(result.data.companyList);
                    $scope.listCompany = result.data.companyList;
                    localStorageService.set('companyList', $scope.companyList);
                }
                $scope.totalItems = $scope.listCompany.length;
            });
        }
        else
        {
            $scope.listCompany = localStorageService.get('companyList');
            $scope.totalItems = $scope.listCompany.length;
        }
    };
    var getCategory = function(lang, defer)
        {
            if (!localStorageService.get('listCategories_' + lang))
            {
                $common.getJobCategory(
                {
                    lang: lang
                }, function(result)
                {
                    // $log.info(result.data);
                    if (result.status)
                    {
                        if ($rootScope.language === lang) {
                            $scope.listCategories = result.data.categoryList;
                        }
                        localStorageService.set('listCategories_' + lang, result.data.categoryList);
                        defer.resolve();
                    }
                });
            }
            else
            {
                if ($rootScope.language === lang) {
                    $scope.listCategories = localStorageService.get('listCategories_' + lang);
                }
                defer.resolve();
            }
        };
        // Get list Position
    var getPosition = function(lang, defer)
    {
        if (!localStorageService.get('listPosition_' + lang))
        {
            $common.getJobPosition(
            {
                lang: lang
            }, function(result)
            {
                // $log.info(result.data);
                if (result.status)
                {
                    if ($rootScope.language === lang) {
                        $scope.listPosition = result.data.positionList;
                    }
                    localStorageService.set('listPosition_' + lang, result.data.positionList);
                    defer.resolve();
                }
            });
        }
        else
        {
            if ($rootScope.language === lang) {
                $scope.listPosition = localStorageService.get('listPosition_' + lang);
            }
            defer.resolve();
        }
    };
    var getLocation = function(defer)
    {
        if (!localStorageService.get('listLocation') || !localStorageService.get('listLevel'))
        {
            $common.getJobLocation(
            {
                lang: 'en'
            }, function(result)
            {
                // $log.info(result.data);
                if (result.status)
                {
                    $scope.listLocation = result.data.countryList;
                    $scope.listLevel = result.data.provinceList;
                    if (!$scope.chooseAssignmentAdmin || !$scope.chooseAssignmentAdmin.id)
                    {
                        var vietnam = _.find($scope.listLocation, function(local)
                        {
                            return local.title === "Vietnam";
                        });
                        if (vietnam)
                        {
                            $scope.chooseAssignmentAdmin.countryId = vietnam.id;
                            $scope.changeCountry();
                            var hanoi = _.find($scope.listLevelByCountry, function(local)
                            {
                                return local.id === "Hà Nội";
                            });
                            if (hanoi)
                            {
                                $scope.chooseAssignmentAdmin.provinceId = hanoi.id;
                            }
                        }
                    }
                    localStorageService.set('listLocation', result.data.countryList);
                    localStorageService.set('listLevel', result.data.provinceList);
                    defer.resolve();
                }
            });
        }
        else
        {
            $scope.listLocation = localStorageService.get('listLocation');
            $scope.listLevel = localStorageService.get('listLevel');
            if (!$scope.chooseAssignmentAdmin || !$scope.chooseAssignmentAdmin.id)
            {
                var vietnam = _.find($scope.listLocation, function(local)
                {
                    return local.title === "Vietnam";
                });
                if (vietnam)
                {
                    $scope.chooseAssignmentAdmin.countryId = vietnam.id;
                    $scope.changeCountry();
                    var hanoi = _.find($scope.listLevelByCountry, function(local)
                    {
                        return local.title === "Hà Nội";
                    });
                    if (hanoi)
                    {
                        $scope.chooseAssignmentAdmin.provinceId = hanoi.id;
                    }
                }
            }
            defer.resolve();
        }
    };
    $scope.doCancel = function()
    {
        $location.path("/admin/job");
    };
    var init = function()
    {
        $scope.format = 'yyyy-MM-DD';
        $scope.altInputFormats = ['M!/d!/yyyy'];
        localStorageService.set("page", "assignment");
        $scope.userAdmin = localStorageService.get('userAdmin');
        $scope.choosecompany = {};
        $scope.chooseAssignmentAdmin = localStorageService.get('chooseAssignmentAdmin');
        $scope.deadlineAdminRequired = true;
        if (!$scope.chooseAssignmentAdmin.id)
        {
            $scope.deadlineAdminRequired = false;
        } else {
            $scope.chooseAssignmentAdmin.deadline2 = new Date($scope.chooseAssignmentAdmin.deadline);
        }
        $rootScope.$watch('language', function(newValue, oldValue)
        {
            if (localStorageService.get('listPosition_' + $rootScope.language)) {
                $scope.listPosition =localStorageService.get('listPosition_' + $rootScope.language);
            }
            if (localStorageService.get('listCategories_' + $rootScope.language)) {
                $scope.listCategories =localStorageService.get('listCategories_' + $rootScope.language);
            }
        });
        var deferArray = [$q.defer(), $q.defer(), $q.defer(), $q.defer(), $q.defer()];
        var loopPromises = [];
        angular.forEach(deferArray, function(deferItem)
        {
            loopPromises.push(deferItem.promise);
        });
        deferArray[0].promise.then(function()
        {
            getCategory('en', deferArray[1]);
        });
        deferArray[1].promise.then(function()
        {
            getPosition('vi', deferArray[2]);
        });
        deferArray[2].promise.then(function()
        {
            getPosition('en', deferArray[3]);
        });
        deferArray[3].promise.then(function()
        {
            getLocation(deferArray[4]);
        });
        deferArray[4].promise.then(function()
        {
            getCompany(deferArray[5]);
        });
        getCategory('vi', deferArray[0]);
        $q.all(loopPromises).then(function()
        {
            if ($scope.chooseAssignmentAdmin && $scope.chooseAssignmentAdmin.countryId)
            {
                $scope.listLevelByCountry = _.filter($scope.listLevel, function(level)
                {
                    return level.countryId === $scope.chooseAssignmentAdmin.countryId;
                });
            }
            else
            {
                // $scope.page.title = $translate.instant('employer.assignment.newAssignment');
            }
        });
    };
    init();
    var _doSave = function()
    {
        $scope.chooseAssignmentAdmin.deadline = new Date($scope.chooseAssignmentAdmin.deadline2);
        if ($scope.chooseAssignmentAdmin.id)
        {
            $admin.updateAssignment(
            {
                token: $scope.userAdmin.token,
                assignment: $scope.chooseAssignmentAdmin
            }, function(result)
            {
                if (result.status && result.data.result)
                {
                    localStorageService.set('chooseAssignmentAdmin', $scope.chooseAssignmentAdmin);
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
            $admin.createAssignment(
            {
                token: $scope.userAdmin.token,
                companyId: $scope.choosecompany.id,
                assignment: $scope.chooseAssignmentAdmin
            }, function(result)
            {
                if (result.status)
                {
                    $scope.chooseAssignmentAdmin.id = result.data.assignmentId;
                    localStorageService.set('chooseAssignmentAdmin', $scope.chooseAssignmentAdmin);
                    toastr.success(updateSuccess);
                }
                else
                {
                    toastr.error(updateError);
                }
            });
        }
    };
    $scope.changeCountry = function()
    {
        $scope.listLevelByCountry = _.filter($scope.listLevel, function(level)
        {
            return level.countryId === $scope.chooseAssignmentAdmin.countryId;
        });
    };
    $scope.doSave = function()
    {
        if (!$scope.assignmentCE.$error.required)
        {
            _doSave();
        }
        else
        {
            toastr.warning(required);
        }
    };
});