"use strict";
angular.module('app')

.factory('$profile', function($translate) {

	function calcNumberExp(candidate) { 
		var year = $translate.instant('year'),
			month = $translate.instant('month'),
            numberExp = '';

        if(candidate.expList && candidate.expList.length > 0) {
            var second = 0;
            var somonth = "";
            var soyear = "";

            for(var i=0; i<candidate.expList.length; i++) {
                second += new Date(candidate.expList[i].endDate) - new Date(candidate.expList[i].startDate) + 8640000;
            }
            var numberday = second/1000/60/60/24;
            var numberyear = (numberday - (numberday%360)) / 360;
            var numbermonth = (numberday%360 - (numberday%360%30))/30;
            if(numbermonth > 0){
                somonth = numbermonth + " " + month;
            }
            if(numberyear > 0){
                soyear = numberyear + " " + year;
                somonth = "";
            }

            numberExp = soyear + " " + somonth;       
        }   

        return numberExp;       
    };	

    return {
    	calcNumberExp: calcNumberExp
    }
})