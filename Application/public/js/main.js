var home = "/home/lxgreen"; //TODO: home location -- to config file
$(function() {

    // init home ls
    privateCloud.cd(home, function() {
        privateCloud.ls(".", listFiles);
    });

    // bind menu links
    $("a#nav-up").tooltip({
        placement: 'bottom',
        title: 'Level Up'
    }).click(function() {
        privateCloud.cd("..", function() {
            privateCloud.ls(".", listFiles);
        });
    });

    $("a#nav-refresh").tooltip({
        placement: 'bottom',
        title: 'Refresh'
    }).click(function() {
        privateCloud.ls(".", listFiles);
    });

    $("a#nav-home").tooltip({
        placement: 'bottom',
        title: 'Home'
    }).click(function() {
        privateCloud.cd(home, function() {
            privateCloud.ls(".", listFiles);
        });
    });

    $("a#nav-upload").tooltip({
        placement: 'bottom',
        title: 'Upload File'
    });
    $("a#nav-new-folder").tooltip({
        placement: 'bottom',
        title: 'New Folder'
    });
    $("a#nav-settings").tooltip({
        placement: 'bottom',
        title: 'Settings'
    });
    $("a#nav-contact").tooltip({
        placement: 'bottom',
        title: 'Contact Us'
    });
    $("a#nav-help").tooltip({
        placement: 'bottom',
        title: 'Help'
    });

    $("button#btnCreateNewFolder").click(function() {
        var folderName = $("input#newFolderName").val();
        if(isValid(folderName)) {
            privateCloud.mkdir(folderName, function() {
                $("div#newFolderDialog").modal("hide");
                privateCloud.ls(".", listFiles);
            });
        }
    });

});

// build file list view

function listFiles(files) {
    if(files.length > 0) {

        // Render file list.
        $("ul#files").hide();
        utils.renderTemplate({
            name: 'fileListItem',
            data: files,
            selector: "ul#files"
        }, function() {
            $("ul#files li[data-type='dir']").click(function() {
                privateCloud.cd($(this).data("name"), function() {
                    privateCloud.ls(".", listFiles);
                });
            });
        });
        $("ul#files").fadeIn();

    } else {

        // Render empty dir message.
        $("ul#files").hide();
        utils.renderTemplate({
            name: 'emptyDirListItem',
            data: null,
            selector: "ul#files"
        }, function() {
            // go back on click
            $("ul#files li").click(function() {
                privateCloud.cd("..", function() {
                    privateCloud.ls(".", listFiles);
                });
            });
        });
        $("ul#files").fadeIn();
    }
}

// validates file/dir name

function isValid(fname) {
    var rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    var rg2 = /^\./; // cannot start with dot (.) in windows
    var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names in windows
    return fname && rg1.test(fname) /*&& !rg2.test(fname) && !rg3.test(fname)*/
    ;
}