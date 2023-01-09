window.onload = () => {
    chrome.storage.sync.get(["first_run"]).then((first_run) => {
        if(first_run.first_run){
            alert("Disclaimer: This tool is not affiliated with the University of Texas at Austin in any way. It is purely experimental and should be used at your own risk. The creators are not responsible in any way for any damages that may ensue including but not limited to: browser crashing, error with course registration, and irritation.")
            chrome.storage.sync.set({"first_run": false}).then(()=>{});
        }
    });
}