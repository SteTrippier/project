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