
window.onload = () => {
    const container = document.getElementById("container");
    // console.log("Container!: "+container);
    chrome.storage.sync.get(["last_registration_log"]).then((log_msg)=>{
        var log = log_msg.last_registration_log;
        if(log == undefined){
            var empty = document.createElement("h3");
            empty.innerText = "When you complete your registration, your results will be displayed here."
            empty.style.fontStyle = "italic";
            container.appendChild(empty);
            return;
        }
        chrome.storage.sync.get(["last_registration_table"]).then((last_table) => {
            var table = last_table.last_registration_table;
            var rows = log.split("\1");
            //remove last row since we have an extra one
            let last = rows.pop();
            console.log(last);
            console.log(rows);
            rows.forEach((course_row, index) => {
                var div = document.createElement('div');
                var h1 = document.createElement('h1');
                h1.innerText = table[index]["Course name"]+" ("+table[index]["Course code"]+")";
                h1.classList.add("info-page");
                div.appendChild(h1);

                var message_split = course_row.split("\5");
                var message_body = document.createElement("div");
                message_body.classList.add("info-body");
                message_split.forEach((message_frag, i) => {
                    var text = document.createElement('div');
                    text.classList.add("info-list");
                    text.innerText = message_frag;
                    if(i % 2 == 1){
                        //error or success message (there is never an error at i=0)
                        if(message_frag.charAt(0) === '\7'){
                            text.style.color = "green";
                            message_frag = message_frag.slice(1);
                            text.innerText = message_frag;
                        } else {
                            text.style.color = "red";
                        }
                    }

                    message_body.appendChild(text);
                });
                div.appendChild(message_body);
                container.appendChild(div);
                var hr_line = document.createElement('hr');
                hr_line.classList.add("hr-line");
                container.appendChild(hr_line);



            });
    
            //adding event listeners
            var faq = document.getElementsByClassName("info-page");
            var i;
    
            for (i = 0; i < faq.length; i++) {
                faq[i].addEventListener("click", function () {
                    /* Toggle between adding and removing the "active" class,
                    to highlight the button that controls the panel */
                    this.classList.toggle("active");
    
                    /* Toggle between hiding and showing the active panel */
                    var body = this.nextElementSibling;
                    if (body.style.display === "block") {
                        body.style.display = "none";
                    } else {
                        body.style.display = "block";
                    }
                });
            }
        });
    });
}

