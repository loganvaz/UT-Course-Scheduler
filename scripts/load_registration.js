// import { assert_equals, assert_not_equals } from "./helpers";
window.onload = click_registration();

function click_registration(){
    //returns node list of objects with matching name
    const submit_button = document.getElementsByName("submit"); 
    if(submit_button == null || submit_button.length != 1){
        throw new Error("Uh oh...looks like I ran on the wrong page or there is some weird formatting. Try again later :)? Number of submit buttons is "+submit_button.length);
    }

    //click the "submit" button to enter into registration section
    submit_button[0].click();

    //TODO: add waiting logic to make sure the URL we're redirected to is loaded
    // document.addEventListener('DOMContentLoaded', verify_registration_page());
}