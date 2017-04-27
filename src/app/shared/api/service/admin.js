"use strict";
angular.module('api').factory('$admin', function(http)
{
    return {
        getQuestionCategory: function(info, callback)
        {
            var path = "/admin/question/category";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        getQuestion: function(info, callback)
        {
            var path = "/admin/question";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        createCompany: function(info, callback)
        {
            var path = "/admin/company";
            var param = {
                token: info.token,
                company: angular.toJson(info.company)
            };
            http.postRequest(path, param, callback);
        },
        updateCompany: function(info, callback)
        {
            var path = "/admin/company";
            var param = {
                token: info.token,
                company: angular.toJson(info.company)
            };
            http.putRequest(path, param, callback);
        },
        getCompanyList: function(info, callback)
        {
            var path = "/admin/company";
            var param = {
                token: info.token,
                offset: info.offset,
                length: info.length,
                count: info.count
            };
            
            http.getRequest(path, param, callback);
        },
        getLicense: function(info, callback)
        {
            var path = "/admin/license";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        updateLicense: function(info, callback)
        {
            var path = "/admin/license";
            var param = {
                token: info.token,
                license: angular.toJson(info.license)
            };
            http.putRequest(path, param, callback);
        },
        getLicenseInfo: function(info, callback)
        {
            var path = "/admin/company/license";
            var param = {
                token: info.token,
                companyId: info.companyId
            };
            http.getRequest(path, param, callback);
        },
        activateLicense: function(info, callback)
        {
            var path = "/admin/company/license";
            var param = {
                token: info.token,
                companyId: info.companyId,
                action: 'activate'
            };
            http.postRequest(path, param, callback);
        },
        deactivateLicense: function(info, callback)
        {
            var path = "/admin/company/license";
            var param = {
                token: info.token,
                companyId: info.companyId,
                action: 'deactivate'
            };
            http.postRequest(path, param, callback);
        },
        renewLicense: function(info, callback)
        {
            var path = "/admin/company/renewlicense";
            var param = {
                token: info.token,
                companyId: info.companyId,
                licenseId: info.licenseId
            };
            http.putRequest(path, param, callback);
        },
        loginAccount: function(info, callback)
        {
            var path = "/admin/account/login";
            var param = {
                login: info.login,
                password: info.password
            };
            http.postRequest(path, param, callback);
        },
        logoutAccount: function(info, callback)
        {
            var path = "/admin/account/logout";
            var param = {
                token: info.token
            };
            http.postRequest(path, param, callback);
        },
        getCompanyUser: function(info, callback)
        {
            var path = "/admin/company/user";
            var param = {
                token: info.token,
                companyId: info.companyId
            };
            http.getRequest(path, param, callback);
        },
        createCompanyUser: function(info, callback)
        {
            var path = "/admin/company/user";
            var param = {
                token: info.token,
                companyId: info.companyId,
                user: angular.toJson(info.user)
            };
            http.postRequest(path, param, callback);
        },
        updateCompanyUser: function(info, callback)
        {
            var path = "/admin/company/user";
            var param = {
                token: info.token,
                user: angular.toJson(info.user)
            };
            http.putRequest(path, param, callback);
        },
        deleteCompanyUser: function(info, callback)
        {
            var path = "/admin/company/user";
            var param = {
                token: info.token,
                userId: info.userId
            };
            http.deleteRequest(path, param, callback);
        },
        getAssignment: function(info, callback)
        {
            var path = "/admin/assignment";
            var param = {
                token: info.token,
                offset: info.offset,
                length: info.length,
                count: info.count
            };
            http.getRequest(path, param, callback);
        },
        createAssignment: function(info, callback)
        {
            var path = "/admin/assignment";
            var param = {
                token: info.token,
                companyId: info.companyId,
                assignment: angular.toJson(info.assignment)
            };
            http.postRequest(path, param, callback);
        },
        updateAssignment: function(info, callback)
        {
            var path = "/admin/assignment";
            var param = {
                token: info.token,
                assignment: angular.toJson(info.assignment)
            };
            http.putRequest(path, param, callback);
        },
        approveAssignment: function(info, callback)
        {
            var path = "/admin/assignment/approve";
            var param = {
                token: info.token,
                assignmentId: info.assignmentId
            };
            http.postRequest(path, param, callback);
        },
        createLicense: function(info, callback)
        {
            var path = "/admin/license";
            var param = {
                token: info.token,
                license: angular.toJson(info.license)
            };
            http.postRequest(path, param, callback);
        },
        getEmployeeList: function(info, callback)
        {
            var path = "/admin/employee";
            var param = {
                token: info.token,
                offset: info.offset,
                length: info.length,
                count: info.count
            };

            http.getRequest(path, param, callback);
        },
        createEmployee: function(info, callback)
        {
            var path = "/admin/employee";
            var param = {
                token: info.token,
                email: info.email,
                password: info.password
            };
            http.postRequest(path, param, callback);
        },
        getEmployeeProfile: function(info, callback)
        {
            var path = "/admin/employee/profile";
            var param = {
                token: info.token,
                employeeId: info.employeeId
            };
            http.getRequest(path, param, callback);
        },
        updateEmployeeProfile: function(info, callback)
        {
            var path = "/admin/employee/profile";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                employee: angular.toJson(info.employee)
            };
            http.putRequest(path, param, callback);
        },
        getEmployeeExperience: function(info, callback)
        {
            var path = "/admin/employee/profile/experience";
            var param = {
                token: info.token,
                employeeId: info.employeeId
            };
            http.getRequest(path, param, callback);
        },
        addEmployeeExperience: function(info, callback)
        {
            var path = "/admin/employee/profile/experience";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                exp: angular.toJson(info.exp)
            };
            http.postRequest(path, param, callback);
        },
        updateEmployeeExperience: function(info, callback)
        {
            var path = "/admin/employee/profile/experience";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                exp: angular.toJson(info.exp)
            };
            http.putRequest(path, param, callback);
        },
        removeEmployeeExperience: function(info, callback)
        {
            var path = "/admin/employee/profile/experience";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                expId: info.expId
            };
            http.deleteRequest(path, param, callback);
        },
        // Education's Apis
        getEmployeeEducation: function(info, callback)
        {
            var path = "/admin/employee/profile/education";
            var param = {
                token: info.token,
                employeeId: info.employeeId
            };
            http.getRequest(path, param, callback);
        },
        addEmployeeEducation: function(info, callback)
        {
            var path = "/admin/employee/profile/education";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                edu: angular.toJson(info.edu)
            };
            http.postRequest(path, param, callback);
        },
        updateEmployeeEducation: function(info, callback)
        {
            var path = "/admin/employee/profile/education";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                edu: angular.toJson(info.edu)
            };
            http.putRequest(path, param, callback);
        },
        removeEmployeeEducation: function(info, callback)
        {
            var path = "/admin/employee/profile/education";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                eduId: info.eduId
            };
            http.deleteRequest(path, param, callback);
        },
        getEmployeeCertificate: function(info, callback)
        {
            var path = "/admin/employee/profile/certificate";
            var param = {
                token: info.token,
                employeeId: info.employeeId
            };
            http.getRequest(path, param, callback);
        },
        addEmployeeCertificate: function(info, callback)
        {
            var path = "/admin/employee/profile/certificate";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                cert: angular.toJson(info.cert)
            };
            http.postRequest(path, param, callback);
        },
        updateEmployeeCertificate: function(info, callback)
        {
            var path = "/admin/employee/profile/certificate";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                cert: angular.toJson(info.cert)
            };
            http.putRequest(path, param, callback);
        },
        removeEmployeeCertificate: function(info, callback)
        {
            var path = "/admin/employee/profile/certificate";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                certId: info.certId
            };
            http.deleteRequest(path, param, callback);
        },
        // Document's Apis
        getEmployeeDocument: function(info, callback)
        {
            var path = "/admin/employee/profile/document";
            var param = {
                token: info.token,
                employeeId: info.employeeId
            };
            http.getRequest(path, param, callback);
        },
        addEmployeeDocument: function(info, callback)
        {
            var path = "/admin/employee/profile/document";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                doc: angular.toJson(info.doc)
            };
            http.postRequest(path, param, callback);
        },
        updateEmployeeDocument: function(info, callback)
        {
            var path = "/admin/employee/profile/document";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                doc: angular.toJson(info.doc)
            };
            http.putRequest(path, param, callback);
        },
        removeEmployeeDocument: function(info, callback)
        {
            var path = "/admin/employee/profile/document";
            var param = {
                token: info.token,
                employeeId: info.employeeId,
                docId: info.docId
            };
            http.deleteRequest(path, param, callback);
        },
        getLicenseCategoryList: function(info, callback)
        {
            var path = "/admin/license/category";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        createLicenseCategory: function(info, callback)
        {
            var path = "/admin/license/category";
            var param = {
                token: info.token,
                licenseCategory: angular.toJson(info.licenseCategory)
            };
            http.postRequest(path, param, callback);
        }
    };
});