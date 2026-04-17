var table_titles;
var time_save_timer = null;
var courses_save_timer = null;

document.addEventListener("DOMContentLoaded", function () {
  setup_page();
  chrome.storage.sync.get(
    ["global_alarm", "registration_semester"],
    function (data) {
      if (data.global_alarm !== undefined) {
        set_displayed_time(data.global_alarm);
      } else {
        // show empty datetime so user can pick one; set min to now
        document.getElementById("registration-time").value = "";
        document.getElementById("registration-time").min = new Date(Date.now())
          .toISOString()
          .slice(0, 16);
      }

      const defaultSem =
        data.registration_semester === undefined
          ? "Fall"
          : data.registration_semester;
      document.getElementById("registration-semester").value = defaultSem;

      attach_time_listeners();
      update_warnings();
    },
  );

  table_titles = [];
  [].slice
    .call(document.getElementById("table-header").rows[0].cells)
    .forEach((cell) => {
      table_titles.push(cell.innerText);
    });
});

function get_listed(has_cells) {
  let list_of_cells = has_cells.cells;
  var to_ret = {};
  [].slice.call(list_of_cells).forEach((cell, idx) => {
    if (table_titles[idx] != "Actions") {
      to_ret[table_titles[idx]] = cell.innerText;
    }
  });
  return to_ret;
}

function store_table() {
  var table_rows = document.getElementById("course-table-body").rows;
  var saved_registration = [];
  [].slice.call(table_rows).forEach((row) => {
    saved_registration.push(get_listed(row));
  });
  set_courses_status("saving", "Saving…");
  try {
    chrome.storage.sync
      .set({ saved_registration: saved_registration })
      .then(() => {
        set_courses_status("saved", "Saved ✓");
        update_warnings();
      })
      .catch((err) => {
        set_courses_status("error", "Error saving: " + err.message);
      });
  } catch (err) {
    set_courses_status("error", "Error saving: " + err.message);
  }
}

// Called by table mutation helpers; debounced to coalesce rapid edits (e.g. reorder).
function autosave_courses() {
  if (courses_save_timer) clearTimeout(courses_save_timer);
  set_courses_status("saving", "Saving…");
  courses_save_timer = setTimeout(() => {
    courses_save_timer = null;
    store_table();
  }, 250);
}

function setup_page() {
  const addRowButton = document.getElementById("add-row-button");
  addRowButton.addEventListener("click", function () {
    document.getElementById("course-popup-title").innerText = "Add Class";
    coursePopup.style.display = "block";
    document.getElementById("course-popup-backdrop").style.display = "block";
  });

  const coursePopup = document.getElementById("course-popup");

  const saveButton = document.getElementById("save-button");
  saveButton.addEventListener("click", save_class);
  const closeButton = document.getElementById("close-button");
  closeButton.addEventListener("click", clear_popup);
  const cancelButton = document.getElementById("cancel-button");
  cancelButton.addEventListener("click", clear_popup);
  document
    .getElementById("course-popup-backdrop")
    .addEventListener("click", clear_popup);
}

function attach_time_listeners() {
  const timeInput = document.getElementById("registration-time");
  const semInput = document.getElementById("registration-semester");
  timeInput.addEventListener("change", autosave_time);
  timeInput.addEventListener("input", autosave_time);
  semInput.addEventListener("change", autosave_time);
}

function autosave_time() {
  if (time_save_timer) clearTimeout(time_save_timer);
  set_time_status("saving", "Saving…");
  time_save_timer = setTimeout(() => {
    time_save_timer = null;
    save_time_now();
  }, 300);
}

function save_time_now() {
  const value = document.getElementById("registration-time").value;
  const semester = document.getElementById("registration-semester").value;

  if (!value) {
    // No time entered: clear any existing alarm, leave semester alone.
    chrome.storage.sync.remove("global_alarm").then(() => {
      chrome.alarms.clear("registration_alarm", () => {});
      update_registration_semester(semester);
      set_time_status("error", "No registration time set");
      update_warnings();
    });
    return;
  }

  const new_date = new Date(value);
  if (isNaN(new_date.getTime())) {
    set_time_status("error", "Invalid time");
    return;
  }
  if (new_date.getTime() <= Date.now()) {
    // Persist semester but don't schedule past alarm; surface the error.
    update_registration_semester(semester);
    chrome.storage.sync.remove("global_alarm").then(() => {
      chrome.alarms.clear("registration_alarm", () => {});
      set_time_status("error", "Registration time must be in the future");
      update_warnings();
    });
    return;
  }

  update_registration_semester(semester);
  update_alarm_data(new_date.getTime(), () => {
    set_time_status("saved", "Saved ✓");
    update_warnings();
  });
}

function set_displayed_time(date_init) {
  var now = new Date(date_init);
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById("registration-time").value = now
    .toISOString()
    .slice(0, 16);
  document.getElementById("registration-time").min = new Date(Date.now())
    .toISOString()
    .slice(0, 16);
}

function update_alarm_data(new_date, cb) {
  chrome.storage.sync
    .set({ global_alarm: new_date })
    .then(() => {
      chrome.storage.sync.get(["global_alarm"], function (data) {
        chrome.alarms.create("registration_alarm", { when: data.global_alarm });
        if (cb) cb();
      });
    })
    .catch((err) => {
      set_time_status("error", "Error saving: " + err.message);
    });
}

function update_registration_semester(semester) {
  if (semester !== "Spring" && semester !== "Summer" && semester !== "Fall") {
    console.error("Invalid semester");
    return;
  }
  chrome.storage.sync.set({ registration_semester: semester });
}

function set_courses_status(kind, text) {
  const el = document.getElementById("courses-save-status");
  if (!el) return;
  el.className = "save-status " + kind;
  el.innerText = text;
}

function set_time_status(kind, text) {
  const el = document.getElementById("time-save-status");
  if (!el) return;
  el.className = "save-status " + kind;
  el.innerText = text;
}

function update_warnings() {
  const banner = document.getElementById("warning-banner");
  const list = document.getElementById("warning-banner-list");
  const text = document.getElementById("warning-banner-text");
  if (!banner) return;

  const problems = [];

  const rows = document.getElementById("course-table-body").rows;
  if (!rows || rows.length === 0) {
    problems.push(
      "You haven't added any classes yet — add at least one class below.",
    );
  }

  const timeVal = document.getElementById("registration-time").value;
  if (!timeVal) {
    problems.push(
      "No registration time set — enter your registration time below.",
    );
  } else {
    const t = new Date(timeVal);
    if (isNaN(t.getTime())) {
      problems.push("Registration time is invalid.");
    } else if (t.getTime() <= Date.now()) {
      problems.push(
        "Registration time is in the past — update it to a future time.",
      );
    }
  }

  // empty-state hint
  const emptyHint = document.getElementById("courses-empty-hint");
  if (emptyHint) {
    emptyHint.style.display = !rows || rows.length === 0 ? "block" : "none";
  }

  if (problems.length === 0) {
    banner.style.display = "none";
    return;
  }
  banner.style.display = "block";
  list.innerHTML = "";
  text.innerText = problems.length === 1 ? "" : "You have a few things to fix.";
  if (problems.length === 1) {
    list.innerHTML = "<li>" + escape_html(problems[0]) + "</li>";
  } else {
    problems.forEach((p) => {
      const li = document.createElement("li");
      li.innerText = p;
      list.appendChild(li);
    });
  }
}

function escape_html(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}
