var home = "/home/lxgreen"; //TODO: home location -- to config file
$(function() {
    // init home ls
    privateCloud.cd(home, function() {
        privateCloud.ls(".", listFiles);
    });

    // bind navigation links
    $("a#nav-up").click(function() {
        privateCloud.cd("..", function() {
            privateCloud.ls(".", listFiles);
        });
    });

    $("a#nav-refresh").click(function() {
        privateCloud.ls(".", listFiles);
    });

    $("a#nav-home").click(function() {
        privateCloud.cd(home, function() {
            privateCloud.ls(".", listFiles);
        });
    });
});

// build file list view


function listFiles(files) {
    if(files.length > 0) {
        $("ul#files").hide().html($("#fileListItemTemplate").render(files)).fadeIn();

        // bind dir list item click
        $("ul#files li[data-type='dir']").click(function() {
            privateCloud.cd($(this).data("name"), function() {
                privateCloud.ls(".", listFiles);
            });
        });
    }
    else {
        $("ul#files").hide().html($("#emptyDirTemplate").render(files)).fadeIn();

        // go back on click
        $("ul#files li[data-type='dir']").click(function() {
            privateCloud.cd("..", function() {
                privateCloud.ls(".", listFiles);
            });
        });
    }
}