document.addEventListener('DOMContentLoaded', function()  {
    setup_page();
    chrome.storage.sync.get(["global_alarm"], function(data) {
        set_displayed_time(data.global_alarm == undefined ? Date.now() : data.global_alarm);
        trigger_update();
    });
});

function setup_page(){
    // Get the edit and submit buttons
    const editButton = document.getElementById("edit-button");
    editButton.addEventListener("click", function() {
        addRowButton.style.display = "inline-block";
        editButton.disabled = true;
    });
    const submitButton = document.getElementById("submit-button");
    submitButton.addEventListener("click", function() {
        addRowButton.style.display = "none";
        submitButton.disabled = true;
    });
    // Get the add row button
    const addRowButton = document.getElementById("add-row-button");
    addRowButton.addEventListener("click", function(){
        coursePopup.style.display = "block";
        document.getElementById("registration-info").style.pointerEvents = "none";
    });

    // Get the course popup
    const coursePopup = document.getElementById("course-popup");

    // Popup setup
    const saveButton = document.getElementById("save-button");
    saveButton.addEventListener("click", save_class);
    const closeButton = document.getElementById("close-button");
    closeButton.addEventListener("click",  clear_popup);
}


function set_displayed_time(date_init){
    var now = new Date(date_init);
    now.setMinutes(now.getMinutes()-now.getTimezoneOffset());
    document.getElementById("registration-time").value = now.toISOString().slice(0, 16);
    //TODO: enforce not allowing bad time to be entered or tell user invalid time was entered
    document.getElementById("registration-time").min = new Date(Date.now()).toISOString().slice(0, 16);
}

function trigger_update() {
    document.getElementById("update-time").addEventListener("click", () => {
        const value = document.getElementById("registration-time").value;
        //convert string to date
        const new_date = new Date(new Date(value));
        console.log("New Date:" + new_date.toISOString());
        update_alarm_data(new_date.getTime());
    });
}

//create all persistent data that we might need (chrome.storage.sync)
//all arm data is stored in UTC, but entered in by user in CST
function update_alarm_data(new_date) {
    //update global alarm time 
    chrome.storage.sync.set({"global_alarm": new_date}).then( () => {
        chrome.storage.sync.get(["global_alarm"], function(data) {
            chrome.alarms.create("registration_alarm" , {
                when: data.global_alarm
            });
        });
    });
}