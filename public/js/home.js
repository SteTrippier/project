function submitNotice(){
    var title = document.getElementById("noticeTitle").value;
    var body = document.getElementById("noticeText").value;
    if (title == "" || body == "") {
        alert("Please fill out all fields");
        return;
    }
    addNotice(title, body);
    saveNotice();
}

async function addNotice(t, b){
    var board = document.getElementById("noticeBoard");
    var boardinnerHTML = board.innerHTML;
    board.innerHTML = '<div class="row" id="noticeRow"><div class="col-lg border bg-light rounded m-1 p-3"><h2>' + t + '</h2><p>'+ b +'</p></div></div>' + boardinnerHTML;
}

async function saveNotice(){
    var title = document.getElementById("noticeTitle").value;
    var body = document.getElementById("noticeText").value;
    var notice = {
        title: title,
        description: body
    }
    var noticeJSON = JSON.stringify(notice);
    console.log(noticeJSON);
    var response = await fetch('/notices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: noticeJSON
    });
}

async function init(){
    var noticeList = await fetch('/notices');
    var noticeListJSON = await noticeList.json();
    console.log(noticeListJSON);
    for (var i = 0; i < noticeListJSON.length ; i++){
        addNotice(noticeListJSON[i].title, noticeListJSON[i].description);
    }

    var isManager = await checkUserStatus();

    // TODO change this to check if user is logged in as manager
    if (isManager == true){
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
                                <button type="submit" class="btn btn-primary" id="submitNotice">Submit Notice </button>
                                </form>
                            </div><br /><br />`;
        document.getElementById("submitNotice").addEventListener("click", submitNotice);
    }
}


async function checkUserStatus() {
    try {
      const response = await fetch('/api/user_role');
      const data = await response.json();
      console.log(data);

      if (data.role.toLowerCase() == "manager") {
        console.log('User is logged in as manager');
        return true;
      } 
      else {
        console.log('User is: ' + data.role + ' not manager');
        return false;
      }
    } 
    catch (error) {
      console.error('An error occurred:', error);
      return false;
    }
  }
