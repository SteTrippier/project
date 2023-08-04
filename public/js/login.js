function checkLogin() {
    var empId = document.getElementById("usr").value;
    var password = document.getElementById("pwd").value;
    
    if (empId == "" || password == "") {
      alert("Login Failed, please enter an employee ID and password.");
    } 
    else {
      var user = {
        username: empId,
        password: password
      };
      var userJSON = JSON.stringify(user);
      console.log(userJSON);
      
      (async function() {
        console.log("Attempting to login...");
        try {
          var response = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: userJSON
          });
          
          if (response.ok) {
            const data = await response.json();
            window.location.href = data.redirect;
          }
          
          else {
            alert("Login Failed, please check your username and password and try again.");
          }
        } 
        catch (error) {
          console.error("An error occurred during login:", error);
          alert("An error occurred during login. Please try again later.");
        }
      })();
    }
  }
  
function validateField(field) {
    field.addEventListener("blur", function() {
        if (field.value == "") {
            field.style.borderColor = "red";
        } else {
            field.style.borderColor = "green";
        }
    });
}

function validateUsername() {
    validateField(document.getElementById("usr"));
}

function validatePassword() {
    validateField(document.getElementById("pwd"));
}

function onLoad() {
    console.log("Login page loaded");
    validateUsername();
    validatePassword();
}
