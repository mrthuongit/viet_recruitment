'use strict';
angular.module('adminModule').controller('AdminEmployeeDetailController', function($scope, $admin, $translate, $rootScope, $employee, toastr, localStorageService, $location, $q, $common, $utilities, Upload, $uibModal, _, $log)
{
    var select = $translate.instant('employee.select');
    var female = $translate.instant('employee.female');
    var male = $translate.instant('employee.male');
    var noresultExp = $translate.instant('toaster.noresultExp');
    var noresultDoc = $translate.instant('toaster.noresultDoc');
    var noresultEdu = $translate.instant('toaster.noresultEdu');
    var noListEdu = $translate.instant('toaster.noListEdu');
    var styding = $translate.instant('employee.styding');
    var stydingEnd = $translate.instant('employee.stydingEnd');
    var noresultCer = $translate.instant('toaster.noresultCer');
    var updateSuccess = $translate.instant('toarster.updateSuccess');
    var Tosrequired = $translate.instant('toarster.required');
    var uninvail = $translate.instant('employee.uninvail');
    var updateError = $translate.instant('toarster.updateError');
    $scope.defaultValues = {};
    $scope.defaultValues.selectText = select;
    $scope.employee = {};
    $scope.exp = {};
    $scope.expList = [];
    $scope.eduList = [];
    $scope.certList = [];
    $scope.avatar = '';
    $scope.positionList = [];
    // Documents
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
    $scope.reset = {
        email: '',
        result: false
    };
    $scope.validDoc = false;
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
    $scope.cancelEditExp = function()
    {
        $scope.expEditId = null;
        $scope.createExp = false;
    };
    $scope.cancelEdu = function()
    {
        $scope.eduEditId = null;
        $scope.createEdu = false;
    };
    $scope.cancelCer = function()
    {
        $scope.cerEditId = null;
        $scope.createCer = false;
    };
    $scope.changeToEditProfile = function(state)
    {
        $scope.editProfile = state;
        $scope.employee.birthday = new Date($scope.employee.birthdate);
    };
    $scope.changeToCreate = function(kind, state)
    {
        switch (kind)
        {
            case 'exp':
                $scope.createExp = state;
                break;
            case 'edu':
                $scope.createEdu = state;
                break;
            default:
                $scope.createCer = state;
        }
    };
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
                result.unshift(
                {
                    id: '',
                    title: select
                });
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
            exp.position = position ? position : {};
        });
    };
    $scope.resetEmployeeProfile = function()
    {
        $scope.changeToEditProfile(false);
        if (localStorageService.get('employeeAdmin'))
        {
            $scope.employee = localStorageService.get('employeeAdmin');
        }
        else
        {
            $scope.getEmployeeProfile();
        }
    };
    $scope.openVideoProfileModal = function(size)
    {
        var modalInstance = $uibModal.open(
        {
            animation: $scope.animationsEnabled,
            templateUrl: 'videoProfileModal.html',
            controller: 'ModalVideoProfileCtrl',
            size: size,
            resolve:
            {
                data: function()
                {
                    return {
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
    $scope.getProvincesListByCountry = function(countryId)
    {
        $scope.provincesList = _.filter($scope.listProvince, function(province)
        {
            return countryId === province.countryId;
        });
        $scope.provinces = {
            selectedProvince: $scope.provincesList[0],
            availableProvinces: $scope.provincesList
        };
    };
    var getCategory = function(lang)
    {
        if (!localStorageService.get('listCategories_' + lang))
        {
            $common.getJobCategory(
            {
                lang: lang
            }, function(result)
            {
                if (result.status)
                {
                    result.data.categoryList.unshift(
                    {
                        id: 0,
                        title: select
                    });
                    $scope.listCategories = result.data.categoryList;
                    localStorageService.set('listCategories_' + lang, result.data.categoryList);
                    $scope.categories = {
                            selectedCategory: $scope.listCategories[0],
                            availabeCategories: $scope.listCategories
                        };
                }
            });
        }
        else
        {
            $scope.listCategories = localStorageService.get('listCategories_' + lang);
            $scope.categories = {
                    selectedCategory: $scope.listCategories[0],
                    availableCategories: $scope.listCategories
                };
        }
    };
    var getLocation = function()
    {
        if (!localStorageService.get('listLocation') || !localStorageService.get('listLevel'))
        {
            $common.getJobLocation(
            {
                lang: 'en'
            }, function(result)
            {
                if (result.status)
                {
                    $scope.listLocation = result.data.countryList;
                    $scope.listProvince = result.data.provinceList;
                    localStorageService.set('listLocation', result.data.countryList);
                    localStorageService.set('listLevel', result.data.provinceList);
                }
            });
        }
        else
        {
            $scope.listLocation = localStorageService.get('listLocation');
            $scope.listProvince = localStorageService.get('listLevel');
        }
    };
    var init = function()
    {
        localStorageService.set("page", "employee");
        $scope.userAdmin = localStorageService.get('userAdmin');
        $scope.chooseEmployee = localStorageService.get('chooseEmployeeAdmin');
        $rootScope.$watch('language', function(newValue, oldValue)
        {
            if (localStorageService.get('listCategories_' + $rootScope.language)) {
                $scope.listCategories =localStorageService.get('listCategories_' + $rootScope.language);
            }
        });
        getCategory('vi');
        getLocation();
        // Inital Emplyee information
        if ($scope.chooseEmployee.id)
        {
            $scope.getEmployeeProfile().then(function()
            {
                return getPositionList();
            }).then(function()
            {
                return $scope.getEmployeeExp().then(function(result)
                {
                    if (result)
                    {
                        getPositionName($scope.expList);
                    }
                });
            }).then(function()
            {
                return $scope.getEduLevelsList().then(function(result)
                {
                    if(result) {
                        $scope.eduLevelObj = {
                        selectedEduLevel: result[0],
                        availableEduLevel: result
                        };
                    }
                });
            }).then(function()
            {
                return $scope.getEmployeeEdu();
            }).then(function()
            {
                return $scope.getEmployeeCer();
            }).then(function()
            {
                return $scope.getEmployeeDoc();
            });
        }
        else
        {
            $scope.editProfile = true;
            getPositionList();
            $scope.getEduLevelsList().then(function(result)
            {
                if(result) {
                    $scope.eduLevelObj = {
                        selectedEduLevel: null,
                        availableEduLevel: result
                    };
                }
            });
            $scope.setCurrCountry($scope.defaultValues.countryId);
            $scope.getProvincesList($scope.defaultValues.countryId);
            $scope.setCurrProvince($scope.defaultValues.provinceId);
            $scope.employee = {};
            $scope.employee.address = false;
            $scope.employee.phone = false;
            $scope.employee.image = "iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAIAAACyr5FlAABCmElEQVR4nO29WbMlx5Em5u4RkctZ\n7lo7gMJCggAGTeu26eme0Ugy6UXzL/S39DP0LNODXvQiG6nHpBmbZnezyQZJbIWqW3W3s2aGux7c\nPTJPFYsgSCznwm5guWfJ7WR86cvnS+BP/5f/GW7H7fh9g37oC7gd+ztuwXE7XjtuwXE7XjtuwXE7\nXjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7Xjtu\nwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7XjtuwXE7\nXjviD30B398ISFVIDVVNSHVINVV1SE2oEgSSQEgBkZAQkBCJUBA67jvJm9ytebPKm0VeL/v1oltv\nc/9D/5rvY/xowRGQAlKkGJESxSrEJtSzqjlMk4M0Paims9jO4+QgTRtKSWLEECgmDAGJECkSo6z7\n7SqvF/36ol+82F4+W18+21w8X19dbharfttL7qTvOWfhH/rnfifjRwuOaWrut8dvtncfVaen1eGk\nbppU1Sm2VTVJTZOqmmJFMcWUKMaYAiACIiIAAIiwZOGe+z5zx/2q3yy3m8V2bf/frM+768+3z399\n9fmny6fX3eoH/rXfzfhRgSNSmKfJcZwd1/PT5uDR/PTt2YPHzd3T+jBVMYYQiGIMMVIMREiIKABE\nFGNABBQ7jgD0uc+ZRUBEWCTnnHvucs6Zc85d3y/6zaerZw8vTz65fHK2Oj/bXJ1tLld5IyB/8Bpv\n0vgxgAMBEQEB77ZHPzt86y/n7743e3Q4mc7aybxpZ03TpAqJUKfNRIPtywIA0vc9yHhSUUBUihBi\nQIwhQiVFrAjApu9P1wc/OXp4uVp8dXXxX8//5e/Of/nZ8ulVtxKRHwdEfgzgqGO61xz9bPLmu4eP\n3jq8+9PDR3fbw5RiSjHFmGIgIgAQEREBEBYQVqCIygZh/cqhAwAKBP0MUQQQAAkAEYkIoIkxtO0k\n1aeT+aODO3eODt84P/3d5dN/ufzyl1efnm0vWW48Pm42OCKGeZrcnxx/ePj4vz39+L3DRwezyXw6\naeoEAAACAgKQczYQSPkLUAAgwAYOlw0AAjjs77OM+h+aoCLEuoqE1RzxYDZ5fHD37PLqF2e/aVP9\n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\nRK5CYII=\n";
            $scope.avatar = 'data:image/png;base64,' + $scope.employee.image;
            localStorageService.set('employeeAdmin', $scope.employee);
        }
        $scope.format = 'yyyy-MM-DD';
        $scope.altInputFormats = ['M!/d!/yyyy'];
    };
    $scope.currDate = function()
        {
            var toDay = new Date();
            var year = toDay.getFullYear();
            var month = toDay.getMonth() + 1;
            var date = toDay.getDate();
            return (year + '-' + month + '-' + date);
        };
        // Get provinces list by country id
    $scope.getProvincesList = function(countryId)
    {
        $scope.provincesList = _.filter($scope.listProvince, function(province)
        {
            return countryId === province.countryId;
        });
        $scope.provinces = {
            selectedProvince: $scope.provincesList[0],
            availableProvinces: $scope.provincesList
        };
    };
    $scope.setCurrCountry = function(countryId)
    {
        if (!countryId)
        {
            countryId = 0;
        }
        $scope.currCountry = _.find($scope.listLocation, function(country)
        {
            return country.id === countryId;
        });
        $scope.countries = {
            selectedCountry: $scope.currCountry,
            availableCountries: $scope.listLocation
        };
    };
    $scope.setCurrProvince = function(provinceId)
    {
        $scope.currProvince = _.find($scope.provincesList, function(province)
        {
            return province.id === provinceId;
        });
        $scope.provinces = {
            availableProvinces: $scope.provincesList,
            selectedProvince: $scope.currProvince
        };
    };
    $scope.getCountryName = function(countryId)
    {
        if ($scope.listLocation)
        {
            var country = _.find($scope.listLocation, function(country)
            {
                return countryId === country.id;
            });
            if (country)
            {
                return country.title;
            }
        }
    };
    $scope.getProvinceName = function(provinceId)
    {
        if ($scope.listProvince)
        {
            var province = _.find($scope.listProvince, function(province)
            {
                return provinceId === province.id;
            });
            if (province)
            {
                return province.title;
            }
        }
    };
    $scope.getCategoryName = function(categoryId)
    {
        if (localStorageService.get('listCategories_' + $rootScope.language))
        {
            $scope.listCategories = localStorageService.get('listCategories_' + $rootScope.language);
            var category = _.find($scope.listCategories, function(category)
            {
                return categoryId === category.id;
            });
            if (category)
            {
                return category.title;
            }
            else
            {
                return '';
            }
        }
    };
    $scope.getEmployeeProfile = function()
    {
        var promise = new Promise(function(resolve, reject)
        {
            var info = {
                token: $scope.userAdmin.token,
                employeeId: $scope.chooseEmployee.id
            };
            $admin.getEmployeeProfile(info, function(result)
            {
                if (result.status)
                {
                    var employee = result.data.employee;
                    employee.birthdate = employee.birthdate ? employee.birthdate : '';
                    employee.mobile = employee.mobile ? employee.mobile : '';
                    if (employee.name.indexOf('@') === -1 && employee.name.indexOf('-') !== -1)
                    {
                        var fullName = employee.name.split('-');
                        employee.lastName = fullName[0];
                        employee.firstName = fullName[1];
                    }
                    if (employee.gender)
                    {
                        $scope.genders.selectedGender = _.find($scope.genders.availableGenders,
                            function(gender)
                            {
                                return employee.gender === gender.title;
                            });
                    }
                    employee.countryName = $scope.getCountryName(employee.countryId);
                    employee.provinceName = $scope.getProvinceName(employee.provinceId);
                    if (employee.countryId && employee.provinceId)
                    {
                        // Set select box country and province to current values
                        $scope.setCurrCountry(employee.countryId);
                        $scope.getProvincesListByCountry(employee.countryId);
                        $scope.setCurrProvince(employee.provinceId);
                    }
                    else
                    {
                        // Set select box country and province to $scope.defaultValues's values
                        $scope.setCurrCountry(location.countryId);
                        $scope.getProvincesListByCountry(location.countryId);
                        $scope.setCurrProvince(location.provinceId);
                    }
                    if (!employee.birthday) {
                        employee.birthday = $scope.currDate();
                    }
                    $scope.avatar = 'data:image/png;base64,' + employee.image;
                    $scope.employee = employee;
                    localStorageService.set('employeeAdmin', employee);
                }
                else
                {
                    var noProfile = $translate.instant('toaster.noresultProfile');
                    toastr.error(noProfile,'');
                }
                resolve('done');
            });
        });
        return promise;
    };
    $scope.getEmployeeExp = function()
    {
        var promise = new Promise(function(resolve, reject)
        {
            $admin.getEmployeeExperience(
            {
                token: $scope.userAdmin.token,
                employeeId: $scope.chooseEmployee.id
            }, function(result)
            {
                if (result.status)
                {
                    $scope.expList = result.data.expList;
                    // Get name of country, province and category
                    $scope.expList.map(function(exp)
                    {
                        exp.countryName = $scope.getCountryName(exp.countryId);
                        exp.provinceName = $scope.getProvinceName(exp.provinceId);
                        exp.categories = $employee.getCategories(exp.categoryIdList,localStorageService.get('listCategories_' + $rootScope.language));
                    });
                    // Get recently company
                    $scope.recentlyExpEmployer = _.find($scope.expList, function(exp)
                    {
                        return exp.current === true;
                    });
                }
                else
                {
                    toastr.error(noresultExp,'');
                }
                resolve('done');
            });
        });
        return promise;
    };
    $scope.getEduLevelsList = function()
    {
        var promise = new Promise(function(resolve, reject)
        {
            $scope.eduLevelsList = [];
            if (localStorageService.get('eduLevelsList'))
            {
                $scope.eduLevelsList = localStorageService.get('eduLevelsList');
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
                            title: $scope.defaultValues.selectText
                        });
                        localStorageService.set('eduLevelsList', result.data.levelList);
                        $scope.eduLevelsList = result.data.levelList;
                    }
                    else
                    {
                        toastr.error(noresultEdu,'');
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
            $admin.getEmployeeEducation(
            {
                token: $scope.userAdmin.token,
                employeeId: $scope.chooseEmployee.id
            }, function(result)
            {
                if (result.status)
                {
                    localStorageService.set('eduList', result.data.eduList);
                    $scope.eduList = result.data.eduList;
                    // Get name edu level
                    $scope.eduList.map(function(eduObj)
                    {
                        var levelObj = _.find($scope.eduLevelsList,function(eduLevel)
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
                    toastr.error(noListEdu,'');
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
                token: $scope.userAdmin.token,
                employeeId: $scope.chooseEmployee.id
            };
            $admin.getEmployeeCertificate(info, function(result)
            {
                if (result.status)
                {
                    $scope.certList = result.data.certList;
                }
                else
                {
                    toastr.error(noresultCer,'');
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
                token: $scope.userAdmin.token,
                employeeId: $scope.chooseEmployee.id
            };
            $admin.getEmployeeDocument(info, function(result)
            {
                if (result.status)
                {
                    $scope.docList = result.data.docList;
                }
                else
                {
                    toastr.error(noresultDoc,'');
                }
                resolve('done');
            });
        });
        return promise;
    };
    // Employee profile
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
    $scope.updateEmployeeAvatar = function(employee)
    {
        Upload.base64DataUrl($scope.avatar).then(function(urls)
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
                    token: $scope.userAdmin.token,
                    employeeId: $scope.chooseEmployee.id,
                    employee: employee
                };
                $admin.updateEmployeeProfile(info, function(result)
                {
                    if (result.status)
                    {
                        localStorageService.remove('employeeAdmin');
                        $scope.getEmployeeProfile();
                    }
                    else
                    {
                        $scope.employee = localStorageService.get('employeeAdmin');
                        toastr.error(updateError,'');
                    }
                });
            };
        });
    };

    var isValidateProfile = function(profile)
    {
        $scope.dismissModal = '';
        if (!profile.lastName || !profile.firstName)
        {
            toastr.warning(Tosrequired,'');
            return false;
        }
        var emailRex = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
        if (!profile.email || !profile.email.match(emailRex))
        {
            toastr.warning(uninvail,'');
            return false;
        }
        var mobileRex = /^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/;
        if (profile.mobile && !profile.mobile.match(mobileRex))
        {
            toastr.warning(uninvail,'');
            return false;
        }
        if ($scope.genders.selectedGender.id === 0)
        {
            toastr.warning(Tosrequired,'');
            return false;
        }
        return true;
    };

    $scope.updateEmployeeProfile = function(employee)
        {
            employee.name = employee.lastName + '-' + employee.firstName;
            employee.gender = $scope.genders.selectedGender.title;
            employee.countryId = $scope.countries.selectedCountry.id;
            employee.provinceId = $scope.provinces.selectedProvince.id;
            employee.birthdate = new Date(employee.birthday).toISOString().slice(0, 10);
            if (isValidateProfile(employee))
            {
                $scope.dismissModal = 'modal';
                if (!$scope.chooseEmployee.id)
                {
                    $admin.createEmployee(
                    {
                        token: $scope.userAdmin.token,
                        email: $scope.employee.email,
                        password: '123456'
                    }, function(result)
                    {
                        if (result.status)
                        {
                            $scope.chooseEmployee.id = result.data.employeeId;
                            $scope.chooseEmployee.email = $scope.employee.email;
                            employee.id = result.data.employeeId;
                            localStorageService.set('chooseEmployeeAdmin', $scope.chooseEmployee);
                            var info = {
                                token: $scope.userAdmin.token,
                                employeeId: $scope.chooseEmployee.id,
                                employee: employee
                            };
                            $admin.updateEmployeeProfile(info, function(result)
                            {
                                if (result.status)
                                {
                                    toastr.success(updateSuccess,'');
                                    $scope.changeToEditProfile(false);
                                    localStorageService.remove('employeeAdmin');
                                    $scope.getEmployeeProfile();
                                }
                                else
                                {
                                    toastr.error(updateError,'');
                                    $scope.employee = localStorageService.get('employeeAdmin');
                                    $scope.employee.birthday = new Date($scope.employee.birthdate);
                                }
                            });
                        }
                        else
                        {
                            $scope.employee = localStorageService.get('employeeAdmin');
                            toastr.error(updateError,'');
                        }
                    });
                }
                else
                {
                    var info = {
                        token: $scope.userAdmin.token,
                        employeeId: $scope.chooseEmployee.id,
                        employee: employee
                    };
                    $admin.updateEmployeeProfile(info, function(result)
                    {
                        if (result.status)
                        {
                            toastr.success(updateSuccess,'');
                            $scope.changeToEditProfile(false);
                            localStorageService.remove('employeeAdmin');
                            $scope.getEmployeeProfile();
                        }
                        else
                        {
                            $scope.employee = localStorageService.get('employeeAdmin');
                            toastr.error(updateError,'');
                        }
                    });
                }
            }
            else
            {
                $scope.employee = localStorageService.get('employeeAdmin');
            }
        };
        // Experience 
    var createEmployeeExp = function(newExp)
    {
        newExp.startDate = new Date(newExp.startDate2).toISOString().slice(0, 10);
        newExp.endDate = new Date(newExp.endDate2).toISOString().slice(0, 10);
        var info = {
            token: $scope.userAdmin.token,
            employeeId: $scope.chooseEmployee.id,
            exp: newExp
        };
        delete info.exp.startDate2;
        delete info.exp.endDate2;
        $admin.addEmployeeExperience(info, function(result)
        {
            if (result.status)
            {
                toastr.success(updateSuccess,'');
                $scope.cancelEditExp();
                $scope.getEmployeeExp().then(function()
                {
                    return getPositionName($scope.expList);
                });
            }
            else
            {
                toastr.error(updateError,'');
            }
        });
    };
    var updateEmployeeExp = function(exp)
    {
        exp.startDate = new Date(exp.startDate2).toISOString().slice(0, 10);
        exp.endDate = new Date(exp.endDate2).toISOString().slice(0, 10);
        var info = {
            token: $scope.userAdmin.token,
            employeeId: $scope.chooseEmployee.id,
            exp: exp
        };
        $admin.updateEmployeeExperience(info, function()
        {
            toastr.success(updateSuccess,'');
            $scope.cancelEditExp();
            $scope.getEmployeeExp().then(function()
            {
                return getPositionName($scope.expList);
            });
        });
    };
    $scope.saveEmployeeExp = function()
    {
        $scope.currExp.categoryIdList = $employee.getCategoryIdList($scope.categories.selectedCategory);
        if ($scope.positions && $scope.positions.seletedPosition.id !== '')
        {
            $scope.currExp.positionId = $scope.positions.seletedPosition.id;
        }
        if (!$scope.currExp.id)
        {
            var newExp = $scope.currExp;
            if (!newExp.description)
            {
                newExp.description = ' ';
            }
            // Get new countryId && provinceId
            newExp.countryId = $scope.countries.selectedCountry.id;
            newExp.provinceId = $scope.provinces.selectedProvince.id;
            createEmployeeExp(newExp);
        }
        else
        {
            // Get new countryId && provinceId
            $scope.currExp.countryId = $scope.countries.selectedCountry.id;
            $scope.currExp.provinceId = $scope.provinces.selectedProvince.id;
            updateEmployeeExp($scope.currExp);
        }
    };
    $scope.resetModalExp = function()
    {
        $scope.currExp = {};
        $scope.currExp.current = false;
        $scope.categories.selectedCategory = $scope.listCategories[0];
        $scope.currExp.startDate = $scope.currDate();
        $scope.currExp.endDate = $scope.currDate();
        $scope.changeToCreate('exp', true);
        $scope.setCurrCountry(location.countryId);
        $scope.getProvincesListByCountry(location.countryId);
        $scope.setCurrProvince(location.provinceId);
    };
    $scope.setModalExp = function(exp)
    {
        $scope.expEditId = exp.id;
        $scope.categories.selectedCategory = exp.categories;
        exp.startDate2 = new Date(exp.startDate);
        exp.endDate2 = new Date(exp.endDate);
        $scope.currExp = {};
        Object.assign($scope.currExp, exp);
        $scope.setCurrCountry(exp.countryId);
        $scope.getProvincesListByCountry(exp.countryId);
        $scope.setCurrProvince(exp.provinceId);
    };
    $scope.removeEmployeeExp = function(exp)
        {
            var info = {
                token: $scope.userAdmin.token,
                employeeId: $scope.chooseEmployee.id,
                expId: exp.id
            };
            $admin.removeEmployeeExperience(info, function(result)
            {
                if (result.status)
                {
                    $scope.getEmployeeExp().then(function()
                    {
                        return getPositionName($scope.expList);
                    });
                }
                else
                {
                    toastr.error(updateError,'');
                }
            });
        };
        // Education
    $scope.statusObj = {
        selectedEduStatus: null,
        availableEduStatus: [
        {
            id: 0,
            title: $scope.defaultValues.selectText
        },
        {
            id: 1,
            title: styding
        },
        {
            id: 2,
            title: stydingEnd
        }]
    };
    $scope.resetModalEdu = function()
    {
        $scope.currEdu = {};
        $scope.currEdu.status = true;
        $scope.currEdu.finishDate = $scope.currDate();
        $scope.createEdu = true;
        $scope.eduEditId = null;
        $scope.statusObj.selectedEduStatus = $scope.statusObj.availableEduStatus[0];
        $scope.eduLevelObj.selectedEduLevel = $scope.eduLevelObj.availableEduLevel[0];
    };
    $scope.setModalEdu = function(edu)
    {
        edu.finishDate2 = new Date(edu.finishDate);
        $scope.currEdu = {};
        $scope.currEdu = edu;
        $scope.eduEditId = edu.id;
        $scope.createEdu = false;
        if (edu.status === 'enrolled')
        {
            $scope.statusObj.selectedEduStatus = $scope.statusObj.availableEduStatus[1];
        }
        else
        {
            $scope.statusObj.selectedEduStatus = $scope.statusObj.availableEduStatus[2];
        }
        $scope.eduLevelObj.selectedEduLevel = $scope.eduLevelObj.availableEduLevel[edu.levelId];
    };
    var createEmployeeEdu = function(newEdu)
    {
        newEdu.finishDate = new Date(newEdu.finishDate2).toISOString().slice(0 , 10);
        var info = {
            token: $scope.userAdmin.token,
            employeeId: $scope.chooseEmployee.id,
            edu: newEdu
        };
        $admin.addEmployeeEducation(info, function(result)
        {
            if (result.status)
            {
                toastr.success(updateSuccess,'');
                $scope.createEdu = false;
                $scope.cancelEdu();
                $scope.getEmployeeEdu();
            }
            else
            {
                toastr.error(updateError,'');
            }
        });
    };
    var updateEmployeeEdu = function(currEdu)
    {
        currEdu.finishDate = new Date(currEdu.finishDate2).toISOString().slice(0 , 10);
        var info = {
            token: $scope.userAdmin.token,
            employeeId: $scope.chooseEmployee.id,
            edu: currEdu
        };
        $admin.updateEmployeeEducation(info, function(result)
        {
            if (result.status)
            {
                toastr.success(updateSuccess,'');
                $scope.cancelEdu();
                $scope.eduEditId = null;
                $scope.getEmployeeEdu();
            }
            else
            {
                toastr.error(updateError,'');
            }
        });
    };
    $scope.saveEmployeeEdu = function(currEdu)
    {
        if ($scope.statusObj.selectedEduStatus.id === 1)
        {
            currEdu.status = 'enrolled';
        }
        else if ($scope.statusObj.selectedEduStatus.id === 2)
        {
            currEdu.status = 'graduated';
        }
        else
        {
            currEdu.status = '';
        }
        currEdu.levelId = $scope.eduLevelObj.selectedEduLevel.id;

        if (!currEdu.id)
        {
            createEmployeeEdu(currEdu);
        }
        else
        {
            updateEmployeeEdu(currEdu);
        }
    };
    $scope.removeEmployeeEdu = function(currEdu)
        {
            var info = {
                token: $scope.userAdmin.token,
                employeeId: $scope.chooseEmployee.id,
                eduId: currEdu.id
            };
            $admin.removeEmployeeEducation(info, function(result)
            {
                if (result.status)
                {
                    $scope.getEmployeeEdu();
                }
                else
                {
                    toastr.error(updateError,'');
                }
            });
        };
        // Certificate
    $scope.resetModalCer = function()
    {
        $scope.createCer = true;
        $scope.currCer = {};
        $scope.currCer.issueDate = $scope.currDate();
    };
    $scope.setModalCer = function(cer)
    {
        cer.issueDate2 = new Date(cer.issueDate);
        $scope.cerEditId = cer.id;
        $scope.currCer = {};
        $scope.currCer = cer;
    };
    var createEmployeeCer = function(newCer)
    {
        newCer.issueDate = new Date(newCer.issueDate2).toISOString().slice(0, 10);
        var info = {
            token: $scope.userAdmin.token,
            employeeId: $scope.chooseEmployee.id,
            cert: newCer
        };
        $admin.addEmployeeCertificate(info, function(result)
        {
            if (result.status)
            {
                toastr.success(updateSuccess,'');
                $scope.cancelCer();
                $scope.createCer = false;
                $scope.getEmployeeCer();
            }
            else
            {
                toastr.error(updateError,'');
            }
        });
    };
    var updateEmployeeCer = function(currCer)
    {
        currCer.issueDate = new Date(currCer.issueDate2).toISOString().slice(0, 10);
        var info = {
            token: $scope.userAdmin.token,
            employeeId: $scope.chooseEmployee.id,
            cert: currCer
        };
        $admin.updateEmployeeCertificate(info, function(result)
        {
            if (result.status)
            {
                toastr.success(updateSuccess,'');
                $scope.cancelCer();
                $scope.cerEditId = null;
            }
            else
            {
                toastr.error(updateError,'');
            }
            $scope.getEmployeeCer();
        });
    };
    $scope.saveEmployeeCer = function(currCer)
    {
        if (!currCer.id)
        {
            createEmployeeCer(currCer);
        }
        else
        {
            updateEmployeeCer(currCer);
        }
    };
    $scope.removeEmployeeCer = function(currCer)
        {
            var info = {
                token: $scope.userAdmin.token,
                employeeId: $scope.chooseEmployee.id,
                certId: currCer.id
            };
            $admin.removeEmployeeCertificate(info, function(result)
            {
                if (result.status)
                {
                    $scope.getEmployeeCer();
                }
                else
                {
                    toastr.error(updateError,'');
                }
            });
        };
        // Documents
    $scope.resetModalDoc = function()
    {
        $scope.formDoc.$setPristine();
        $scope.currFile = {};
        $scope.toggleModalDoc = !$scope.toggleModalDoc;
    };
    $scope.setModalDoc = function(doc)
    {
        $scope.currFile = doc;
        $scope.currFile.file = {};
        $scope.currFile.file.name = doc.filename;
        $scope.toggleModalDoc = !$scope.toggleModalDoc;
    };
    var createEmployeeDoc = function(newFile)
    {
        if (newFile)
        {
            var filename = newFile.file.name;
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function(theFile)
            {
                var base64 = theFile.target.result;
                base64 = base64.split(',')[1];
                var info = {
                    token: $scope.userAdmin.token,
                    employeeId: $scope.chooseEmployee.id,
                    doc:
                    {
                        title: newFile.title,
                        filename: filename,
                        filedata: base64
                    }
                };
                $admin.addEmployeeDocument(info, function(result)
                {
                    if (result.status)
                    {
                        $scope.currFile.title = '';
                        $scope.currFile.file = {};
                        $scope.getEmployeeDoc();
                    }
                    else
                    {
                        toastr.error(updateError,'');
                    }
                    $scope.change = false;
                });
            });
            // Read in the file as a data URL.
            reader.readAsDataURL(newFile.file);
        }
    };
    $scope.saveEmployeeDoc = function(doc)
    {
        createEmployeeDoc(doc);
        $scope.resetModalDoc();
    };
    $scope.removeEmployeeDoc = function(doc)
        {
            var info = {
                token: $scope.userAdmin.token,
                employeeId: $scope.chooseEmployee.id,
                docId: doc.id
            };
            $admin.removeEmployeeDocument(info, function(result)
            {
                if (result.status)
                {
                    $scope.getEmployeeDoc();
                }
                else
                {
                    toastr.error(updateError,'');
                }
            });
        };
    init();
}).controller('ModalVideoProfileCtrl', function($scope, $uibModalInstance, data)
{
    $scope.videoUrl = data.videoUrl;
    $scope.cancel = function()
    {
        $uibModalInstance.dismiss('cancel');
    };
});