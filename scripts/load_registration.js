window.onload = click_registration();

function click_registration(){
    //returns node list of objects with matching name
    const submit_button = document.getElementsByName("submit"); 
    if(submit_button == null || submit_button.length != 1){
        throw new Error("Uh oh...looks like I ran on the wrong page or there is some weird formatting. Try again later :)? Number of submit buttons is "+submit_button.length);
    }

    //click the "submit" button to enter into registration section
    submit_button[0].click();

    //verify that we are in the registration page
    const page_title_div = document.getElementById("pgTitle");
    if(page_title_div == null){
        throw new Error("Clicked submit but failed to load into valid regsitration page!");
    }
    //verify that the page title div only has one child element which is of type h1
    console.assert(page_title_div.childNodes.length == 1);
    console.assert(page_title_div.childNodes.item(0).textContent.includes("Registration"));
    //TODO maybe verify that the URL is https://utdirect.utexas.edu/registration/registration.WBX instead? 

    console.log("I should now be in the registration page, having clicked the semester selector!");
}


function manage_registration(){
    console.log("Managed Registration!!");
}