'use strict';
angular.module('employerModule')
.filter('country', function(_) {
    return function(provinceList, countryId) {
        return  _.filter(provinceList, function(level)
                {
                    return level.countryId === countryId;
                });
    };
  })
.controller('AssignmentController', function($scope, $employer, $translate,
    $rootScope, toastr, localStorageService, $location, $cache, $q,EMPLOYER_DEFAULT_VALUES,_)
{
    var alert = $translate.instant('toarster.alert');
    var updateSuccess = $translate.instant('toarster.updateSuccess');
    var updateError = $translate.instant('toarster.updateError');
    var required = $translate.instant('toarster.required');
    function _doSave()
    {
        var params = 
            {
                token: $scope.userEmployer.token,
                assignment: $scope.chooseAssignment
            };
        $scope.chooseAssignment.deadline = new Date($scope.chooseAssignment.deadline2);
        if ($scope.chooseAssignment.id)
        {
            $employer.updateAssignment(params, function(result)
            {
                if (result.status && result.data.result)
                {
                    localStorageService.set('chooseAssignment', $scope.chooseAssignment);
                    toastr.success( updateSuccess,alert);
                }
                else
                {
                    toastr.error( updateError,alert);
                }
            });
        }
        else
        {
            $employer.createAssignment(params, function(result)
            {
                if (result.status)
                {
                    $scope.chooseAssignment.id = result.data.assignmentId;
                    var totalAssigns = localStorageService.get("totalAssign") + 1;
                    localStorageService.set("totalAssign", totalAssigns);
                    localStorageService.set('chooseAssignment', $scope.chooseAssignment);
                    toastr.success( updateSuccess,alert);
                }
                else
                {
                    toastr.error( updateError,alert);
                }
            });
        }
    }

    $scope.doSave = function()
    {
        if (!$scope.assignmentCE.$error.required )
        {
            _doSave();
        }
        else
        {
            toastr.warning( required,alert);
        }
    };
    
    function getCategory(lang)  {
        return $q(function(resolve, reject) {
            $cache.getJobCategory( {  lang: lang }, function(result)
                {
                    resolve(result.data.categoryList);
                });
        });            
     }
    
    function getPosition(lang)  {
        return $q(function(resolve, reject) {
            $cache.getJobPosition( {  lang: lang  }, function(result)
                    {
                        resolve(result.data.positionList);
                    });
        });            
     }
    
    function getLocation(lang)  {
        return $q(function(resolve, reject) {
            $cache.getJobLocation( { lang: lang}, function(result)
                    {
                        if (result.status)
                        {       
                            $scope.listLocation = result.data.countryList;
                            $scope.listLevel = result.data.provinceList;   
                            resolve();
                        } else {
                            reject();
                        }
                    });
        });            
     }
   
    $rootScope.$watch('language', function(newValue, oldValue)
    {
        getCategory(newValue)
        .then(function(categoryList) {
            $scope.listCategories = categoryList;
            getPosition(newValue)
            .then(function(positionList) {
                $scope.listPosition = positionList;
            });
        });
    });
    
    
    
    function init()
    {
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        $scope.chooseAssignment = localStorageService.get('chooseAssignment');
        getLocation($rootScope.language).then(function() {            
            if ( !$scope.chooseAssignment)
            {                           
                var vietnam = _.find($scope.listLocation,function(country) {
                    return country.title  === EMPLOYER_DEFAULT_VALUES.LOCATION.COUNTRY;
                });
                var hanoi = _.find($scope.listLevel,function(state) {
                    return state.title  === EMPLOYER_DEFAULT_VALUES.LOCATION.PROVINCE;
                });
                $scope.chooseAssignment = {
                        countryId : vietnam.id,
                        provinceId : hanoi.id
                };
            } else {
                $scope.chooseAssignment.deadline2 = new Date($scope.chooseAssignment.deadline);
            }
            getCategory($rootScope.language).then(function(categoryList) {
                $scope.listCategories = categoryList;
                getPosition($rootScope.language).then(function(positionList) {
                    $scope.listPosition = positionList;              
                });
            });
        });
    }          
    init();
   
});