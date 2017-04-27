'use strict';
angular.module('employerModule').controller('CompanyProfileController', function($scope, $employer,
    $translate, $rootScope, toastr, localStorageService, $location, Upload, $common, $utilities, $q)
{
    var alert = $translate.instant('toarster.alert');
    var updateSuccess = $translate.instant('toarster.updateSuccess');
    var updateError = $translate.instant('toarster.updateError');
    var saveImage = function(defer)
    {
        if ($scope.image.src.size)
        {
            Upload.base64DataUrl($scope.image.src).then(function(urls)
            {
                urls = urls.split(',')[1];
                var blob = $utilities.b64toBlob(urls,'image/png');
                var img = new Image();
                img.src = URL.createObjectURL(blob);
                img.onload = function()
                {
                    urls = $utilities.resizeImg(img, 120, 120, 0);
                    urls = urls.split(',')[1];
                    $scope.company.image = urls;
                    defer.resolve();
                };
            });
        }
        else
        {
            defer.resolve();
        }
    };

    var uploadVideo = function(defer)
    {
        if ($scope.profile.fileUpload)
        {
            $common.uploadVideo(
            {
                file: $scope.profile.fileUpload
            }, function(result)
            {
                if (result.status && result.data.result)
                {
                    $scope.company.videoUrl = result.data.url;
                }
                defer.resolve();
            });
        }
        else
        {
            defer.resolve();
        }
    };
    
    $scope.doSave = function()
    {
        $scope.company.phone = $scope.company.phone.toString();
        $scope.company.vat = $scope.company.vat.toString();

        var info = {
            token: $scope.userEmployer.token,
            company: $scope.company
        };
        var deferArray = [$q.defer(), $q.defer()];
        var loopPromises = [];
        angular.forEach(deferArray, function(deferItem)
        {
            loopPromises.push(deferItem.promise);
        });
        deferArray[0].promise.then(function()
        {
            uploadVideo(deferArray[1]);
        });
        saveImage(deferArray[0]);
        $q.all(loopPromises).then(function()
        {
            $employer.updateCompanyEmployer(info, function(result)
            {
                if (result.status)
                {
                    localStorageService.set('companyProfile', $scope.company);
                    toastr.success(  updateSuccess,alert);
                }
                else
                {
                    toastr.error( updateError,alert);
                }
            });
        });
    };
    
    $scope.doChangepass = function()
    {
        if ($scope.account.oldpass && $scope.account.newpass && $scope.account.confirmpass &&
            $scope.account.confirmpass === $scope.account.newpass)
        {
            $employer.changePass(
            {
                token: $scope.userEmployer.token,
                oldpass: $scope.account.oldpass,
                newpass: $scope.account.newpass
            }, function(result)
            {
                if (result.status && result.data.result)
                {
                    toastr.success(  updateSuccess,alert);
                }
                else
                {
                    toastr.error(  updateError,alert);
                }
            });
        }
    };
    var getLicense = function()
    {
        $employer.getLicenseInfo(
        {
            token: $scope.userEmployer.token
        }, function(result)
        {
            if (result.status)
            {
                localStorageService.set('licenseInfo', result.data.licenseInfo);
            }
        });
    };
    var init = function()
    {
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        $scope.videoControl = {};
        $scope.profile = {
            fileUpload: null
        };
        $scope.company = {};
        $scope.image = {};
        $scope.account = {
            oldpass: null,
            newpass: null,
            confirmpass: null
        };
        getLicense();
        $scope.licenseInfo = localStorageService.get('licenseInfo');
        $scope.maxbar = $scope.licenseInfo.license.email;
        $scope.value = $scope.licenseInfo.email;
        $scope.valuevar = ($scope.value * 100) / $scope.maxbar;
        $scope.maxbarPoint = $scope.licenseInfo.license.point;
        $scope.valuePoint = $scope.licenseInfo.point;
        $scope.valuevarPoint = ($scope.valuePoint * 100) / $scope.maxbarPoint;
        if (!localStorageService.get('companyProfile'))
        {
            $employer.getCompanyEmployer(
            {
                token: $scope.userEmployer.token
            }, function(result)
            {
                if (result.status)
                {
                    $scope.company = result.data.company;
                    $scope.company.phone = Number($scope.company.phone).valueOf();
                    $scope.company.vat = Number($scope.company.vat).valueOf();
                    if ($scope.company.image)
                    {
                        $scope.image.src = "data:image/png;base64," + $scope.company.image;
                    }
                    else
                    {
                        $scope.image.src = "assets/images/icProfile.png";
                    }
                    localStorageService.set('companyProfile', $scope.company);
                }
            });
        }
        else
        {
            $scope.company = localStorageService.get('companyProfile');
            $scope.company.phone = Number($scope.company.phone).valueOf();
            $scope.company.vat = Number($scope.company.vat).valueOf();

            if ($scope.company.image)
            {
                $scope.image.src = "data:image/png;base64," + $scope.company.image;
            }
            else
            {
                $scope.image.src = "assets/images/icProfile.png";
            }
        }
    };
    init();
});