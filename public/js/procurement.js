document.addEventListener("DOMContentLoaded", () => {
  fetchProcurements();
});
document.addEventListener('DOMContentLoaded', checkUserStatus);

document
  .getElementById("procurementForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    var Requestedby = await fetch("/api/user");
    Requestedby = await Requestedby.json();
    console.log("requested by " + Requestedby.username);

    var Request = document.getElementById("Request").value;

    if (Request === "") {
      alert("Please enter your request");
      return;
    }
    try {
      const result = await fetch("/api/procurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Requestedby: Requestedby,
          Request: Request,
        }),
      });
      alert("Procurement request submitted");
    } catch (err) {
      alert("Error submitting procurement request");
      console.error(err);
    }
  });

async function fetchProcurements() {
  const table = document
    .getElementById("procurementTable")
    .getElementsByTagName("tbody")[0];
  try {
    const response = await fetch("/api/procurements");

    // Check if response was successful
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const row = table.insertRow();
      row.innerHTML =
        '<td colspan="6" style="text-align: center;">Error fetching procurements</td>';
      return;
    }

    const procurements1 = await response.json();
    const procurements = procurements1.rows;
    console.log(procurements);
    // Ensure procurements is an array and it's not empty
    for (var i = 0; i < procurements.length; i++) {
      if (procurements[i].status === "fulfilled") {
        const row = table.insertRow();
        var date = new Date(procurements[i].date);
        var formattedDate = date.toISOString().split("T")[0];
        row.innerHTML = `
                    <td>${procurements[i].id}</td>
                    <td>${procurements[i].requestedby}</td>
                    <td>${procurements[i].request}</td>
                    <td>${formattedDate}</td>
                    <td>${procurements[i].status}</td>
                    <td id="noChange-${procurements[i].id}">
                        <select id="status-${
                          procurements[i].id
                        }" onchange="updateStatus(${procurements[i].id})">
                            <option value="requested" ${
                              procurements[i].status === "requested"
                                ? "selected"
                                : ""
                            }>Requested</option>
                            <option value="fulfilled" ${
                              procurements[i].status === "fulfilled"
                                ? "selected"
                                : ""
                            }>Fulfilled</option>
                        </select>
                    </td>
                `;
      } else if (procurements[i].status === "requested") {
        const row = table.insertRow();
        var date = new Date(procurements[i].date);
        var formattedDate = date.toISOString().split("T")[0];
        row.innerHTML = `
                    <td>${procurements[i].id}</td>
                    <td>${procurements[i].requestedby}</td>
                    <td>${procurements[i].request}</td>
                    <td>${formattedDate}</td>
                    <td>${procurements[i].status}</td>
                    <td class="changeable">
                        <select id="status-${
                          procurements[i].id
                        }" onchange="updateStatus(${procurements[i].id})">
                            <option value="requested" ${
                              procurements[i].status === "requested"
                                ? "selected"
                                : ""
                            }>Requested</option>
                            <option value="fulfilled" ${
                              procurements[i].status === "fulfilled"
                                ? "selected"
                                : ""
                            }>Fulfilled</option>    
                        </select>
                    </td>
                `;
      } else {
        const row = table.insertRow();
        row.innerHTML =
          '<td colspan="6" style="text-align: center;">No procurements found</td>';
      }
    }
  } catch (err) {
    console.error(err);
    const row = table.insertRow();
    row.innerHTML =
      '<td colspan="6" style="text-align: center;">Error fetching procurements</td>';
  }
}

async function updateStatus(id) {
  const status = document.getElementById(`status-${id}`).value;
  try {
    const response = await fetch(`/api/procurements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: status,
      }),
    });
    const result = await response.json();
    alert(result.message);
  } catch (err) {
    console.error(err);
  }
}

async function checkUserStatus() {
    try {
      const response = await fetch('/api/user_role');
      const data = await response.json();
      console.log(data);
  
      if (!(data.role.toLowerCase() == "manager")) {
        // If the user is not a manager, remove the "Update Status" column
        var table = document.getElementById("procurementTable");
        var columnIndex = 5; // Index of the "Update Status" column (zero-based)
        var rows = table.getElementsByTagName("tr");
        
        for (var i = 0; i < rows.length; i++) {
          var cells = rows[i].getElementsByTagName("td");
          if (cells.length > columnIndex) {
            // Remove the cell at columnIndex
            cells[columnIndex].parentNode.removeChild(cells[columnIndex]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
  