var table_titles;

document.addEventListener('DOMContentLoaded', function()  {
    setup_page();
    chrome.storage.sync.get(["global_alarm"], function(data) {
        set_displayed_time(data.global_alarm == undefined ? Date.now() : data.global_alarm);
        trigger_update();
    });

    table_titles = [];
    [].slice.call(document.getElementById("table-header").rows[0].cells).forEach((cell) => {
        table_titles.push(cell.innerText);
    });

    
});



function get_listed(has_cells) {
    let list_of_cells = has_cells.cells;
    var to_ret = {};
    [].slice.call(list_of_cells).forEach((cell, idx) => {
        console.log("cell inner text is " + cell.innerText);
        console.log("key is " + table_titles[idx]);
        if (table_titles[idx] != 'Actions')
        {
            to_ret[table_titles[idx]] = cell.innerText;
        }
        //to_ret.push(cell.innerText);
    })

    return to_ret;
}

function store_table() {
    
    var table_rows = document.getElementById("course-table-body").rows;
    var saved_registration = [];
    [].slice.call(table_rows).forEach((row) => {saved_registration.push(get_listed(row));});
    console.log("saved registration "+saved_registration);
    chrome.storage.sync.set({ "saved_registration": saved_registration }).then(() => {
        console.log(saved_registration[0]);
        console.log(saved_registration[0]["Registration Order"]);
    });
}
function setup_page(){
    // Get the edit and submit buttons
    const editButton = document.getElementById("edit-button");
    editButton.addEventListener("click", function() {
        addRowButton.style.display = "inline-block";
        editButton.disabled = true;
        //enable the submit button
        document.getElementById("submit-button").disabled = false;

        //allow in row editting
        document.getElementById("course-table").style.removeProperty("pointer-events");
    });
    const submitButton = document.getElementById("submit-button");
    submitButton.addEventListener("click", function() {
        addRowButton.style.display = "none";
        submitButton.disabled = true;

        //store the current table
        store_table();

        //enable the edit button
        document.getElementById("edit-button").disabled = false;

        //disable edit/delete in table
        document.getElementById("course-table").style.pointerEvents = "none";

    });
    // Get the add row button
    const addRowButton = document.getElementById("add-row-button");
    addRowButton.addEventListener("click", function(){
        coursePopup.style.display = "block";
        console.log("bottom of registration-info: "+document.getElementById("registration-info").getBoundingClientRect().bottom);
        console.log("window height: "+window.innerHeight);
        var percentTop = 100*document.getElementById("registration-info").getBoundingClientRect().bottom/window.innerHeight;
        console.log("percent: "+percentTop)
        coursePopup.style.top =(document.getElementById("submit-button").getBoundingClientRect().bottom+coursePopup.getBoundingClientRect().height/2)+"px"
        
        // coursePopup.style.top = "0px";


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