// Fungsi untuk mendeteksi ancaman STRIDE berdasarkan input transaksi
function detectStrideThreats(username, amount) {
    const strideLog = [];

    if (username.toLowerCase().includes("admin")) {
        strideLog.push("Spoofing detected: Username contains 'admin'.");
    }
    if (username.length < 3) {
        strideLog.push("Spoofing detected: Suspicious short username.");
    }
    if (amount > 10000000) {
        strideLog.push("Tampering detected: Unusual high transaction amount.");
    }

    if (username === "") {
        strideLog.push("Repudiation detected: Username field is empty.");
    }

    return strideLog;
}

// Fungsi untuk menilai risiko DREAD berdasarkan input transaksi
function calculateDreadRisk(username, amount) {
    const dreadLog = [];
    if (amount > 10000000) {
        dreadLog.push({ title: "High-value transaction", score: 8 });
    }
    if (username.length < 3) {
        dreadLog.push({ title: "Suspicious short username", score: 7 });
    }
    if (amount % 1000 !== 0) {
        dreadLog.push({ title: "Unusual transaction amount", score: 6 });
    }

    return dreadLog;
}

// Fungsi untuk menambahkan log STRIDE ke elemen HTML
function addStrideLog(logs) {
    const strideList = document.getElementById("stride-list");
    strideList.innerHTML = ""; // Clear previous logs
    logs.forEach((log) => {
        const listItem = document.createElement("li");
        listItem.textContent = log;
        strideList.appendChild(listItem);
    });
}

// Fungsi untuk menambahkan log DREAD ke elemen HTML
function addDreadLog(logs) {
    const dreadList = document.getElementById("dread-list");
    dreadList.innerHTML = ""; // Clear previous logs
    logs.forEach((log) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<strong>${log.title}</strong> - Risk Score: ${log.score}`;
        dreadList.appendChild(listItem);
    });
}

// Simulasi pengiriman transaksi



// Data pelatihan (Contoh: username length, amount, threat level)
const trainingData = tf.tensor2d([
    [3, 20000], // Pendek (username length < 4), Amount kecil
    [7, 10000000], // Normal username, Amount tinggi
    [2, 1000000], // Pendek username, Amount sedang
    [10, 50000000], // Panjang username, Amount besar
], [4, 2]); // 4 sampel, 2 fitur

// Label (0 = Tidak Berisiko, 1 = Berisiko)
const outputData = tf.tensor2d([
    [0], // Tidak Berisiko
    [1], // Berisiko
    [1], // Berisiko
    [1], // Berisiko
], [4, 1]); // 4 sampel, 1 label

// Membuat dan melatih model
const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [2], units: 4, activation: 'relu' }));
model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

// Melatih model
model.fit(trainingData, outputData, { epochs: 50 }).then(() => {
    console.log("Model trained!");

    // Pindahkan event listener ke sini agar hanya ditambahkan setelah model dilatih
    document.getElementById("transaction-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const amount = parseInt(document.getElementById("amount").value, 10);

        if (!amount) {
            alert("Mohon lengkapi semua data transaksi!");
            return;
        }

        // Prediksi risiko menggunakan ML
        const riskScore = await predictRisk(username, amount);

        // Menampilkan hasil prediksi
        if (riskScore > 0.5) {
            alert(`⚠️ Transaksi dari ${username} sejumlah Rp ${amount} terdeteksi berisiko tinggi!`);
        } else {
            alert(`✅ Transaksi dari ${username} sejumlah Rp ${amount} aman.`);
        }

        // Deteksi ancaman STRIDE dan DREAD (logik sebelumnya)
        const strideThreats = detectStrideThreats(username, amount);
        addStrideLog(strideThreats);

        const dreadRisks = calculateDreadRisk(username, amount);
        addDreadLog(dreadRisks);
    });
});

// Fungsi untuk memprediksi risiko berdasarkan input pengguna
async function predictRisk(username, amount) {
    const usernameLength = username.length;
    const inputTensor = tf.tensor2d([[usernameLength, amount]]);
    const prediction = await model.predict(inputTensor).data();

    return prediction[0]; // Nilai risiko (0 = aman, 1 = berisiko)
}


