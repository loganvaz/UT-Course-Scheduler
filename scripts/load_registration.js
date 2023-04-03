window.onload = click_registration();

//allows up to a minute of retrying if can't enter registration
const MAX_REQUESTS = 70;

function click_registration(){
    chrome.storage.session.get(["registration_progress", "registration_semester"]).then((registration_progress) => {
        chrome.storage.sync.get(["registration_semester"]).then((data) => {
            console.log("registration progress: ", registration_progress)
            if(typeof registration_progress.registration_progress === 'undefined'){
                //not currently registering
                return;
            }
            
            if(registration_progress.registration_progress["num_requests"] >= MAX_REQUESTS){
                alert("Ending Registration, Can't Enter Portal");
                return;
            }
            registration_progress.registration_progress["num_requests"]++;
            const semester = data.registration_semester;
            if(semester === undefined){
                alert("No registration semester found");
                return;
            }
            console.log("clicking semester: "+semester);
            chrome.storage.session.set({"registration_progress": registration_progress.registration_progress}).then(()=>{
                const submit_buttons = document.getElementsByName("submit");
                //find submit button who's value is the semester
                let submit_button = null;
                for(let i = 0; i < submit_buttons.length; i++){
                    const curButton = submit_buttons[i];
                    const curButtonString = curButton.value.toLocaleLowerCase();
                    if(curButtonString.includes(semester.toLocaleLowerCase())){
                        submit_button = curButton;
                        break;
                    }
                }
                if(submit_button === null){
                    console.log("New set timeout: "+(300+15*registration_progress.registration_progress["num_requests"]));
                    setTimeout(() => {
                        window.location.href = "https://utdirect.utexas.edu/registration/chooseSemester.WBX";
                    }, 300+15*registration_progress.registration_progress["num_requests"]);
                    return;
                }
                registration_progress.registration_progress["num_requests"] = 0;
                chrome.storage.session.set({"registration_progress": registration_progress.registration_progress}).then(()=>{
                    submit_button.click();
                });
            });
        });
    });
}