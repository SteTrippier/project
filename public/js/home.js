async function init() {
  var noticeList = await fetch("/notices");
  var noticeListJSON = await noticeList.json();
  console.log(noticeListJSON);
  
  var isManager = await checkManager();
  
  for (var i = 0; i < noticeListJSON.length; i++) {
      addNotice(
          noticeListJSON[i].title,
          noticeListJSON[i].description,
          noticeListJSON[i].id,
          isManager
      );
  }

  if (isManager) {
      var snippet = document.getElementById("add-a-notice");
      snippet.innerHTML = `<h1 class="my-4">Submit a Notice</h1>
          <form onsubmit="return false">
              <div class="form-group">
                  <label for="noticeTitle">Notice Title</label>
                  <input type="text" class="form-control" id="noticeTitle" placeholder="Enter notice title">
              </div>
              <div class="form-group">
                  <label for="noticeText">Notice Text</label>
                  <textarea class="form-control" id="noticeText" rows="3" placeholder="Enter notice text"></textarea>
              </div>
              <button type="submit" class="btn btn-primary" id="submitNotice" disabled>Submit Notice</button>
              <button type="button" class="btn btn-primary" id="clearForm" >Clear Form</button>
          </form>
      </div><br /><br />`;
      document.getElementById("submitNotice").addEventListener("click", submitNotice);
      document.getElementById("clearForm").addEventListener("click", clearForm);
      document.getElementById("noticeTitle").addEventListener("change", updateButtonState);
      document.getElementById("noticeText").addEventListener("change", updateButtonState);
  }
}

function updateButtonState() {
  const title = document.getElementById("noticeTitle").value;
  const body = document.getElementById("noticeText").value;
  
  const submitBtn = document.getElementById("submitNotice");
  
  if (title.trim() === "" || body.trim() === "") {
    // Disable the buttons
    submitBtn.setAttribute("disabled", "disabled");
  } else {
    // Enable the buttons
    submitBtn.removeAttribute("disabled");
  }
}

function submitNotice() {
  var title = document.getElementById("noticeTitle").value;
  var body = document.getElementById("noticeText").value;
  if (title == "" || body == "") {
    alert("Please fill out all fields");
    return;
  }
  saveNotice();
}

async function addNotice(title, body, id, isManager) {
  var board = document.getElementById("noticeBoard");
  var boardinnerHTML = board.innerHTML;

  var deleteButton = '';
  if (isManager) {
      deleteButton = '<button class="btn btn-danger" onclick="deleteNotice(' + id + ')">Delete</button>';
  }

  board.innerHTML =
      '<div class="row" id="noticeRow"><div class="col-lg border bg-light rounded m-1 p-3"><h2>' +
      title +
      "</h2><p>" +
      body +
      '</p><input type="hidden" id="noticeId" value="' +
      id +
      '">' + deleteButton + '</div></div>' +
      boardinnerHTML;
}


async function deleteNotice(id) {
  try {
    var response = await fetch("/deleteNotice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });

    if (response.status === 200) {
      // Refresh the page after deleting the notice
      location.reload();
    }
  } catch (error) {
    console.log(error);
  }
}

async function saveNotice() {
  var title = document.getElementById("noticeTitle").value;
  var body = document.getElementById("noticeText").value;
  var notice = {
    title: title,
    description: body,
  };
  var noticeJSON = JSON.stringify(notice);

  try {
    var response = await fetch("/notices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: noticeJSON,
    });

    if (response.status === 200) {
      // Reload the page on successful save
      window.location.reload();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}



function clearForm() {
  document.getElementById("noticeTitle").value = "";
  document.getElementById("noticeText").value = "";
}

async function checkManager() {
  try {
    const response = await fetch("/api/user_role");
    const data = await response.json();
    console.log(data);
    // check if user is a manager
    return data.role.toLowerCase() == "manager";
  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }
}
