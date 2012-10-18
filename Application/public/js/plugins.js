// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
    (function() {
        var noop = function() {};
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = window.console = {};
        while (length--) {
            console[methods[length]] = noop;
        }
    }());
}

// Place any jQuery/helper plugins in here.
(function(ns, $, undefined) {

    ns.renderTemplate = function(item, callback) {

            var file = '../templates/' + item.name + '.html';

            $.when($.get(file)).done(function(tmplData) {
                $.templates({tmpl: tmplData });
                $(item.selector).html($.render.tmpl(item.data));
                callback();
            });
    };

})(window.utils = window.utils || {}, jQuery);