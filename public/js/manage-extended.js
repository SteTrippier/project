// get management link from nav bar and add event listener
// when any page loads this script will run
// the script checks if the user is logged in as role manager, if not it will hide the link
// if the user is logged in as manager, it will show the link
document.addEventListener("DOMContentLoaded", function () {
  checkManagerLink();
});
async function checkManagerLink() {
  var el = document.getElementById("manager-link");
  try {
    const response = await fetch("/api/user_role");
    const data = await response.json();
    console.log(data);
    if (data.role.toLowerCase() == "manager") {
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }
}
