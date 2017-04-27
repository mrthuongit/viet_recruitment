'use strict';
angular.module('employerModule').controller('ModalCvCandidateCtrl', function($scope, $rootScope, $common,
    $q, $employer, $employee, $cvToPdf, $profile, $translate, $uibModal, $uibModalInstance, localStorageService,$log, data, _,toastr)
{
    var employer        = data.employer,
        viewedOld       = data.employee.viewed,
        employeeId      = data.employee.employeeId,
        employeeEmail   = data.employee.employeeEmail,
        candidateApply  = data.candidateApply,
        styding         = $translate.instant('employee.styding'),
        stydingEnd      = $translate.instant('employee.stydingEnd');
    $scope.videoCandidate = false;
    $scope.cvAvailable = true;

    // Get countries and provinces list
    var getLocation = function()
    {
        var deferred = $q.defer();
        if (!localStorageService.get('countriesList') || !localStorageService.get('provincesList'))
        {
            $common.getJobLocation(
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
        }
        else
        {
            $scope.countriesList = localStorageService.get('countriesList');
            $scope.provincesList = localStorageService.get('provincesList');
            deferred.resolve(true);
        }
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

    function getHighestEdu(candidate, eduList)
    {
        var level = _.max(eduList, function(edu)
        {
            return edu.levelId;
        });
        candidate.profile.highestEduLevel = level ? level.levelName : null;
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
                return (exp.positionId == position.id);
            });
            exp.positionName = position ? position.title : '';
        });
    };

    function setEmployeeDetail(candidate) {
        $scope.cvAvailable = true;
        getLocationName(candidate.profile, $scope.countriesList, $scope.provincesList);
        getRecentlyCompany(candidate.profile, candidate.expList);
        getEduLevelName(candidate.eduList);
        getHighestEdu(candidate, candidate.eduList);
        getPositionName(candidate.expList);
        $profile.calcNumberExp(candidate);

        candidate.expList.map(function(exp) {
            getLocationName(exp, $scope.countriesList, $scope.provincesList);
            exp.categories = $employee.getCategories(exp.categoryIdList,
                $scope.categoriesList);
        });

        // candidate.viewed = candidateApply ? true : candidate.viewed;
        candidate.profile.numberExp = $profile.calcNumberExp(candidate);

        $scope.candidate = candidate;
    }

    function getEmployeeById() {
        var info = {
                token: employer.token,
                employeeId: employeeId
            };

        $employer.getEmployeeDetail(info, function(result) {
            if (result.status && result.data.result) {
                setEmployeeDetail(result.data.employeeDetail);
            } else {
                $log.error('Khong lay duoc thong tin ung vien');
                $scope.cvAvailable = false;
            }
        });
    }

    function getEmployeeByEmail() {
        var info = {
            email: employeeEmail,
            token: employer.token
        };

        $employer.getEmployeeByEmail(info, function(result) {
            if (result.status && result.data.result) {
                setEmployeeDetail(result.data.employeeProfile[0]);
            } else {
                $log.error('Khong lay duoc thong tin ung vien');
                $scope.cvAvailable = false;
            }
        });
    }

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
        if (employeeId) {
            getEmployeeById();
        } else {
            getEmployeeByEmail();
        }
    });

    $scope.toggleVideoCandidate = function() {        
        $scope.videoCandidate = !$scope.videoCandidate;
        $scope.videoUrl = $scope.videoCandidate ? $scope.candidate.profile.videoUrl : null;
    };

    $scope.displayContact = function() {
        var info = {
                token: employer.token,
                employeeId: employeeId
            };

        $employer.getEmployeeContact(info, function(result) {
            if (result.status)
            {
                $scope.candidate.viewed = result.data.result;
            }
        });
    };

    $scope.cancel = function () {
        var candidate = null;

        if ((typeof $scope.candidate !== 'undefined') && $scope.candidate.viewed && (viewedOld !== $scope.candidate.viewed)) {
            candidate = {
                    employeeId: employeeId,
                    viewed: $scope.candidate.viewed
                };
        }

        $uibModalInstance.close(candidate);
    };

    $scope.exportPdf = function() {
        var fileName = $scope.candidate.profile.name.replace(/\s+/g, '-') + '_CV.pdf';
        var styles = $cvToPdf.setStyles();
        var contentToPdf = [];

        contentToPdf = $cvToPdf.setFeatureList(contentToPdf, $scope.candidate.profile);
        contentToPdf = $cvToPdf.setExpContentList(contentToPdf, $scope.candidate.expList);
        contentToPdf = $cvToPdf.setEduContentList(contentToPdf, $scope.candidate.eduList);
        contentToPdf = $cvToPdf.setCertContentList(contentToPdf, $scope.candidate.certList);
        contentToPdf = $cvToPdf.setDocContentList(contentToPdf, $scope.candidate.docList);

        var docDefinition = {
            content: contentToPdf,
            styles: styles
        };

        pdfMake.createPdf(docDefinition).download(fileName);
        downloadDocList($scope.candidate.docList);
    }

    function downloadDocList(docList) {
        if(docList.length > 0) {
            for(var i=0; i< docList.length; i++){
                window.open(docList[i].filedata);
            }
        }

        // window.open('https://vietinterview.com/home/data/Documents/09471709102016CV.docx');
    };
});