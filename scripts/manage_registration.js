document.addEventListener('DOMContentLoaded', function()  {
    setup_page();
   

    chrome.storage.sync.get(["global_alarm"], function(data) {
        set_displayed_time(data.global_alarm == undefined ? Date.now() : data.global_alarm);
        trigger_update();
    });


});

function mouseUpHandler() {
    const table = document.getElementById("course-table");

    if (placeholder) placeholder.parentNode.removeChild(placeholder);
    dragging_el.style.removeProperty('top');
    dragging_el.style.removeProperty('left');
    dragging_el.style.removeProperty('position');
    dragging_el.classList.remove("dragging");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);

    //recalculating where we ended up
    console.log("list.children = " +list.children )
    const end_row_idx = [].slice.call(list.children).indexOf(dragging_el);
    let rows = [].slice.call(table.querySelectorAll('tr'));
    if (dragging_row_idx > end_row_idx) {
        console.log("end_row_idx is " + end_row_idx);
        console.log("rows[end_row_idx] is " + rows[end_row_idx]);
        console.log("parent of it is " + rows[end_row_idx].parentNode);
        rows[end_row_idx].parentNode.insertBefore(rows[dragging_row_idx], rows[end_row_idx]);
    }
    else {
        rows[end_row_idx].parentNode.insertBefore(rows[dragging_row_idx], rows[end_row_idx].nextSibling);
    }

    
    list.parentNode.removeChild(list);
    table.style.removeProperty('display');
    //table.style.removeProperty('visibility');
    drag_started = false;
    //list.innerHTML = "";


};

//global -- move this to the top
var drag_started = false;
var dragging_el;
var dragging_row_idx;
var x = 0;
var y = 0;
var placeholder;
var table_bounding_rect;
var header_size;

function swap(nodeA, nodeB) {
    const pA = nodeA.parentNode;
    const sA = nodeA.nextSibling ===nodeB ? nodeA : nodeA.nextSibling;

    nodeB.parentNode.insertBefore(nodeA, nodeB);
    pA.insertBefore(nodeB, sA);
}

function isAbove(nA, nB) {
    const rA = nA.getBoundingClientRect();
    const rB = nB.getBoundingClientRect();
    return rA.top + rA.height/2 < rB.top + rB.height/2;
}



function mouseMoveHandler(e) {
    if (!drag_started) {
        drag_started = true;
        clone_table();

        dragging_el = [].slice.call(list.children)[dragging_row_idx];

        //create placeholder
        placeholder = document.createElement("div");
        placeholder.classList.add("placeholder");
        dragging_el.parentNode.insertBefore(placeholder, dragging_el.nextSibling);
        placeholder.style.height = `${dragging_el.offsetHeight}px`;
    }

    dragging_el.style.position = 'absolute';
    
    //get table position

    let table = document.getElementById("course-table");
    let y_min = header_size;//list.getBoundingClientRect().top;

    let y_max = table_bounding_rect.bottom;//list.getBoundingClientRect().bottom;

    let y_new =dragging_el.offsetTop + e.clientY -y;
    console.log("y min is " + y_min);
    console.log("y max is " + y_max);
    console.log("y cur is " + y_new);
    y_new = (y_new < y_min) ? y_min : ((y_new > y_max )? y_max : y_new);

    dragging_el.style.top = `${y_new}px`;
    //dragging_el.style.left = `${dragging_el.offsetLeft + e.clientX }px`;
    dragging_el.classList.add("dragging");

    x = e.clientX;
    y = e.clientY;
    const prev = dragging_el.previousElementSibling;
    const next_el = placeholder.nextElementSibling;

    if (prev && prev.previousElementSibling && isAbove(dragging_el, prev)) {
        swap(placeholder, dragging_el);
        swap(placeholder, prev);
    }
    
    if (next_el && isAbove(next_el, dragging_el)) {
        swap(next_el, placeholder);
        swap(next_el, dragging_el);
    }

};

var list;
function clone_table() {
    const table = document.getElementById("course-table") ;
    const rect = table.getBoundingClientRect();

    const width = parseInt(window.getComputedStyle(table).width);

    list = document.createElement('div');
    //list.style.visibility = 'hidden';

    list.style.positon = 'absolute';
    list.style.left = `${rect.left}px`;
    list.style.top = `${rect.top}px`;

    table.parentNode.insertBefore(list, table);
    //table.style.visibility = 'hidden';
    


    //clone all elements of table
    //make a table w one row for each row in the original table -- makes easier to see while dragging
    table.querySelectorAll('tr').forEach(function(row) {
        const item = document.createElement('div');
        const new_table = document.createElement('table');
        const newRow = document.createElement('tr');

        new_table.style.width = `${width}px`;

        [].slice.call(row.children).forEach(function(cell) {
            const new_cell = cell.cloneNode(true);
            new_cell.style.width = `${parseInt(window.getComputedStyle(cell).width)}px`;
            new_cell.style.minWidth = new_cell.style.width;
            newRow.append(new_cell);
           
        });

        new_table.appendChild(newRow);
        item.appendChild(new_table);
        list.appendChild(item);

        new_table.appendChild(newRow);
    });
    table.style.display = 'none';
    

}

function mouseDownHandler(e) {
    const table = document.getElementById("course-table");
    const original_row = e.target.parentNode;
    dragging_row_idx = [].slice.call(table.querySelectorAll('tr')).indexOf(original_row);//where it is in the table
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);

    x = e.clientX;
    y = e.clientY;

    table_bounding_rect = table.getBoundingClientRect();
    header_size = document.getElementById("table_header").getBoundingClientRect().top;

   

}
 

function make_table_draggable() {
   
}

function setup_page(){
    make_table_draggable();
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

    make_draggable(row);
    clear_popup();
}
//https://htmldom.dev/drag-and-drop-table-row/
function make_draggable(row_element) {
    console.log("row element is " + row_element);
    const first_cell = row_element.firstElementChild;
    first_cell.classList.add("draggable");
    first_cell.addEventListener("mousedown", mouseDownHandler);


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