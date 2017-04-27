'use strict';
angular.module('employerModule').config(function ($routeProvider, $sceDelegateProvider, localStorageServiceProvider)
{
    $routeProvider
    .when('/employer', {
        templateUrl: 'app/modules/employer/views/assignmentListView.html',
        controller: 'AssignmentListController'
    })
    .when('/employer/search_candidate', {
        templateUrl: 'app/modules/employer/views/candidate_list.html',
        controller: 'CandidateListController'
    })
    .when('/employer/candidate_detail/', {
        templateUrl: 'app/modules/employer/views/candidate_detail.html',
        controller: 'CandidateDetailController'
    })
    .when('/employer/candidate_apply_list', {
        templateUrl: 'app/modules/employer/views/candidateApplyListView.html',
        controller: 'CandidateApplyListController'
    })
    .when('/employer/assignment', {
        templateUrl: 'app/modules/employer/views/assignmentDetailView.html',
        controller: 'AssignmentController'
    })
    .when('/employer/interview_list', {
        templateUrl: 'app/modules/employer/views/assignmentInterviewListView.html',
        controller: 'InterviewListController'
    })
    .when('/employer/conference_list', {
        templateUrl: 'app/modules/employer/views/conference_list.html',
        controller: 'ConferenceListController'
    })
    .when('/employer/video/interview', {
        templateUrl: 'app/modules/employer/wizards/video/video_interview.html',
        controller: 'VideoInterviewController'
    })
    .when('/employer/video/setting_interview', {
        templateUrl: 'app/modules/employer/wizards/video/setting_video_interview.html',
        controller: 'SettingVideoInterviewController'
    })
    .when('/employer/video/question_interview', {
        templateUrl: 'app/modules/employer/wizards/video/question_video_interview.html',
        controller: 'QuestionVideoInterviewController'
    })
    .when('/employer/video/review_confirm_interview', {
        templateUrl: 'app/modules/employer/wizards/video/review_confirm_video_interview.html',
        controller: 'ReviewConfirmVideoInterviewController'
    })
    .when('/employer/conference/interview', {
        templateUrl: 'app/modules/employer/wizards/conference/conference_interview.html',
        controller: 'ConferenceInterviewController'
    })
    .when('/employer/conference/setting_interview', {
        templateUrl: 'app/modules/employer/wizards/conference/setting_conference_interview.html',
        controller: 'SettingConferenceInterviewController'
    })
    .when('/employer/conference/question_interview', {
        templateUrl: 'app/modules/employer/wizards/conference/question_conference_interview.html',
        controller: 'QuestionConferenceInterviewController'
    })
    .when('/employer/conference/review_confirm_interview', {
        templateUrl: 'app/modules/employer/wizards/conference/review_confirm_conference_interview.html',
        controller: 'ReviewConfirmConferenceInterviewController'
    })
    .when('/employer/conference/interview', {
        templateUrl: 'app/modules/employer/wizards/conference/conference_interview.html',
        controller: 'ConferenceInterviewController'
    })
    .when('/employer/conference/setting_interview', {
        templateUrl: 'app/modules/employer/wizards/conference/setting_conference_interview.html',
        controller: 'SettingConferenceInterviewController'
    })
    .when('/employer/conference/question_interview', {
        templateUrl: 'app/modules/employer/wizards/conference/question_conference_interview.html',
        controller: 'QuestionConferenceInterviewController'
    })
    .when('/employer/quiz/review_confirm_interview', {
    templateUrl: 'app/modules/employer/wizards/quiz/review_confirm_quiz_interview.html',
    controller: 'ReviewConfirmQuizInterviewController'
    })
    .when('/employer/quiz/interview', {
        templateUrl: 'app/modules/employer/wizards/quiz/quiz_interview.html',
        controller: 'QuizInterviewController'
    })
    .when('/employer/quiz/setting_interview', {
        templateUrl: 'app/modules/employer/wizards/quiz/setting_quiz_interview.html',
        controller: 'SettingQuizInterviewController'
    })
    .when('/employer/quiz/question_interview', {
        templateUrl: 'app/modules/employer/wizards/quiz/question_quiz_interview.html',
        controller: 'QuestionQuizInterviewController'
    })
    .when('/employer/invitation_candidate', {
        templateUrl: 'app/modules/employer/views/invitationCandidateView.html',
        controller: 'InvitationCandidateController'
    })
    .when('/employer/assessment', {
        templateUrl: 'app/modules/employer/views/assessmentListView.html',
        controller: 'AssessmentController'
    })
    .when('/employer/report/assessment/:id', {
        templateUrl: 'app/modules/employer/views/report_assessment.html',
        controller: 'AssessmentReportCtrl'
    })
    .when('/employer/report/test/:id', {
        templateUrl: 'app/modules/employer/views/report_test.html',
        controller: 'TestReportCtrl'
    })
    .when('/employer/profile', {
        templateUrl: 'app/modules/employer/views/profile.html',
        controller: 'CompanyProfileController'
    });
localStorageServiceProvider.setPrefix('employerApp');
$sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self', // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://vietinterview.com/**',
    'https://192.168.1.200/**'
]);
});