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

// SAFE GET ELEMENT
function get(id) {
  return document.getElementById(id);
}

const tempEl = get("temp");
const timeEl = get("time");
const modeEl = get("mode");
const statusEl = get("status");
const logEl = get("logTable");

let currentMode = 0;

// ================= TIME =================
function updateTime() {
  const now = new Date();
  const jam = String(now.getHours()).padStart(2, '0');
  const menit = String(now.getMinutes()).padStart(2, '0');

  if (timeEl) timeEl.innerText = ${jam}:${menit};
}
setInterval(updateTime, 1000);
updateTime();

// ================= MODE =================
db.ref("coolbox/mode").on("value", (snap) => {
  currentMode = parseInt(snap.val()) || 0;

  if (!modeEl) return;

  if (currentMode === 0) modeEl.innerText = "OFF";
  else if (currentMode === 1) modeEl.innerText = "2–8°C";
  else if (currentMode === 2) modeEl.innerText = "8–15°C";
});

// ================= TEMP =================
db.ref("coolbox/temperature_c").on("value", (snap) => {
  let temp = parseFloat(snap.val());
  if (isNaN(temp)) return;

  if (tempEl) tempEl.innerText = temp.toFixed(1);
  updateStatus(temp);
});

// ================= STATUS =================
function updateStatus(temp) {
  if (!statusEl) return;

  let status = "STABLE";

  if (currentMode === 0) status = "OFF";
  else if (temp > 8 && currentMode === 1) status = "COOLING";
  else if (temp > 15 && currentMode === 2) status = "COOLING";

  statusEl.innerText = status;
}

// ================= LOG =================
db.ref("coolbox/logs").on("value", (snap) => {
  if (!logEl) return;

  logEl.innerHTML = "";

  snap.forEach((child) => {
    const d = child.val();

    const waktu = d.timestamp
      ? new Date(d.timestamp).toLocaleString("id-ID")
      : "-";

    const suhu = d.temperature ?? "-";
    const mode = d.mode ?? "-";
    const aksi = d.peltier ? "ON" : "OFF";

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

// ================= BUTTON FUNCTIONS (WAJIB ADA) =================
function setMode(mode) {
  db.ref("coolbox").update({ mode });
}

function simpanManual() {
  db.ref("coolbox").once("value").then((snap) => {
    const d = snap.val();

    db.ref("coolbox/logs").push({
      temperature: d.temperature_c,
      mode: d.mode,
      peltier: d.peltier,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  });
}

function hapusSemua() {
  if (confirm("Hapus semua data?")) {
    db.ref("coolbox/logs").remove();
  }
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}
