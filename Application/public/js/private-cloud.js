"use strict";
(function(ns, $, undefined) {

    var
    // current dir tracking
   dirtyDir = true,

   loadingIndicator = $("div#loading"),

    // Basic ajax API call
    // settings = {requestMethod, url, data, success, error, fail}
    apiCall = function(settings) {

        // handle default request fail
        var defaultSettings = {
            fail : function(){
                utils.showNotification({message : "Connectivity problem detected." });
            },
            error : function(e) {
                utils.showNotification({message : e.error});
            }
        };

        $.extend(defaultSettings, settings);

        loadingIndicator.css('visibility', 'visible');
        $.ajax({
            type : defaultSettings.requestMethod,
            url : defaultSettings.url,
            data : defaultSettings.data
        })
        .done(function(result) {
                if(result.error) {
                        defaultSettings.error(result);
                    } else {
                        defaultSettings.success(result);
                    }
                })
        .fail(function() {
            defaultSettings.fail();
        })
        .always(function(){
            loadingIndicator.css('visibility', 'hidden');
        });
    };

    // Uploading files tracking
    // Array of {dir : "path", files}
    ns.uploads =  ns.uploads || [];

    ns.currentDir = "";

    // List directory
    ns.ls = function(path, callback) {
        apiCall({
            requestMethod : "post",
            url : "/ls",
            data : {path : path},
            success :  function(files) {

                if(typeof callback === 'function') {
                    callback(files);
                }
            }
        });
    };

    // Delete file
    ns.rm = function(path, callback) {
        apiCall({
            url: '/delete',
            requestMethod: 'DELETE',
            data: { path: path },
            success: function(result) {
                 if(typeof callback === 'function') {
                    callback(result);
                }
            }
        });
    };

    // Make directory
    ns.mkdir = function(path, success, error) {
        apiCall({
            requestMethod : "post",
            url : "/mkdir",
            data : {path : path},
            success :  function(result) {
                 if(typeof success === 'function') {
                   success(result);
                }

            },
            error : function(e) {
                if(typeof error === 'function') {
                    error(e);
               }
            }
        });
    };

    // Change directory
    ns.cd = function(path, callback) {
        apiCall({
            requestMethod : "post",
            url : "/chdir",
            data : {path : path},
            success :  function(result) {
                dirtyDir = true;
                if(typeof callback === 'function') {
                    callback(files);
                }
            }
        });
    };

    // Get current directory absolute path
    ns.pwd = function(success, error){
        if(dirtyDir) {
            apiCall({
                requestMethod : "get",
                url : "/pwd",
                success :  function(result) {
                    ns.currentDir = result;
                    dirtyDir = false;
                    if(typeof success === 'function') {
                        success(ns.currentDir);
                    }
                },
                error : function(e) {
                    if(typeof error === 'function') {
                        error(e);
                    }
                }
            });
        }
        else {
            if(typeof success === 'function') {
                success(ns.currentDir);
            }
        }

    };

    // Uploads file to server
    // ns.upload = function(path, success) {
    //     apiCall({
    //         requestMethod : "post",
    //         url : "/upload",
    //         data : {path : path},
    //         success : function(result) {
    //              if(typeof success === 'function') {
    //                 success(result);
    //             }
    //         },
    //         error : function(e) {
    //             if(typeof error === 'function') {
    //                 error(e);
    //             }
    //         }
    //     });
    // };

})(window.privateCloud = window.privateCloud || {}, jQuery);