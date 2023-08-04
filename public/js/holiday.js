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

// Gets all holidays from the database
async function getHolidays() {
  const response = await fetch("/getholidays");
  const holidays = await response.json();
  console.log(holidays);
  return holidays;
}

// Checks if the requested holiday overlaps with any other holidays
async function isHolidayOverlap(startDatei, endDatei) {
  // Iterate through each booked holiday
  var bookedHolidays = await getHolidays();
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
  const response = await fetch("/api/remaining_holiday");
  const remainingHoliday = await response.json(); // Assuming the API returns JSON data
  //todo: complete this function
  //check that the number of working days between the 2 dates are less than the remaining holiday
  //if they are, return true
  //if not, return false
  const response2 = await fetch("/api/workingDays");
  const workingDays = await response2.json(); // Assuming the API returns JSON data
  var mon = workingDays.workingDays.charAt(0) === "1";
  var tue = workingDays.workingDays.charAt(1) === "1";
  var wed = workingDays.workingDays.charAt(2) === "1";
  var thu = workingDays.workingDays.charAt(3) === "1";
  var fri = workingDays.workingDays.charAt(4) === "1";
  //loop through all the days between the start and end date to check if they are working days
  var startDate = new Date(startDatei);
  var endDate = new Date(endDatei);
  var count = 0;
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
  if (count <= remainingHoliday) {
    return true;
  } else {
    return false;
  }
}

// checks if the requested holiday is valid
async function bookHoliday(startDate, endDate, comment) {
  try {
    const response = await fetch("/api/employee_id");
    const employeeId = await response.json(); // Assuming the API returns JSON data
    const response2 = await fetch("/api/remaining_holiday");
    const remainingHoliday = await response2.json(); // Assuming the API returns JSON data

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
    } else if (!(await hasEnoughRemainingHoliday(startDate, endDate))) {
      alert("You do not have enough remaining holiday to book this holiday");
      return;
    } else if (!(await isHolidayOverlap(startDate, endDate))) {
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
            startDate: startDate,
            endDate: endDate,
            employeeId: employeeId,
            comment: comment,
          }),
        });
        console.log("booked holiday, no overlap");
        console.log(booked);
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err);
  }
}
