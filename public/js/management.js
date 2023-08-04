var usersData;
var employeesData;
var holidayAllowanceChangedList = {};

async function removeUser() {
  console.log("removeUser called");
  let username = document.getElementById("userToRemove").value;
  if (!username) {
    alert("Please enter a username");
    return;
  }
  let data = {
    username: username
  };
  try {
    var response = await fetch('/removeuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    console.log("response: ", response);

    if (response.ok) {
      alert("User removed successfully");
      populateUserList();
      return;
    } else if (response.status == 401) {
      alert("You do not have permission to remove users");
      return;
    } else if (response.status == 404) {
      alert("User not found");
      return;
    } else {
      alert("User removal failed");
      return;
    }
  } catch (error) {
    console.error("An error occurred during deletion:", error);
    alert("An error occurred during deletion. Please try again later.");
    return;
  }
}

async function populateEmployeeList() {
  const employeeList = document.getElementById("employee-list-management");

  // Clear existing options
  employeeList.innerHTML = '';

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.hidden = true;
  defaultOption.value = '';
  defaultOption.textContent = 'select user';
  employeeList.appendChild(defaultOption);

  // Add options based on the data
  employeesData.forEach(employee => {
    const option = document.createElement('option');
    option.value = employee.username;
    option.textContent = `${employee.firstname} ${employee.lastname}`;
    employeeList.appendChild(option);
  });
}

async function overrideBookHoliday() {
  // Check that the user has filled in all the fields
  // Check that the user has selected a user from the dropdown list
  // TODO: Add the implementation for overriding or modifying holiday bookings
}

async function populateUserList() {
  const userList = document.getElementById("userList");
  userList.innerHTML = '';

  usersData.forEach(user => {
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
}

async function populateHolidayAllowanceList() {
  const holidayAllowanceList = document.getElementById("holidayAllowanceList");
  holidayAllowanceList.innerHTML = '';

  employeesData.forEach(user => {
    const row = document.createElement('tr');
    const userFullNameCell = document.createElement('td');
    const userNameCell = document.createElement('td');
    const userHolidayAllowanceCell = document.createElement('td');

    userFullNameCell.textContent = user.firstname + " " + user.lastname;
    userNameCell.textContent = user.username;
    userHolidayAllowanceCell.textContent = user.annual_leave_remaining;
    

    // Make the holiday allowance cell an input field with type number
    userHolidayAllowanceCell.innerHTML = '<input type="number" id="holidayAllowanceInput" name="holidayAllowanceInput" min="0" max="30" value="' + user.annual_leave_remaining + '">';

    // Highlight the cell red if the user has no holiday allowance left
    if (user.annual_leave_remaining == 0) {
      userHolidayAllowanceCell.style.backgroundColor = "red";
    }
    else {
        userHolidayAllowanceCell.style.backgroundColor = "white";
    }

    // If the cell has changed, highlight it yellow and update holidayAllowanceChangedList
    userHolidayAllowanceCell.addEventListener("change", function() {
      userHolidayAllowanceCell.style.backgroundColor = "yellow";

      // Update the holidayAllowanceChangedList object with user data
      holidayAllowanceChangedList[user.username] = {
        fullname: user.firstname + " " + user.lastname,
        allowance: userHolidayAllowanceCell.firstChild.value
      };
    });

    row.appendChild(userFullNameCell);
    row.appendChild(userNameCell);
    row.appendChild(userHolidayAllowanceCell);

    holidayAllowanceList.appendChild(row);
  });
}

async function getInfo() {
  try {
    const response = await fetch('/getAllEmployeesNameAndUsername');
    employeesData = await response.json();
    const response2 = await fetch('/users');
    usersData = await response2.json();
    console.log("usersData: ", usersData);
    console.log("employeesData: ", employeesData);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function updateHolidayAllowances() {
    // Process the holidayAllowanceChangedList
    for (let username in holidayAllowanceChangedList) {
      if (holidayAllowanceChangedList.hasOwnProperty(username)) {
        // Get the updated holiday allowance value
        let updatedAllowance = holidayAllowanceChangedList[username].allowance;
  
        // Send the updated holiday allowance value to the server
        let data = {
          username: username,updateHolidayAllowances,
          holidayAllowance: updatedAllowance
        };
        try {
          var response = await fetch('/updateHolidayAllowance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
  
          console.log("Response:", response);
  
          if (response.ok) {
            console.log("Updated holiday allowance for " + username + ": " + updatedAllowance);
            alert("Updated holiday allowance for " + username + ": " + updatedAllowance);
          } else {
            console.error("Failed to update holiday allowance for " + username);
            alert("Failed to update holiday allowance for " + username);
          }
        } catch (error) {
          console.error("An error occurred while updating holiday allowance for " + username + ":", error);
          alert("An error occurred while updating holiday allowance for " + username + ". Please try again later.");
        }
        finally {
          //reload the page
            location.reload();
            
        }
      }
    }
  }
  
async function managementLoad() {
  await getInfo();
  populateUserList();
  populateEmployeeList();
  populateHolidayAllowanceList();
}
