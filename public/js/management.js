async function registerUser() {

    var username = $('#username').val();
    var password = $('#password').val();
    var firstname = $('#firstname').val();
    var lastname = $('#lastname').val();
    var email = $('#email').val();
    var tel = $('#tel').val();
    var house = $('#house').val();
    var postcode = $('#postcode').val();
    var department = $('#department').val();
    var workingdays = $('#workingdays').val();
    var status = $('#status').val();

    var user = {
        username: username,
        password: password,
        firstname: firstname,
        lastname: lastname,
        email: email,
        tel: tel,
        house: house,
        postcode: postcode,
        department: department,
        workingdays: workingdays,
        status: status
    };
    var userJSON = JSON.stringify(user);
    console.log(userJSON);

    var response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: userJSON
    });

}

