function submitNotice(){
    var title = document.getElementById("noticeTitle").value;
    var body = document.getElementById("noticeText").value;
    console.log ("submitNotice() called");
    addNotice(title, body);
    //todo: store notices in a database and recall them on load 
}

async function addNotice(t, b){
    var board = document.getElementById("noticeBoard");
    board.innerHTML += '<div class="row" id="noticeRow"><div class="col-lg border bg-light rounded m-1 p-1"><h2>' + t + '</h2><p>'+ b +'</p></div>';
    var submittedNotice = await fetch('/notices', {
         method: 'POST', 
         body: JSON.stringify({title: t, description: b})
         });

}


async function init(){
    var noticeList = await fetch('/notices');
    var noticeListJSON = await noticeList.json();
    console.log(noticeListJSON);
    for(var i = 0; i < 10; i++){
        addNotice(noticeListJSON[i].title, noticeListJSON[i].description);
    }   
    
}

