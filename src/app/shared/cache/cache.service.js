'use strict';
angular.module('cache').factory('$cache', function($common,localStorageService,$log)
{
    return {
        getJobCategory: function(info, callback)
        {
            var resName = 'jobCat_'+info.lang;
            if (!localStorageService.get(resName)) {
                $common.getJobCategory(info, function(result) {
                    if (result.status ) {
                        localStorageService.set(resName,result.data.categoryList);
                    } else {
                        $log.error('Khong lay duoc danh sach category');
                    }
                        
                    callback(result);
                });
            } else {
                var catList = localStorageService.get(resName);
                callback({status:true, data:{result:true,categoryList:catList}});
            }
        },
        getJobPosition: function(info, callback)
        {
            var resName = 'jobPos_'+info.lang;
            if (!localStorageService.get(resName)) {
                $common.getJobPosition(info, function(result) {
                    if (result.status ) {
                        localStorageService.set(resName,result.data.positionList);
                    }else {
                        $log.error('Khong lay duoc danh sach position');
                    }
                    callback(result);
                });
            } else {
                var posList = localStorageService.get(resName);
                callback({status:true, data:{result:true,positionList:posList}});
            }
        },
        getJobLocation: function(info, callback)
        {
            var resName = 'jobLoc_'+info.lang;
            if (!localStorageService.get(resName)) {
                $common.getJobLocation(info, function(result) {
                    if (result.status ) {
                        localStorageService.set(resName,{'countryList':result.data.countryList,'provinceList':result.data.provinceList});
                    }else {
                        $log.error('Khong lay duoc danh sach location');
                    }
                    callback(result);
                });
            } else {
                var locList = localStorageService.get(resName);
                callback({status:true, data:{result:true,provinceList:locList.provinceList,countryList:locList.countryList}});
            }
        },
        getEducationLevel: function(info, callback)
        {
            var resName = 'eduLevel_'+info.lang;
            if (!localStorageService.get(resName)) {
                $common.getEducationLevel(info, function(result) {
                    if (result.status ) {
                        localStorageService.set(resName,result.data.levelList);
                    }else {
                        $log.error('Khong lay duoc danh sach eduLevel');
                    }
                    callback(result);
                });
            } else {
                var levelList = localStorageService.get(resName);
                callback({status:true, data:{result:true,levelList:levelList}});
            }
        },
        getQuestionCategory: function(info, callback)
        {
            var resName = 'quesCat_'+info.lang;
            if (!localStorageService.get(resName)) {
                $common.getQuestionCategory(info, function(result) {
                    if (result.status ) {
                        localStorageService.set(resName,result.data.categoryList);
                    }else {
                        $log.error('Khong lay duoc danh sach question category');
                    }
                    callback(result);
                });
            } else {
                var categoryList = localStorageService.get(resName);
                callback({status:true, data:{result:true,categoryList:categoryList}});
            }
        },
        getQuestion: function(info, callback)
        {
            var resName = 'ques_'+info.lang;
            if (!localStorageService.get(resName)) {
                $common.getQuestion(info, function(result) {
                    if (result.status ) {
                        localStorageService.set(resName,result.data.questionList);
                    }else {
                        $log.error('Khong lay duoc danh sach question');
                    }
                    callback(result);
                });
            } else {
                var questionList = localStorageService.get(resName);
                callback({status:true, data:{result:true,questionList:questionList}});
            }
        },
        getAssessment: function(info, callback)
        {
            var resName = 'assessment_'+info.lang;
            if (!localStorageService.get(resName)) {
                $common.getAssessment(info, function(result) {
                    if (result.status ) {
                        localStorageService.set(resName,result.data.assessment);
                    } else {
                        $log.error('Khong lay duoc assessment');
                    }
                    callback(result);
                });
            } else {
                var assessment = localStorageService.get(resName);
                callback({status:true, data:{result:true,assessment:assessment}});
            }
        }
    };
});