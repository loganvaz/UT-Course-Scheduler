window.addEventListener ("load", register, false);

function register(){
    //read the state of the last class that was added, weird design pattern due to pressing submit restarting the script
    const response = read_add_response();
    if(!("no_class" in response)){
        console.log(response["response"]);
        if("waitlist" in response && response["waitlist"]){
            //TODO check if we want to waitlist this class
            const waitlist = document.getElementById("s_request_STAWL");
            assert_not_equals(waitlist, null);
            //s_waitlist_swap_unique use to select class to swap if added to waitlist
            waitlist.click();
            //press submit
            const submit_button = document.getElementsByName("s_submit");
            assert_equals(submit_button.length, 1);
            submit_button[0].click();
            console.log("Added to waitlist!");
            return;
        }
    }

    //load class queue and 'pop' front element
    chrome.storage.session.get(["class_queue"]).then((result) => {
        const class_queue = result.class_queue;
        if(class_queue == null || class_queue.length == 0){
            chrome.storage.session.remove("class_queue");
            return;
        }
        const cur_class = class_queue[0];
        class_queue.splice(0, 1);
        //update queue
        console.log("shifting class queue\n");
        console.log(class_queue);
        chrome.storage.session.set({ "class_queue": class_queue}).then(() => {
            console.log("*adding class "+cur_class);
            add_class(cur_class);
        });
    });
}

function add_class(unique_num){
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

function read_add_response(){
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
        console.log("Added class!");
        return {"success": true, "response": message_text};
    }
    //check if waitlist radio exists, if it does, we can add this class to waitlist if needed
    const waitlist = document.getElementById("s_request_STAWL");
    console.log("Failed to add class!");
    return {"success": false, "waitlist": waitlist != null, "response": message_text};
}

//checks if two variables are equal, throws error if they aren't
function assert_equals(a, b){
    //TODO actually print variable names or something useful
    //strict equality
    if(a !== b){
        throw new Error("Failed assertion "+ (a ? a :"null") +" and "+(b ? b : "null")+ "should be equal");
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