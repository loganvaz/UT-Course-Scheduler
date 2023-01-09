window.onload = click_registration();

//if registration page opens a minute late, we would make a maximum of 105 requests (based on linear timeout increase)
const MAX_REQUESTS = 200;

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
                setTimeout(() => {
                    window.location.href = "https://utdirect.utexas.edu/registration/chooseSemester.WBX";
                }, 300+5*registration_progress.registration_progress["num_requests"].num_requests);
                return;
            }
            submit_button[0].click();
        });
        
    });
}