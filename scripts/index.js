// document.getElementById("manage_button").addEventListener('click', open_manage_registration);
document.addEventListener('DOMContentLoaded', function(){
    var manage_button = document.getElementById("manage_button");
    manage_button.addEventListener('click', open_manage_registration);
});

function open_manage_registration(){
    // throw new Error("Manage registration time!");
    chrome.tabs.create(
    {
        "url": "htmls/registration.html"
    }
    );
}