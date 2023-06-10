async function removeUser(){
    console.log("removeUser called");
    let username = document.getElementById("userToRemove").value;
    if (username == ""){
        alert("Please enter a username");
        return;
    }
    let data = {
        username: username
    }
    try {
        var response = await fetch('/removeuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        console.log(response);
        if (response.ok) {
            alert("User removed successfully");
        } else if (response.status == 401) {
            alert("You do not have permission to remove users");
        }
        else if (response.status == 404){
            alert("User not found");
        }
        else {
            alert("User removal failed");
        }
    } catch (error) {
        console.error("An error occurred during login:", error);
        alert("An error occurred during login. Please try again later.");
    }
};