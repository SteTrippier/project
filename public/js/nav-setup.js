// get management link from nav bar and add event listener
// when any page loads this script will run
// the script checks if the user is logged in as role manager, if not it will hide the link
// if the user is logged in as manager, it will show the link
document.addEventListener("DOMContentLoaded", function () {
  loadNavBar();
});


async function loadNavBar(){
  var navBar = document.getElementById("main-nav-bar");
  try {
    const response = await fetch("/api/user_role");
    const data = await response.json();
    console.log(data);
    var isManager = data.role.toLowerCase() == "manager";
    if (isManager) {
      navBar.innerHTML = `
      <a class="navbar-brand" href="#">Harrisons Saw and tool</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="/home">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/holiday">Holidays</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/machinefault">Fault reports</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="manager-link" href="/management">Management area</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/procurement">Procurement Requests</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/logout">Log out</a>
          </li>

        </ul>
      </div>
      `;
    } else {
      navBar.innerHTML = `
      <a class="navbar-brand" href="#">Harrisons Saw and tool</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="/home">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/holiday">Holidays</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/machinefault">Fault reports</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/procurement">Procurement Requests</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/logout">Log out</a>
          </li>
        </ul>
      </div>
      `;
    } 

  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }
}