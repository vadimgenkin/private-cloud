// Avoid `console` errors in browsers that lack a console.
if(!(window.console && console.log)) {
    (function() {
        var noop = function() {};
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = window.console = {};
        while(length--) {
            console[methods[length]] = noop;
        }
    }());
}

// Place any jQuery/helper plugins in here.
(function(ns, $, undefined) {

    // Renders external template
    // item = {data, name, selector}
    // Depends on jsRender
    ns.renderTemplate = function(item, callback) {

        var file = '../templates/' + item.name + '.html';

        $.when($.get(file)).done(function(tmplData) {
            $.templates({tmpl: tmplData });
            $(item.selector).html($.render.tmpl(item.data));
            callback();
        });
    };

    // Registers external template as named one
    // Depends on jsRender
    ns.registerTemplate = function(name) {
        var file = '../templates/' + name + '.html';
        $.when($.get(file)).done(function(tmplData) {
           $.templates(name, {markup : tmplData });
        });
    };

    // Renders modal dialog
    // dialog = {data: {content, iconClass, header, buttons, xButton, id}, selector}, eventHandlers = {show, shown, hide, hidden}
    // Depends on jsRender
    ns.showDialog = function(dialog, callback, eventHandlers) {

        var defaultDialog = {selector : "div#dialogPlaceholder"};

        $.extend(defaultDialog, dialog);

       $(defaultDialog.selector).html($.render.modalDialog(defaultDialog.data));

        var dialogBox = $("#" + defaultDialog.data.id);

        // submit on enter
        dialogBox.keyup(function(e){
            if(e.keyCode === 13){
                $(".btn-primary").click();
            }
        });

        // modal event handlers registration
        if(eventHandlers.hidden) dialogBox.on('hidden', function(){eventHandlers.hidden();});
        if(eventHandlers.hide) dialogBox.on('hide', function(){eventHandlers.hide();});
        if(eventHandlers.shown) dialogBox.on('shown', function(){eventHandlers.shown();});
        if(eventHandlers.show) dialogBox.on('hidden', function(){eventHandlers.show();});
        dialogBox.modal();
        callback();
    };

    // Displays notification
    // notification = {position : "top/bottom-left/right", message : "text", html : true/false, type : "success/error/block/info"}
    // Depends on bootstrap-notify
    ns.showNotification = function (notification) {

        var defaultNotification = { position : "bottom-right", html : false, type : "error" };

        $.extend(defaultNotification, notification);

        $("." + defaultNotification.position).notify({type : defaultNotification.type, message : {text : defaultNotification.message, html : defaultNotification.html}}).show();
    };

    // Converts string to Title case.
    ns.titlize = function(stringToTitle) {
        return stringToTitle.charAt(0).toUpperCase() + stringToTitle.substr(1).toLowerCase();
    };

})(window.utils = window.utils || {}, jQuery);


(function(ns, $, undefined) {

    ns.deleteDialog = function(path, entryType) {
        var warning = "Are you sure you want to <b style='color : #bd362f;'>DELETE</b> '" + path + "' " + entryType + "?";
        return {
            data: {
                content: warning,
                header: "Delete " + utils.titlize(entryType),
                buttons: '<button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button> <button class="btn btn-danger" id="btnDelete">DELETE</button>',
                xButton: "×",
                id: "deleteDialog",
                iconClass: "icon-trash"
            }
        };
    };

    ns.newFolderDialog = function() {
        return {
            data: {
                content: '<input type="text" placeholder="Enter folder name" autofocus="autofocus" id="newFolderName"/>',
                header: "Create New Folder",
                buttons: '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button> <button class="btn btn-primary" id="btnCreateNewFolder">Done</button>',
                xButton: "×",
                id: "newFolderDialog",
                iconClass: "icon-folder-close"
            }
        };
    };

    ns.settingsDialog = function() {
        return {
            data: {
                content: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
                header: "Settings",
                buttons: '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button> <button class="btn btn-primary" id="btnCreateNewFolder">Done</button>',
                xButton: "×",
                id: "settingsDialog",
                iconClass: "icon-cog"
            }
        };
    };

    ns.helpDialog = function() {
        return {
            data: {
                content: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
                header: "Help",
                buttons: '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button> ',
                xButton: "×",
                id: "helpDialog",
                iconClass: "icon-question-sign"
            }
        };
    };

    ns.uploadDialog = function() {
        return {
            data : {
                content: "<form><input type='file'></form>",
                header: "Upload File",
                buttons: '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button> <button class="btn btn-primary" id="btnUpload">Upload</button>',
                xButton: "×",
                id: "uploadDialog",
                iconClass: "icon-upload"
            }
        };
    }

})(window.dialogs = window.dialogs || {}, jQuery);

