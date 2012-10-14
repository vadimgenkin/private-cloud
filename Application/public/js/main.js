$(function() {
    var currentPath = ".";

    privateCloud.ls(currentPath, function(files) {
        // directories first
        files.sort(function(file1, file2) {
            return(file1.type != "dir" && file2.type == "dir") - (file1.type == "dir" && file2.type != "dir");
        });
        createListView(files);
    });

    // navigation -- for tests only
    $("a#nav-up").click(function(){
        currentPath = "../" + currentPath;
        privateCloud.ls(currentPath, function(files) {
        // directories first
        files.sort(function(file1, file2) {
            return(file1.type != "dir" && file2.type == "dir") - (file1.type == "dir" && file2.type != "dir");
        });
        createListView(files);
    });
    });


});

function createListView(files) {
    $("#files").html($("#fileListItemTemplate").render(files));
}