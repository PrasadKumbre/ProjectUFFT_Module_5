// pagination.js

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