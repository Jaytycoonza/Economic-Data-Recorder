// ==============================
// Load stored data when the page loads
// ==============================
const recordedData = JSON.parse(localStorage.getItem("recordedData")) || {};

// Function to save data into localStorage
function saveData() {
  localStorage.setItem("recordedData", JSON.stringify(recordedData));
}

// Helper function to generate a unique key for each data type and currency
function getKey(dataType, currency) {
  return `${dataType}_${currency}`;
}

// ==============================
// Navigation Handling
// ==============================
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    // Remove active class from all links, add it to clicked link
    navLinks.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
    // Hide all pages and then show targeted one
    document.querySelectorAll(".page").forEach((page) =>
      page.classList.remove("active")
    );
    const target = this.getAttribute("data-target");
    document.getElementById(target).classList.add("active");
  });
});

// ==============================
// Record Data Page Functions
// ==============================
function recordData() {
  const dataType = document.getElementById("recordDataType").value;
  const currency = document.getElementById("recordCurrency").value;
  const valueInput = document.getElementById("recordValue").value;
  const value = parseFloat(valueInput);

  if (isNaN(value)) {
    alert("Please enter a valid number.");
    return;
  }

  const key = getKey(dataType, currency);
  if (!recordedData[key]) {
    recordedData[key] = [];
  }
  
  recordedData[key].push(value);
  saveData(); // Save data into localStorage
  updateTable(); // Update displayed data
  document.getElementById("recordValue").value = "";
}

// Function to update tables dynamically
function updateTable() {
  const container = document.getElementById("tablesContainer");
  container.innerHTML = ""; // Clear current content

  Object.keys(recordedData).forEach((key) => {
    const [dataType, currency] = key.split("_");
    const heading = document.createElement("h3");
    heading.textContent = `${dataType} Data Table for ${currency}`;
    container.appendChild(heading);

    const table = document.createElement("table");
    table.className = "data-table";
    table.innerHTML = `
      <tr>
        <th>#</th>
        <th>Data Type</th>
        <th>Currency</th>
        <th>Value (%)</th>
        <th>Action</th>
      </tr>
    `;

    recordedData[key].forEach((val, index) => {
      const row = document.createElement("tr");
      let valueClass = "value-black";

      if (index > 0) {
        const prevVal = recordedData[key][index - 1];
        valueClass = val > prevVal ? "value-green" : val < prevVal ? "value-red" : "value-black";
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${dataType}</td>
        <td>${currency}</td>
        <td class="${valueClass}">${val}%</td>
        <td><button onclick="deleteData('${key}', ${index})">Delete</button></td>
      `;
      table.appendChild(row);
    });

    container.appendChild(table);
  });
}

// Function to delete a specific data point
function deleteData(key, index) {
  recordedData[key].splice(index, 1);
  saveData(); // Update stored data
  updateTable();
}

// ==============================
// Visual Data Page Functions
// ==============================
let visualChartType = "bar";
let visualChartInstance = null;

function viewDataChart() {
  const dataType = document.getElementById("visualDataType").value;
  const currency = document.getElementById("visualCurrency").value;
  const key = getKey(dataType, currency);
  const dataArr = recordedData[key] || [];

  if (dataArr.length === 0) {
    alert("No data available for this combination.");
    return;
  }

  const labels = dataArr.map((_, index) => `Month ${index + 1}`);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: `${dataType} Data in ${currency}`,
        data: dataArr,
        backgroundColor: "rgba(0,123,255,0.5)",
        borderColor: "rgba(0,123,255,1)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const ctx = document.getElementById("visualChart").getContext("2d");

  if (visualChartInstance) {
    visualChartInstance.destroy();
  }
  visualChartInstance = new Chart(ctx, {
    type: visualChartType,
    data: chartData,
    options: {
      responsive: true,
      scales: {
        y: {
          title: { display: true, text: "Percentage (%)" },
        },
      },
    },
  });
}

function toggleVisualChartType() {
  visualChartType = visualChartType === "bar" ? "line" : "bar";
  document.getElementById("visualGraphTypeText").textContent = visualChartType;
  if (visualChartInstance) {
    viewDataChart();
  }
}

// ==============================
// Compare Data Page Functions
// ==============================
let compareChartType = "bar";
let compareChartInstance = null;

function compareDataChart() {
  const dataType = document.getElementById("compareDataType").value;
  const currency1 = document.getElementById("compareCurrency1").value;
  const currency2 = document.getElementById("compareCurrency2").value;
  const key1 = getKey(dataType, currency1);
  const key2 = getKey(dataType, currency2);
  const dataArr1 = recordedData[key1] || [];
  const dataArr2 = recordedData[key2] || [];

  if (dataArr1.length === 0 || dataArr2.length === 0) {
    alert("Insufficient data for comparison.");
    return;
  }

  const maxLength = Math.max(dataArr1.length, dataArr2.length);
  const labels = Array.from({ length: maxLength }, (_, i) => `Month ${i + 1}`);

  const data1 = [...dataArr1, ...Array(maxLength - dataArr1.length).fill(null)];
  const data2 = [...dataArr2, ...Array(maxLength - dataArr2.length).fill(null)];

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: `${dataType} Data in ${currency1}`,
        data: data1,
        backgroundColor: "rgba(0,123,255,0.5)",
        borderColor: "rgba(0,123,255,1)",
        fill: false,
        tension: 0.1,
      },
      {
        label: `${dataType} Data in ${currency2}`,
        data: data2,
        backgroundColor: "rgba(220,53,69,0.5)",
        borderColor: "rgba(220,53,69,1)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const ctx = document.getElementById("compareChart").getContext("2d");
  if (compareChartInstance) {
    compareChartInstance.destroy();
  }
  compareChartInstance = new Chart(ctx, {
    type: compareChartType,
    data: chartData,
    options: {
      responsive: true,
      scales: {
        y: { title: { display: true, text: "Percentage (%)" } },
      },
    },
  });
}

function toggleCompareChartType() {
  compareChartType = compareChartType === "bar" ? "line" : "bar";
  document.getElementById("compareGraphTypeText").textContent = compareChartType;
  if (compareChartInstance) {
    compareDataChart();
  }
}

// Load stored data when the page opens
window.onload = updateTable;

function toggleMenu() {
  const navLinks = document.getElementById('nav-links');
  navLinks.classList.toggle('show');
}


let lastScrollY = window.pageYOffset;
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.pageYOffset;
      
      // If scrolling up, slide in the navbar; if scrolling down, slide it completely out.
      if (currentScrollY < lastScrollY) {
        navbar.style.transform = "translateY(0)";
      } else {
        navbar.style.transform = "translateY(-100%)";
      }
      
      lastScrollY = currentScrollY;
    });


     // Optional: ensure that if the user is not logged in, they are sent back to the login page.
     if (localStorage.getItem("loggedIn") !== "true") {
      window.location.href = "login.html";
    }


    document.getElementById("logoutBtn").addEventListener("click", function() {
      // Fade out the page and then process logout.
      document.body.style.opacity = '0';
      setTimeout(() => {
        localStorage.removeItem("loggedIn");
        window.location.href = "login.html"; // Or your login page.
      }, 500);
    });

    document.addEventListener("DOMContentLoaded", function() {
      // Trigger the fade-in by setting opacity back to 1.
      document.body.style.opacity = '1';
    });


     