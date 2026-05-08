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
const db = firebase.database();

// ================= ELEMENT =================
const tempEl = document.getElementById("temp");
const timeEl = document.getElementById("time");
const modeEl = document.getElementById("mode");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");

// ================= GLOBAL =================
let currentMode = 0;

// ================= TIME REALTIME =================
setInterval(() => {
  const now = new Date();

  const jam = String(now.getHours()).padStart(2, '0');
  const menit = String(now.getMinutes()).padStart(2, '0');

  timeEl.innerText = ${jam}:${menit};
}, 1000);

// ================= TEMPERATURE =================
db.ref("coolbox/temperature_c").on("value", (snap) => {
  let temp = snap.val();

  if (temp === null || temp === undefined) return;

  temp = parseFloat(temp);
  if (isNaN(temp)) return;

  tempEl.innerText = temp.toFixed(1);

  updateStatus(temp);
});

// ================= MODE =================
db.ref("coolbox/mode").on("value", (snap) => {
  let mode = snap.val();

  currentMode = parseInt(mode);
  if (isNaN(currentMode)) currentMode = 0;

  if (currentMode === 0) modeEl.innerText = "OFF";
  else if (currentMode === 1) modeEl.innerText = "2–8°C";
  else if (currentMode === 2) modeEl.innerText = "8–15°C";
  else modeEl.innerText = "UNKNOWN";
});

// ================= STATUS LOGIC MEDIS =================
function updateStatus(temp) {

  let status = "STABLE";
  let colorClass = "stable";

  if (currentMode === 0) {
    status = "OFF";
    colorClass = "off";
  }

  else if (currentMode === 1) {
    if (temp > 8) {
      status = "COOLING";
      colorClass = "cooling";
    }
  }

  else if (currentMode === 2) {
    if (temp > 15) {
      status = "COOLING";
      colorClass = "cooling";
    }
  }

  if (temp < 5 && currentMode !== 0) {
    status = "COLD";
    colorClass = "cooling";
  }

  statusEl.innerText = status;

  statusEl.className = "status " + colorClass;
}

// ================= LOG DATA =================
db.ref("coolbox/logs").on("value", (snap) => {

  logEl.innerHTML = "";

  snap.forEach((child) => {
    const d = child.val();

    const waktu = d.timestamp
      ? new Date(d.timestamp).toLocaleString("id-ID")
      : "-";

    const suhu = (d.temperature !== undefined)
      ? parseFloat(d.temperature).toFixed(1)
      : "-";

    const mode = (d.mode !== undefined)
      ? d.mode
      : "-";

    const aksi = (d.peltier === true)
      ? "ON"
      : "OFF";

    logEl.innerHTML += `
      <tr>
        <td>${waktu}</td>
        <td>${suhu}</td>
        <td>${mode}</td>
        <td>${aksi}</td>
      </tr>
    `;
  });
});
