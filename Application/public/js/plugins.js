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

})(window.utils = window.utils || {}, jQuery);