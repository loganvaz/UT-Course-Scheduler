document.addEventListener('DOMContentLoaded', function(){

    document.getElementById("faq").addEventListener("click", () => {
        window.open("../htmls/faq.html", "");
    });

    document.getElementById("log").addEventListener("click", () => {
        window.open("../htmls/log.html", "");
    });


    document.getElementById("dropbtn").addEventListener("click", ()=>{
        const dropdown = document.getElementById("dropdown-menu");
        console.log("dropdown style: "+dropdown.style.display);
        if(dropdown.style.display == "block"){
            dropdown.style.display = "none";
        } else {
            dropdown.style.display = "block";
        }
    });

    chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
    
    var manage_button = document.getElementById("manage-button");
    manage_button.addEventListener('click', open_manage_registration);

    //display current registration time
    chrome.storage.sync.get(["global_alarm", "registration_semester"], function(data) {
        if(data.global_alarm === undefined){
            document.getElementById("registration-time").style.display = "none";
            document.getElementById("registration-time-container").style.marginBottom = '1.5em';
            document.getElementById("no-registration-time").style.removeProperty("display");
        } else {
            set_displayed_time(data.global_alarm);
        }
        if(data.registration_semester !== undefined){
            document.getElementById("registration-time-label").innerText = "Registration Time for "+data.registration_semester;
        }
    });

    //add list of classes
    chrome.storage.sync.get(["saved_registration"], function(data) {
        if(data.saved_registration === undefined){
            document.getElementById("class-list-div").hidden = false;
        } else {
            let list_of_classes = document.getElementById("class-list");
            data["saved_registration"].forEach((instance) => {
                let newest = document.createElement("div");
                newest.classList.add("centered");
                newest.classList.add("course_element");

                newest.innerText = instance["Course name"].trim() == "" ?  instance["Course code"] : instance["Course name"] + " (" + instance["Course code"] + ")";
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
    chrome.tabs.create(
    {
        "url": "htmls/manage_registration.html"
    }
    );
}