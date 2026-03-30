/* =========================================================================
   ISLAMIC APPS CORE SCRIPT (Ready for Encryption/Obfuscation)
   Bebas Cache - Al-Quran Global Search - Hadits API Spesifik
========================================================================= */

// ==========================================
// 1. VARIABEL GLOBAL & PENGATURAN
// ==========================================
let KOTA = "Jakarta"; 
let NEGARA = "Indonesia";
let ukuranArab = 30;
let ukuranLatin = 14;
let modeTampilan = "lengkap"; // "lengkap" atau "arab"
let isCenteredContent = false; 
let isDarkMode = false; 

// Variabel Penampung Data (Nanti diisi otomatis dari file JSON)
let dataDzikirPagi = [];
let dataDzikirPetang = [];
let dataDoaHarian = [];
let dataBacaanShalat = [];
let dataMaulidDetail = [];
let dataTahlil = [];
let dataYasin = [];
let dataAsmaulHusna = [];
// (Tambahkan wadah lain di sini jika ada)

// Variabel State Aplikasi
let stateKitabAktif = "bukhari"; // Default kitab hadits
let stateLoadedHadits = 0;
let limitPerLoad = 50;
let isSearchingGlobalQuran = false;
window.isFetchingSpecificHadith = false;

// ==========================================
// 2. INISIALISASI & TARIK DATA JSON (ANTI-CACHE)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    muatDataJSON();
    
    // Pasang event listener pencarian
    let searchHaditsEl = document.getElementById('searchInputHadits');
    if (searchHaditsEl) {
        searchHaditsEl.addEventListener('keyup', window.filterPencarianHadits);
    }
});

function muatDataJSON() {
    // GANTI LINK DI BAWAH dengan link raw file data.json Anda di Github
    const linkGithubJSON = "https://raw.githubusercontent.com/AsepBelajar/BloggerIslamicApps/main/databaseaplikasiislam.json";
    const urlAntiCache = linkGithubJSON + "?t=" + new Date().getTime();

    fetch(urlAntiCache)
        .then(response => {
            if (!response.ok) throw new Error('Gagal memuat JSON');
            return response.json();
        })
        .then(data => {
            // Masukkan data JSON ke variabel aplikasi
            if(data.dzikirPagi) dataDzikirPagi = data.dzikirPagi;
            if(data.dzikirPetang) dataDzikirPetang = data.dzikirPetang;
            if(data.doaHarian) dataDoaHarian = data.doaHarian;
            if(data.bacaanShalat) dataBacaanShalat = data.bacaanShalat;
            if(data.maulidDetail) dataMaulidDetail = data.maulidDetail;
            if(data.tahlil) dataTahlil = data.tahlil;
            if(data.yasin) dataYasin = data.yasin;
           if(data.nadhomAsmaulHusna) dataAsmaulHusna = data.nadhomAsmaulHusna;
            console.log("Semua data berhasil ditarik dari JSON");
        })
        .catch(error => console.error("Error load JSON:", error));
}

// ==========================================
// 3. MANAJEMEN NAVIGASI & HISTORY
// ==========================================
history.replaceState({ page: 'view-dashboard' }, "", "");

function bukaHalaman(idHalaman, pushState = true) {
    document.querySelectorAll('.page-view').forEach(el => el.style.display = 'none');
    
    let targetEl = document.getElementById(idHalaman);
    if(targetEl) targetEl.style.display = 'block';
    
    window.scrollTo(0, 0);
    if (pushState) { history.pushState({ page: idHalaman }, "", ""); }
    
    // Load surat jika belum ada
    if(idHalaman === 'view-quran' && document.getElementById('daftar-surat').innerHTML.includes('Memuat')) { 
        if(typeof loadDaftarSurat === "function") loadDaftarSurat(); 
    }
}

function kembali() {
    let searchInputs = ['searchInput', 'searchInputSurah', 'searchInputAyat', 'searchInputHadits', 'searchInputDzikir'];
    searchInputs.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    // Hapus box pencarian global jika ada
    let quranBox = document.getElementById('quran-global-search-result');
    if (quranBox) quranBox.remove();
    let haditsBox = document.getElementById('specific-hadith-result');
    if (haditsBox) haditsBox.remove();
    
    window.history.back();
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        bukaHalaman(event.state.page, false);
    } else {
        bukaHalaman('view-dashboard', false);
    }
});

// ==========================================
// 4. PENGATURAN TAMPILAN (RTL & FONT)
// ==========================================
function terapkanPengaturan() {
    // Set Ukuran Font
    document.documentElement.style.setProperty('--ukuran-arab', ukuranArab + 'px');
    document.documentElement.style.setProperty('--ukuran-latin', ukuranLatin + 'px');

    // Set Mode Tampilan (Arab Saja / Lengkap)
    const contentBoxes = document.querySelectorAll('.content-box');
    contentBoxes.forEach(box => {
        const latinText = box.querySelector('.teks-arti');
        if (latinText) {
            latinText.style.display = (modeTampilan === "arab") ? "none" : "block";
        }
        
        if (modeTampilan === "arab") {
            box.classList.add('arab-only-mode');
        } else {
            box.classList.remove('arab-only-mode');
        }
        
        if (isCenteredContent) {
            box.classList.add('center-mode');
        } else {
            box.classList.remove('center-mode');
        }
    });
}

// ==========================================
// 5. PENCARIAN AL-QURAN GLOBAL (API CLOUD)
// ==========================================
async function filterPencarianSurah() {
    let input = document.getElementById('searchInputSurah').value.toLowerCase().trim();
    let container = document.getElementById('daftar-surat');
    
    if (input === '') {
        isSearchingGlobalQuran = false;
        let quranBox = document.getElementById('quran-global-search-result');
        if (quranBox) quranBox.remove();
        let items = container.getElementsByClassName('list-item');
        for (let i = 0; i < items.length; i++) items[i].style.display = "flex";
        return;
    }

    // Filter lokal
    let items = container.getElementsByClassName('list-item');
    for (let i = 0; i < items.length; i++) {
        let textContext = items[i].innerText.toLowerCase();
        items[i].style.display = textContext.includes(input) ? "flex" : "none";
    }

    // Filter Global jika lebih dari 3 huruf
    if (input.length >= 3 && !isSearchingGlobalQuran) {
        isSearchingGlobalQuran = true;
        
        let searchResultBox = document.getElementById('quran-global-search-result');
        if (!searchResultBox) {
            searchResultBox = document.createElement('div');
            searchResultBox.id = 'quran-global-search-result';
            searchResultBox.style.marginTop = '20px';
            container.appendChild(searchResultBox);
        }
        searchResultBox.innerHTML = "<div class='loader'></div><center><i>Mencari '" + input + "' di seluruh Al-Qur'an...</i></center>";

        try {
            const response = await fetch(`https://api.alquran.cloud/v1/search/${input}/all/id.indonesian`);
            const result = await response.json();

            if (result.code === 200 && result.data.matches.length > 0) {
                let html = `<div class='content-title' style='margin-bottom:10px;'>Ditemukan ${result.data.matches.length} ayat mengandung kata "${input}"</div>`;
                result.data.matches.forEach(match => {
                    html += `
                    <div class='content-box'>
                        <div class='content-title' style='direction:ltr; text-align:left;'>Surat ${match.surah.englishName} : Ayat ${match.numberInSurah}</div>
                        <div class='teks-arti' style='border-bottom:none; margin-bottom:0; padding-bottom:0;'>${match.text}</div>
                    </div>`;
                });
                searchResultBox.innerHTML = html;
            } else {
                searchResultBox.innerHTML = "<center><i>Ayat tidak ditemukan.</i></center>";
            }
        } catch (error) {
            searchResultBox.innerHTML = "<center><i style='color:red;'>Gagal mencari, periksa koneksi internet.</i></center>";
        } finally {
            isSearchingGlobalQuran = false;
        }
    } else if (input.length < 3) {
        let quranBox = document.getElementById('quran-global-search-result');
        if (quranBox) quranBox.innerHTML = "";
    }
}

function filterPencarianAyat() {
    let input = document.getElementById('searchInputAyat').value.toLowerCase();
    let items = document.getElementById('quran-detail-content').children;
    for (let i = 0; i < items.length; i++) {
        if(items[i].className === 'loader') continue;
        let textContext = items[i].innerText.toLowerCase();
        items[i].style.display = textContext.includes(input) ? "" : "none";
    }
}

