        // Get category totals from the backend
        const categoryTotals = {{ category_totals | tojson }};

        // Prepare data for Chart.js
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        // Generate the pie chart
        const ctx = document.getElementById('expensePieChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expense Distribution',
                    data: data,
                    backgroundColor: [
                        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                const category = labels[tooltipItem.dataIndex];
                                const amount = data[tooltipItem.dataIndex];
                                return `${category}: ₹${amount.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });