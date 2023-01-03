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

//credit: https://dev.to/avigoldman/open-a-new-tab-when-your-browser-extension-is-installed-7h7
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
      chrome.tabs.create({ url: "../htmls/faq.html"});
    }
});
  