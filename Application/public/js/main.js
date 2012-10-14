$(function() {

    var files = privateCloud.ls('home');
    var originalContent = "";

    // directories displayed first
    files.sort(function(file1, file2) {
        return (file1.type != "inode/directory" && file2.type == "inode/directory") -
        (file1.type == "inode/directory" && file2.type != "inode/directory");
    });

    createListView(files);
});

// Fill listview data
function createListView(files) {
    $("#files").html($("#fileListItemTemplate").render(files));
}