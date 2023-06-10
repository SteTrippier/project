
function checkLogin() {
    var empId = document.getElementById("usr").value;
    var password = document.getElementById("pwd").value;
    
    if (empId == "" || password == "") {
      alert("Login Failed, please enter an employee ID and password.");
    } else {
      var user = {
        username: empId,
        password: password
      };
      var userJSON = JSON.stringify(user);
      console.log(userJSON);
      
      (async function() {
        try {
          var response = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: userJSON
          });
          
          // Process the response as needed
          // For example, you can check the response status and redirect the user if successful
          if (response.ok) {
            console.log(response);
            window.location.href = "/home.html";
          } else {
            alert("Login Failed, please check your credentials and try again.");
          }
        } catch (error) {
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
