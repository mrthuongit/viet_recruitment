'use strict';
angular.module('api').factory('http', function($http, apiUrl, blockUI, $log)
{
    var transform = function(data){
        var str = [];
        for(var p in data){
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
        }
        return str.join("&");        
    };
    return {
        postRequest: function(path, param, callback)
        {
            var url = apiUrl + path;
            var req = {
                method: 'POST',
                url: url,
                headers:
                {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                transformRequest: transform,
                timeout: 300000,
                data: param
            };
            blockUI.start();
            $log.info('POST request: ' + req.data);
            $http(req).then(function(data)
            {
                if (data.status === 200)
                {
                    blockUI.stop();
                    if (typeof(data.data.result) ===
                        "boolean" && !data.data.result)
                    {
                        callback(
                        {
                            status: false
                        });
                    }
                    else
                    {
                        callback(
                        {
                            status: true,
                            data: data.data
                        });
                    }
                }
            }, function(error)
            {
                blockUI.stop();
                $log.error(error);
                callback(
                {
                    status: false
                });
            });
        },
        getRequest: function(path, param, callback)
        {
            var url = apiUrl + path;
            var req = {
                method: 'GET',
                url: url,
                headers:
                {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                transformRequest: transform,
                params: param
            };
            blockUI.start();
            $log.info('GET request: ' + req.params);
            $http(req).then(function(data)
            {
                blockUI.stop();
                if (data.status === 200)
                {
                    if (typeof(data.data.result) ===
                        "boolean" && !data.data.result)
                    {
                        callback(
                        {
                            status: false
                        });
                    }
                    else
                    {
                        callback(
                        {
                            status: true,
                            data: data.data
                        });
                    }
                }
            }, function(error)
            {
                blockUI.stop();
                $log.error(error);
                callback(
                {
                    status: false
                });
            });
        },
        putRequest: function(path, param, callback)
        {
            var url = apiUrl + path;
            var req = {
                method: 'PUT',
                url: url,
                headers:
                {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                transformRequest: transform,
                data: param
            };
            $log.info('PUT request: ' + req.params);
            blockUI.start();
            $http(req).then(function(data)
            {
                blockUI.stop();
                if (data.status === 200)
                {
                    if (typeof(data.data.result) ===
                        "boolean" && !data.data.result)
                    {
                        callback(
                        {
                            status: false
                        });
                    }
                    else
                    {
                        callback(
                        {
                            status: true,
                            data: data.data
                        });
                    }
                }
            }, function(error)
            {
                blockUI.stop();
                $log.error(error);
                callback(
                {
                    status: false
                });
            });
        },
        deleteRequest: function(path, param, callback)
        {
            var url = apiUrl + path;
            var req = {
                method: 'DELETE',
                url: url,
                headers:
                {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                transformRequest: transform,
                data: param
            };
            $log.info('DELETE request: ' + req.data);
            blockUI.start();
            $http(req).then(function(data)
            {
                if (data.status === 200)
                {
                    blockUI.stop();
                    if (typeof(data.data.result) ===
                        "boolean" && !data.data.result)
                    {
                        callback(
                        {
                            status: false
                        });
                    }
                    else
                    {
                        callback(
                        {
                            status: true,
                            data: data.data
                        });
                    }
                }
            }, function(error)
            {
                blockUI.stop();
                $log.error(error);
                callback(
                {
                    status: false
                });
            });
        },
        uploadRequest: function(path, file, callback)
        {
            var url = apiUrl + path;
            var xhr = new XMLHttpRequest();
            var fd = new FormData();
            xhr.open("POST", url, true);
            blockUI.start();
            $log.info('UPLOAD request: ' + path);
            xhr.onreadystatechange = function()
            {
                if (xhr.readyState === 4 && xhr.status === 200)
                {
                    blockUI.stop();
                    callback(
                    {
                        status: true,
                        data: angular.fromJson(xhr.responseText)
                    });
                    
                }
            };
            fd.append('file', file);
            xhr.send(fd);
        }
    };
});