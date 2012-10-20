var home = "/home/lxgreen"; //TODO: home location -- to config file
var levelUp = "..";
var currentDir = ".";

$(function() {

    $(document).ajaxError(function(event, xhr, settings, error){
        utils.showNotification({message : "Connectivity problem detected."});
    });

    // start @ home
    browse(home);

    // bind menu links
    $("a#nav-up").tooltip({placement: 'bottom', title: 'Level Up'}).click(function() {browse(levelUp);});

    $("a#nav-refresh").tooltip({placement: 'bottom', title: 'Refresh'}).click(function() {privateCloud.ls(currentDir, listFiles); });

    $("a#nav-home").tooltip({placement: 'bottom', title: 'Home'}).click(function() {browse(home); });

    $("a#nav-upload").tooltip({placement: 'bottom', title: 'Upload File'});

    $("a#nav-new-folder").tooltip({placement: 'bottom', title: 'New Folder'}).click(function() {
        // set new folder dialog data
        var newFolderDialog = {
            data: {
                content: '<input type="text" placeholder="Enter folder name" autofocus="autofocus" id="newFolderName"/>',
                header: "Create New Folder",
                buttons: '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button> <button class="btn btn-primary" id="btnCreateNewFolder">Done</button>',
                xButton: "×",
                id: "newFolderDialog",
                iconClass: "icon-folder-close"
            },
            selector: "div#dialogPlaceholder"
        };

        // show new folder dialog
        utils.showDialog(newFolderDialog, function() {

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
         // set settings dialog data
        var settingsDialog = {
            data: {
                content: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
                header: "Settings",
                buttons: '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button> <button class="btn btn-primary" id="btnCreateNewFolder">Done</button>',
                xButton: "×",
                id: "settingsDialog",
                iconClass: "icon-cog"
            },
            selector: "div#dialogPlaceholder"
        };

        // show settings dialog
        utils.showDialog(settingsDialog, function() {}, {} );
    });

    $("a#nav-help").tooltip({placement: 'bottom', title: 'Help'}).click(function(){
        // set help dialog data
        var helpDialog = {
            data: {
                content: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
                header: "Help",
                buttons: '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button> ',
                xButton: "×",
                id: "helpDialog",
                iconClass: "icon-question-sign"
            },
            selector: "div#dialogPlaceholder"
        };

        // show settings dialog
        utils.showDialog(helpDialog, function() {}, {});
    });

    $("a#nav-contact").tooltip({placement: 'bottom', title: 'Contact Us'});

});

// build file list view
function listFiles(files) {
    if(files.length > 0) {

        // Render file list.
        $("ul#files").hide();
        utils.renderTemplate(
            {
                name: 'fileListItem',
                data: files,
                selector: "ul#files"
            },
            function() {
                $("ul#files li[data-type='dir']").click(function() {
                    browse($(this).data("name"));
                });
            }
        );
        $("ul#files").fadeIn();

    } else {

        // Render empty dir message.
        $("ul#files").hide();
        utils.renderTemplate({name: 'emptyDirListItem', data: null, selector: "ul#files"},
        function() {
            // go back on click
            $("ul#files li").click(function() {
                browse(levelUp);
            });
            $("ul#files").fadeIn();
        });
    }
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