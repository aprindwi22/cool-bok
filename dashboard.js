const firebaseConfig = {
  apiKey: "AIzaSyAJeM3MnB2dbbTNFV9htfDLJk1f8ZsIo34",
  databaseURL: "https://monitoring-coler-box-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

// ===== KONTROL MODE =====
function setMode(mode) {
  db.ref("/coolbox/mode").set(mode);
}

// ===== AMBIL DATA REALTIME =====
db.ref("/coolbox").on("value", snapshot => {
  const data = snapshot.val();

  document.getElementById("temp").innerText =
    data.temperature_c ?? "--";

  document.getElementById("hum").innerText =
    data.humidity ?? "--";

  document.getElementById("status").innerText =
    data.relay_status ?? "--";
});
