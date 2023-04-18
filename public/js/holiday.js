const clientId = "YOUR_CLIENT_ID";
const apiKey = "YOUR_API_KEY";
const calendarId = "YOUR_CALENDAR_ID";
const scopes = "https://www.googleapis.com/auth/calendar.events";

let googleAuth;

function init() {
  gapi.load("client:auth2", () => {
    gapi.client.init({
      apiKey: apiKey,
      clientId: clientId,
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
      ],
      scope: scopes,
    }).then(() => {
      googleAuth = gapi.auth2.getAuthInstance();

      document.getElementById("authorize").onclick = authorize;
      document.getElementById("list-events").onclick = listEvents;
      document.getElementById("add-holiday").onclick = addHoliday;
      document.getElementById("delete-holiday").onclick = deleteHoliday;
    });
  });
} 

function authorize() {
  googleAuth.signIn().then(() => {
    console.log("User signed in");
  });
}

function listEvents() {
  gapi.client.calendar.events.list({
    calendarId: calendarId,
  }).then((response) => {
    const events = response.result.items;
    let content = "<ul>";
    for (let event of events) {
      content += `<li>${event.summary} (${event.start.dateTime || event.start.date})</li>`;
    }
    content += "</ul>";
    document.getElementById("content").innerHTML = content;
  });
}

function addHoliday() {
  const event = {
    summary: "New Holiday",
    start: {
      date: "2023-04-25",
    },
    end: {
      date: "2023-04-26",
    },
  };

  gapi.client.calendar.events.insert({
    calendarId: calendarId,
    resource: event,
  }).then((response) => {
    console.log("Event created: " + response.result.htmlLink);
  });
}

function deleteHoliday() {
  const eventId = "YOUR_EVENT_ID";

  gapi.client.calendar.events.delete({
    calendarId: calendarId,
    eventId: eventId,
  }).then(() => {
    console.log("Event deleted");
  });
}

init();







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

  // No overlap found, return false
  bookHoliday(startDate , endDate );
  return false;
}

async function bookHoliday (startDate, endDate ){
    // code to post holiday to database and refresh the page;
    const booked = await fetch("/bookholiday",
    {
        method: post,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            startDate: startDate,
            endDate: endDate,
            employeeId: employeeId
        })
    }
    );
}






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
  from: senderEmail ,
  to: receiverEmail ,
  subject: emailTitle.sucesss,
  text: emailBody.success
}

var mailFailOptions = {
    from: senderEmail,
    to: receiverEmail,
    subject: emailTitle.fail,
    text: emailBody.fail
    
}

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});




