chrome.alarms.onAlarm.addListener( (alarm) => {
    console.log("ALARM WENT OFF");
    if(alarm.name == "registration_alarm"){
        //LOAD CLASSES
        //loading working copy of the saved registration table
        chrome.storage.sync.get(["saved_registration"]).then((registration_table) => {
            // var reg_table = registration_table.saved_registration;
            // [].slice.call(reg_table.cells).forEach((cell, idx) => {
            //     if (table_titles[idx] != "Actions"){
            //         if (table_titles[idx] == "Alternate Courses") {
            //             if(cell.innerText == "")
            //             to_ret[table_titles[idx]] = cell.innerText.split(",").map(Number);
            //         }
            //         else if (table_titles[idx] == "Waitlist") {
            //             to_ret[table_titles[idx]] = cell.innerText == "true" || cell.innerText == "yes";
            //         }
            //         else {
            //             to_ret[table_titles[idx]] = cell.innerText;
            //         }
            //     }
            // });

            chrome.storage.session.set({"working_registration_copy": registration_table.saved_registration }).then(() => {
                //initialize index of current row we're working on
                chrome.storage.session.set({ "registration_progress" : {"table_index": 0, "course_index": -1, "is_registering": true, "prev_action": "none"}}).then(() => {
                    chrome.storage.session.set({"registration_log": ""}).then(() => {
                        //open tab with registration page when alarm goes off
                        chrome.tabs.create(
                            {
                                "url": "https://utdirect.utexas.edu/registration/chooseSemester.WBX"
                            }
                        );
                        //remove alarm after it's been triggered
                        chrome.alarms.clear(
                            "registration_alarm",
                            () => {
                                //TODO remove alarm when done registering
                                //chrome.storage.sync.remove(["global_alarm"]);     
                            }
                        );
                        console.log("FIRST CLASS TO REGISTER FOR: "+registration_table.saved_registration[0]["Course name"]);
                    });
                });
            });
        });
    }
});

//credit: https://dev.to/avigoldman/open-a-new-tab-when-your-browser-extension-is-installed-7h7
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
      chrome.tabs.create({ url: "../htmls/faq.html"});
    }
});
  