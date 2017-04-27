'use strict';
angular.module('employeeModule')
.controller('ProfileEmployeeController', function($scope, $rootScope, $employee, $translate, $common, $location, $utilities, $uibModal, $q, $sce, $log, $filter, toastr, localStorageService, Upload, _) {

    $scope.page_main ="homepage";
    $scope.employee = localStorageService.get('employee');
    var login = $translate.instant('toaster.login');

    if (!$scope.employee) {
        toastr.error( '', login);
        $location.path('/home');
    }
    
    var select = $translate.instant('employee.select');
    var female = $translate.instant('employee.female');
    var male = $translate.instant('employee.male');
    var noProfile = $translate.instant('toaster.noresultProfile');
    var noExp = $translate.instant('toaster.noresultExp');
    var noDoc = $translate.instant('toaster.noresultDoc');
    var noEdu = $translate.instant('toaster.noresultEdu');
    var noListEdu = $translate.instant('toaster.noListEdu');
    var styding = $translate.instant('employee.styding');
    var stydingEnd = $translate.instant('employee.stydingEnd');
    var noCer = $translate.instant('toaster.noresultCer');
    var updateError = $translate.instant('toarster.updateError');
    var allcountry = $translate.instant('employee.searchCountries');
    // var allProvince = $translate.instant('employee.searchProvinces');
    var selectText = select;    
    $scope.female = $translate.instant('employee.female');
    $scope.male = $translate.instant('employee.male');
    
    $scope.expList = [];
    $scope.eduList = [];
    $scope.certList = [];
    $scope.positionList = [];
    $scope.currFile = {};
    $scope.toggleModalDoc = true;
    $scope.avatar = '';
    $scope.editProfile = false;
    $scope.createExp = false;
    $scope.createEdu = false;
    $scope.createCer = false;
    $scope.expEditId = null;
    $scope.eduEditId = null;
    $scope.cerEditId = null;
   
    $scope.validDoc = false;
    $scope.statusObj = {
        availableEduStatus: [
        {
            id: 0,
            title: selectText
        },
        {
            id: 1,
            title: styding
        },
        {
            id: 2,
            title: stydingEnd
        }],
        selectedEduStatus:
        {
            id: 0,
            title: selectText
        }
    };
    $scope.genders = {
        availableGenders: [
        {
            id: 0,
            title: select
        },
        {
            id: 1,
            title: male
        },
        {
            id: 2,
            title: female
        }],
        selectedGender:
        {
            id: 0,
            title: select
        }
    };
    $scope.isSelectedExp = function(id)
    {
        return ($scope.expEditId === id);
    };
    $scope.isSelectedEdu = function(id)
    {
        return ($scope.eduEditId === id);
    };
    $scope.isSelectedCer = function(id)
    {
        return ($scope.cerEditId === id);
    };
    $scope.cancelCer = function()
    {
        $scope.cerEditId = null;
        $scope.createCer = false;
    };
    $scope.changeToEditProfile = function(state)
    {
        $scope.editProfile = state;
        $scope.employee.birthdate = new Date($scope.employee.birthdate);
    };  
  
    $scope.currDate = function() {
        var toDay   = new Date(),
            year    = toDay.getFullYear(),
            month   = toDay.getMonth() + 1,
            date    = toDay.getDate();

        return (year + '-' + month + '-' + date);
    };
    function getLocation() {
        var deferred = $q.defer();

        if (!localStorageService.get('listLocation') || !localStorageService.get('listProvince')) {
            $common.getJobLocation({ lang: 'vi' }, function(result){
                if(result.status){
                    result.data.countryList.unshift({
                        id: '',
                        title: allcountry
                    });

                    $scope.listLocation = result.data.countryList;
                    $scope.listProvince = result.data.provinceList;
                
                    localStorageService.set('listLocation', result.data.countryList);
                    localStorageService.set('listProvince', result.data.provinceList);
                } else {
                    $log.info('error', 'Khong the lay duoc danh sach country va province');
                }

                deferred.resolve();
            });      
        } else {
            $scope.listLocation = localStorageService.get('listLocation');
            $scope.listProvince = localStorageService.get('listProvince'); 

            deferred.resolve(); 
        } 

        return deferred.promise;
    }
    function setCurrCountry(obj) {
        $scope.currCountry = _.find($scope.listLocation, function(country) {
            return (obj.countryId === country.id);
        });

        $scope.countries = {
            selectedCountry: $scope.currCountry,
            availableCountries: $scope.listLocation            
        };
    }
    function setCurrProvince(obj) {
        $scope.currProvince = _.find($scope.provincesList, function(province) {
            return obj.provinceId === province.id;
        });

        $scope.provinces = {
            availableProvinces: $scope.provincesList,
            selectedProvince: $scope.currProvince
        };
    }
    function getCountryName(obj) {
        if ($scope.listLocation) {
            var country = _.find($scope.listLocation, function(country) {
                return obj.countryId === country.id;
            });

            if (country) {
                obj.countryName = country.title;
            }
        }
    }   
    function getProvinceName(obj) {
        if ($scope.listProvince) {
            var province = _.find($scope.listProvince, function(province) {
                return obj.provinceId === province.id;
            });

            if (province) {
                obj.provinceName = province.title;
            }
        }
    }
    $scope.getProvincesListByCountry = function(countryId) {
        $scope.provincesList = _.filter($scope.listProvince, function(province) {
            return countryId === province.countryId;
        });

        $scope.provinces = {
            selectedProvince: $scope.provincesList[0],
            availableProvinces: $scope.provincesList            
        };
    }; 
    function setSelectedGender(employee) {
        if (employee.gender) {
            $scope.genders.selectedGender = _.find($scope.genders.availableGenders,
                function(gender) {
                    return (employee.gender === gender.title);
                });
        }
    }
    function getListCategory() {
        var deferred = $q.defer();

        if(!localStorageService.get('listCategories')){
            $common.getJobCategory({ 'lang': 'vi' }, function(result){
                if(result.status){
                    $scope.listCategories = result.data.categoryList;
                    localStorageService.set('listCategories', $scope.listCategories);
                    $scope.categories = {
                        availableCategories: $scope.listCategories
                    };
                    console.log($scope.categories.availabeCategories);
                }
                deferred.resolve();
            });
        } else{
            $scope.listCategories = localStorageService.get('listCategories');
            $scope.categories = {
                availableCategories: $scope.listCategories
            };
            deferred.resolve();
        }

        return deferred.promise;
    }
    $scope.getEmployeeProfile = function() {
        var deferred    = $q.defer(),
            info        = {
                    token: $scope.employee.token
                };

        $employee.getEmployeeProfile(info, function(result) {
            if (result.status) {
                var employee = result.data.employee;
                employee.birthdate = employee.birthdate ? employee.birthdate : '';
                employee.mobile = employee.mobile ? employee.mobile : '';
                if ((employee.name.indexOf('@') === -1) && (employee.name.indexOf('-') !== -1)) {
                        var fullName = employee.name.split('-');
                        employee.lastName = fullName[0];
                        employee.firstName = fullName[1];
                    }
                
                setSelectedGender(employee);
                getCountryName(employee);
                getProvinceName(employee);

                if (employee.countryId && employee.provinceId) {
                    setCurrCountry(employee);
                    $scope.getProvincesListByCountry(employee.countryId);
                    setCurrProvince(employee);
                }
                else {
                    setCurrCountry(location);
                    $scope.getProvincesListByCountry(location.countryId);
                    setCurrProvince(location);
                }

                if (!employee.birthday) {
                    employee.birthday = $scope.currDate();
                }
                $scope.avatar = 'data:image/png;base64,' + employee.image;
                employee.token = $scope.employee.token;
                $scope.employee = employee;
                localStorageService.set('employee', employee);
                deferred.resolve(employee);
            }
            else
            {
                toastr.error('', noProfile);
                deferred.resolve(null);
            }            
        }); 

        return deferred.promise;
    };
    $scope.getEmployeeExp = function()
    {
        var promise = new Promise(function(resolve, reject)
        {
            $employee.getEmployeeExperience(
            {
                token: $scope.employee.token
            }, function(result)
            {
                if (result.status)
                {
                    $scope.expList = result.data.expList;
                    // Get name of country, province and category
                    $scope.expList.map(function(exp)
                    {
                        getCountryName(exp);
                        getProvinceName(exp);
                        exp.categories = $employee.getCategories(exp.categoryIdList,
                            localStorageService.get('listCategories')
                        );
                    });
                    // Get recently company
                    $scope.recentlyExpEmployer = _.find($scope.expList, function(exp)
                    {
                        return exp.current === true;
                    });
                    resolve($scope.expList);
                }
                else
                {
                    toastr.error( '', noExp);
                    resolve(null);
                }
            });
        });
        return promise;
    };
    $scope.getEduLevelsList = function()
    {
        var promise = new Promise(function(resolve, reject)
        {
            $scope.eduLevelsList = [];
            if (localStorageService.get('eduLevelList'))
            {
                $scope.eduLevelsList = localStorageService.get('eduLevelList');
                resolve($scope.eduLevelsList);
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
                        result.data.levelList.unshift(
                        {
                            id: 0,
                            title: selectText
                        });
                        localStorageService.set('eduLevelList', result.data.levelList);
                        $scope.eduLevelsList = result.data.levelList;
                    }
                    else
                    {
                        toastr.error( '', noEdu);
                    }
                    resolve($scope.eduLevelsList);
                });
            }
        });
        return promise;
    };
    $scope.getEmployeeEdu = function()
    {
        var promise = new Promise(function(resolve, reject)
        {
            $employee.getEmployeeEducation(
            {
                token: $scope.employee.token
            }, function(result)
            {
                if (result.status)
                {
                    localStorageService.set('eduList', result.data.eduList);
                    $scope.eduList = result.data.eduList;
                    // Get name edu level
                    $scope.eduList.map(function(eduObj)
                    {
                        var levelObj = _.find($scope.eduLevelsList,
                            function(eduLevel)
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
                    // Get highest edu level
                    $scope.highestEduLevel = _.max($scope.eduList, function(edu)
                    {
                        return edu.levelId;
                    });
                }
                else
                {
                    toastr.error('', noListEdu);
                }
                resolve('done');
            });
        });
        return promise;
    };
    $scope.getEmployeeCer = function()
    {
        var promise = new Promise(function(resolve, reject)
        {
            var info = {
                token: $scope.employee.token
            };
            $employee.getEmployeeCertificate(info, function(result)
            {
                if (result.status)
                {
                    $scope.certList = result.data.certList;
                }
                else
                {
                    toastr.error( '', noCer);
                }
                resolve('done');
            });
        });
        return promise;
    };
    $scope.getEmployeeDoc = function()
    {
        var promise = new Promise(function(resolve, reject)
        {
            var info = {
                token: $scope.employee.token
            };
            $employee.getEmployeeDocument(info, function(result)
            {
                if (result.status)
                {
                    $scope.docList = result.data.docList;
                }
                else
                {
                    toastr.error( '', noDoc);
                }
                resolve('done');
            });
        });
        return promise;
    };

    function getPositionListPromise() {
        var deferred = $q.defer();

        if (!localStorageService.get('listPosition')) {
            $common.getJobPosition({
                'lang': 'vi'
            }, function(result) {
                if (result.status) {
                    result.data.positionList.unshift({
                            id: '',
                            title: selectText
                        });
                    deferred.resolve(result.data.positionList);
                } else {
                    $log.info('Khong lay duoc danh sach vi tri');
                    deferred.resolve(null);
                }
            });
        } else {
            deferred.resolve(localStorageService.get('listPosition'));
        }

        return deferred.promise;
    }

    function getPositionList() {
        getPositionListPromise().then(function(result) {
            if (result) {
                localStorageService.set('listPosition', result);
                $scope.positionList = result;
                $scope.positions = {
                    availablePositions: result,
                    seletedPosition: result[0]
                };
            }
        });
    }

    function getPositionName(expList) {
        expList.map(function(exp) {
            var position = _.find($scope.positionList, function(position) {
                return (exp.positionId === position.id);
            });

            exp.position = position ? position : {};
        });
    }

    // Init
    getLocation().then(function() {
        return $scope.getEmployeeProfile();
    }).then(function() {
        return getPositionList();
    }).then(function() {
        return getListCategory();
    }).then(function()  {
        return $scope.getEmployeeExp();
    }).then(function(result) {
        if (result) {
            getPositionName(result);
            $scope.expList = result;
        }
    }).then(function() {
        return $scope.getEduLevelsList();
    }).then(function(result) {
        if (result) {
            $scope.eduLevelObj = {
                selectedEduLevel: result[0],
                availableEduLevel: result
            };
        }
    }).then(function() {
        return $scope.getEmployeeEdu();
    }).then(function() {
        return $scope.getEmployeeCer();
    }).then(function() {
        return $scope.getEmployeeDoc();
    }); 

    $scope.openCreateVideoModal = function(size)
    {
        var modalInstance = $uibModal.open(
        {
            animation: true,
            templateUrl: 'createVideoModal.html',
            controller: 'ModalCreateVideoCtrl',
            size: size,
            resolve:
            {
                data: function()
                {
                    return {
                        avatar: $scope.avatar,
                        videoUrl: $scope.employee.videoUrl
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
    $scope.openVideoProfileModal = function(size) {
        var modalInstance = $uibModal.open( {
            animation: true,
            templateUrl: 'videoProfileModal.html',
            controller: 'ModalVideoProfileCtrl',
            size: size,
            resolve: {
                    data: function() {
                        return {
                            videoUrl: $scope.employee.videoUrl
                        };
                    }
                }
        });

        modalInstance.result.then(function(selectedItem) {
            $scope.selected = selectedItem;
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.uploadVideo = function(files) {
        if (files && files[0]) {
            var file = files[0];

            $common.uploadVideo( {
                file: file
            }, function(result) {
                if (result.status && result.data.result) {
                    $scope.employee.videoUrl = result.data.url;
                    var info = {
                            token: $scope.employee.token,
                            employee: $scope.employee
                        };

                    $employee.updateEmployeeProfile(info, function(result) {
                        if (result.status) {
                            toastr.success( '', 'Tải video thành công');
                            localStorageService.remove('employee');
                            $scope.getEmployeeProfile();
                        } else {
                            $scope.employee = localStorageService.get('employee');
                            toastr.error(updateError);
                        }
                    });
                }
            });
        }
    };
    $scope.resetEmployeeProfile = function()
    {
        $scope.changeToEditProfile(false);
        if (localStorageService.get('employee'))
        {
            $scope.employee = localStorageService.get('employee');
        }
        else
        {
            $scope.getEmployeeProfile();
        }
    };
        // Edit photpBase64 and upload image
    var uploadBase64 = function(urls, employee)
    {
        urls = urls.split(',')[1];
        var blob = $utilities.b64toBlob(urls, 'image/png');
        var img = new Image();
        img.src = URL.createObjectURL(blob);
        img.onload = function()
        {
            urls = $utilities.resizeImg(img, 222, 304, 0);
            urls = urls.split(',')[1];
            employee.image = urls;
            var info = {
                token: $scope.employee.token,
                employee: employee
            };
            $employee.updateEmployeeProfile(info, function(result)
            {
                if (result.status)
                {
                    localStorageService.remove('employee');
                    $scope.getEmployeeProfile();
                }
                else
                {
                    $scope.employee = localStorageService.get('employee');
                    toastr.error('', 'Cập nhật không thành công');
                }
            });
        };
    };
    $scope.updateEmployeeAvatar = function(employee)
        {
            if ($scope.avatar)
            {
                Upload.base64DataUrl($scope.avatar).then(function(urls)
                {
                    uploadBase64(urls, employee);
                });
            }
        };
        // Employee's avatar form webcam
    $rootScope.$on('photoBase64', function(event, stringBase64)
    {
        uploadBase64(stringBase64, $scope.employee);
    });
    // Employee's video url
    $rootScope.$on('url', function(event, url)
    {
        $scope.employee.videoUrl = url;
        var info = {
            token: $scope.employee.token,
            employee: $scope.employee
        };
        $employee.updateEmployeeProfile(info, function(result)
        {
            if (result.status)
            {
                angular.element('#employee-modal').modal('hide');
                localStorageService.remove('employee');
                $scope.getEmployeeProfile();
            }
            else
            {
                $scope.employee = localStorageService.get('employee');
                toastr.error( '', updateError);
            }
        });
    });
    $scope.updateEmployeeProfile = function(employee) {
        employee.name = employee.lastName + '-' + employee.firstName;
        employee.gender = $scope.genders.selectedGender.title;
        employee.countryId = $scope.countries.selectedCountry.id;
        employee.provinceId = $scope.provinces.selectedProvince.id;
        employee.birthdate = $filter('date')(employee.birthdate, 'yyyy-MM-dd');
        var info = {
            token: $scope.employee.token,
            employee: employee
        };
        $employee.updateEmployeeProfile(info, function(result)
        {
            if (result.status)
            {
                localStorageService.remove('employee');
                $scope.changeToEditProfile(false);
                $scope.getEmployeeProfile().then(function(employee) {
                        if (employee) {
                            $rootScope.$emit('changeEmployee');
                        }
                    });
            }
            else
            {
                $scope.employee = localStorageService.get('employee');
                toastr.error( '', updateError);
            }
        });
    };
    function createEmployeeExp(newExp) {
        var info = {
            token: $scope.employee.token,
            exp: newExp
        };

        $employee.addEmployeeExperience(info, function(result) {
            if (result.status) {
                $scope.createExp = false;
                $scope.getEmployeeExp().then(function(result) {
                    if (result) {
                        getPositionName(result);
                        $scope.expList = result;
                    }
                });
            } else {
                toastr.error( '', updateError);
            }
        });
    }
    function updateEmployeeExp(exp) {
        var info = {
            token: $scope.employee.token,
            exp: exp
        };

        $employee.updateEmployeeExperience(info, function(result) {
            if (result.status) {
                $scope.expEditId = null;
                $scope.getEmployeeExp().then(function(result) {
                    if (result) {
                        getPositionName(result);
                        $scope.expList = result;
                    }
                });
            } else {
                toastr.error( '', updateError);
            }
        });
    }
    $scope.saveEmployeeExp = function() {
        $scope.currExp.categoryIdList = $employee.getCategoryIdList($scope.categories.selectedCategory);
        $scope.currExp.startDate = $filter('date')($scope.currExp.startDate, 'yyyy-MM-dd');
        $scope.currExp.endDate = $filter('date')($scope.currExp.endDate, 'yyyy-MM-dd');
        if ($scope.positions && $scope.positions.seletedPosition.id !== '') {
            $scope.currExp.positionId = $scope.positions.seletedPosition.id;
        }
        if (!$scope.currExp.id) {
            var newExp = $scope.currExp;
            if (!newExp.description) {
                newExp.description = ' ';
            }
            // Get new countryId && provinceId
            newExp.countryId = $scope.countries.selectedCountry.id;
            newExp.provinceId = $scope.provinces.selectedProvince.id;
            createEmployeeExp(newExp);
        } else {
            // Get new countryId && provinceId
            $scope.currExp.countryId = $scope.countries.selectedCountry.id;
            $scope.currExp.provinceId = $scope.provinces.selectedProvince.id;
            updateEmployeeExp($scope.currExp);
        }
    };
    $scope.removeEmployeeExp = function(exp) {
        var info = {
                token: $scope.employee.token,
                expId: exp.id
            };
        $employee.removeEmployeeExperience(info, function(result) {
            if (result.status) {
                $scope.getEmployeeExp().then(function(result) {
                    if (result) {
                        getPositionName(result);
                        $scope.expList = result;
                    }
                });
            } else {
                toastr.error( '', updateError);
            }
        });
    };
    $scope.cancelEditExp = function() {
        $scope.expEditId = null;
        $scope.createExp = false;
    };
    $scope.resetModalExp = function() {
        $scope.createExp = true;
        $scope.currExp = {};
        $scope.currExp.current = false;
        $scope.currExp.startDate = new Date($scope.currDate());
        $scope.currExp.endDate = new Date($scope.currDate());
        $scope.positions.seletedPosition = $scope.positions.availablePositions[0];
        setCurrCountry(location);
        $scope.getProvincesListByCountry(location.countryId);
        setCurrProvince(location);
    };
    $scope.setModalExp = function(exp) {
        $scope.expEditId = exp.id;
        $scope.categories.selectedCategory = exp.categories;
        $scope.positions.seletedPosition = exp.position;
        exp.startDate = new Date(exp.startDate);
        exp.endDate = new Date(exp.endDate);
        $scope.currExp = {};
        Object.assign($scope.currExp, exp);
        setCurrCountry(exp);
        $scope.getProvincesListByCountry(exp.countryId);
        setCurrProvince(exp);
    };
    // Education    
    $scope.resetModalEdu = function() {
        $scope.currEdu = {};
        $scope.currEdu.status = true;
        $scope.currEdu.finishDate = new Date($scope.currDate());
        $scope.createEdu = true;
        $scope.eduEditId = null;
        $scope.statusObj.selectedEduStatus = $scope.statusObj.availableEduStatus[0];
        $scope.eduLevelObj.selectedEduLevel = $scope.eduLevelObj.availableEduLevel[0];
    };
    $scope.setModalEdu = function(edu) {
        edu.finishDate = new Date(edu.finishDate);
        $scope.currEdu = edu;
        $scope.eduEditId = edu.id;
        $scope.createEdu = false;
        if (edu.status === 'enrolled') {
            $scope.statusObj.selectedEduStatus = $scope.statusObj.availableEduStatus[1];
        } else {
            $scope.statusObj.selectedEduStatus = $scope.statusObj.availableEduStatus[2];
        }
        $scope.eduLevelObj.selectedEduLevel = $scope.eduLevelObj.availableEduLevel[edu.levelId];
    };
    $scope.cancelEdu = function() {
        $scope.eduEditId = null;
        $scope.createEdu = false;
    };
    var createEmployeeEdu = function(newEdu) {
        var info = {
                token: $scope.employee.token,
                edu: newEdu
            };

        $employee.addEmployeeEducation(info, function(result) {
            if (result.status) {
                $scope.createEdu = false;
                $scope.getEmployeeEdu();
            } else {
                toastr.error( '', updateError);
            }
        });
    };
    var updateEmployeeEdu = function(currEdu) {
        var info = {
                token: $scope.employee.token,
                edu: currEdu
            };

        $employee.updateEmployeeEducation(info, function(result) {
            if (result.status) {
                $scope.eduEditId = null;
                $scope.getEmployeeEdu();
            } else {
                toastr.error( '', updateError);
            }
        });
    };
    $scope.saveEmployeeEdu = function(currEdu) {
        if ($scope.statusObj.selectedEduStatus.id === 1) {
            currEdu.status = 'enrolled';
        } else if ($scope.statusObj.selectedEduStatus.id === 2) {
            currEdu.status = 'graduated';
        }
        else {
            currEdu.status = '';
        }

        currEdu.levelId = $scope.eduLevelObj.selectedEduLevel.id;
        currEdu.finishDate = $filter('date')(currEdu.finishDate, 'yyyy-MM-dd');

        if (!currEdu.id) {
            createEmployeeEdu(currEdu);
        } else {
            updateEmployeeEdu(currEdu);
        }
    };
    $scope.removeEmployeeEdu = function(currEdu) {
        var info = {
                token: $scope.employee.token,
                eduId: currEdu.id
            };

        $employee.removeEmployeeEducation(info, function(result) {
            if (result.status) {
                $scope.getEmployeeEdu();
            } else {
                toastr.error( '', updateError);
            }
        });
    };
    // Certificate
    $scope.resetModalCer = function() {
        $scope.createCer = true;
        $scope.currCer = {};
        $scope.currCer.issueDate = new Date($scope.currDate());
    };
    $scope.setModalCer = function(cer) {
        $scope.cerEditId = cer.id;
        // $scope.currCer = {};
        cer.issueDate = new Date(cer.issueDate);
        $scope.currCer = cer;
    };
    var createEmployeeCer = function(newCer) {
        var info = {
                token: $scope.employee.token,
                cert: newCer
            };

        $employee.addEmployeeCertificate(info, function(result) {
            if (result.status) {
                $scope.createCer = false;
                $scope.getEmployeeCer();
            } else {
                toastr.error( '', updateError);
            }
        });
    };
    var updateEmployeeCer = function(currCer) {
        var info = {
                token: $scope.employee.token,
                cert: currCer
            };

        $employee.updateEmployeeCertificate(info, function(result) {
            if (result.status) {
                $scope.cerEditId = null;
            } else {
                toastr.error( '', updateError);
            }
            $scope.getEmployeeCer();
        });
    };
    $scope.saveEmployeeCer = function(currCer) {
        currCer.issueDate = $filter('date')(currCer.issueDate, 'yyyy-MM-dd');
        if (!currCer.id) {
            createEmployeeCer(currCer);
        } else {
            updateEmployeeCer(currCer);
        }
    };
    $scope.removeEmployeeCer = function(currCer) {
        var info = {
                token: $scope.employee.token,
                certId: currCer.id
            };

        $employee.removeEmployeeCertificate(info, function(result) {
            if (result.status) {
                $scope.getEmployeeCer();
            } else {
                toastr.error( '', updateError);
            }
        });
    };
    // Documents
    $scope.resetModalDoc = function() {
        $scope.formDoc.$setPristine();
        $scope.currFile = {};
        $scope.toggleModalDoc = !$scope.toggleModalDoc;
    };
    $scope.setModalDoc = function(doc) {
        $scope.currFile = doc;
        $scope.currFile.file = {};
        $scope.currFile.file.name = doc.filename;
        $scope.toggleModalDoc = !$scope.toggleModalDoc;
    };
    var createEmployeeDoc = function(newFile) {
        if (newFile) {
            var filename = newFile.file.name;
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                var base64 = theFile.target.result;
                    base64 = base64.split(',')[1];
                var info = {
                        token: $scope.employee.token,
                        doc:
                        {
                            title: newFile.title,
                            filename: filename,
                            filedata: base64
                        }
                    };

                $employee.addEmployeeDocument(info, function(result) {
                    if (result.status) {
                        $scope.currFile.title = '';
                        $scope.currFile.file = {};
                        $scope.getEmployeeDoc();
                    } else {
                        toastr.error('', updateError);
                    }

                    $scope.change = false;
                });
            });
            // Read in the file as a data URL.
            reader.readAsDataURL(newFile.file);
        }
    };
    $scope.saveEmployeeDoc = function(doc) {
        createEmployeeDoc(doc);
        $scope.resetModalDoc();
    };
    $scope.removeEmployeeDoc = function(doc) {
        var info = {
                token: $scope.employee.token,
                docId: doc.id
            };

        $employee.removeEmployeeDocument(info, function(result) {
            if (result.status) {
                $scope.getEmployeeDoc();
            } else {
                toastr.error( '', updateError);
            }
        });
    };
    $scope.isValidateDoc = function(doc) {
        if (!doc) {
            $scope.validDoc = false;
            return false;
        }
        $scope.validDoc = true;
        return true;
    };
}).controller('ModalCreateVideoCtrl', function($scope, $uibModalInstance, $sce, data) {
    $scope.avatar = data.avatar;
    $scope.videoUrl = data.videoUrl;
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}).controller('ModalVideoProfileCtrl', function($scope, $uibModalInstance, $sce, data) {
    $scope.videoUrl = data.videoUrl;
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});