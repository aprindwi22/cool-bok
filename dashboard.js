// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAJeM3MnB2dbbTNFV9htfDLJk1f8ZsIo34",
  authDomain: "monitoring-coler-box.firebaseapp.com",
  databaseURL: "https://monitoring-coler-box-default-rtdb.firebaseio.com",
  projectId: "monitoring-coler-box",
  storageBucket: "monitoring-coler-box.firebasestorage.app",
  messagingSenderId: "496909050006",
  appId: "1:496909050006:web:d0eb1930e5ae7f6fe962b7"
};

// ================= INIT =================
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ================= ELEMENT =================
const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");
const statusEl = document.getElementById("status");

// ================= CHART =================
const ctx = document.getElementById("tempChart").getContext("2d");

let tempData = {
  labels: [],
  datasets: [{
    label: "Temperature (°C)",
    data: [],
    borderWidth: 2,
    fill: false,
    tension: 0.3
  }]
};

const tempChart = new Chart(ctx, {
  type: "line",
  data: tempData,
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }
});

// ================= READ TEMPERATURE =================
database.ref("coolbox/temperature_c").on("value", (snapshot) => {
  const temp = snapshot.val();
  if (temp == null) return;

  tempEl.innerText = temp.toFixed(1);

  const time = new Date().toLocaleTimeString();

  if (tempData.labels.length > 10) {
    tempData.labels.shift();
    tempData.datasets[0].data.shift();
  }

  tempData.labels.push(time);
  tempData.datasets[0].data.push(temp);

  tempChart.update();
});

// ================= READ HUMIDITY =================
database.ref("coolbox/humidity").on("value", (snapshot) => {
  humEl.innerText = snapshot.val();
});

// ================= READ STATUS =================
database.ref("coolbox/relay_status").on("value", (snapshot) => {
  const status = snapshot.val();
  statusEl.innerText = status;

  // ===== WARNA STATUS =====
  if (status === "MODE_18_25_ACTIVE") {
    statusEl.style.color = "#f39c12"; // ORANGE
  } 
  else if (status === "MODE_8_15_ACTIVE") {
    statusEl.style.color = "#3498db"; // BIRU
  } 
  else {
    statusEl.style.color = "#aaa"; // OFF
  }
});

// ================= BUTTON =================
function setMode(mode) {
  database.ref("coolbox").update({
    mode: mode
  });
}
