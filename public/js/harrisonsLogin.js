


exports.login= function login(){
    let user = document.getElementById("usr").value;
    let pass = document.getElementById("pwd").value;

    //console log the user and pass variables
    console.log("user name and password are: " + user + pass);
        
    //If usersname and password match storer credentials
    if(user == "user1" && pass == "pass1"){
        // deliver home page
        console.log("home page");
        window.location.href = "C:/project/public/home.html";
    }
    // else
    else{
        // delivery error message
        alert("Username or password invalid, please try again");
    }
    
}
