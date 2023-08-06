var count = 0;
var calendar;


document.addEventListener("DOMContentLoaded", function () {
  holidayInit();
  getRemainingHolidays();
  getPersonalHolidaysList();
  getAllHolidayList();
  var calendarEl = document.getElementById('calendar');
  calendar = new myFullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth'
  });
  calendar.render();
});



// test function. called on page load
function holidayInit() {
  document
    .getElementById("holidayForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      var startDate = document.getElementById("start-date").value;
      var endDate = document.getElementById("end-date").value;
      var comment = document.getElementById("comment").value;
      bookHoliday(startDate, endDate, comment);
    });
}
async function getRemainingHolidays() {
  const response = await fetch("/api/remaining_holiday");
  const remainingHoliday = await response.json(); // Assuming the API returns JSON data
  console.log(remainingHoliday);
  document.getElementById("holidays-remaining").innerHTML =
    remainingHoliday.remaining_holiday;
}


// Checks if the requested holiday overlaps with any other holidays
async function isHolidayOverlap(startDatei, endDatei) {
  // Iterate through each booked holiday
  var bookedHolidays = await getAllHolidayList();
  var startDate = new Date(startDatei);
  var endDate = new Date(endDatei);

  // If there are no holidays booked, return false immediately
  if (bookedHolidays.length < 1) {
    return false;
  }
  //loop through all holidays in the database
  for (let i = 0; i < bookedHolidays.length; i++) {
    var holidayStart = new Date(bookedHolidays[i].start_date);
    var holidayEnd = new Date(bookedHolidays[i].end_date);
    // Check if and of the dates in the input range are between the start and end of any other booked holiday
    if (
      startDate.getTime() <= holidayEnd.getTime() &&
      endDate.getTime() >= holidayStart.getTime()
    ) {
      return true;
    }
  }

  // If no holidays overlap, return false
  return false;
}

async function hasEnoughRemainingHoliday(startDatei, endDatei) {
  count = 0;
  const response = await fetch("/api/remaining_holiday");
  const temp = await response.json();
  var remainingHoliday = temp.remaining_holiday // Assuming the API returns JSON data
  console.log("Remaining Holiday:", remainingHoliday);

  // Check the working days from the API response
  const response2 = await fetch("/api/workingDays");
  const workingDays = await response2.json(); // Assuming the API returns JSON data
  var mon = workingDays.workingDays.charAt(0) === "1";
  var tue = workingDays.workingDays.charAt(1) === "1";
  var wed = workingDays.workingDays.charAt(2) === "1";
  var thu = workingDays.workingDays.charAt(3) === "1";
  var fri = workingDays.workingDays.charAt(4) === "1";

  console.log("Working Days:", workingDays);

  // Loop through all the days between the start and end date to check if they are working days
  var startDate = new Date(startDatei);
  var endDate = new Date(endDatei);

  for (var d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    if (
      (d.getDay() === 1 && mon) ||
      (d.getDay() === 2 && tue) ||
      (d.getDay() === 3 && wed) ||
      (d.getDay() === 4 && thu) ||
      (d.getDay() === 5 && fri)
    ) {
      count++;
    }
  }

  console.log("Working Days Count:", count);

  if (count <= remainingHoliday) {
    console.log("Has Enough Remaining Holiday: true");
    return remainingHoliday-count;
  } else {
    console.log("Has Enough Remaining Holiday: false");
    return -1;
  }
}

// checks if the requested holiday is valid
async function bookHoliday(startDate, endDate, comment) {
  try {
    const response = await fetch("/api/employee_id");
    const employeeId = await response.json(); // Assuming the API returns JSON data
    const response2 = await fetch("/api/remaining_holiday");
    const remainingHoliday = await response2.json(); // Assuming the API returns JSON data
    const remaining = await hasEnoughRemainingHoliday(startDate, endDate);
    
    if (employeeId == null) {
      alert("You must be logged in to book a holiday");
      return;
    } else if (startDate == "" || endDate == "") {
      alert("Please enter a start and end date");
      return;
    } else if (startDate > endDate) {
      alert("Start date must be before end date");
      return;
    } else if (new Date(startDate) < new Date()) {
      alert("Start date must be in the future");
      return;
    } else if (new Date(endDate) < new Date()) {
      alert("End date must be in the future");
      return;
    } else if (remaining == -1) {
      alert("You do not have enough remaining holiday to book this holiday");
      return;
    } else if ((await isHolidayOverlap(startDate, endDate))) {
      alert("This holiday overlaps with another holiday");
    } else {
      //if the holiday is valid, book it
      try {
        const booked = await fetch("/bookholiday", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stat: "success",
            startDate: formatDateToYYYYMMDD(new Date(startDate)),
            endDate: formatDateToYYYYMMDD(new Date (endDate)),
            employeeId: employeeId,
            comment: comment,
            numOfDays: count,
          }),
        });
        console.log("booked holiday, no overlap");
        console.log(booked);
        const holidayAlloanceUpdated = await fetch("/updateholiday", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ remaining: remaining }),
        });
        console.log(holidayAlloanceUpdated);
        location.reload(true);
        getRemainingHolidays();
      } catch (err) {
        console.log(err);
        getRemainingHolidays();
      }
    }
  } catch (err) {
    console.log(err);
    getRemainingHolidays();
  }
}

async function getPersonalHolidaysList() {
  let name = await fetch("/api/employeename");
  name = await name.json();

  let holidays = await fetch("getpersonalholidays");
  holidays = await holidays.json();
  console.log(holidays);
  let noHol = document.getElementById("no-holiday-list");
  let failHol = document.getElementById("failed-holiday-list");
  let editHol = document.getElementById("edit-holiday-list");
  let cancelTableBody = document.getElementById("cancelHolidayTableBody");
  if (holidays == null || holidays == undefined) {
    noHol.style.display = "none";
    failHol.style.display = "block";
    editHol.style.display = "none";
  }
  if (holidays.length < 1) {
    noHol.style.display = "block";
    failHol.style.display = "none";
    editHol.style.display = "none";
  } else {
    noHol.style.display = "none";
    failHol.style.display = "none";
    editHol.style.display = "block";

    // Clear the existing content of the cancelTableBody
    cancelTableBody.innerHTML = "";

    for (let i = 0; i < holidays.length; i++) {
      // Append each row to the cancelTableBody
      cancelTableBody.insertAdjacentHTML(
        "beforeend",
        `<tr>
          <td>${holidays[i].id}</td>
          <td>${formatDateToYYYYMMDD(new Date (holidays[i].start_date))}</td>
          <td>${formatDateToYYYYMMDD(new Date (holidays[i].end_date))}</td>
          <td>${holidays[i].comment}</td>
          <td><button class='btn btn-danger' onclick='cancelHoliday(${holidays[i].id})'>Cancel</button></td>
        </tr>`
      );
      addHolidayEvent(name, holidays[i].start_date, holidays[i].end_date, "#FF0000", "#FF0000", "#FFFFFF")
    }
  }
}

async function getAllHolidayList() {
  let holidays = await fetch("/getallholidays");
  holidays = await holidays.json();
  console.log(holidays);
  return holidays;
}

async function cancelHoliday(id) {
  console.log(id);
  try {
    const booked = await fetch("/deleteHoliday", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stat: "success",
        holidayID: id,

      }),
    });
    console.log("cancelled holiday");
    console.log(booked);
    location.reload(true);
  } catch (err) {
    console.log(err);
    getRemainingHolidays();
  }
}






// Function to add an event to the calendar
function addHolidayEvent(title, start, end, backgroundColor, borderColor, textColor) {
  const calendar1 = calendar; // Get the FullCalendar instance
  calendar1.addEvent({
    title: title,
    start: start,
    end: end,
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    textColor: textColor,
  });
}


function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
