function toggleDateInputs() {
  const timeRange = document.getElementById("time_range").value;
  const customDateInputs = document.getElementById("custom_date_inputs");
  if (timeRange === "custom") {
    customDateInputs.style.display = "block";
  } else {
    customDateInputs.style.display = "none";
  }
}

// Restrict Date Inputs
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0];
  const startDateInput = document.getElementById("start_date");
  const endDateInput = document.getElementById("end_date");

  // Set max attribute for both date inputs
  startDateInput.setAttribute("max", today);
  endDateInput.setAttribute("max", today);

  // Update end date's min value based on start date
  startDateInput.addEventListener("change", function () {
    const startDate = startDateInput.value;
    endDateInput.setAttribute("min", startDate); // Ensure end date is not before start date
    if (
      endDateInput.value &&
      new Date(endDateInput.value) < new Date(startDate)
    ) {
      endDateInput.value = ""; // Reset end date if it violates the new constraint
    }
  });

  // Ensure end date does not exceed today's date
  endDateInput.addEventListener("change", function () {
    const endDate = endDateInput.value;
    if (new Date(endDate) > new Date(today)) {
      alert("End Date cannot be greater than today's date.");
      endDateInput.value = ""; // Reset invalid end date
    }
  });
});

// Validate Start and End Dates
function validateDates() {
  const timeRange = document.getElementById("time_range").value;
  const startDate = document.getElementById("start_date").value;
  const endDate = document.getElementById("end_date").value;

  if (timeRange === "custom") {
    if (!startDate) {
      alert("Please select a Start Date.");
      return false;
    }
    if (!endDate) {
      alert("Please select an End Date.");
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start Date cannot be later than End Date.");
      return false;
    }
  }
  return true;
}

// Show loading animation if validation passes
function showLoading() {
  if (validateDates()) {
    document.getElementById("loadingAnimation").style.display = "block";
  } else {
    event.preventDefault(); // Prevent form submission if validation fails
  }
}
// Filter function for the table
function filterExpenses() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const table = document.getElementById("expenseTable");
  const rows = table.getElementsByTagName("tr");
  let visibleRowCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    let match = false;
    for (const cell of cells) {
      if (cell.textContent.toLowerCase().includes(input)) {
        match = true;
        break;
      }
    }
    rows[i].style.display = match ? "" : "none";
    if (match) visibleRowCount++;
  }

  document.getElementById("noRecordsFound").style.display =
    visibleRowCount === 0 ? "block" : "none";
}

// Show loading animation
function showLoading() {
  document.getElementById("loadingAnimation").style.display = "block";
}

// function fetchFamilyMembers() {
//   var familyId = document.getElementById("family_id").value;
//   if (familyId) {
//     window.location.href = `/fetch_family_members?family_id=${familyId}`;
//   } else {
//     alert("Please select a family first.");
//   }
// }

$(document).ready(function () {
  $("#fetchFamilyMembersBtn").click(function () {
    const familyId = $("#family_id").val();
    $("#hidden_family_id").val(familyId);
    if (familyId) {
      $.get(`/fetch_family_members?family_id=${familyId}`, function (data) {
        const members = data.family_members;
        const userSelect = $("#user_id");
        userSelect.empty();
        userSelect.append('<option value="">-- Select User --</option>');
        members.forEach((member) => {
          userSelect.append(
            `<option value="${member.user_id}">${member.name}</option>`
          );
        });
        userSelect.append('<option value="all">All Family Members</option>');
      });
    } else {
      alert("Please select a family first.");
    }
  });
});

function toggleDateInputs() {
  const timeRange = document.getElementById("time_range").value;
  const customDateInputs = document.getElementById("custom_date_inputs");
  customDateInputs.style.display = timeRange === "custom" ? "block" : "none";
}

    // Validation function
    function validateSelection(event, checkUser = false) {
      const familyId = document.getElementById('family_id').value;
      const userId = document.getElementById('user_id').value;

      if (userId === "-- Select User --")
      {
        alert("Please select a user before proceeding.");
      }
        if (!familyId || (checkUser && !userId)) {
          event.preventDefault(); // Prevent default action

          // Show appropriate error message
          if (!familyId) {
            alert("Please select a family before proceeding.");
          } else if (checkUser && !userId) {
            alert("Please select a user before proceeding.");
          }
        }
    }

    // Add validation for "Fetch Members" button
    document.getElementById('fetchFamilyMembersBtn').addEventListener('click', function (event) {
        validateSelection(event); // Only checks family selection
    });

    // Add validation for "Filter Records" button
    document.querySelector('form').addEventListener('submit', function (event) {
        validateSelection(event, true); // Checks both family and user selection
    });


function fetchrecords()
{
  const familyId = document.getElementById("family_id").value;
  const userId = document.getElementById("user_id").value;

  if (userId === "") {
    alert("Please select a user before proceeding.");
  }
  if (familyId === "") {
  alert("Please select a family before proceeding.");
  }
}


 document.addEventListener("DOMContentLoaded", function () {
   const rowsPerPage = 10; // Number of records to display per page
   const table = document.getElementById("expenseTable");
   const rows = table.querySelectorAll("tbody tr");
   const totalRows = rows.length;
   const totalPages = Math.ceil(totalRows / rowsPerPage);

   let currentPage = 1;

   function showPage(page) {
     const start = (page - 1) * rowsPerPage;
     const end = start + rowsPerPage;
     rows.forEach((row, index) => {
       if (index >= start && index < end) {
         row.style.display = "";
       } else {
         row.style.display = "none";
       }
     });

     document.getElementById("pageNumber").textContent = `Page ${page}`;
     document.getElementById("prevPage").disabled = page === 1;
     document.getElementById("nextPage").disabled = page === totalPages;
   }

   // Show the first page initially
   showPage(currentPage);

   // Handle the "Back" button click
   document.getElementById("prevPage").addEventListener("click", function () {
     if (currentPage > 1) {
       currentPage--;
       showPage(currentPage);
     }
   });

   // Handle the "Forward" button click
   document.getElementById("nextPage").addEventListener("click", function () {
     if (currentPage < totalPages) {
       currentPage++;
       showPage(currentPage);
     }
   });
 });