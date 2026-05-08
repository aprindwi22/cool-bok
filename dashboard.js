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

// ================= ELEMENT (WAJIB SESUAI HTML) =================
const tempEl = document.getElementById("temp");
const timeEl = document.getElementById("time");
const modeEl = document.getElementById("mode");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("logTable");

// ================= STATE =================
let currentMode = 0;

// ================= TIME (NO SECOND) =================
function updateTime() {
  const now = new Date();

  const jam = String(now.getHours()).padStart(2, '0');
  const menit = String(now.getMinutes()).padStart(2, '0');

  if (timeEl) {
    timeEl.innerText = ${jam}:${menit};
  }
}

setInterval(updateTime, 1000);
updateTime();

// ================= TEMPERATURE (DS18B20) =================
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

  if (modeEl) {
    if (currentMode === 0) modeEl.innerText = "OFF";
    else if (currentMode === 1) modeEl.innerText = "2–8°C";
    else if (currentMode === 2) modeEl.innerText = "8–15°C";
    else modeEl.innerText = "UNKNOWN";
  }
});

// ================= STATUS LOGIC (ICU STYLE) =================
function updateStatus(temp) {

  let status = "STABLE";
  let color = "#2ecc71";

  if (currentMode === 0) {
    status = "OFF";
    color = "#7f8c8d";
  }

  else if (currentMode === 1) {
    if (temp > 8) status = "COOLING";
    else status = "STABLE";
    color = "#3498db";
  }

  else if (currentMode === 2) {
    if (temp > 15) status = "COOLING";
    else status = "STABLE";
    color = "#3498db";
  }

  if (temp < 5 && currentMode !== 0) {
    status = "COLD";
    color = "#00ffff";
  }

  statusEl.innerText = status;
  statusEl.style.color = color;
}

// ================= LOG TABLE =================
db.ref("coolbox/logs").on("value", (snap) => {

  logEl.innerHTML = "";

  snap.forEach((child) => {
    const d = child.val();

    const waktu = d.timestamp
      ? new Date(d.timestamp).toLocaleString("id-ID")
      : "-";

    const suhu = d.temperature !== undefined
      ? parseFloat(d.temperature).toFixed(1)
      : "-";

    const mode = d.mode ?? "-";

    const aksi = d.peltier === true ? "ON" : "OFF";

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
