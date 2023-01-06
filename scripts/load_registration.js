// import { assert_equals, assert_not_equals } from "./helpers";
window.onload = click_registration();

function click_registration(){
    chrome.storage.session.get(["registration_progress"]).then((registration_progress) => {
        if(typeof registration_progress.registration_progress === 'undefined'){
            //not currently registering
            return;
        }
        //returns node list of objects with matching name
        const submit_button = document.getElementsByName("submit"); 
        //TODO 
        if(submit_button == null || submit_button.length != 1){
            throw new Error("Uh oh...looks like I ran on the wrong page or there is some weird formatting. Try again later :)? Number of submit buttons is "+submit_button.length);
        }
        submit_button[0].click();
        //TODO: add waiting logic to make sure the URL we're redirected to is loaded
    });
}