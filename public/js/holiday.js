// auto email confirmation

var nodemailer = require('nodemailer');
var senderEmail = "emailadress@googlemail.com";
var senderPass = "";
var receiverEmail = "";

var emailTitle ={
    success: "Holiday booking confirmed!",
    fail: "Holiday booking failed"
};
var emailBody = {
    success: "Your holiday has been successfully booked for startDate until endDate",
    fail: "Your holiday booking for startDate until endDate could not be processed due to reason"
}

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: senderEmail,
    pass: senderPass
  }
});

var mailSuccessOptions = {
  from: senderEmail,
  to: receiverEmail,
  subject: emailTitle.sucesss,
  text: emailBody.success
}

var mailFailOptions = {
    from: senderEmail,
    to: receiverEmail,
    subject: emailTitle.fail,
    text: emailBody.fail
}







// checks if there will be a holiday overlap
function isHolidayOverlap(startDate, endDate, bookedHolidays) {
  // Iterate through each booked holiday
  for (let i = 0; i < bookedHolidays.length; i++) {
    const holidayStart = new Date(bookedHolidays[i].start);
    const holidayEnd = new Date(bookedHolidays[i].end);
    // Check if the requested date range overlaps with the current booked holiday
    if (startDate <= holidayEnd && endDate >= holidayStart) {
       return true; // Overlap found, return true
    }
  }
  // No overlap found, so book the holiday and return false
  bookHoliday(startDate , endDate );
  return false;
}

async function bookHoliday (startDate, endDate ){
    // code to post holiday to database and refresh the page;
    //todo: get comment from form
    //todo: get employee id from session
    const booked = await fetch("/bookholiday",
    {
        method: post,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            startDate: startDate,
            endDate: endDate,
            employeeId: employeeId,
            comment: comment
        })
    }
    );

    if (booked.status == 200){
        alert("Holiday booked successfully");
        transporter.sendMail(mailSuccessOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
    }
    else{
        alert("Holiday booking failed");
        transporter.sendMail(mailFailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
    } 

    location.reload();
}









