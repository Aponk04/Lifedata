// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, query, where, orderBy } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNlEqwNBYi7uYdDy4iXd7sh1JX4PjIk5M",
    authDomain: "lifedata-9a38d.firebaseapp.com",
    projectId: "lifedata-9a38d",
    storageBucket: "lifedata-9a38d.firebasestorage.app",
    messagingSenderId: "85081493262",
    appId: "1:85081493262:web:61201bacb087fc34cc915f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get references to HTML elements
const addPatientForm = document.getElementById('add-patient-form');
const patientNameInput = document.getElementById('patient-name');
const patientDobInput = document.getElementById('patient-dob');
const patientAddressTextarea = document.getElementById('patient-address');
const patientList = document.getElementById('patient-list');

const medicalRecordSection = document.getElementById('medical-record-section');
const currentPatientNameSpan = document.getElementById('current-patient-name');
const addMedicalRecordForm = document.getElementById('add-medical-record-form');
const medicalRecordNoteTextarea = document.getElementById('medical-record-note');
const medicalRecordList = document.getElementById('medical-record-list');
const backToPatientsButton = document.getElementById('back-to-patients');

let currentPatientId = null;

// --- Fungsi untuk Pasien ---

// Tambah Pasien Baru
addPatientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = patientNameInput.value;
    const dob = patientDobInput.value;
    const address = patientAddressTextarea.value;

    try {
        await addDoc(collection(db, "patients"), {
            name: name,
            dob: dob,
            address: address,
            createdAt: new Date()
        });
        alert('Pasien berhasil ditambahkan!');
        addPatientForm.reset();
    } catch (e) {
        console.error("Error adding document: ", e);
        alert('Gagal menambahkan pasien. Silakan coba lagi.');
    }
});

// Menampilkan daftar pasien secara real-time
const displayPatients = () => {
    onSnapshot(collection(db, "patients"), (snapshot) => {
        patientList.innerHTML = ''; // Clear existing list
        if (snapshot.empty) {
            patientList.innerHTML = '<li>Belum ada pasien yang terdaftar.</li>';
            return;
        }
        snapshot.forEach((doc) => {
            const patient = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${patient.name}</strong><br>
                Tgl Lahir: ${patient.dob}<br>
                Alamat: ${patient.address}</span>
                <button data-id="${doc.id}" data-name="${patient.name}">Lihat Catatan</button>
            `;
            patientList.appendChild(li);
        });
    });
};

// Tangani klik pada tombol "Lihat Catatan" pasien
patientList.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        currentPatientId = e.target.dataset.id;
        currentPatientNameSpan.textContent = e.target.dataset.name;
        document.querySelector('.card:nth-child(1)').style.display = 'none'; // Sembunyikan form tambah pasien
        document.querySelector('.card:nth-child(2)').style.display = 'none'; // Sembunyikan daftar pasien
        medicalRecordSection.style.display = 'block'; // Tampilkan bagian catatan medis
        displayMedicalRecords(currentPatientId);
    }
});

// --- Fungsi untuk Catatan Medis ---

// Tambah Catatan Medis
addMedicalRecordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentPatientId) {
        alert('Pilih pasien terlebih dahulu.');
        return;
    }
    const note = medicalRecordNoteTextarea.value;

    try {
        await addDoc(collection(db, "medicalRecords"), {
            patientId: currentPatientId,
            note: note,
            timestamp: new Date()
        });
        alert('Catatan medis berhasil ditambahkan!');
        addMedicalRecordForm.reset();
    } catch (e) {
        console.error("Error adding medical record: ", e);
        alert('Gagal menambahkan catatan medis. Silakan coba lagi.');
    }
});

// Menampilkan catatan medis pasien tertentu secara real-time
const displayMedicalRecords = (patientId) => {
    const q = query(collection(db, "medicalRecords"),
                    where("patientId", "==", patientId),
                    orderBy("timestamp", "desc")); // Urutkan dari yang terbaru

    onSnapshot(q, (snapshot) => {
        medicalRecordList.innerHTML = ''; // Clear existing list
        if (snapshot.empty) {
            medicalRecordList.innerHTML = '<li>Belum ada catatan medis untuk pasien ini.</li>';
            return;
        }
        snapshot.forEach((doc) => {
            const record = doc.data();
            const li = document.createElement('li');
            const date = record.timestamp.toDate(); // Mengubah Timestamp Firebase ke objek Date
            li.innerHTML = `
                <p>${record.note}</p>
                <span>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
            `;
            medicalRecordList.appendChild(li);
        });
    });
};

// Kembali ke daftar pasien
backToPatientsButton.addEventListener('click', () => {
    currentPatientId = null;
    document.querySelector('.card:nth-child(1)').style.display = 'block'; // Tampilkan form tambah pasien
    document.querySelector('.card:nth-child(2)').style.display = 'block'; // Tampilkan daftar pasien
    medicalRecordSection.style.display = 'none'; // Sembunyikan bagian catatan medis
});

// Panggil fungsi untuk menampilkan pasien saat halaman dimuat
displayPatients();
