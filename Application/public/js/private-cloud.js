(function(ns, $, undefined) {

    // List directory
    ns.ls = function(path, callback) {
        $.post("/ls", {
            path: path
        }, function(files) {
            callback(files);
        });
    };

    // Delete file
    ns.rm = function(path, callback) {
        $.ajax({
            url: '/delete',
            type: 'DELETE',
            data: {
                path: path
            },
            success: function(result) {
                callback(result);
            },
            error: function(result) {
                callback(result);
            }
        });
    };

    // Make directory
    ns.mkdir = function(path, callback) {
        $.post("/mkdir", {
            path: path
        }, function(result) {
            callback(result);
        });
    };
})(window.privateCloud = window.privateCloud || {}, jQuery);