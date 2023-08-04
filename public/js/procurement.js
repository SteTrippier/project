document.addEventListener("DOMContentLoaded", () => {
  fetchProcurements();
});

document
  .getElementById("procurementForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    var Requestedby = document.getElementById("Requestedby").value;
    var Request = document.getElementById("Request").value;
    if (Requestedby === "") {
      alert("Please enter your name");
      return;
    }
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
      console.log(result);
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
    let procurements = procurements1.rows;

    // Sorting procurements array by status and date
    procurements.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "requested" ? -1 : 1;
      }
      return new Date(a.date) - new Date(b.date);
    });

    console.log(procurements);

    // Ensure procurements is an array and it's not empty
    for (var i = 0; i < procurements.length; i++) {
      const row = table.insertRow();
      var date = new Date(procurements[i].date);
      var formattedDate = date.toISOString().split("T")[0];
      row.innerHTML = `
                  <td>${procurements[i].id}</td>
                  <td>${procurements[i].requestedby}</td>
                  <td>${procurements[i].request}</td>
                  <td>${formattedDate}</td>
                  <td>${procurements[i].status}</td>
                  <td>
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
    }
  } catch (err) {
    console.log(err);
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
