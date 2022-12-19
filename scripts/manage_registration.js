document.addEventListener('DOMContentLoaded', function()  {
    chrome.storage.sync.get(["global_alarm"], function(data) {
        set_displayed_time(data.global_alarm == undefined ? Date.now() : data.global_alarm);
        trigger_update();
    });
});

function set_displayed_time(date_init){
    var now = new Date(date_init);
    now.setMinutes(now.getMinutes()-now.getTimezoneOffset());
    document.getElementById("registration_time").value = now.toISOString().slice(0, 16);
    console.log("Now string: "+new Date(Date.now()).toISOString());
    //TODO: enforce not allowing bad time to be entered or tell user invalid time was entered
    document.getElementById("registration_time").min = new Date(Date.now()).toISOString().slice(0, 16);
}

function trigger_update() {
    document.getElementById("update_time").addEventListener("click", () => {
        const value = document.getElementById("registration_time").value;
        //convert string to date
        const new_date = new Date(new Date(value));
        console.log("new date:" + new_date.toISOString());
        update_alarm_data(new_date.getTime());
    });
}

//create all persistent data that we might need (chrome.storage.sync)
//all arm data is stored in UTC, but entered in by user in CST
function update_alarm_data(new_date) {
    console.log("new_data passed in is " + new_date);
    //update global alarm time 
    chrome.storage.sync.set({"global_alarm": new_date}).then( () => {
        chrome.storage.sync.get(["global_alarm"], function(data) {
            chrome.alarms.create("registration_alarm" , {
                when: data.global_alarm
            });
        });
    });
}