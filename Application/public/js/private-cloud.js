(function(ns, $, undefined) {
    // Basic ajax API call
    // settings = {requestMethod, url, data, success, error, fail}
    var apiCall = function(settings) {

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
        });
    };

    // List directory
    ns.ls = function(path, callback) {
        apiCall({
            requestMethod : "post",
            url : "/ls",
            data : {path : path},
            success :  function(files) {
                callback(files);
            }
        });
    };

    // Delete file
    ns.rm = function(path, success) {
        apiCall({
            url: '/delete',
            requestMethod: 'DELETE',
            data: { path: path },
            success: function(result) {
                success(result);
            }
        });
    };

    // Make directory
    ns.mkdir = function(path, success, error) {
        apiCall({
            requestMethod : "post",
            url : "/mkdir",
            data : {path : path},
            success :  function(files) {
                success(files);
            },
            error : function(e) {
                error(e);
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
                callback(files);
            }
        });
    };

    // Get current directory absolute path
    ns.pwd = function(success, error){
        apiCall({
            requestMethod : "get",
            url : "/pwd",
            success :  function(result) {
                success(files);
            },
            error : function(e) {
                error(e);
            }
        });
    };

    // Uploads file to server
    ns.upload = function(path, success) {
        apiCall({
            requestMethod : "post",
            url : "/upload",
            data : {path : path},
            success : function(result) {
                success(result);
            },
            error : function(e) {
                error(e);
            }
        });
    };

     // Downloads file from server
    ns.download = function(path, success) {
         apiCall({
            requestMethod : "post",
            url : "/download",
            data : {path : path},
            success : function(result) {
                success(result);
            }
        });
    };


})(window.privateCloud = window.privateCloud || {}, jQuery);