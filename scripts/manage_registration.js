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
    });

    // Get the course popup
    const coursePopup = document.getElementById("course-popup");

    // Popup setup
    const saveButton = document.getElementById("save-button");
    saveButton.addEventListener("click", save_class);
    const closeButton = document.getElementById("close-button");
    closeButton.addEventListener("click",  clear_popup);
}

function save_class(){
    const courseName = document.getElementById("course-name-input").value;
    const courseCode = document.getElementById("course-code-input").value;
    const waitlist = document.getElementById("waitlist-input").checked;
    const alternateCourses = document.getElementById("alternate-courses-input").value;

    //add row to course table
    const courseTable = document.getElementById("course-table");
    var rowVal = document.getElementById("add_edit").value;
    const edit_request = rowVal != "add";
    if(edit_request){
        courseTable.deleteRow(rowVal);
    }
    var row = courseTable.insertRow(edit_request ? rowVal : -1);
    row.addEventListener("dblclick", function(e){
        e.target.parentNode.classList.add("selected_row");
        edit_row(e.target);
    });
    //insert all values
    var courseNameTable = row.insertCell(0);
    courseNameTable.innerHTML = courseName;
    var courseCodeTable = row.insertCell(1);
    courseCodeTable.innerHTML = courseCode;
    var waitlistTable = row.insertCell(2);
    waitlistTable.innerHTML = waitlist;
    var alternateCoursesTable = row.insertCell(3);
    alternateCoursesTable.innerHTML = alternateCourses;
    var removeButtonTable = row.insertCell(4);
    var removeButton = document.createElement("button");
    removeButton.innerText = "Remove";
    removeButtonTable.appendChild(removeButton);
    removeButton.onclick = function(e) {
        document.getElementById("course-table").deleteRow(e.target.parentNode.parentNode.rowIndex);
    };
    clear_popup();
}

function clear_popup(){
    document.getElementById("course-name-input").value = "";
    document.getElementById("course-code-input").value = "";
    document.getElementById("waitlist-input").checked = false;
    document.getElementById("alternate-courses-input").value = "";
    document.getElementById("add_edit").value = "add";
    var selected_row = document.getElementsByClassName("selected_row");
    for(let e of selected_row){
        e.classList.remove("selected_row");
    }
    document.getElementById("course-popup").style.display = "none";

}

function edit_row(cell){
    const row = cell.parentNode;
    document.getElementById("course-name-input").value = row.cells[0].innerText;
    document.getElementById("course-code-input").value = row.cells[1].innerText;
    document.getElementById("waitlist-input").checked = row.cells[2].innerText == "true";
    document.getElementById("alternate-courses-input").value = row.cells[3].innerText;
    document.getElementById("add_edit").value = row.rowIndex;
    document.getElementById("course-popup").style.display = "block";
}

function set_displayed_time(date_init){
    var now = new Date(date_init);
    now.setMinutes(now.getMinutes()-now.getTimezoneOffset());
    document.getElementById("registration_time").value = now.toISOString().slice(0, 16);
    //TODO: enforce not allowing bad time to be entered or tell user invalid time was entered
    document.getElementById("registration_time").min = new Date(Date.now()).toISOString().slice(0, 16);
}

function trigger_update() {
    document.getElementById("update_time").addEventListener("click", () => {
        const value = document.getElementById("registration_time").value;
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