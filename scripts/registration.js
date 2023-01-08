window.addEventListener ("load", load_register_vars, false);

const MAX_REQUESTS = 200;

async function load_register_vars(){
    //get the previous registration action
    chrome.storage.session.get(["working_registration_copy"]).then((registration_table) => {
        chrome.storage.session.get(["registration_progress"]).then((registration_progress) => {
            if(typeof registration_progress.registration_progress === 'undefined'){
                //not currently registering
                console.log("not currently registering!");
                return;
            }
            
            register(registration_table.working_registration_copy, registration_progress.registration_progress).catch((err) => {
                console.log("ERROR: "+err);
                //something went wrong registering for class, just move on to next action
                write_log("ERROR: "+err+", previous action: "+registration_progress.registration_progress["prev_action"]).then(() => {
                    // registration_progress.registration_progress["course_index"]++;
                    update_registration_progress(registration_progress.registration_progress).then(() => {
                        window.location.href = "https://utdirect.utexas.edu/registration/chooseSemester.WBX";
                    });           
                });
            });
        });
    }); 
}

async function register(registration_table, registration_progress){
    console.log("NUM REQUESTS: "+registration_progress["num_requests"]);
    if(registration_progress["num_requests"]++ >= MAX_REQUESTS){
        cleanup_registration();
        alert("Ending Registration, maximum requests exceeded");
        return;
    }
    await update_registration_progress(registration_progress);


    // await write_log("Loaded registration page, previous action was: "+registration_progress["prev_action"]+", table index: "+registration_progress["table_index"]+", course index: "+registration_progress["course_index"]);
    //if this is the first action just add a class
    if(registration_progress["prev_action"] == "none"){
        const course_code = get_course_code(registration_table, registration_progress);
        //UPDATE STATE
        registration_progress["prev_action"] = "add";
        await update_registration_progress(registration_progress);
        // await write_log("About to add class!");
        await add_class(course_code);
        return;
    }
    //get state of page
    const page_state = await read_add_response();
    console.log("table index: "+registration_progress["table_index"]+", course index: "+registration_progress["course_index"]);

    //if previous action is waitlist, always try to add an alternate, regardless of success/failure
    if(registration_progress["prev_action"] == "waitlist"){
        await add_next_alternate(registration_table, registration_progress);
        return;
    }
    //previously we tried to add a class, either the main or alternate
    if(registration_progress["prev_action"] == "add"){
        //we successfully added class
        if(page_state["success"]){
            //previous action was add (add course code or alternate)
            //add delimeter
            await write_log("\1");
            registration_progress["table_index"]++;
            registration_progress["course_index"] = -1;
            await update_registration_progress(registration_progress);
            await add_class(get_course_code(registration_table, registration_progress));
            return;
        }
        else {
            //if we failed an add of main course code, try waitlist if requested
            if(registration_progress["course_index"] == -1){
                //attempt waitlist if possible
                if(registration_table[registration_progress["table_index"]]["Waitlist"]){
                    if(page_state["waitlist"]){
                        registration_progress["prev_action"] = "waitlist";
                        await update_registration_progress(registration_progress);
                        await write_log("Waitlisting class!");
                        console.log("Should be waitlisting!");
                        waitlist_class();
                    }
                    else {
                        await write_log("No waitlist available!");
                        await add_next_alternate(registration_table, registration_progress);
                    }
                }
                else {
                    await add_next_alternate(registration_table, registration_progress);
                }
            }
            else {
                //failed to add alternate
                await add_next_alternate(registration_table, registration_progress);
                return;
            }
        }
    }
}

async function write_log(message){
    await chrome.storage.session.get(["registration_log"]).then((log_msg) => {
        chrome.storage.session.set({"registration_log": log_msg.registration_log+"\n"+message});
    });
}

async function print_log(){
    await chrome.storage.session.get(["registration_log"]).then((log_msg) => {
        console.log(log_msg.registration_log);
    });
}

async function get_log(){
    var log_res = "";
    await chrome.storage.session.get(["registration_log"]).then((log_msg) => {
        log_res = log_msg.registration_log;
    });
    return log_res;
}

async function get_table(){
    var res = "";
    await chrome.storage.session.get(["working_registration_copy"]).then((registration_table)=>{
        res = registration_table.working_registration_copy;
    });
    return res;
}

async function update_registration_progress(registration_progress){
    await chrome.storage.session.set({ "registration_progress": registration_progress}).then(() => {
        return registration_progress;
    });
}

//returns the course code of the class we're trying to add (could be alternate)
function get_course_code(registration_table, registration_progress){
    if(registration_progress["table_index"] >= registration_table.length){
        return -1;
    }
    if(registration_progress["course_index"] == -1){
        return registration_table[registration_progress["table_index"]]["Course code"];
    } else {
        let alt_courses = registration_table[registration_progress["table_index"]]["Alternate Courses"];
        if(alt_courses.length == 0 || registration_progress["course_index"] >= alt_courses.length){
            return -1;
        }
        return alt_courses[registration_progress["course_index"]];
    }
}

function finish_registration(){
    write_log("Finished registration!").then(() => {
        print_log().then(() => {
            //save a copy of log to permanent storage
            get_log().then((log) => {
                chrome.storage.sync.set({"last_registration_log": log}).then(() => {
                    get_table().then((table)=>{
                        chrome.storage.sync.set({"last_registration_table": table}).then(()=>{
                            cleanup_registration();
                        });
                    }); 
                });
            });
        });
    });
    alert("Finished registration!");
    (async () => {
        const response = await chrome.runtime.sendMessage({finished: true});
    })();
      
}

async function add_class(unique_num){
    if(unique_num == -1){
        finish_registration();
        return;
    }
    await write_log("Attempting to add class: "+unique_num);
    assert_equals(unique_num.length, 5);
    //select add radio button
    const add_radio = document.getElementById("ds_request_STADD");
    if(add_radio == null){
        console.error("add_radio is null!");
    }
    assert_not_equals(add_radio, null);
    add_radio.click();
    //enter unique num
    const add_unique_input = document.getElementById("s_unique_add");
    assert_not_equals(add_unique_input, null);
    // add_unique_input.defaultValue = unique_num;
    add_unique_input.value = unique_num;
    //press submit
    const submit_button = document.getElementsByName("s_submit");
    assert_equals(submit_button.length, 1);
    submit_button[0].click();    
}

async function add_next_alternate(registration_table, registration_progress){
    //now try to add alternates
    registration_progress["course_index"]++;
    const alt_course_code = get_course_code(registration_table, registration_progress);
    if(alt_course_code != -1){
        //have more alternates to try
        registration_progress["prev_action"] = "add";
        await update_registration_progress(registration_progress);
        console.log("Alternate course code: "+alt_course_code);
        await add_class(alt_course_code);
        return;
    }
    //no alternates left, so move onto next class
    //add delimeter in log
    await write_log("\1");
    registration_progress["table_index"]++;
    registration_progress["course_index"] = -1;
    registration_progress["prev_action"] = "add";
    await update_registration_progress(registration_progress);
    await add_class(get_course_code(registration_table, registration_progress));
}

function waitlist_class(){
    const waitlist = document.getElementById("s_request_STAWL");
    assert_not_equals(waitlist, null);
    //s_waitlist_swap_unique use to select class to swap if added to waitlist
    waitlist.click();
    //press submit
    const submit_button = document.getElementsByName("s_submit");
    assert_equals(submit_button.length, 1);
    submit_button[0].click();
}

async function read_add_response(){
    //get response message
    const message = document.getElementById("n_message");
    assert_not_equals(message, null);
    const message_text = message.innerText;
    if(message_text.includes("Please select a registration action.")){
        //haven't added any classes yet
        return {"no_class":true};
    }
    //check if error class exists, if it doesn't, we added class successfully
    const err = document.getElementsByClassName("error");
    if(err == null || err.length == 0){
        // console.log("Added class!");
        await write_log("\5\7"+message_text+"\5");
        return {"success": true, "response": message_text};
    }
    //check if waitlist radio exists, if it does, we can add this class to waitlist if needed
    const waitlist = document.getElementById("s_request_STAWL");
    await write_log("\5"+message_text+"\5");
    return {"success": false, "waitlist": waitlist != null, "response": message_text};
}

function cleanup_registration(){
    chrome.storage.session.remove(["working_registration_copy", "registration_progress", "registration_log", "num_requests"], function(){
        chrome.storage.sync.remove(["global_alarm"], ()=>{});  
    });
}

//checks if two variables are equal, throws error if they aren't
function assert_equals(a, b){
    //TODO actually print variable names or something useful
    //strict equality
    if(a !== b){
        throw new Error("Failed assertion "+ (a ? a :"null") +" and "+(b ? b : "null")+ " should be equal");
    }   
}

//checks if two variables are not equal, throws error if they aren't
function assert_not_equals(a, b){
    //TODO actually print variable names or something useful
    //strict equality
    if(a === b){
        throw new Error("Failed assertion "+(a ? a: "null")+" and "+(b ? b : "null")+" should not be equal");
    }
}