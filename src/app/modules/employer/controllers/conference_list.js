'use strict';
angular.module('employerModule').controller('ConferenceListController', function($scope, $employer,
    $translate, $rootScope, localStorageService, $location, $window, $q, $log)
{
    var ten     = $translate.instant('tenItemsPerPage'),
        twenty  = $translate.instant('twentyItemsPerPage'),
        thirty  = $translate.instant('thirtyItemsPerPage'),
        fourty  = $translate.instant('fourtyItemsPerPage'),
        fifty   = $translate.instant('fiftyItemsPerPage');

    $scope.pageOptions = {
        availableOptions: [
          {value: 10, name: ten},
          {value: 20, name: twenty},
          {value: 30, name: thirty},
          {value: 40, name: fourty},
          {value: 50, name: fifty}
        ],
        selectedOption: {value: 10, name: ten} 
    };

    // UI logic
    $scope.changeItemsPerPage = function() {
        $scope.itemsPerPage = $scope.pageOptions.selectedOption.value;
        $scope.changePage($scope.currPage);
    }

    $scope.changePage = function(page) {
        $scope.currPage = page;

        var info = {
            token: $scope.userEmployer.token,
            offset: ($scope.currPage - 1) * $scope.itemsPerPage,
            length: $scope.itemsPerPage,
            count: false
        };

        getConference(info)
            .then(function(conferenceList) {
                $scope.conferenceList = conferenceList;
            }).catch(function(e) {
                $log.error(e);
            });
    };

    // Bussiness logic
    $scope.launchConference = function(conference)
    {
        conference.memberList.forEach(function(member)
        {
            if (member.role === 'moderator')
            {
                if (conference.status === 'pending')
                {
                    var url1 = "/#/conference?meetingId=" + conference.meetingId + "&memberId=" + member.memberId + "&translate=" + conference.language;
                    $window.open(url1,'_blank');
                    
                    $employer.openMeeting(
                    {
                        token: $scope.userEmployer.token,
                        conferenceId: conference.id
                    }, function()
                    {
                        
                    });
                }
                else
                {
                    var url = "/#/conference?meetingId=" + conference.meetingId + "&memberId=" + member.memberId + "&translate=" + conference.language;
                    $window.open(url,'_blank');
                }
            }
        });
    };

    function  getConference(info) {
        var defered = $q.defer();

        $employer.getConference(info, function(result) {
            if (result.status && result.data.result) {
                defered .resolve(result.data.conferenceList);
            } else {
                defered.reject('err get conference');
            }
        });

        return defered.promise;
    }

    var init = function()
    {
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer) {
            $location.path("/");
            return;
        }
        
        $scope.listConference = [];
        $scope.currPage = 1;
        $scope.itemsPerPage = 10;
        $scope.maxSize = 4;

        var info = {
            token: $scope.userEmployer.token,
            offset: ($scope.currPage - 1) * $scope.itemsPerPage,
            length: $scope.itemsPerPage,
            count: false
        };

        getConference(info)
            .then(function(conferenceList) {
                $scope.conferenceList = conferenceList;
                info.count = true;
                return getConference(info);    
            }).then(function(totalConferences) {
                $scope.totalConferences = totalConferences;    
            }).catch(function(e) {
                $log.error(e);
            });
    };
    init();
});