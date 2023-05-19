// test function. called on page load
function holidayInit(){
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
  if(bookedHolidays.length<1){
    return false;
  }
  //loop through all holidays in the database
  for (let i = 0; i < bookedHolidays.length; i++) {
    var holidayStart = new Date(bookedHolidays[i].start_date);
    var holidayEnd = new Date(bookedHolidays[i].end_date);
    // Check if and of the dates in the input range are between the start and end of any other booked holiday
    if ((startDate.getTime() <= holidayEnd.getTime()) && (endDate.getTime() >= holidayStart.getTime())) {
      return true;
    }
  }

  // If no holidays overlap, return false
  return false;
}

// checks if the requested holiday is valid
async function bookHoliday (startDate, endDate){
  
  //todo: get comment from form
  //todo: get employee id from session
  employeeId = 0001;
  comment = "test comment";

  if (await isHolidayOverlap(startDate, endDate)) {
    //alert("Holiday overlaps with another holiday");
    await fetch("/bookholiday",{
      method: 'POST',
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
        startDate: startDate,
        endDate: endDate,
        stat: "fail"})
    });
  }
  else{
    const booked = await fetch("/bookholiday",{
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({stat: "success", startDate: startDate,endDate: endDate,employeeId: employeeId,comment: comment})
    });
    console.log("booked holiday, no overlap")
    console.log(booked);
  }
  
} 
