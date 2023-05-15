
function holidayInit(){
  console.log("holiday init() called");
  //test data

  bookHoliday(new Date("2023-07-28"), new Date("2023-07-29"));
}

async function getHolidays() {
  const response = await fetch("/getholidays");
  const holidays = await response.json();
  console.log(holidays);
  return holidays;

}

// checks if there will be a holiday overlap
async function isHolidayOverlap(startDatei, endDatei) {

  // Iterate through each booked holiday
  var bookedHolidays = await getHolidays();
  var startDate = new Date(startDatei);
  var endDate = new Date(endDatei);
  
  if(bookedHolidays.length<1){
    console.log("no holidays");
    return false;
  }
  for (let i = 0; i < bookedHolidays.length; i++) {
    var holidayStart = new Date(bookedHolidays[i].start_date);
    var holidayEnd = new Date(bookedHolidays[i].end_date);
    console.log("holidayStart: " + holidayStart);
    console.log("holidayEnd: " + holidayEnd);
    // Check if and of the dates in the input range are between the start and end of any other booked holiday
    if ((startDate.getTime() <= holidayEnd.getTime()) && (endDate.getTime() >= holidayStart.getTime())) {
      return true;
    }
  }
  return false;
}



// checks if the requested holiday is valid
async function bookHoliday (startDate, endDate){
  //todo: get comment from form
  //todo: get employee id from session
  employeeId = 0001;
  comment = "test comment";
  if (isHolidayOverlap(startDate, endDate)) {
    //alert("Holiday overlaps with another holiday");
    await fetch("/bookholiday",{
      method: 'POST',
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({stat: "fail"})
    });
    return;
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
  //location.reload();
} 
