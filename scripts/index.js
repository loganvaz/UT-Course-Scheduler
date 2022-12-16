// document.getElementById("manage_button").addEventListener('click', open_manage_registration);
document.addEventListener('DOMContentLoaded', function(){
    //TODO maybe add this to background script instead
    chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
        //load class queue as copy of saved requested classes
    const class_queue = ["13220", "13180"];
    // chrome.storage.session.setAccessLevel({"accessLevel": "TRUSTED_AND_UNTRUSTED_CONTEXTS"});
    chrome.storage.session.set({ "class_queue": class_queue }).then(() => {
        //click the "submit" button to enter into registration section
        var manage_button = document.getElementById("manage_button");
        manage_button.addEventListener('click', open_manage_registration);
    });
});

function open_manage_registration(){
    // throw new Error("Manage registration time!");
    chrome.tabs.create(
    {
        "url": "htmls/registration.html"
    }
    );
}