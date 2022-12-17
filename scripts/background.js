chrome.alarms.onAlarm.addListener( (alarm) => {
    chrome.tabs.create(
        {
            "url": "https://utdirect.utexas.edu/registration/chooseSemester.WBX"
        }
    );
}
);