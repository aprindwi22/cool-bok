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

// ================= INIT FIREBASE =================
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// ================= ELEMENT =================
const tempEl = document.getElementById("temp");
const statusEl = document.getElementById("status");
const logTable = document.getElementById("logTable");

// ================= CEK LOGIN =================
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// ================= CHART =================
const ctx = document.getElementById("tempChart").getContext("2d");

const tempChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Temperature",
      data: [],
      borderColor: "#00ffff",
      tension: 0.3,
      fill: false
    }]
  }
});

// ================= MODE =================
let currentMode = 0;

db.ref("coolbox/mode").on("value", (snap) => {
  currentMode = Number(snap.val()) || 0;
});

// ================= TEMPERATURE =================
db.ref("coolbox/temperature_c").on("value", (snap) => {
  const temp = Number(snap.val());

  if (isNaN(temp)) return;

  tempEl.innerText = temp.toFixed(1);

  // ===== chart update =====
  const time = new Date().toLocaleTimeString();

  tempChart.data.labels.push(time);
  tempChart.data.datasets[0].data.push(temp);

  if (tempChart.data.labels.length > 20) {
    tempChart.data.labels.shift();
    tempChart.data.datasets[0].data.shift();
  }

  tempChart.update();

  // ===== status logic =====
  if (currentMode === 0) {
    statusEl.innerText = "OFF";
  } else if (temp > 8 && currentMode === 1) {
    statusEl.innerText = "COOLING";
  } else if (temp > 15 && currentMode === 2) {
    statusEl.innerText = "COOLING";
  } else {
    statusEl.innerText = "STABLE";
  }
});

// ================= LOG TABLE =================
db.ref("coolbox/logs").on("value", (snap) => {
  logTable.innerHTML = "";

  snap.forEach((child) => {
    const d = child.val();

    const waktu = d.timestamp
      ? new Date(d.timestamp).toLocaleString("id-ID")
      : "-";

    const suhu = d.temperature ?? "-";
    const mode = d.mode ?? "-";
    const aksi = d.peltier ? "ON" : "OFF";

    logTable.innerHTML += `
      <tr>
        <td>${waktu}</td>
        <td>${suhu}</td>
        <td>${mode}</td>
        <td>${aksi}</td>
      </tr>
    `;
  });
});

// ================= MODE CONTROL =================
function setMode(mode) {
  db.ref("coolbox").update({ mode });
}

// ================= SIMPAN MANUAL =================
function simpanManual() {
  db.ref("coolbox").once("value").then((snap) => {
    const d = snap.val();

    db.ref("coolbox/logs").push({
      temperature: d.temperature_c,
      mode: d.mode,
      peltier: d.peltier || false,
      timestamp: Date.now()
    });

    alert("Data tersimpan");
  });
}

// ================= HAPUS LOG =================
function hapusSemua() {
  if (confirm("Hapus semua data log?")) {
    db.ref("coolbox/logs").remove();
  }
}

// ================= EXPORT EXCEL FIX =================
function exportExcel() {
  db.ref("coolbox/logs").once("value")
    .then((snap) => {
      const data = snap.val();

      if (!data) {
        alert("Data kosong");
        return;
      }

      let csv = "Waktu,Suhu,Mode,Aksi\n";

      Object.values(data).forEach((d) => {
        const waktu = d.timestamp
          ? new Date(d.timestamp).toLocaleString("id-ID")
          : "-";

        const suhu = d.temperature ?? "-";
        const mode = d.mode ?? "-";
        const aksi = d.peltier ? "ON" : "OFF";

        csv += ${waktu},${suhu},${mode},${aksi}\n;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "coolbox_data.csv";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1500);
    })
    .catch((err) => {
      console.log(err);
      alert("Export gagal");
    });
}

// ================= LOGOUT =================
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
