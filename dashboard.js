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
const db = firebase.database();

// ================= ELEMENT =================
const tempEl = document.getElementById("temp");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("logTable");

// ================= LOGIN CHECK =================
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// ================= MODE =================
let currentMode = 0;

db.ref("coolbox/mode").on("value", (snap) => {
  currentMode = Number(snap.val()) || 0;
});

// ================= TEMPERATURE =================
db.ref("coolbox/temperature_c").on("value", (snap) => {
  const temp = parseFloat(snap.val());
  if (isNaN(temp)) return;

  if (tempEl) tempEl.innerText = temp.toFixed(1);

  updateStatus(temp);
});

// ================= STATUS LOGIC =================
function updateStatus(temp) {
  if (!statusEl) return;

  let status = "STABLE";

  if (currentMode === 0) {
    status = "OFF";
  } 
  else if (currentMode === 1) {
    status = temp > 8 ? "COOLING" : "STABLE";
  } 
  else if (currentMode === 2) {
    status = temp > 15 ? "COOLING" : "STABLE";
  }

  if (temp >= 30) {
    status = "WARNING";
  }

  statusEl.innerText = status;
}

// ================= LOG DATA =================
db.ref("coolbox/logs").on("value", (snap) => {
  if (!logEl) return;

  logEl.innerHTML = "";

  snap.forEach((child) => {
    const d = child.val();

    const waktu = d.timestamp
      ? new Date(d.timestamp).toLocaleString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit"
        })
      : "--";

    const suhu = d.temperature !== undefined ? Number(d.temperature).toFixed(1) : "--";
    const mode = d.mode ?? "--";
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

// ================= SET MODE =================
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
      peltier: d.peltier,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  });
}

// ================= HAPUS LOG =================
function hapusSemua() {
  if (confirm("Hapus semua data?")) {
    db.ref("coolbox/logs").remove();
  }
}

// ================= LOGOUT =================
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
