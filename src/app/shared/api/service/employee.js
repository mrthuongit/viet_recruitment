"use strict";
angular.module('api').factory('$employee', function(http, _)
{
    return {
        /* Api services */
        registerAccount: function(info, callback)
        {
            var path = "/employee/account/register";
            var param = {
                email: info.email,
                password: info.password
            };
            http.postRequest(path, param, callback);
        },
        loginAccount: function(info, callback)
        {
            var path = "/employee/account/login";
            var param = {
                email: info.email,
                password: info.password
            };
            http.postRequest(path, param, callback);
        },
        logout: function(info, callback)
        {
            var path = "/employee/account/logout";
            var param = {
                token: info.token
            };
            http.postRequest(path, param, callback);
        },
        // Employee's Apis Profile
        getEmployeeProfile: function(info, callback)
        {
            var path = "/employee/profile";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        updateEmployeeProfile: function(info, callback)
        {
            var path = "/employee/profile";
            var param = {
                token: info.token,
                employee: angular.toJson(info.employee)
            };
            http.putRequest(path, param, callback);
        },
        getEmployeeExperience: function(info, callback)
        {
            var path = "/employee/profile/experience";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        addEmployeeExperience: function(info, callback)
        {
            var path = "/employee/profile/experience";
            var param = {
                token: info.token,
                exp: angular.toJson(info.exp)
            };
            http.postRequest(path, param, callback);
        },
        updateEmployeeExperience: function(info, callback)
        {
            var path = "/employee/profile/experience";
            var param = {
                token: info.token,
                exp: angular.toJson(info.exp)
            };
            http.putRequest(path, param, callback);
        },
        removeEmployeeExperience: function(info, callback)
        {
            var path = "/employee/profile/experience";
            var param = {
                token: info.token,
                expId: info.expId
            };
            http.deleteRequest(path, param, callback);
        },
        // Education's Apis
        getEmployeeEducation: function(info, callback)
        {
            var path = "/employee/profile/education";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        addEmployeeEducation: function(info, callback)
        {
            var path = "/employee/profile/education";
            var param = {
                token: info.token,
                edu: angular.toJson(info.edu)
            };
            http.postRequest(path, param, callback);
        },
        updateEmployeeEducation: function(info, callback)
        {
            var path = "/employee/profile/education";
            var param = {
                token: info.token,
                edu: angular.toJson(info.edu)
            };
            http.putRequest(path, param, callback);
        },
        removeEmployeeEducation: function(info, callback)
        {
            var path = "/employee/profile/education";
            var param = {
                token: info.token,
                eduId: info.eduId
            };
            http.deleteRequest(path, param, callback);
        },
        getEmployeeCertificate: function(info, callback)
        {
            var path = "/employee/profile/certificate";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        addEmployeeCertificate: function(info, callback)
        {
            var path = "/employee/profile/certificate";
            var param = {
                token: info.token,
                cert: angular.toJson(info.cert)
            };
            http.postRequest(path, param, callback);
        },
        updateEmployeeCertificate: function(info, callback)
        {
            var path = "/employee/profile/certificate";
            var param = {
                token: info.token,
                cert: angular.toJson(info.cert)
            };
            http.putRequest(path, param, callback);
        },
        removeEmployeeCertificate: function(info, callback)
        {
            var path = "/employee/profile/certificate";
            var param = {
                token: info.token,
                certId: info.certId
            };
            http.deleteRequest(path, param, callback);
        },
        // Document's Apis
        getEmployeeDocument: function(info, callback)
        {
            var path = "/employee/profile/document";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        addEmployeeDocument: function(info, callback)
        {
            var path = "/employee/profile/document";
            var param = {
                token: info.token,
                doc: angular.toJson(info.doc)
            };
            http.postRequest(path, param, callback);
        },
        updateEmployeeDocument: function(info, callback)
        {
            var path = "/employee/profile/document";
            var param = {
                token: info.token,
                doc: angular.toJson(info.doc)
            };
            http.putRequest(path, param, callback);
        },
        removeEmployeeDocument: function(info, callback)
        {
            var path = "/employee/profile/document";
            var param = {
                token: info.token,
                docId: info.docId
            };
            http.deleteRequest(path, param, callback);
        },
        getEmployeeApplicationHistory: function(info, callback)
        {
            var path = "/employee/profile/application";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        applyJob: function(info, callback)
        {
            var path = "/employee/apply";
            var param = {
                token: info.token,
                assignmentId: info.assignmentId,
                letter: info.letter
            };
            http.postRequest(path, param, callback);
        },       
        setNameEmployee: function(employee)
        {
            var emailRegex =
                /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
            if (employee.name && !employee.name.match(emailRegex) &&
                employee.name.indexOf('-') !== -1)
            {
                var fullName = employee.name.split('-');
                employee.lastName = fullName[0];
                employee.firstName = fullName[1];
            }
        },
        getCategoryIdList: function(categoryList)
        {
            var categoryIdList = [];
            categoryList.map(function(category)
            {
                categoryIdList.push(category.id);
            });
            return categoryIdList;
        },
        getCategories: function(categoryIdList, categoryList)
        {
            var categories = [];
            if (angular.isArray(categoryIdList) && angular.isArray(
                    categoryList))
            {
                categories = categoryIdList.map(function(
                    categoryId)
                {
                    var category = _.find(categoryList,
                        function(category)
                        {
                            return categoryId === category.id;
                        });
                    if (category)
                    {
                        return category;
                    }
                    else
                    {
                        return {};
                    }
                });
            }
            return categories;
        },
        getProvincesListByCountry: function(countryId, listProvince) {
            var provinces = listProvince;

            if (countryId) {
                provinces = _.filter(listProvince, function(
                    province) {

                    return (countryId === province.countryId);
                });
            }

            return provinces;
        },
        setSearchOptions: function(searchObj) {
            var info = {
                keyword: '',
                option: {
                    categoryId: '',
                    positionId: '',
                    countryId: '',
                    provinceId: ''
                },
                offset: searchObj.offset,
                length: searchObj.length,
                count: searchObj.count
            };
            if (searchObj) {
                if (searchObj.keyword) {
                    info.keyword = searchObj.keyword;
                } 

                if (searchObj.option) {
                    if (searchObj.option.categoryId) {
                        info.option.categoryId = Number(searchObj.option.categoryId);
                    }               

                    if (searchObj.option.positionId) {
                        info.option.positionId = Number(searchObj.option.positionId); 
                    }                

                    info.option.countryId = searchObj.option.countryId;
                    info.option.provinceId = searchObj.option.provinceId;        
                } 
            }
            return info;
        }
    };
});