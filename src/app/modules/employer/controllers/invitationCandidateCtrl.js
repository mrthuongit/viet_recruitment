'use strict';
angular.module('employerModule').controller('InvitationCandidateController', function($scope, $employer,
    $common, $translate, $rootScope, toastr, localStorageService, $location, $q, _, $uibModal, $filter, $window, $log)
{
    var alert = $translate.instant('toarster.alert');
    var emailSuccess = $translate.instant('toarster.emailSuccess');
    var alertEmail = $translate.instant('alertEmail');
    var finishEmail = $translate.instant('finishEmail');
    var noEmail = $translate.instant('invitation.noemail');
    var defaultemail = $translate.instant('toarster.emailDefault');
    var employeeData = null;
    var candidateList = [];

    var getCandidate = function()
    {
        var info = {
            token: $scope.userEmployer.token,
            interviewId: $scope.interview.id
        };
        $employer.getCandidate(info, function(response)
        {
            if (response.status && response.data.result)
            {
                candidateList = response.data.candidateList;
                _.each(candidateList, function(candidate)
                {
                    candidate.select = false;
                    candidate.potential = false;
                });
                var uniqueList = _.uniq(candidateList, function(item, key, email) { 
                    return item.email;
                });
                $scope.candidateList = uniqueList;
                localStorageService.set("candidateListInvitation",$scope.candidateList);
            }
        });
    };
    var getAssignment = function(){
        var deferred = $q.defer();
        if(!localStorageService.get("totalAssignOld") 
            || (localStorageService.get("totalAssignOld") !== $scope.totalAssign)
            || localStorageService.get('changeStatusAssignment')){
                $employer.getAssignment(
                {
                    token: $scope.userEmployer.token,
                    offset: 0,
                    length: $scope.totalAssign,
                    count: false,
                    overview: true
                }, function(result)
                {
                    localStorageService.set("assignmentList", result.data.assignmentList);
                    localStorageService.set("totalAssignOld", $scope.totalAssign);
                    localStorageService.set('changeStatusAssignment', false)
                    deferred.resolve(result);
                });
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    }

    function getAssignmentPublic() {
        var assignmentList = localStorageService.get("assignmentList");

        $scope.assignmentPublishedList = _.filter(assignmentList, function(assignment) {
            return assignment.status == 'published';
        });
    };

    function _validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    $scope.getEmployeeByEmail = function()
    {
        employeeData = null;
        $employer.getEmployeeByEmail(
        {
            email: $scope.inputEmail,
            token: $scope.userEmployer.token
        }, function(result)
        {
            if (result.status && result.data.result)
            {
                employeeData = result.data.employeeProfile[0];
                var emprofile = employeeData.profile;
                if (emprofile.name.indexOf('-') !== -1)
                {
                    var firstname = emprofile.name.split('-')[0];
                    var lastname = emprofile.name.split('-')[1];
                    $scope.inputName = firstname + ' ' + lastname;
                }
                else
                {
                    $scope.inputName = emprofile.name;
                }
                employeeData.name = $scope.inputName;
            }
        });
    };
    $scope.chooseAssignment = function() {
        $scope.interviewList = [];
        $scope.chooseInterview = {};
        $scope.inviteList = [];
        $scope.candidateList = [];
        $scope.potential = false;
        $scope.interview = {};

        if($scope.chooseAss){
            var assign = JSON.parse($scope.chooseAss);
            var info = {
                token: $scope.userEmployer.token,
                assignmentId: assign.id
            };

            $employer.getInterview(info, function(result)
            {
                if (result.status && result.data.result)
                {
                    $scope.interviewList = _.filter(result.data.interviewList,function(interview) {
                        return interview.status === 'published';
                    });
                }
            });
        }
    };
        
    $scope.changeInterview = function()
    {
        $scope.inviteList = [];
        $scope.candidateList = [];
        $scope.potential = false;
        $scope.interview = JSON.parse($scope.chooseInterview);
        getCandidate();

    };

    var getLicense = function()
    {
        var deferred = $q.defer();
        $employer.getLicenseInfo(
        {
            token: $scope.userEmployer.token
        }, function(result)
        {
            if (result.status)
            {
                $scope.licenseInfo = result.data.licenseInfo;
                $scope.maxEmail = $scope.licenseInfo.license.email;
                $scope.useEmail = $scope.licenseInfo.email;
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    };

    $scope.sendEmail = function()
    {
        localStorageService.set('interview', $scope.interview);
        var inviteList = _.filter($scope.candidateList, function(candidate)
        {
            return candidate.select;
        });
        if (inviteList.length > 0)
        {
            getLicense().then(function()
            {
                var numberEmail = $scope.maxEmail - inviteList.length - $scope.useEmail;
                if(numberEmail >= 0){
                    var info = {
                        token: $scope.userEmployer.token,
                        candidateList: inviteList,
                        subject: $scope.subject,
                        interviewId: $scope.interview.id
                    };
                    $employer.sendInterviewInvitation(info, function(result)
                    {
                        if (result.status && result.data.result)
                        {
                            getCandidate();
                            toastr.success( emailSuccess,alert);
                        }
                        else
                        {
                            toastr.error(alertEmail);
                        }
                    });
                } else {
                    toastr.warning(finishEmail);
                }
            }).catch(function(e){
                console.log(e);
            });
        }
        else
        {
            toastr.warning(noEmail,alert);
        }
    };
    $scope.addCandidate = function(name, email)
    {
        if(_validateEmail(email)){
            if (!_.contains(_.pluck($scope.candidateList, "email"), email))
            {
                var candidate = {
                    select: true,
                    potential: false,
                    shortlist: false,
                    invited: false,
                    name: name,
                    email: email
                };
                if (!candidate.name)
                {
                    candidate.name = candidate.email;
                }
                if (employeeData)
                {
                    candidate.certList = employeeData.certList;
                    candidate.docList = employeeData.docList;
                    candidate.eduList = employeeData.eduList;
                    candidate.expList = employeeData.expList;
                    candidate.profile = employeeData.profile;
                    candidate.viewed = employeeData.viewed;
                    candidate.employeeId = employeeData.employeeId;
                }
                $scope.candidateList.push(candidate);
                $scope.inputName = "";
                $scope.inputEmail = "";
                return candidate;
            }
        } else {
            toastr.warning(defaultemail);
        }
        return null;
    };
    
    $scope.addCandidateWithSchedule = function(name, email)
    {
        var candidate = $scope.addCandidate (name,email);
        if (candidate){
            candidate.schedule =   $filter('date')($scope.schedule, $scope.dateFormat);
        }
        return candidate;
    };

    var init = function()
    {
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        $scope.dateFormat ="dd MMM yyyy HH:mm";
        $scope.schedule  = new Date();
        $scope.totalAssign = localStorageService.get("totalAssign");

        getAssignment().then(function()
        {
            return getAssignmentPublic();
        }).catch(function(e){
            console.log(e);
        });
    };

    init();

    $scope.importCandidate = function (workbook) {
        for (var sheetName in workbook.Sheets) {
            var jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if (jsonData.length === 0) {continue};
            // Get keys of object to use (case insensitive, name)
            var keys = _.keys(jsonData[0]);
            var list =  _.uniq(jsonData);

            for(var i=0; i< list.length; i++){
                $scope.addCandidate(list[i][keys[0]],list[i][keys[1]]);
                $scope.$apply();
            }
        }
    };

    $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
    };

    $scope.openModalCvInvitation = function (size, candidate) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalCvInvitationCtrl.html',
            controller: 'ModalCvInvitationController',
            size: size,
            resolve: {
                    data: function () {
                        return {
                                candidate: candidate,
                            };
                    }
                }
        });

        modalInstance.result.then(function (selectedItem) {

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });

    };
});