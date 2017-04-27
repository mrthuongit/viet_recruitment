'use strict';
angular.module('employerModule')
.controller('CandidateListController', function($rootScope, $scope, $common, $filter, $employer, $q, $employee, $location, $translate, $window, $log, $uibModal, localStorageService, _) {
    var config = {
        countryId: 243, // Viet Nam
        provinceId: 60 // Ha Noi
    };
    var allProvince = $translate.instant("employee.searchProvinces");

    // Get countries and provinces list
    var getLocation = function() {
        var deferred = $q.defer();
            if (!localStorageService.get('countriesList') 
                || !localStorageService.get('provincesList')) {
                $common.getJobLocation({ lang: 'vi' }, function(result){
                  if(result.status){                    
                    localStorageService.set('countriesList', result.data.countryList);
                    localStorageService.set('provincesList', result.data.provinceList);
                    deferred.resolve(true);
                  } else {
                    deferred.reject('err get location');
                  }
                });      
            } else {
                deferred.resolve(true);
            } 

        return deferred.promise;
    };

    // Get categories list
    var getCategories = function(lang) {
        var deferred = $q.defer();

        if(!localStorageService.get('categoriesList_' + lang)){
            $common.getJobCategory({ 'lang': lang }, function(result){
                if(result.status){
                    $scope.categoriesList = result.data.categoryList;
                    localStorageService.set('categoriesList_' + lang, result.data.categoryList);
                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }            
            });
        } else{
            $scope.categoriesList = localStorageService.get('categoriesList_' + lang);
            deferred.resolve(true);
        }

        return deferred.promise;
    };

    // Set current country
    var setCurrCountry = function(countryId) {
        $scope.currCountry = _.find($scope.countriesList, function(country) {
            return (country.id === countryId);
        });

        $scope.countries = {
            availableCountries: $scope.countriesList,
            selectedCountry: $scope.currCountry
        };
    };

    // Set current province
    var setCurrProvince = function(provinceId) {
        $scope.currProvince = _.find($scope.provincesList, function(province) {
            return (province.id === provinceId);
        });

        $scope.provincesList.unshift({
                        id: '',
                        title: allProvince
                    });

        $scope.provinces = {
            availableProvinces: $scope.provincesList,
            selectedProvince: $scope.currProvince
        };
    };

    var getLocationName = function(candidatesList, countriesList, provincesList) {
        candidatesList.map(function(candidate) {
            // Get country name
            var country = _.find(countriesList, function(country) {
                return (candidate.countryId === country.id);
            });

            candidate.countryName = country ? country.title : '';

            // Get province name
            var province = _.find(provincesList, function(province) {
                return (candidate.provinceId === province.id);
            });

            candidate.provinceName = province ? province.title : '';

            return candidate;
        });
    };

    var getCategoryName = function(categoryId, categoriesList) {
        var category = _.find(categoriesList, function(category) {
            return (categoryId === category.id);
        });

        var categoryName = category ? category.title : null;
        return categoryName;
    };

    function setSearchResult(candidateList) {
        $scope.candidatesList = candidateList;

        $scope.candidatesList.map(function(candidate) {
            candidate.categories = candidate.categoryIds.map(function(categoryId) {
                var category = {
                    id: categoryId,
                    title: getCategoryName(categoryId, $scope.categoriesList)
                };
                return category;
            });
        });

        getLocationName($scope.candidatesList, $scope.countriesList, $scope.provinces.availableProvinces);
    };

    function getSearchResult(info) {
        var deferred = $q.defer();

        $employer.searchCandidate(info, function(result) {
            if (result.status && result.data.result) {   
                deferred.resolve(result);
            } else {
                deferred.resolve('err get search result');
            }
        });

        return deferred.promise;
    };

    var getPositionListPromise = function(lang) {
        var deferred = $q.defer();

        if(!localStorageService.get('listPosition_' + lang)){
            $common.getJobPosition({ 'lang': lang }, function(result){
                if(result.status){
                    deferred.resolve(result.data.positionList);
                } else {
                    deferred.resolve(null);
                }
            });
        } else{
            deferred.resolve(localStorageService.get('listPosition_' + lang));
        } 

        return deferred.promise;
    };

    var getPositionList = function(lang) {
        getPositionListPromise(lang)
        .then(function(result) {
            if (result) {
                localStorageService.set('listPosition_' + lang, result);
                $scope.positions = result;
            }            
        });
    };
    
    $rootScope.$watch('language', function(newValue, oldValue)
    {
        if (localStorageService.get("listPosition_" + newValue))
        {
            $scope.positions = localStorageService.get("listPosition_" + newValue);
        }
        if (localStorageService.get("categoriesList_" + newValue))
        {
            $scope.categoriesList = localStorageService.get("categoriesList_" + newValue);
        }
    });    

    // Search candidate
    $scope.searchCandidate = function(info) {
        if (!info) {
            $scope.offset = 0;
            $scope.searching = true;
            $scope.search.options.countryId = config.countryId;
            $scope.search.options.provinceId = $scope.provinces.selectedProvince.id;

            $scope.info = {
                token: $scope.employer.token,
                offset: $scope.offset,
                length: $scope.itemsPerPage,
                option: $scope.search.options
            };
        }

        getSearchResult($scope.info)
        .then(function(result) {
            if (result.data.employeeList.length < $scope.itemsPerPage) {
                $scope.endPage = true;
            } else {
                $scope.offset = result.data.nextOffset;
            }

            if (result.data.employeeList.length > 0) {
                setSearchResult(result.data.employeeList);
            }
        }).catch(function(e) {
            $log.error(e);
        });
    };

    $scope.nextPage = function() {
        $scope.currPage = !$scope.endPage ? ($scope.currPage + 1) : $scope.currPage;
        $scope.info.offset = $scope.offset;
        $scope.searchCandidate($scope.info);
    }

    $scope.prevPage = function() {
        $scope.currPage = ($scope.currPage > 1) ? ($scope.currPage - 1) : 1;
        $scope.info.offset = ($scope.currPage - 1) * $scope.itemsPerPage;
        $scope.searchCandidate($scope.info);
    }

    $scope.openModalCvCandidate = function (employee) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalCvCandidate.html',
            controller: 'ModalCvCandidateCtrl',
            size: 'lg',
             resolve: {
                data: function () {
                    return {
                            employee: {
                                employeeId: employee.employeeId,
                                employeeEmail: false
                            },
                            employer: $scope.employer
                        };
                }
            }
        });

        modalInstance.result.then(function(candidate) {
            if (candidate) {
                $scope.candidateListPagination.map(function(candidateOri) {
                    if (candidateOri.employeeId === candidate.employeeId) {
                        candidateOri.viewed = candidate.viewed;
                    }
                });
            }
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    function Init() {
        $scope.employer = localStorageService.get('userEmployer');
        if (!$scope.employer) {
            $location.path("/");
            return;
        }

        $scope.totalCandidates = 215588;
        $scope.searching = false;
        $scope.currPage = 1;
        $scope.endPage = false;
        $scope.itemsPerPage = 10;
        $scope.offset = 0;
        $scope.countriesList = [];
        $scope.provincesList = [];
        $scope.categoriesList = [];

        $scope.search = {
            options: {
                email: '',
                countryId: '',
                provinceId: '',
                categoryId: '',
                positionId: ''
            }
        };

        $scope.info = {
            token: $scope.employer.token,
            offset: 0,
            length: $scope.itemsPerPage,
            option: {
                countryId: '',
                provinceId: '',
                categoryId: '',
                positionId: ''
            }
        };

        getLocation().then(function() {
            $scope.countriesList = localStorageService.get('countriesList');
            $scope.provincesList = localStorageService.get('provincesList'); 
        }).then(function() {
            return getCategories('en');
        }).then(function() {
            return getCategories('vi');
        }).then(function() {
            return getPositionList('en');
        }).then(function() {
            return getPositionList('vi');
        }).then(function() {
            setCurrCountry(config.countryId);
            $scope.provincesList = $employee.getProvincesListByCountry(config.countryId, localStorageService.get('provincesList'));
            setCurrProvince(config.provinceId);
        }).then(function() {
            $scope.searchCandidate($scope.info);
        });
    }

    Init();
});