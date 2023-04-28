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
    board.innerHTML += '<div class="row" id="noticeRow"><div class="col-lg border bg-light rounded m-1 p-1"><h2>' + t + '</h2><p>'+ b +'</p></div>'; 
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
    // TODO change this to check if user is logged in as manager
    if (true){
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
    }
}

