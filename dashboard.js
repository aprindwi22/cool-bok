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
      y: {
        beginAtZero: false
      }
    }
  }
});

// ================= MODE =================
let currentMode = 0;

database.ref("coolbox/mode").on("value", (snapshot) => {
  currentMode = snapshot.val();
});

// ================= READ TEMPERATURE =================
database.ref("coolbox/temperature_c").on("value", (snapshot) => {

  const temp = snapshot.val();

  if (temp == null) return;

  tempEl.innerText = parseFloat(temp).toFixed(1);

  // ===== GRAFIK =====
  const time = new Date().toLocaleTimeString();

  if (tempData.labels.length > 10) {
    tempData.labels.shift();
    tempData.datasets[0].data.shift();
  }

  tempData.labels.push(time);
  tempData.datasets[0].data.push(temp);

  tempChart.update();

  // ===== STATUS =====
  let status = "STABLE";

  if (currentMode == 1 && temp > 8) {
    status = "COOLING";
  }

  if (currentMode == 2 && temp > 15) {
    status = "COOLING";
  }

  if (temp < 5) {
    status = "COLD";
  }

  statusEl.innerText = status;

  if (status === "COOLING") {
    statusEl.style.color = "#f39c12";
  }
  else if (status === "COLD") {
    statusEl.style.color = "#3498db";
  }
  else {
    statusEl.style.color = "#7f8c8d";
  }
});

// ================= SET MODE =================
function setMode(mode) {

  database.ref("coolbox").update({
    mode: mode
  });

}

// ================= SIMPAN MANUAL =================
function simpanManual() {

  database.ref("coolbox/temperature_c")
    .once("value")
    .then((tempSnap) => {

      const temp = tempSnap.val();

      database.ref("coolbox/logs").push({
        temperature: temp,
        mode: currentMode,
        aksi: "MANUAL_SAVE",
        timestamp: firebase.database.ServerValue.TIMESTAMP
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

// ================= TAMPILKAN LOGS =================
database.ref("coolbox/logs").on("value", (snapshot) => {

  logTable.innerHTML = "";

  const data = snapshot.val();

  if (!data) return;

  Object.keys(data).forEach((key) => {

    const item = data[key];

    const waktu = item.timestamp
      ? new Date(item.timestamp).toLocaleString("id-ID")
      : "-";

    let modeText = "-";

    if (item.mode == 0) modeText = "OFF";
    else if (item.mode == 1) modeText = "2-8C";
    else if (item.mode == 2) modeText = "8-15C";

    logTable.innerHTML += `
      <tr>
        <td>${waktu}</td>
        <td>${item.temperature}</td>
        <td>${modeText}</td>
        <td>${item.aksi || "-"}</td>
      </tr>
    `;

  });

});

//================= EXPORT CSV =================
function exportCSV() {

  database.ref("coolbox/logs").once("value")
    .then((snapshot) => {

      const data = snapshot.val();

      if (!data) {
        alert("Data kosong!");
        return;
      }

      let csvContent = "Waktu,Suhu,Mode,Aksi\n";

      Object.keys(data).forEach((key) => {

        const item = data[key];

        const waktu = item.timestamp
          ? new Date(item.timestamp).toLocaleString("id-ID")
          : "-";

        const suhu = item.temperature ?? "-";

        let modeText = "-";

        if (item.mode == 0) modeText = "OFF";
        else if (item.mode == 1) modeText = "2-8C";
        else if (item.mode == 2) modeText = "8-15C";

        const aksi = item.aksi || "-";

        csvContent +=
          waktu + "," +
          suhu + "," +
          modeText + "," +
          aksi + "\n";
      });

      // ===== BUAT FILE =====
      const blob = new Blob(
        [csvContent],
        { type: "text/csv;charset=utf-8;" }
      );

      // ===== KHUSUS ANDROID =====
      const reader = new FileReader();

      reader.onload = function() {

        const link = document.createElement("a");

        link.href = reader.result;

        link.download = "coolbox_logs.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
      };

      reader.readAsDataURL(blob);

    })
    .catch((error) => {

      console.log(error);

      alert("Gagal export CSV");

    });

}

}

// ================= LOGOUT =================
function logout() {

  auth.signOut().then(() => {

    window.location.href = "index.html";

  });

}
