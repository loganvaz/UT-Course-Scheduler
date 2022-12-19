chrome.alarms.onAlarm.addListener( (alarm) => {
    // console.log("alarm name: " + alarm.name);
    if(alarm.name == "registration_alarm"){
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
                chrome.storage.sync.remove(["global_alarm"]);     
            }
        );
    }
});