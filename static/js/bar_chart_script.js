document.addEventListener("DOMContentLoaded", function () {
  const groupedExpenses = window.groupedExpenses || {};

  // Log the groupedExpenses to debug
  console.log("Grouped Expenses:", groupedExpenses);

  const labels = [];
  const data = [];

  // Process Data for Bar Chart
  for (const userId in groupedExpenses) {
    const user = groupedExpenses[userId];
    if (user.categories) {
      for (const category in user.categories) {
        const label = `${user.user_name || "Unknown"} - ${category}`;
        labels.push(label);
        data.push(user.categories[category]);
      }
    }
  }

  if (labels.length === 0 || data.length === 0) {
    console.warn("No data available for the bar chart.");
    return; // Stop rendering if there's no data
  }

  // Render Bar Chart
  const barCtx = document.getElementById("barChart").getContext("2d");
  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Expense Amount",
          data: data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow resizing
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
});
