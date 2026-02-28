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
const auth = firebase.auth();
const database = firebase.database();

// ================= CEK LOGIN =================
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// ================= ELEMENT =================
const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");
const statusEl = document.getElementById("status");
const logTable = document.getElementById("logTable");

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
      y: { beginAtZero: false }
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

  if (status === "MODE_18_25_ACTIVE") {
    statusEl.style.color = "#f39c12";
  } else if (status === "MODE_8_15_ACTIVE") {
    statusEl.style.color = "#3498db";
  } else {
    statusEl.style.color = "#7f8c8d";
  }
});

// ================= SET MODE =================
function setMode(mode) {
  database.ref("coolbox").update({ mode });
}

// ================= SIMPAN MANUAL =================
function simpanManual() {
  Promise.all([
    database.ref("coolbox/temperature_c").once("value"),
    database.ref("coolbox/humidity").once("value")
  ]).then(([tempSnap, humSnap]) => {

    const temp = tempSnap.val();
    const hum = humSnap.val();

    database.ref("coolbox/logs").push({
      temperature: temp,
      humidity: hum,
      timestamp: Date.now()
    });

    alert("Data berhasil disimpan!");
  });
}

// ================= HAPUS SEMUA =================
function hapusSemua() {
  if (confirm("Yakin hapus semua logs?")) {
    database.ref("coolbox/logs").remove();
  }
}

// ================= HAPUS SATU =================
function hapusSatu(key) {
  database.ref("coolbox/logs/" + key).remove();
}

// ================= TAMPILKAN LOGS =================
database.ref("coolbox/logs").on("value", (snapshot) => {

  logTable.innerHTML = "";

  const data = snapshot.val();
  if (!data) return;

  Object.keys(data).forEach((key) => {

    const item = data[key];
    const waktu = new Date(item.timestamp).toLocaleString();

    logTable.innerHTML += `
      <tr>
        <td>${waktu}</td>
        <td>${item.temperature}</td>
        <td>${item.humidity}</td>
        <td>
          <button onclick="hapusSatu('${key}')">Hapus</button>
        </td>
      </tr>
    `;
  });
});

// ================= LOGOUT =================
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
