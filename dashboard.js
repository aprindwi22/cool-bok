const firebaseConfig = {
  apiKey: "AIzaSyAJeM3MnB2dbbTNFV9htfDLJk1f8ZsIo34",
  authDomain: "monitoring-coler-box.firebaseapp.com",
  databaseURL: "https://monitoring-coler-box-default-rtdb.firebaseio.com",
  projectId: "monitoring-coler-box",
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const auth = firebase.auth();

const tempEl = document.getElementById("temp");
const statusEl = document.getElementById("status");
const logTable = document.getElementById("logTable");

// ================= TEMPERATURE =================
database.ref("coolbox/temperature_c").on("value", (snap) => {
  const temp = snap.val();
  if (!temp) return;

  tempEl.innerText = temp.toFixed(1);

  if (temp < 8) {
    statusEl.innerText = "COOLING";
    statusEl.style.color = "#00ffcc";
  } else if (temp < 15) {
    statusEl.innerText = "STABLE";
    statusEl.style.color = "#ffd700";
  } else {
    statusEl.innerText = "HIGH TEMP";
    statusEl.style.color = "#ff4d4d";
  }
});

// ================= MODE =================
function setMode(mode) {
  database.ref("coolbox").update({ mode });
}

// ================= SIMPAN MANUAL =================
function simpanManual() {
  database.ref("coolbox/temperature_c").once("value").then((t) => {
    const temp = t.val();

    database.ref("coolbox/logs").push({
      temperature: temp,
      mode: "AUTO",
      timestamp: Date.now()
    });
  });
}

// ================= DELETE ALL =================
function hapusSemua() {
  database.ref("coolbox/logs").remove();
}

// ================= LOAD LOG =================
database.ref("coolbox/logs").on("value", (snap) => {
  logTable.innerHTML = "";

  const data = snap.val();
  if (!data) return;

  Object.values(data).forEach((item) => {

    const waktu = item.timestamp
      ? new Date(item.timestamp).toLocaleString("id-ID")
      : "-";

    logTable.innerHTML += `
      <tr>
        <td>${waktu}</td>
        <td>${item.temperature.toFixed(1)}</td>
        <td>${item.mode}</td>
      </tr>
    `;
  });
});

// ================= EXPORT CSV (EXCEL) =================
function exportCSV() {

  database.ref("coolbox/logs").once("value").then((snap) => {

    const data = snap.val();
    if (!data) {
      alert("Data kosong!");
      return;
    }

    let csv = "Waktu,Suhu,Mode\n";

    Object.values(data).forEach((item) => {

      const waktu = item.timestamp
        ? new Date(item.timestamp).toLocaleString("id-ID")
        : "-";

      csv += ${waktu},${item.temperature},${item.mode}\n;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "coolbox_data.csv";
    a.click();

    URL.revokeObjectURL(url);
  });
}

// ================= LOGOUT =================
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
