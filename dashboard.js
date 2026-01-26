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

// ================= READ TEMPERATURE =================
database.ref("coolbox/temperature_c").on("value", (snapshot) => {
  document.getElementById("temp").innerText = snapshot.val();
});

// ================= READ HUMIDITY =================
database.ref("coolbox/humidity").on("value", (snapshot) => {
  document.getElementById("hum").innerText = snapshot.val();
});

// ================= READ STATUS =================
database.ref("coolbox/relay_status").on("value", (snapshot) => {
  document.getElementById("status").innerText = snapshot.val();
});

// ================= BUTTON =================
function setMode(mode) {
  database.ref("coolbox").update({
    mode: mode
  });
}
