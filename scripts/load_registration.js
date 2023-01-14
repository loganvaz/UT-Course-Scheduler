window.onload = click_registration();

//allows up to a minute of retrying if can't enter registration
const MAX_REQUESTS = 70;

function click_registration(){
    chrome.storage.session.get(["registration_progress"]).then((registration_progress) => {
        if(typeof registration_progress.registration_progress === 'undefined'){
            //not currently registering
            return;
        }
        
        if(registration_progress.registration_progress["num_requests"] >= MAX_REQUESTS){
            alert("Ending Registration, Can't Enter Portal");
            return;
        }
        registration_progress.registration_progress["num_requests"]++;
        chrome.storage.session.set({"registration_progress": registration_progress.registration_progress}).then(()=>{
            const submit_button = document.getElementsByName("submit"); 
            if(submit_button == null || submit_button.length != 1){
                console.log("New set timeout: "+(300+15*registration_progress.registration_progress["num_requests"]));
                setTimeout(() => {
                    window.location.href = "https://utdirect.utexas.edu/registration/chooseSemester.WBX";
                }, 300+15*registration_progress.registration_progress["num_requests"]);
                return;
            }
            registration_progress.registration_progress["num_requests"] = 0;
            chrome.storage.session.set({"registration_progress": registration_progress.registration_progress}).then(()=>{
                submit_button[0].click();
            });
        });
        
    });
}