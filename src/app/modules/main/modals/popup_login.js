'use strict';
angular.module('mainModule').controller('LoginDialogController', function($scope, $rootScope,
  $translate, $q, $location, $employee, $common, toastr, localStorageService, _,$log, $uibModalInstance,
  EMPLOYEE_DEFAULT_VALUES,POPUP_DIALOG_RESULT,$employer,activeTab) {

  var alert = $translate.instant('toarster.alert');
  var emailNull = $translate.instant('toaster.emailNull');
  var passNull = $translate.instant('toaster.passNull');
  var loginSuccess = $translate.instant('toaster.loginSuccess');
  var loginError = $translate.instant('toaster.loginError');
  var registerError = $translate.instant('toaster.noRegister');
  var sendEmailError = $translate.instant('employee.resetPass.sendEmailError');
  var sendEmailSuccess = $translate.instant('employee.resetPass.sendEmailSuccess');
  var errTitle = $translate.instant('login.employeeErrTitle');
  var errContent = $translate.instant('login.employeeErrContent');
  $scope.activeTab = activeTab;

  $scope.alerts = [
  {type: 'sucess', msg: sendEmailSuccess}
  ];

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.closeDialog = function () {
    $uibModalInstance.close(POPUP_DIALOG_RESULT.CANCEL);
  };

  function validateUserLogin() {
    if ($scope.userLogin.email.length === 0) {
      toastr.error(  emailNull,alert);
      return false;
    }
    if ($scope.userLogin.password.length === 0) {
      toastr.error(  passNull,alert);
      return false;
    }
    return true;
  }

  $scope.doLogin = function() {
    if (validateUserLogin()) {
      $employer.loginAccount({
        email: $scope.userLogin.email,
        password: $scope.userLogin.password
      }, function(result) {
        if (result.status) {
          var user = {
            token: result.data.token
          };
          toastr.success(loginSuccess);
          localStorageService.set('userEmployer', user);
          $employer.getLicenseInfo( {
            token:user.token
          }, function(result) {
            if (result.status) {
              localStorageService.set('licenseInfo', result.data.licenseInfo);
              $employer.getCompanyEmployer(
              {
                token: user.token
              }, function(result)
              {
                if (result.status)
                {
                  localStorageService.set('companyProfile', result.data.company);
                  $uibModalInstance.close(POPUP_DIALOG_RESULT.EMPLOYER_LOGIN);

                }
              });
            } else {
              toastr.error( loginError);
            } 
          });                
        } else {
          toastr.error(loginError);
        }
      });
    }
  };

  function getEmployeeProfile(token) {
    var deferred = $q.defer(),
    employee = {};

    $employee.getEmployeeProfile({
      token: token
    }, function(result) {
      if (result.status) {
        employee = result.data.employee;
      } else {
        employee = $scope.userLogin;
        $log.info('get employee profile error');
      }

      employee.status = result.status;
      employee.token = token;
      deferred.resolve(employee);
    });

    return deferred.promise;
  }

  $scope.loginEmployee = function() {
    var info = {
      email: $scope.userLogin.email,
      password: $scope.userLogin.password
    };

    $employee.loginAccount(info, function(result) {
      if (result.status) {
        $scope.loginStatus = true;
        getEmployeeProfile(result.data.token)
        .then(function(employee) {
          if (employee.status) {
            $employee.setNameEmployee(employee);
          }
          localStorageService.set('employee', employee);
          $rootScope.$emit('changeEmployee');
          $uibModalInstance.close(POPUP_DIALOG_RESULT.EMPLOYEE_LOGIN);
        });
      } else {
        $scope.loginStatus = false;
        toastr.error(errContent, errTitle);
      }
    });
  };

  $scope.signupEmployee = function() {
    var info = {
      email: $scope.userRegister.email,
      password: $scope.userRegister.password
    };

    $employee.registerAccount(info, function(result) {
      localStorageService.remove('employee');
      if (result.status) {
        $scope.signupStatus = true;
        $scope.userLogin.email = $scope.userRegister.email;
        $scope.userLogin.password = $scope.userRegister.password;
        $scope.loginEmployee();
      } else {
        $scope.signupStatus = false;
        toastr.error(registerError, alert);
      }
    });
  };

  $scope.sendEmailReset = function() {
    var info = {
      email: $scope.reset.email
    };

    $common.sendEmailReset(info, function(result) {
      if (result.status) {
        $scope.reset.result = true;
        $scope.selectLogin();
      } else {
        toastr.error(sendEmailError, '');
      }        
    });
  };

  $scope.selectResetPassword =  function() {
    $scope.reset.result = false;
    $scope.employeeOption = {
      login:false,
      register:false,
      resetPassword:true
    };
  };

  $scope.selectRegister =  function() {
    $scope.employeeOption = {
      login:false,
      register:true,
      resetPassword:false
    };
  };

  $scope.selectLogin =  function() {
    $scope.employeeOption = {
      login:true,
      register:false,
      resetPassword:false
    };
  };

  function init() {       
    $scope.userLogin = {
      email: '',
      password: ''
    };
    $scope.userRegister =   {
      email: '',
      password: '',
      confirmPassword: ''
    };
    $scope.reset = {
      email: '',
      result: false
    };
    $scope.selectLogin();
  }

  init();
});