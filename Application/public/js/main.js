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

    $("a#upload-start").tooltip({placement: 'bottom', title: 'Start All Uploads'});
    $("a#upload-cancel").tooltip({placement: 'bottom', title: 'Cancel All Uploads'});
    $("a#upload-delete").tooltip({placement: 'bottom', title: 'Delete All Uploads'});

    $("a#fs-upload").tooltip({placement: 'bottom', title: 'Upload'});
    $("a#fs-new-folder").tooltip({placement: 'bottom', title: 'New Folder'}).click(function() {
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

    $("a#misc-settings").tooltip({placement: 'bottom', title: 'Settings'})
    .click(function(){
        // show settings dialog
        utils.showDialog(dialogs.settingsDialog(), function() {}, {} );
    });

    $("a#misc-help").tooltip({placement: 'bottom', title: 'Help'}).click(function(){
        // show help dialog
        utils.showDialog(dialogs.helpDialog(), function() {}, {});
    });

    $("a#misc-contact").tooltip({placement: 'bottom', title: 'Contact Us'});

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
       $("ul#files li a.icon-download").click(function(event) {
            event.stopPropagation();
            privateCloud.download($(this).closest("li").data("name"), function(){
                privateCloud.ls(currentDir, listFiles);
            });
        });
    }
    $("ul#files").fadeIn();
}

// changes dir and lists its content
function browse(path, shouldPreserveNavigationPath) {
    privateCloud.cd(path,
        // success
        function() {
            // list content
            privateCloud.ls(currentDir, listFiles);

            // get absolute path
            privateCloud.pwd(function(){
                // reset navPath on regular browse
                if(!shouldPreserveNavigationPath) {
                    privateCloud.navigationPath = privateCloud.currentDir;
                }

                // generate navigation data
                var
                dirs = [],
                navigationPath = privateCloud.navigationPath,
                paths = navigationPath.split(utils.dirDelimiter);
                while(navigationPath) {
                    dirs.unshift({dir : navigationPath});
                    paths.pop();
                    navigationPath = paths.join(utils.dirDelimiter);
                }

                // render breadcrumbs navigation bar
               $("ul#breadcrumbs").html($.render.breadcrumbsNavigation({dirs: dirs, current : privateCloud.currentDir, delimiter :utils.dirDelimiter}));
               $("ul#breadcrumbs li a").click(function(){
                    var navDir = $(this).closest("li").data("dir");
                    if(navDir) {
                        browse(navDir, true);
                    }
               });
            });
        }
    );
}

function init(){
    // Show notification on ajax error
    $(document).ajaxError(function(event, xhr, settings, error){
            utils.showNotification({message : "Connectivity problem detected."});
        });

    $(document).keyup(function(event) {
        var
            leftArrowKey = 37,
            upArrowKey = 38,
            rightArrowKey = 39,
            downArrowKey = 40
        ;
        if(event.keyCode === leftArrowKey) {
            navigatePrev();
        }
        else if(event.keyCode === rightArrowKey) {
            navigateNext();
        }
    });

    initFileUpload();

    // Load and register external templates
    preCompileTemplates();

    // Define custom tags for templating
    defineCustomTags();
}

function navigateNext() {
    var nextNavLink = $("ul#breadcrumbs li.active").next();
    if(nextNavLink) {
        var nextDir = nextNavLink.data("dir");
        if(nextDir)
            browse(nextDir, true);
    }
}

function navigatePrev() {
     var prevNavLink = $("ul#breadcrumbs li.active").prev();
    if(prevNavLink) {
        var previousDir = prevNavLink.data("dir");
        if(previousDir)
            browse(previousDir, true);
    }
}

function initFileUpload() {

    //TODO: get options from config
    $("#fileUploader").fileupload({

       //10MiB chunks
        maxChunkSize : 10*1024*1024,

       // maxFileSize : 1000000000,

        //upload on add
        autoUpload : true,

        add : function(e, data) {

            // Show all-upload level controls in menu bar
            $("ul#uploadControls").css("visibility", "visible");

            var that = $(this).data('fileupload'), options = that.options, files = data.files;

             $("ul#files li:first").remove();
             $("ul#files").prepend($.render.uploadOverallListItem());
            // Set context to listView upload items

            data.context = $($.render.uploadListItem(files)).insertAfter("#nav-back");

            // validate + submit (according to options)
            if (options.autoUpload &&
                utils.validateFiles(files) && data.autoUpload !== false) {
                    data.submit();
            }
        },
        progress: function(e,data) {
            if (data.context) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    data.context.find('.upload-progress-bar')
                        .attr('aria-valuenow', progress)
                        .css('width', progress + '%');
            }
        },
        progressall: function(e,data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#nav-back .upload-progress-bar')
                .attr('aria-valuenow', progress)
                .css('width', progress + '%');
            $('#nav-back .span12').text(progress + '%');
        },

        // remove uploaded, relist files on complete
        done: function(e,data){
             if (data.context) {
                var result = JSON.parse(data.result);
                if(result && result.length > 0) {
                    var error = result[0].error;
                    var filename = result[0].name;
                    if(error) {
                        data.context.find(".upload-progress-bar").toggleClass("error");
                        utils.showNotification({message :  "File '" + filename  + "' upload error (" + error + ")"});
                    }
                    else {
                        data.context.remove();
                         utils.showNotification({message :  "File '" + filename  + "' uploaded successfully", type : 'success'});
                    }
                }


                if( $('.uploadListItem').length === 1) {
                    privateCloud.ls(currentDir, listFiles);
                }
             }
        },
        fail: function(e,data) {
            utils.showNotification({message : "Upload aborted"});
        }
    });
}

// Loads and registers external templates
function preCompileTemplates() {
    utils.registerTemplate('fileListItem');
    utils.registerTemplate('backNavListItem');
    utils.registerTemplate('uploadListItem');
    utils.registerTemplate('modalDialog');
    utils.registerTemplate('uploadOverallListItem');
    utils.registerTemplate('breadcrumbsNavigation');
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
            if(types.indexOf("upload") !== -1) {
                links.push({title : "Delete upload", iconClass : "upload icon-trash delete", customStyle : "visibility : visible;"});
                links.push({title : "Cancel upload", iconClass : "upload icon-stop stop", customStyle : "visibility : visible;"});
                links.push({title : "Start upload", iconClass : "upload icon-play start", customStyle : "visibility : visible;"});
            }

            $.templates('hoverLinks', "<a  href='#' class='{{:iconClass}} hover-option' title='{{:title}}' style='{{:customStyle}}'/>");

            return $.render.hoverLinks(links);
        },

        breadcrumbs : function(data){
            var ret = "";
            for(dir in data.dirs){
                ret += this.renderContent(dir)
            }
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