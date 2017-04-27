'use strict';
angular.module('adminModule').controller('AdminQuestionController', function($scope, $admin, _, localStorageService)
{
    var userAdmin = localStorageService.get('userAdmin');
    $scope.questionList = [];
    $admin.getQuestionCategory(
    {
        token: userAdmin.token
    }, function(resultCategory)
    {
        if (resultCategory.status)
        {
            var categoryList = resultCategory.data.categoryList;
            $admin.getQuestion(
            {
                token: userAdmin.token
            }, function(result)
            {
                if (result.status)
                {
                    $scope.questionList = result.data.questionList;
                    $scope.questionList.forEach(function(question)
                    {
                        var existCate = _.find(categoryList, function(cate)
                        {
                            return cate.id === question.categoryId;
                        });
                        if (existCate)
                        {
                            question.nameCategory = existCate.title;
                        }
                    });
                    $scope.totalItems = $scope.questionList.length;
                    $scope.currentPage = 1;
                    $scope.itemsPerPage = 10;
                    $scope.maxSize = 10; //Number of pager buttons to show
                }
            });
        }
    });
});