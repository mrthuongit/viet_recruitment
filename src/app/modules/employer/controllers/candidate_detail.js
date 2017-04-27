'use strict';
angular.module('employerModule').controller('CandidateDetailController', function($scope, $rootScope, $common,
    $q, $employer, $employee, $routeParams, $translate, $uibModal, localStorageService,$log, $cache, _, toastr, $location)
{

        $scope.employer = localStorageService.get('userEmployer');
    if (!$scope.employer)
        {
            $location.path("/");
            return;
        }
    var styding = $translate.instant('employee.styding');
    var stydingEnd = $translate.instant('employee.stydingEnd');
    $scope.countriesList = [];
    $scope.provincesList = [];
    $scope.categoriesList = [];
    $scope.candidate = {
        profile: [],
        expList: [],
        eduList: [],
        cerList: [],
        docList: []
    };

    // Get countries and provinces list
    var getLocation = function()
    {
        var deferred = $q.defer();

            $cache.getJobLocation(
            {
                lang: 'vi'
            }, function(result)
            {
                if (result.status)
                {
                    result.data.countryList.unshift(
                    {
                        id: 0,
                        title: 'Tất cả đất nước'
                    });
                    result.data.provinceList.unshift(
                    {
                        id: 0,
                        title: 'Tất cả tỉnh/thành phố'
                    });
                    $scope.countriesList = result.data.countryList;
                    $scope.provincesList = result.data.provinceList;
                    localStorageService.set('countriesList', result.data.countryList);
                    localStorageService.set('provincesList', result.data.provinceList);
                    deferred.resolve(true);
                }
                else
                {
                    $log.info('error', 'Khong lay duoc danh sach country va province');
                    deferred.resolve(true);
                }
            });
      
        return deferred.promise;
    };
    var getRecentlyCompany = function(candidate, expList)
    {
        var company = _.find(expList, function(exp)
        {
            return exp.current === true;
        });
        candidate.recentlyCompany = company ? company.employer : null;
    };
    var getEduLevelsList = function()
    {
        var deferred = $q.defer();
        $scope.eduLevelsList = [];
        if (localStorageService.get('eduLevelsList'))
        {
            $scope.eduLevelsList = localStorageService.get('eduLevelsList');
            deferred.resolve($scope.eduLevelsList);
        }
        else
        {
            $common.getEducationLevel(
            {
                lang: 'vi'
            }, function(result)
            {
                if (result.status)
                {
                    localStorageService.set('eduLevelsList', result.data.eduLevelsList);
                    $scope.eduLevelsList = result.data.levelList;
                }
                else
                {
                    var noEdu = $translate.instant('toaster.noresultEdu');
                    toastr.error(noEdu);
                }
                deferred.resolve($scope.eduLevelsList);
            });
        }
        return deferred.promise;
    };
    var getEduLevelName = function(eduList)
    {
        eduList.map(function(eduObj)
        {
            var levelObj = _.find($scope.eduLevelsList, function(eduLevel)
            {
                return eduObj.levelId === eduLevel.id;
            });
            eduObj.levelName = levelObj.title;
            if (eduObj.status === 'enrolled')
            {
                eduObj.statusVi = styding;
            }
            else
            {
                eduObj.statusVi = stydingEnd;
            }
            return eduObj;
        });
    };
    var getHighestEdu = function(candidate, eduList)
    {
        var level = _.max(eduList, function(edu)
        {
            return edu.levelId;
        });
        candidate.highestEduLevel = level ? level.levelName : null;
    };
    var getFullname = function(candidate)
    {
        if (candidate.name.indexOf('-'))
        {
            var firstname = candidate.name.split('-')[0];
            var lastname = candidate.name.split('-')[1];
            candidate.fullname = firstname + ' ' + lastname;
        }
        else
        {
            candidate.fullname = candidate.name;
        }
    };
    var getLocationName = function(candidate, countriesList, provincesList)
        {
            // Get country name
            var country = _.find(countriesList, function(country)
            {
                return (candidate.countryId === country.id);
            });
            candidate.countryName = country ? country.title : null;
            // Get province name
            var province = _.find(provincesList, function(province)
            {
                return (candidate.provinceId === province.id);
            });
            candidate.provinceName = province ? province.title : null;
        };
        // Get categories list
    var getCategories = function()
        {
            var deferred = $q.defer();
            if (!localStorageService.get('categoriesList'))
            {
                $common.getJobCategory(
                {
                    'lang': 'vi'
                }, function(result)
                {
                    if (result.status)
                    {
                        $scope.categoriesList = result.data.categoryList;
                        localStorageService.set('categoriesList', result.data.categoryList);
                        deferred.resolve(true);
                    }
                    else
                    {
                        $log.info('Khong lay duoc danh sach category');
                        deferred.resolve(false);
                    }
                });
            }
            else
            {
                $scope.categoriesList = localStorageService.get('categoriesList');
                deferred.resolve(true);
            }
            return deferred.promise;
        };
        // Get list positions
    var getPositionListPromise = function()
    {
        var deferred = $q.defer();
        if (!localStorageService.get('listPosition'))
        {
            $common.getJobPosition(
            {
                'lang': 'vi'
            }, function(result)
            {
                if (result.status)
                {
                    deferred.resolve(result.data.positionList);
                }
                else
                {
                    $log.info('Khong lay duoc danh sach vi tri');
                    deferred.resolve(null);
                }
            });
        }
        else
        {
            deferred.resolve(localStorageService.get('listPosition'));
        }
        return deferred.promise;
    };
    var getPositionList = function()
    {
        getPositionListPromise().then(function(result)
        {
            if (result)
            {
                localStorageService.set('listPosition', result);
                $scope.positionList = result;
                $scope.positions = {
                    availabePositions: result,
                    seletedPosition: result[0]
                };
            }
        });
    };
    var getPositionName = function(expList)
    {
        expList.map(function(exp)
        {
            var position = _.find($scope.positionList, function(position)
            {
                return (exp.positionId === position.id);
            });
            exp.positionName = position ? position.title : '';
        });
    };
    getLocation().then(function()
    {
        getPositionList();
    }).then(function()
    {
        return getEduLevelsList();
    }).then(function()
    {
        return getCategories();
    }).then(function()
    {
        var info = {
            token: $scope.employer.token,
            employeeId: $routeParams.employeeId
        };
        $employer.getEmployeeDetail(info, function(result)
        {
            if (result.status)
            {
                var candidate = result.data.employeeDetail;
                getFullname(candidate.profile);
                getLocationName(candidate.profile, $scope.countriesList, $scope.provincesList);
                getRecentlyCompany(candidate.profile, candidate.expList);
                getEduLevelName(candidate.eduList);
                getHighestEdu(candidate.profile, candidate.eduList);
                candidate.expList.map(function(exp)
                {
                    getLocationName(exp, $scope.countriesList, $scope.provincesList);
                    exp.categories = $employee.getCategories(exp.categoryIdList, $scope.categoriesList);
                });
                $scope.candidate.viewed = candidate.viewed;
                $scope.candidate.profile = candidate.profile;
                $scope.candidate.expList = candidate.expList;
                getPositionName(candidate.expList);
                $scope.candidate.eduList = candidate.eduList;
                $scope.candidate.certList = candidate.certList;
                $scope.candidate.docList = candidate.docList;
            }
        });
    });
    $scope.openVideoProfileModal = function(size)
    {
        var modalInstance = $uibModal.open(
        {
            animation: $scope.animationsEnabled,
            templateUrl: 'videoProfileModal.html',
            controller: 'ModalVideoProfileControllerl',
            size: size,
            resolve:
            {
                data: function()
                {
                    return {
                        videoUrl: $scope.candidate.profile.videoUrl
                    };
                }
            }
        });
        modalInstance.result.then(function(selectedItem)
        {
            $scope.selected = selectedItem;
        }, function()
        {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    $scope.openConfirmGetContactModal = function(size)
    {
        var modalInstance = $uibModal.open(
        {
            animation: $scope.animationsEnabled,
            templateUrl: 'confirmGetContactModal.html',
            controller: 'InvitationCandidateController',
            size: size,
            resolve:
            {
                data: function()
                {
                    return {
                        videoUrl: $scope.candidate.profile.videoUrl
                    };
                }
            }
        });
        modalInstance.result.then(function(selectedItem)
        {
            $scope.selected = selectedItem;
        }, function()
        {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
}).controller('ModalVideoProfileControllerl', function($scope, $uibModalInstance, data)
{
    $scope.videoUrl = data.videoUrl;
    $scope.cancel = function()
    {
        $uibModalInstance.dismiss('cancel');
    };
}).controller('ModalConfirmGetContactControllerl', function($scope, $rootScope, $uibModalInstance, $routeParams, $employer)
{
    $scope.cancel = function()
    {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.getContactCandidate = function()
    {
        var displayContact = function()
        {
            var info = {
                token: $scope.employer.token,
                employeeId: $routeParams.employeeId
            };
            $employer.getEmployeeContact(info, function(result)
            {
                if (result.status)
                {
                    $scope.candidate.viewed = result.data.result;
                }
            });
        };

        displayContact();
        $uibModalInstance.dismiss('cancel');
    };
});