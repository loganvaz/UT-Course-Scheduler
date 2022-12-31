// document.getElementById("manage_button").addEventListener('click', open_manage_registration);
document.addEventListener('DOMContentLoaded', function(){
    //TODO maybe add this to background script instead
    chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
    //load class queue as copy of saved requested classes
    const class_queue = ["51895","13220"];
    //read list/hashmap of course codes that we want to waitlist
    // chrome.storage.session.setAccessLevel({"accessLevel": "TRUSTED_AND_UNTRUSTED_CONTEXTS"});
    
    chrome.storage.session.set({ "class_queue": class_queue }).then(() => {
        //click the "submit" button to enter into registration section
        var manage_button = document.getElementById("manage-button");
        manage_button.addEventListener('click', open_manage_registration);
    });
    

    //display current registration time
    chrome.storage.sync.get(["global_alarm"], function(data) {
        if(data.global_alarm == undefined){
            document.getElementById("registration-time").style.display = "none";
            document.getElementById("registration-time-container").style.marginBottom = '1.5em';
            document.getElementById("no-registration-time").style.removeProperty("display");
        } else {
            set_displayed_time(data.global_alarm);
        }
    });



    //add list of classes
    chrome.storage.sync.get(["saved_registration"], function(data) {
        if(data.saved_registration == undefined){
            document.getElementById("class-list-div").hidden = false;
        } else {
            let list_of_classes = document.getElementById("class-list");
            data["saved_registration"].forEach((instance) => {
                let newest = document.createElement("div");
                newest.classList.add("centered");
                newest.classList.add("course_element");
                newest.innerText = instance["Course name"] + " (" + instance["Course code"] + ")";
                list_of_classes.appendChild(newest);
            })
        }
    });


});

function set_displayed_time(date_init){
    var now = new Date(date_init);
    now.setMinutes(now.getMinutes()-now.getTimezoneOffset());
    document.getElementById("registration-time").value = now.toISOString().slice(0, 16);
}



function open_manage_registration(){
    // throw new Error("Manage registration time!");
    chrome.tabs.create(
    {
        "url": "htmls/manage_registration.html"
    }
    );
}