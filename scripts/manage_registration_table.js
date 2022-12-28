/*
Dragging rows in table based on: https://htmldom.dev/drag-and-drop-table-row/
*/

var drag_started = false;
var dragging_el;
var dragging_row_idx;
var x = 0;
var y = 0;
var placeholder;
var table_bounding_rect;
var header_size;
var list;


/*table indexes*/
const priority_idx = 0;
const course_name_idx = 1;
const course_code_idx = 2;
const course_waitlist_idx = 3;
const alternate_course_idx = 4;
const action_idx = 5;

function save_class(){
    const courseName = document.getElementById("course-name-input").value;
    const courseCode = document.getElementById("course-code-input").value;
    const waitlist = document.getElementById("waitlist-input").checked;
    const alternateCourses = document.getElementById("alternate-courses-input").value;

    //add row to course table
    const courseTableBody = document.getElementById("course-table-body");
    var rowVal = document.getElementById("add-edit").value;
    const edit_request = rowVal != "add";
    if(edit_request){
        courseTableBody.deleteRow(rowVal);
    }
    var row = courseTableBody.insertRow(edit_request ? rowVal : -1);

    var priorityTable = row.insertCell(priority_idx);
    priorityTable.innerHTML = "priority placeholder";
    var courseNameTable = row.insertCell(course_name_idx);
    courseNameTable.innerHTML = courseName;
    var courseCodeTable = row.insertCell(course_code_idx);
    courseCodeTable.innerHTML = courseCode;
    var waitlistTable = row.insertCell(course_waitlist_idx);
    waitlistTable.innerHTML = waitlist;
    var alternateCoursesTable = row.insertCell(alternate_course_idx);
    alternateCoursesTable.innerHTML = alternateCourses;
    var actionsTable = row.insertCell(action_idx);
    var flex_div = document.createElement("div");
    flex_div.classList.add("action-cell");
    actionsTable.appendChild(flex_div);
    // actionsTable.classList.add("action-cell");
    var editButton = document.createElement("input");
    editButton.type = "image";
    editButton.src = "../images/edit-pencil.svg";
    editButton.onclick = function(e) {
        e.target.parentNode.parentNode.parentNode.classList.add("selected_row");
        edit_row(e.target.parentNode.parentNode);
    };
    flex_div.appendChild(editButton);

    var deleteButton = document.createElement("input");
    deleteButton.type = "image";
    deleteButton.src = "../images/trash.svg";
    deleteButton.onclick = function(e) {
        document.getElementById("course-table").deleteRow(e.target.parentNode.parentNode.parentNode.rowIndex);
    };
    flex_div.appendChild(deleteButton);

    make_draggable(row);
    clear_popup();
    reset_priority();
}

function edit_row(cell){
    const row = cell.parentNode;
    document.getElementById("course-name-input").value = row.cells[course_name_idx].innerText;
    document.getElementById("course-code-input").value = row.cells[course_code_idx].innerText;
    document.getElementById("waitlist-input").checked = row.cells[course_waitlist_idx].innerText == "true";
    document.getElementById("alternate-courses-input").value = row.cells[alternate_course_idx].innerText;
    document.getElementById("add-edit").value = row.rowIndex-1;
    document.getElementById("registration-info").style.pointerEvents = "none";
    document.getElementById("course-popup").style.display = "block";
}

function clear_popup(){
    document.getElementById("course-name-input").value = "";
    document.getElementById("course-code-input").value = "";
    document.getElementById("waitlist-input").checked = false;
    document.getElementById("alternate-courses-input").value = "";
    document.getElementById("add-edit").value = "add";
    var selected_row = document.getElementsByClassName("selected_row");
    for(let e of selected_row){
        e.classList.remove("selected_row");
    }
    document.getElementById("registration-info").style.removeProperty("pointer-events");
    document.getElementById("course-popup").style.display = "none";
}

function make_draggable(row_element) {
    const first_cell = row_element.firstElementChild;
    first_cell.classList.add("draggable");
    first_cell.addEventListener("mousedown", mouseDownHandler);
}

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

function clone_table() {
    const table = document.getElementById("course-table") ;
    const rect = table.getBoundingClientRect();
    const width = parseInt(window.getComputedStyle(table).width);

    list = document.createElement('div');
    list.style.positon = 'absolute';
    list.style.left = `${rect.left}px`;
    list.style.top = `${rect.top}px`;

    table.parentNode.insertBefore(list, table);

    //clone all elements of table
    //make a table w one row for each row in the original table -- makes easier to see while dragging
    table.querySelectorAll('tr').forEach(function(row) {
        const item = document.createElement('div');
        const new_table = document.createElement('table');
        const newRow = document.createElement('tr');

        new_table.style.width = `${width}px`;
        newRow.style.backgroundColor = window.getComputedStyle(row).backgroundColor;

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
    const end_row_idx = [].slice.call(list.children).indexOf(dragging_el);
    let rows = [].slice.call(table.querySelectorAll('tr'));
    if (dragging_row_idx > end_row_idx) {
        rows[end_row_idx].parentNode.insertBefore(rows[dragging_row_idx], rows[end_row_idx]);
    }
    else {
        rows[end_row_idx].parentNode.insertBefore(rows[dragging_row_idx], rows[end_row_idx].nextSibling);
    }

    list.parentNode.removeChild(list);
    table.style.removeProperty('display');
    drag_started = false;


    //reset priority idx of table
    reset_priority();

};

function reset_priority() {
    var table_body = document.getElementById("course-table-body");
    var children = table_body.childNodes;
    console.log("children r " + children);

    [].slice.call(table_body.rows).forEach( (row, idx) => {
        console.log(row);
        row.cells[priority_idx].innerText = idx+1;
    });

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
    header_size = document.getElementById("table-header").getBoundingClientRect();
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
    let row_size = dragging_el.getBoundingClientRect();
    let y_min = header_size.top+header_size.height-row_size.height/2;

    let y_max = table_bounding_rect.bottom-row_size.height/2;

    let y_new =dragging_el.offsetTop + e.clientY -y;
    y_new = (y_new < y_min) ? y_min : ((y_new > y_max )? y_max : y_new);

    dragging_el.style.top = `${y_new}px`;
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