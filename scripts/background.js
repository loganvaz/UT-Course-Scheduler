chrome.alarms.onAlarm.addListener( (alarm) => {
    console.log("ALARM WENT OFF");
    if(alarm.name == "registration_alarm"){
        //LOAD CLASSES
        //loading working copy of the saved registration table
        chrome.storage.sync.get(["saved_registration"]).then((registration_table) => {
            let reg_table = registration_table.saved_registration;
            reg_table = reg_table.map( (row) => {
                row["Alternate Courses"] = row["Alternate Courses"].split(",").map((e) => e.trim());
                if(row["Alternate Courses"] == 0){
                    row["Alternate Courses"] = [];
                }
                row["Waitlist"] = row["Waitlist"] == "true" || row["Waitlist"] == "yes";
                return row;
            });

            console.log("reg_table is " + reg_table + " alt courses r " + reg_table[0]["Alternate Courses"]);

            chrome.storage.session.set({"working_registration_copy": registration_table.saved_registration }).then(() => {
                //initialize index of current row we're working on
                chrome.storage.session.set({ "registration_progress" : {"table_index": 0, "course_index": -1, "is_registering": true, "prev_action": "none", "num_requests": 0}}).then(() => {
                    chrome.storage.session.set({"registration_log": "Log:\n\n"}).then(() => {
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
  