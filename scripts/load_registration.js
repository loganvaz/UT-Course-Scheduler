// import { assert_equals, assert_not_equals } from "./helpers";
window.onload = click_registration();

//if registration page opens a minute late, we would make a maximum of 105 requests (based on linear timeout increase)
const MAX_REQUESTS = 200;

function click_registration(){
    chrome.storage.session.get(["registration_progress"]).then((registration_progress) => {
        if(typeof registration_progress.registration_progress === 'undefined'){
            //not currently registering
            console.log("Not registering!");
            return;
        }
        chrome.storage.session.get(["num_requests"]).then((num_requests) => {
            if(num_requests.num_requests >= MAX_REQUESTS){
                alert("Ending Registration, Can't Enter Portal");
                return;
            }
            chrome.storage.session.set({"num_requests": num_requests.num_requests+1}).then(()=>{
                //returns node list of objects with matching name
                const submit_button = document.getElementsByName("submit"); 
                //TODO 
                if(submit_button == null || submit_button.length != 1){
                    setTimeout(() => {
                        window.location.href = "https://utdirect.utexas.edu/registration/chooseSemester.WBX";
                    }, 300+5*num_requests.num_requests);
                    return;
                    // throw new Error("Uh oh...looks like I ran on the wrong page or there is some weird formatting. Try again later :)? Number of submit buttons is "+submit_button.length);
                }
                submit_button[0].click();
            });
        })
        
        //TODO: add waiting logic to make sure the URL we're redirected to is loaded
    });
}