 'use strict';
 angular.module('mainModule')
    .constant('POPUP_DIALOG_RESULT', {
                CANCEL:0,
                EMPLOYEE_LOGIN:1,
                EMPLOYER_LOGIN:2
            })
    .constant('EMPLOYEE_DEFAULT_VALUES', {
                countryId: 243, // Viet Nam
                provinceId: 60, // Ha Noi
                COUNTRY: 'Vietnam',
                PROVINCE:'Hà Nội'
            });
 