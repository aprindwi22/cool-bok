// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyAJeM3MnB2dbbTNFV9htfDLJk1f8ZsIo34",
  authDomain: "monitoring-coler-box.firebaseapp.com",
  databaseURL: "https://monitoring-coler-box-default-rtdb.firebaseio.com",
  projectId: "monitoring-coler-box",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ================= ELEMENT =================
const tempEl = document.getElementById("temp");
const statusEl = document.getElementById("status");
const logTable = document.getElementById("logTable");

// ================= CHART =================
const ctx = document.getElementById("tempChart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Suhu",
      data: [],
      borderColor: "cyan",
      fill: false
    }]
  }
});

// ================= MODE =================
let modeNow = 0;

db.ref("coolbox/mode").on("value", s => {
  modeNow = Number(s.val()) || 0;
});

// ================= TEMP =================
db.ref("coolbox/temperature_c").on("value", s => {
  const temp = parseFloat(s.val());
  if (isNaN(temp)) return;

  tempEl.innerText = temp.toFixed(1);

  // chart update
  const time = new Date().toLocaleTimeString();

  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(temp);

  if (chart.data.labels.length > 15) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();

  // status
  if (modeNow === 0) statusEl.innerText = "OFF";
  else if (temp > 8) statusEl.innerText = "COOLING";
  else statusEl.innerText = "STABLE";
});

// ================= LOG =================
db.ref("coolbox/logs").on("value", snap => {
  logTable.innerHTML = "";

  snap.forEach(child => {
    const d = child.val();

    const waktu = d.timestamp
      ? new Date(d.timestamp).toLocaleString("id-ID")
      : "-";

    logTable.innerHTML += `
      <tr>
        <td>${waktu}</td>
        <td>${d.temperature ?? "-"}</td>
        <td>${d.mode ?? "-"}</td>
        <td>${d.peltier ? "ON" : "OFF"}</td>
      </tr>
    `;
  });
});

// ================= MODE =================
function setMode(m) {
  db.ref("coolbox").update({ mode: m });
}

// ================= SIMPAN =================
function simpanManual() {
  db.ref("coolbox").once("value").then(s => {
    const d = s.val();

    db.ref("coolbox/logs").push({
      temperature: d.temperature_c,
      mode: d.mode,
      peltier: d.peltier,
      timestamp: Date.now()
    });
  });
}

// ================= HAPUS =================
function hapusSemua() {
  db.ref("coolbox/logs").remove();
}

// ================= EXPORT (FIXED) =================
function exportExcel() {
  db.ref("coolbox/logs").once("value").then(snap => {
    const data = snap.val();
    if (!data) return alert("Kosong");

    let csv = "Waktu,Suhu,Mode,Aksi\n";

    Object.values(data).forEach(d => {
      csv += ${new Date(d.timestamp).toLocaleString()},${d.temperature},${d.mode},${d.peltier ? "ON":"OFF"}\n;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "coolbox.csv";
    a.click();
  });
}
