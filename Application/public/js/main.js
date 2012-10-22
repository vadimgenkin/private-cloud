var home = "/home/lxgreen"; //TODO: home location -- to config file
var levelUp = "..";
var currentDir = ".";

$(function() {

    init();

    // start @ home
    browse(home);

    // bind menu links
    $("a#nav-up").tooltip({placement: 'bottom', title: 'Level Up'}).click(function() {browse(levelUp);});

    $("a#nav-refresh").tooltip({placement: 'bottom', title: 'Refresh'}).click(function() {privateCloud.ls(currentDir, listFiles); });

    $("a#nav-home").tooltip({placement: 'bottom', title: 'Home'}).click(function() {browse(home); });

    $("a#nav-upload").tooltip({placement: 'bottom', title: 'Upload File'});

    $("a#nav-new-folder").tooltip({placement: 'bottom', title: 'New Folder'}).click(function() {
        // show new folder dialog
        utils.showDialog(dialogs.newFolderDialog(), function() {

            var input = $("input#newFolderName");
            var doneButton = $("button#btnCreateNewFolder");

            doneButton.click(function() {
                var folderName = input.val();
                privateCloud.mkdir(folderName,
                    // success
                    function() {
                        $("div#newFolderDialog").modal("hide");
                        privateCloud.ls(currentDir, listFiles);
                        utils.showNotification({ message : "Folder '" + folderName +"' created successfully.", type : "success"});
                    },
                    // error
                    function(e) {
                       utils.showNotification({ message : e.error });
                       input.focus();
                    }
                );
            });
        }, {shown : function(){$("input#newFolderName").focus(); } });
    });

    $("a#nav-settings").tooltip({placement: 'bottom', title: 'Settings'})
    .click(function(){
        // show settings dialog
        utils.showDialog(dialogs.settingsDialog(), function() {}, {} );
    });

    $("a#nav-help").tooltip({placement: 'bottom', title: 'Help'}).click(function(){
        // show help dialog
        utils.showDialog(dialogs.helpDialog(), function() {}, {});
    });

    $("a#nav-contact").tooltip({placement: 'bottom', title: 'Contact Us'});

});

// build file list view
function listFiles(files) {

    $("ul#files").hide();

    // Render back nav entry
    $("ul#files").html($.render.backNavListItem());
    $("ul#files li#nav-back").click( function() { browse(levelUp); });

    // Render file list
    if(files.length > 0) {
        $("ul#files").append($.render.fileListItem(files));
        $("ul#files li[data-type='dir']").click(function(event) {
            event.stopPropagation();
            browse($(this).data("name"));
        });
        $("ul#files li a.icon-folder-open").click(function(event) {
            event.stopPropagation();
            browse($(this).closest("li").data("name"));
        });
        $("ul#files li a.icon-trash").click(function(event) {
            event.stopPropagation();
            deleteCarefully($(this).closest("li").data("name"), $(this).closest("li").data("type"));
        });

    }

    $("ul#files").fadeIn();
}

// changes dir and lists its content
function browse(path) {
    privateCloud.cd(path,
        // success
        function() {
            privateCloud.ls(currentDir, listFiles);
        }
    );
}

function init(){
    // Show notification on ajax error
    $(document).ajaxError(function(event, xhr, settings, error){
            utils.showNotification({message : "Connectivity problem detected."});
        });

    // Load and register external templates
    preCompileTemplates();

    // Define custom tags for templating
    defineCustomTags();
}

// Loads and registers external templates
function preCompileTemplates() {
    utils.registerTemplate('fileListItem');
    utils.registerTemplate('backNavListItem');
    utils.registerTemplate('modalDialog');
}

// Defines custom tags for templating
function defineCustomTags() {
    $.views.tags({

        // listview item links
        links : function(types){

            var links = [];
            if(types.indexOf("delete") !== -1) {
                links.push({title : "Delete", iconClass : "icon-trash"});
            }
             if(types.indexOf("share") !== -1) {
                links.push({title : "Share", iconClass : "icon-cloud"});
            }
            if(types.indexOf("download") !== -1) {
                links.push({title : "Download", iconClass : "icon-download default-action"});
            }
            if(types.indexOf("stream") !== -1) {
                links.push({title : "Stream", iconClass : "icon-play"});
            }
            if(types.indexOf("view") !== -1) {
                links.push({title : "View", iconClass : "icon-eye-open"});
            }
            if(types.indexOf("edit") !== -1) {
                links.push({title : "Edit", iconClass : "icon-edit"});
            }
            if(types.indexOf("browse") !== -1) {
                links.push({title : "Browse", iconClass : "icon-folder-open default-action"});
            }

            $.templates('hoverLinks', "<a  href='#' class='{{:iconClass}} hover-option' title='{{:title}}'/>");

            return $.render.hoverLinks(links);
        }
    });
}

// Shows delete dialog and deletes file/folder
function deleteCarefully(path, type) {

    var entryType  = (type === "dir" ? "folder" : "file") ;

    // show new folder dialog
    utils.showDialog(dialogs.deleteDialog(path, entryType), function() {

        var deleteButton = $("button#btnDelete");

        deleteButton.click(function() {

            privateCloud.rm(path,
                // success
                function() {
                    $("div#deleteDialog").modal("hide");
                    privateCloud.ls(currentDir, listFiles);
                    utils.showNotification({ message : utils.titlize(entryType) + " '" + path +"' deleted successfully.", type : "success"});
                }
            );
        });
    }, {/*handlers*/});
}