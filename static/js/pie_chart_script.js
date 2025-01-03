document.addEventListener("DOMContentLoaded", function () {
  if (typeof groupedExpenses !== "undefined") {
    Object.entries(groupedExpenses).forEach(([user_id, user_data]) => {
      const ctx = document.getElementById(`chart-${user_id}`);
      if (ctx) {
        new Chart(ctx, {
          type: "pie",
          data: {
            labels: Object.keys(user_data.categories),
            datasets: [
              {
                data: Object.values(user_data.categories),
                backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                  "#FF9F40",
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
            },
          },
        });
      } else {
        console.error(`Canvas element not found for chart-${user_id}`);
      }
    });
  } else {
    console.error("No expense data available for charts.");
  }
});
