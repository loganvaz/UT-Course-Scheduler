document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("faq").addEventListener("click", () => {
    window.open("../htmls/faq.html", "");
  });

  document.getElementById("log").addEventListener("click", () => {
    window.open("../htmls/log.html", "");
  });

  document.getElementById("dropbtn").addEventListener("click", () => {
    const dropdown = document.getElementById("dropdown-menu");
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  });

  chrome.storage.session.setAccessLevel({
    accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
  });

  var manage_button = document.getElementById("manage-button");
  manage_button.addEventListener("click", open_manage_registration);

  // Load state and render
  chrome.storage.sync.get(
    ["global_alarm", "registration_semester", "saved_registration"],
    function (data) {
      const hasTime =
        data.global_alarm !== undefined && data.global_alarm > Date.now();
      const pastTime =
        data.global_alarm !== undefined && data.global_alarm <= Date.now();

      if (data.global_alarm === undefined) {
        document.getElementById("registration-time").style.display = "none";
        document.getElementById(
          "registration-time-container",
        ).style.marginBottom = "1.5em";
        document
          .getElementById("no-registration-time")
          .style.removeProperty("display");
      } else {
        set_displayed_time(data.global_alarm);
      }
      if (data.registration_semester !== undefined) {
        document.getElementById("registration-time-label").innerText =
          "Registration Time for " + data.registration_semester;
      }

      const hasClasses =
        data.saved_registration !== undefined &&
        data.saved_registration.length > 0;
      if (!hasClasses) {
        document.getElementById("class-list-div").hidden = false;
      } else {
        let list_of_classes = document.getElementById("class-list");
        data.saved_registration.forEach((instance) => {
          let newest = document.createElement("div");
          newest.classList.add("centered");
          newest.classList.add("course_element");
          newest.innerText =
            instance["Course name"].trim() === ""
              ? instance["Course code"]
              : instance["Course name"] + " (" + instance["Course code"] + ")";
          list_of_classes.appendChild(newest);
        });
      }

      render_warning_banner({ hasTime, pastTime, hasClasses });
    },
  );
});

function render_warning_banner({ hasTime, pastTime, hasClasses }) {
  const banner = document.getElementById("warning-banner");
  const text = document.getElementById("warning-banner-text");
  const list = document.getElementById("warning-banner-list");
  const problems = [];

  if (!hasClasses)
    problems.push("No classes added — open Manage Registration to add some.");
  if (!hasTime && !pastTime)
    problems.push("No registration time set — set one in Manage Registration.");
  if (pastTime) problems.push("Registration time is in the past — update it.");

  if (problems.length === 0) {
    banner.style.display = "none";
    return;
  }
  banner.style.display = "block";
  text.innerText = problems.length === 1 ? "" : "You have a few things to fix.";
  list.innerHTML = "";
  if (problems.length === 1) {
    const li = document.createElement("li");
    li.innerText = problems[0];
    list.appendChild(li);
  } else {
    problems.forEach((p) => {
      const li = document.createElement("li");
      li.innerText = p;
      list.appendChild(li);
    });
  }
}

function set_displayed_time(date_init) {
  var now = new Date(date_init);
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById("registration-time").value = now
    .toISOString()
    .slice(0, 16);
}

function open_manage_registration() {
  chrome.tabs.create({ url: "htmls/manage_registration.html" });
}
