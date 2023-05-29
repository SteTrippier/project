async function signup() {
    var empId = document.getElementsByName("empId")[0].value;
    var password = document.getElementsByName("password")[0].value;
    var name = document.getElementsByName("name")[0].value;
    var tel = document.getElementsByName("tel")[0].value;
    var email = document.getElementsByName("email")[0].value;
    var houseno = document.getElementsByName("houseno")[0].value;
    var postcode = document.getElementsByName("postcode")[0].value;
    var department = document.getElementsByName("department")[0].value;
    var role = document.getElementById("role").value
    var mon = document.getElementById("mon").checked;
    var tue = document.getElementById("tue").checked;
    var wed = document.getElementById("wed").checked;
    var thu = document.getElementById("thu").checked;
    var fri = document.getElementById("fri").checked;
    
    //split first and last name at space
    var nameArray = name.split(" ");
    var firstname = nameArray[0];
    var lastname = nameArray[1];
    
    //Regex for validation
    var postcodeRE = new RegExp("([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})");
    var phoneRE = new RegExp("^0\d{10}");

    //check working days and reformat into a string
    var workingdays = "00000";
    if (mon) {workingdays = "1" + workingdays.substring(1);}
    if (tue) {workingdays = workingdays.substring(0, 1) + "1" + workingdays.substring(2);}
    if (wed) {workingdays = workingdays.substring(0, 2) + "1" + workingdays.substring(3);}
    if (thu) {workingdays = workingdays.substring(0, 3) + "1" + workingdays.substring(4);}
    if (fri) {workingdays = workingdays.substring(0, 4) + "1";}

    //check if all fields are filled
    if (empId == "" || password == "" || name == "" || tel == "" || email == "" || houseno == "" || postcode == "" || department == "") {
        alert("Please fill in all fields");
        return;
    }

    var employee = {
      username: empId,
      password: password,
      firstname: firstname,
      lastname: lastname,
      email: email,
      tel: tel,
      house: houseno,
      postcode: postcode,
      role: role,                      
      department: department,
      workingdays: workingdays,
      status: "working"
    };

    
    var signupJSON = JSON.stringify(employee);
    console.log(signupJSON);
    
    var response = await fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: signupJSON
    });
    
}
