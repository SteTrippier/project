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

        console.log("response: " + response);

        if (response.ok) {
            alert("User removed successfully");
            populateUserList();
            
            return;
        } else if (response.status == 401) {
            alert("You do not have permission to remove users");
            return;
        }
        else if (response.status == 404){
            alert("User not found");
            return;
        }
        else {
            alert("User removal failed");
            return;
        }
    } catch (error) {
        console.error("An error occurred during deletion:", error);
        alert("An error occurred during deletion. Please try again later.");
        return;
    }
};


//todo: add function which gets list of employees and adds them to a drop down list on the managment page.
// the function should be called when the page loads and also relate the employees list to the user list to book holidays for the user but display the employee name
async function populateEmployeeList(){
//get list of employees form database
//get list of users from database
//book holiday for user but display employee name
//poppulate the dropdown list with the employee names
    const employeeList = document.getElementById("employee-list-management");
    try{
        const response = await fetch('/getAllEmployees');
        const data = await response.json();
    
    }

}

//todo: complete this function
async function overrideBookHoliday(){
    //check that the user has filled in all the fields
    //check that the user has selected a user from the dropdown list
}

function managementLoad(){
    populateUserList();
    populateEmployeeList(); // implement this function
}



async function populateUserList() {
    const userList = document.getElementById("userList");
    
    try {
      const response = await fetch('/users'); // Assuming the endpoint to fetch user data is '/users'
      const data = await response.json();
      
      // Clear the existing user list
      userList.innerHTML = '';
      
      // Populate the user list with the fetched data
      data.forEach(user => {
        const row = document.createElement('tr');
        const userIdCell = document.createElement('td');
        const userNameCell = document.createElement('td');
        const userRoleCell = document.createElement('td');
        
        userIdCell.textContent = user.id;
        userNameCell.textContent = user.username;
        userRoleCell.textContent = user.role;
        
        row.appendChild(userIdCell);
        row.appendChild(userNameCell);
        row.appendChild(userRoleCell);
        
        userList.appendChild(row);
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
  