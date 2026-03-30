// ==========================================
// 1. VARIABEL GLOBAL & PENGATURAN TAMPILAN
// ==========================================
let KOTA = "Jakarta"; 
let NEGARA = "Indonesia";
let ukuranArab = 30;
let ukuranLatin = 14;
let modeTampilan = "lengkap"; // "lengkap" atau "arab"
let isCenteredContent = false; // Untuk Nadhom/Maulid
let isDarkMode = false; // Dark mode state

// Wadah Penampung Data (Akan diisi otomatis dari JSON)
let dataDzikirPagi = [];
let dataDzikirPetang = [];
let dataDoaHarian = [];
let dataBacaanShalat = [];
let dataDzikirShalat = [];
let dataSholawat = [];
let dataMaulidDetail = {};
let dataTahlil = [];
let dataYasin = [];
let dataAsmaulHusna = [];

// ==========================================
// 2. INISIALISASI & TARIK DATA JSON (ANTI-CACHE)
// ==========================================
// Langsung eksekusi pemanggilan agar tidak stuck "Memuat..."
muatDataJSON();

function muatDataJSON() {
    // Menggunakan GitHack agar tidak diblokir oleh browser
    const linkGithubJSON = "https://raw.githack.com/AsepBelajar/BloggerIslamicApps/main/databaseaplikasiislam.json";
    const urlAntiCache = linkGithubJSON + "?t=" + new Date().getTime();

    fetch(urlAntiCache)
        .then(response => {
            if (!response.ok) throw new Error('Gagal memuat JSON');
            return response.json();
        })
        .then(data => {
            // Memasukkan data dari GitHub ke dalam memori aplikasi
            if(data.dzikirPagi) dataDzikirPagi = data.dzikirPagi;
            if(data.dzikirPetang) dataDzikirPetang = data.dzikirPetang;
            if(data.doaHarian) dataDoaHarian = data.doaHarian;
            if(data.bacaanShalat) dataBacaanShalat = data.bacaanShalat;
            if(data.dzikirShalat) dataDzikirShalat = data.dzikirShalat;
            if(data.sholawat) dataSholawat = data.sholawat;
            if(data.maulidDetail) dataMaulidDetail = data.maulidDetail;
            if(data.tahlil) dataTahlil = data.tahlil;
            if(data.yasin) dataYasin = data.yasin;
            if(data.nadhomAsmaulHusna) dataAsmaulHusna = data.nadhomAsmaulHusna;
            console.log("Semua data berhasil ditarik dari GitHub!");
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
    
    // Load surat jika menu Al-Quran dibuka dan masih kosong
    let daftarSuratEl = document.getElementById('daftar-surat');
    if(idHalaman === 'view-quran' && daftarSuratEl && daftarSuratEl.innerHTML.includes('Memuat')) { 
        if(typeof loadDaftarSurat === "function") loadDaftarSurat(); 
    }
}

function kembali() {
    let searchInputs = ['searchInput', 'searchInputSurah', 'searchInputAyat', 'searchInputDzikir'];
    searchInputs.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    // Reset tampilan daftar surah jika habis pencarian
    let searchInputSurah = document.getElementById('searchInputSurah');
    if (searchInputSurah) { filterPencarianSurah(); }
    
    let boxes = document.getElementsByClassName('content-box');
    for (let i = 0; i < boxes.length; i++) { boxes[i].style.display = ""; }

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
// 4. FUNGSI DARK MODE & PENGATURAN FONT
// ==========================================
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    updateDarkModeIcon();
}

function updateDarkModeIcon() {
    const btns = document.querySelectorAll('.btn-circle');
    btns.forEach(btn => {
        if (btn.getAttribute('title') === 'Mode Gelap/Terang') {
            btn.innerHTML = isDarkMode ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        }
    });
}

function bukaPengaturan() {
    let modal = document.getElementById('settings-modal');
    if(modal) {
        modal.style.display = 'flex';
        document.getElementById('slider-arab').value = ukuranArab;
        document.getElementById('val-arab').innerText = ukuranArab + 'px';
        document.getElementById('slider-latin').value = ukuranLatin;
        document.getElementById('val-latin').innerText = ukuranLatin + 'px';
    }
}

function tutupPengaturan() {
    let modal = document.getElementById('settings-modal');
    if(modal) modal.style.display = 'none';
}

function updateSliderArab(val) {
    ukuranArab = val;
    document.getElementById('val-arab').innerText = val + 'px';
    terapkanPengaturan();
}

function updateSliderLatin(val) {
    ukuranLatin = val;
    document.getElementById('val-latin').innerText = val + 'px';
    terapkanPengaturan();
}

function setModeTampilan(mode) {
    modeTampilan = mode;
    document.getElementById('btn-mode-lengkap').classList.remove('active');
    document.getElementById('btn-mode-arab').classList.remove('active');
    
    if(mode === 'lengkap') {
        document.getElementById('btn-mode-lengkap').classList.add('active');
    } else {
        document.getElementById('btn-mode-arab').classList.add('active');
    }
    terapkanPengaturan();
}

function terapkanPengaturan() {
    if (modeTampilan === 'arab') {
        document.body.classList.add('arab-only-mode');
    } else {
        document.body.classList.remove('arab-only-mode');
    }

    let dynamicStyle = document.getElementById('dynamic-settings-style');
    if (!dynamicStyle) {
        dynamicStyle = document.createElement('style');
        dynamicStyle.id = 'dynamic-settings-style';
        document.head.appendChild(dynamicStyle);
    }
    
    let styleCSS = `
        .teks-arab { font-size: ${ukuranArab}px !important; }
        .teks-latin, .teks-arti { font-size: ${ukuranLatin}px !important; }
        .content-title { direction: ltr !important; text-align: left !important; display: block !important; }
    `;
    
    if (modeTampilan === 'arab') {
        styleCSS += `
            .teks-latin, .teks-arti { display: none !important; }
            .arab-only-mode #quran-detail-content,
            .arab-only-mode #dzikir-content,
            .arab-only-mode #materi-content {
                text-align: justify !important;
                text-justify: inter-word !important;
                text-align-last: right !important;
                line-height: 2.8 !important; 
                padding: 0 5px !important;
            }
            .arab-only-mode #quran-detail-content > div,
            .arab-only-mode .content-box:not(.centered-arab) {
                display: inline !important;
                border: none !important;
                background: transparent !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
            }
            .arab-only-mode .teks-arab:not(.centered-arab .teks-arab) {
                display: inline !important;
                margin-left: 15px !important;
            }
            .arab-only-mode .centered-arab {
                display: block !important; 
                text-align: center !important;
                border-bottom: 2px dashed #eee !important;
                padding: 20px 10px !important;
                margin-bottom: 15px !important;
            }
            .arab-only-mode .centered-arab .teks-arab {
                display: block !important;
                text-align: center !important;
                margin-bottom: 10px !important;
                margin-left: 0 !important; 
            }
        `;
    }
    dynamicStyle.innerHTML = styleCSS;
}

// ==========================================
// 5. LOKASI & JADWAL SHALAT (WAKTU OTOMATIS)
// ==========================================
async function deteksiLokasi() {
    if (navigator.geolocation) {
        document.getElementById('lokasi-teks').innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> MENCARI LOKASI...";
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const lat = position.coords.latitude; const lon = position.coords.longitude;
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                const data = await res.json();
                KOTA = data.address.city || data.address.town || data.address.county || data.address.state || "Jakarta";
                document.getElementById('lokasi-teks').innerHTML = `<i class='fa-solid fa-location-dot'></i> KOTA ${KOTA.toUpperCase()}`;
                ambilJadwalShalat();
            } catch (e) { document.getElementById('lokasi-teks').innerHTML = `<i class='fa-solid fa-location-dot'></i> KOTA ${KOTA.toUpperCase()}`; }
        }, () => { document.getElementById('lokasi-teks').innerHTML = `<i class='fa-solid fa-location-dot'></i> KOTA ${KOTA.toUpperCase()}`; });
    }
}

function inputLokasiManual() {
    let kotaBaru = prompt("Masukkan nama Kota/Kabupaten Anda:", KOTA);
    if(kotaBaru && kotaBaru.trim() !== "") { 
        KOTA = kotaBaru.trim(); 
        document.getElementById('lokasi-teks').innerHTML = `<i class='fa-solid fa-location-dot'></i> KOTA ${KOTA.toUpperCase()}`; 
        document.getElementById('next-prayer-name').innerText = "MEMPERBARUI WAKTU..."; 
        ambilJadwalShalat(); 
    }
}

let elTglMasehi = document.getElementById('tgl-masehi');
if(elTglMasehi) {
    const opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elTglMasehi.innerText = new Date().toLocaleDateString('id-ID', opsiTanggal);
}

let intervalTimer;
async function ambilJadwalShalat() {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${KOTA}&country=${NEGARA}&method=20`);
        const hasil = await res.json(); 
        const jdw = hasil.data.timings; 
        const hijr = hasil.data.date.hijri;
        
        let elImsak = document.getElementById('waktu-imsak'); if(elImsak) elImsak.innerText = jdw.Imsak;
        let elSubuh = document.getElementById('waktu-subuh'); if(elSubuh) elSubuh.innerText = jdw.Fajr;
        let elDzuhur = document.getElementById('waktu-dzuhur'); if(elDzuhur) elDzuhur.innerText = jdw.Dhuhr;
        let elAshar = document.getElementById('waktu-ashar'); if(elAshar) elAshar.innerText = jdw.Asr;
        let elMaghrib = document.getElementById('waktu-maghrib'); if(elMaghrib) elMaghrib.innerText = jdw.Maghrib;
        let elIsya = document.getElementById('waktu-isya'); if(elIsya) elIsya.innerText = jdw.Isha;
        
        let elHijri = document.getElementById('tgl-hijri');
        if(elHijri) elHijri.innerText = `${hijr.day} ${hijr.month.en} ${hijr.year}`;
        
        mulaiHitungMundur(jdw);
    } catch (e) {
        console.error("Gagal mengambil jadwal shalat:", e);
    }
}

function mulaiHitungMundur(jadwal) {
    if(intervalTimer) clearInterval(intervalTimer);
    const urutan = [ 
        { id: 'imsak', nama: 'IMSAK', w: jadwal.Imsak }, 
        { id: 'subuh', nama: 'SUBUH', w: jadwal.Fajr }, 
        { id: 'dzuhur', nama: 'DZUHUR', w: jadwal.Dhuhr }, 
        { id: 'ashar', nama: 'ASHAR', w: jadwal.Asr }, 
        { id: 'maghrib', nama: 'MAGHRIB', w: jadwal.Maghrib }, 
        { id: 'isya', nama: 'ISYA', w: jadwal.Isha } 
    ];
    function updateTimer() {
        const skr = new Date(); let next = null; let tTarget = null;
        for (let i = 0; i < urutan.length; i++) { 
            const [j, m] = urutan[i].w.split(':'); 
            const bdg = new Date(); bdg.setHours(j, m, 0, 0); 
            if (bdg > skr) { next = urutan[i]; tTarget = bdg; break; } 
        }
        if (!next) { 
            next = urutan[0]; 
            const [j, m] = urutan[0].w.split(':'); 
            tTarget = new Date(); tTarget.setDate(tTarget.getDate() + 1); tTarget.setHours(j, m, 0, 0); 
        }
        
        let elNext = document.getElementById('next-prayer-name');
        if(elNext) elNext.innerText = `MENUJU ${next.nama}`;
        
        document.querySelectorAll('.prayer-tab').forEach(t => t.classList.remove('active'));
        const tabAktif = document.getElementById(`tab-${next.id}`); 
        if(tabAktif) tabAktif.classList.add('active');
        
        const selisih = tTarget.getTime() - new Date().getTime();
        if (selisih < 0) { ambilJadwalShalat(); return; }
        const jam = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 
        const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60)); 
        const detik = Math.floor((selisih % (1000 * 60)) / 1000);
        
        let elTimer = document.getElementById('timer');
        if(elTimer) elTimer.innerText = `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
    }
    updateTimer(); 
    intervalTimer = setInterval(updateTimer, 1000);
}

// ==========================================
// 6. FUNGSI AL-QURAN
// ==========================================
function bersihkanTeksArab(teks) { return teks.replace(/\u08D6/g, '').replace(/ࣖ/g, ''); }
function konversiAngkaArab(angka) { return angka.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]); }

async function loadDaftarSurat() {
    try {
        const res = await fetch('https://equran.id/api/v2/surat'); 
        const hasil = await res.json(); 
        let html = '';
        hasil.data.forEach(s => { 
            let namaAman = s.namaLatin.replace(/'/g, "\\'").replace(/"/g, "&quot;"); 
            html += `<div class="list-item" onclick="bukaIsiSurat(${s.nomor}, '${namaAman}')">
                        <div><strong>${s.nomor}. ${s.namaLatin}</strong><br/><span style='font-size:11px; color:gray;'>${s.arti} • ${s.jumlahAyat} Ayat</span></div>
                        <div class='teks-arab' style='font-size:24px !important; margin:0; padding:0; text-align:right;'>${s.nama}</div>
                     </div>`; 
        });
        let ds = document.getElementById('daftar-surat');
        if(ds) ds.innerHTML = html;
    } catch(e) { 
        let ds = document.getElementById('daftar-surat');
        if(ds) ds.innerHTML = "<center>Gagal memuat Al-Qur'an. Periksa koneksi internet.</center>"; 
    }
}

async function bukaIsiSurat(no, nama) {
    bukaHalaman('view-quran-detail'); 
    let js = document.getElementById('judul-surat'); if(js) js.innerText = `Surah ${nama}`; 
    let qc = document.getElementById('quran-detail-content'); 
    if(qc) qc.innerHTML = "<div class='loader'></div><center><i>Memuat ayat...</i></center>";
    
    try {
        const res = await fetch(`https://equran.id/api/v2/surat/${no}`); 
        const hasil = await res.json();
        let html = (no != 1 && no != 9) ? `<div class='teks-arab' style='text-align:center; margin-bottom:30px;'>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>` : '';
        hasil.data.ayat.forEach(a => { 
            html += `<div style='margin-bottom:20px;' class='content-box'>
                        <div class='teks-arab'>${bersihkanTeksArab(a.teksArab)} <span class='ayat-marker'>${konversiAngkaArab(a.nomorAyat)}</span></div>
                        <div class='teks-latin'>${a.teksLatin}</div>
                        <div class='teks-arti'>${a.teksIndonesia}</div>
                     </div>`; 
        });
        if(qc) qc.innerHTML = html;
        isCenteredContent = false; 
        terapkanPengaturan();
    } catch(e) { 
        if(qc) qc.innerHTML = "<center>Gagal memuat ayat.</center>"; 
    }
}

function filterPencarianSurah() {
    let input = document.getElementById('searchInputSurah');
    if(!input) return;
    let val = input.value.toLowerCase();
    
    let container = document.getElementById('daftar-surat');
    if(!container) return;
    let items = container.getElementsByClassName('list-item');
    
    for (let i = 0; i < items.length; i++) {
        let textContext = items[i].innerText.toLowerCase();
        if (textContext.includes(val)) {
            items[i].style.display = "";
        } else {
            items[i].style.display = "none";
        }
    }
}

function filterPencarianAyat() {
    let input = document.getElementById('searchInputAyat');
    if(!input) return;
    let val = input.value.toLowerCase();
    
    let container = document.getElementById('quran-detail-content');
    if(!container) return;
    let items = container.children;
    
    for (let i = 0; i < items.length; i++) {
        if(items[i].className === 'loader' || items[i].className === 'teks-arab') continue; 
        let textContext = items[i].innerText.toLowerCase();
        if (textContext.includes(val)) {
            items[i].style.display = "";
        } else {
            items[i].style.display = "none";
        }
    }
}

// ==========================================
// 7. FUNGSI PERENDERAN MENU LAIN DARI JSON
// ==========================================
function renderUmum(judulTitle, arrayData, viewTargetId = 'view-dzikir', contentId = 'dzikir-content', titleId = 'dzikir-title') {
    bukaHalaman(viewTargetId);
    let titleEl = document.getElementById(titleId);
    if(titleEl) titleEl.innerText = judulTitle;
    
    let contentEl = document.getElementById(contentId);
    if(!contentEl) return;
    
    if(!arrayData || arrayData.length === 0) {
        contentEl.innerHTML = "<center><br/><i>Sistem sedang memuat data dari server, silakan kembali lalu buka ulang menu ini...</i></center>";
        return;
    }

    let html = '';
    arrayData.forEach(item => {
        let judulHtml = item.judul ? `<div class='content-title'>${item.judul}</div>` : '';
        // Cek properti a/arab, l/latin, t/arti yang dipakai di JSON
        let arabHtml = item.arab || item.a ? `<div class='teks-arab'>${item.arab || item.a}</div>` : '';
        let latinHtml = item.latin || item.l ? `<div class='teks-latin'>${item.latin || item.l}</div>` : '';
        let artiHtml = item.arti || item.t ? `<div class='teks-arti'>${item.arti || item.t}</div>` : '';
        
        html += `<div class='content-box'>
                    ${judulHtml}
                    ${arabHtml}
                    ${latinHtml}
                    ${artiHtml}
                 </div>`;
    });
    
    contentEl.innerHTML = html;
    isCenteredContent = false;
    terapkanPengaturan();
}

function bukaMenuDzikirPagi() { renderUmum("Dzikir Pagi", dataDzikirPagi); }
function bukaMenuDzikirPetang() { renderUmum("Dzikir Petang", dataDzikirPetang); }
function bukaMenuDoaHarian() { renderUmum("Doa Harian", dataDoaHarian); }
function bukaMenuBacaanShalat() { renderUmum("Bacaan Shalat", dataBacaanShalat); }
function bukaMenuDzikirShalat() { renderUmum("Wirid Ba'da Shalat", dataDzikirShalat); }
function bukaMenuSholawat() { renderUmum("Shalawat Masyhur", dataSholawat); }

function renderAsmaulHusna() {
    bukaHalaman('view-materi');
    let titleEl = document.getElementById('materi-title');
    if(titleEl) titleEl.innerText = "Nadhom Asmaul Husna";
    
    let contentEl = document.getElementById('materi-content');
    if(!contentEl) return;
    
    if(!dataAsmaulHusna || dataAsmaulHusna.length === 0) {
        contentEl.innerHTML = "<center><br/><i>Data Asmaul Husna sedang dimuat dari server...</i></center>";
        return;
    }

    let html = '';
    dataAsmaulHusna.forEach(item => {
        html += `<div class='content-box centered-arab'>
                    <div class='teks-arab'>${item.arab || item.a}</div>
                    <div class='teks-latin'>${item.latin || item.l}</div>
                    <div class='teks-arti'>${item.arti || item.t}</div>
                 </div>`;
    });
    contentEl.innerHTML = html;
    isCenteredContent = true;
    terapkanPengaturan();
}

function bukaMenuMaulid() {
    bukaHalaman('view-materi');
    let titleEl = document.getElementById('materi-title');
    if(titleEl) titleEl.innerText = "Pilihan Maulid";
    
    let contentEl = document.getElementById('materi-content');
    if(!contentEl) return;

    if(!dataMaulidDetail || Object.keys(dataMaulidDetail).length === 0) {
        contentEl.innerHTML = "<center><br/><i>Data Maulid sedang dimuat dari server...</i></center>";
        return;
    }

    let kunciPertama = Object.keys(dataMaulidDetail)[0];
    let dataMaulid = dataMaulidDetail[kunciPertama] || [];
    
    let html = '';
    dataMaulid.forEach(item => {
        let judulHtml = item.judul ? `<div class='content-title' style='text-align:center;'>${item.judul}</div>` : '';
        html += `<div class='content-box centered-arab'>
                    ${judulHtml}
                    <div class='teks-arab'>${item.arab || item.a}</div>
                    <div class='teks-latin'>${item.latin || item.l}</div>
                    <div class='teks-arti'>${item.arti || item.t}</div>
                 </div>`;
    });
    
    contentEl.innerHTML = html;
    isCenteredContent = true;
    terapkanPengaturan();
}

function filterPencarianDzikir() {
    let inputEl = document.getElementById('searchInputDzikir');
    if(!inputEl) return;
    let input = inputEl.value.toLowerCase();
    
    let container = document.getElementById('dzikir-content') || document.getElementById('materi-content');
    if(!container) return;
    
    let items = container.getElementsByClassName('content-box');
    for (let i = 0; i < items.length; i++) {
        let textContext = items[i].innerText.toLowerCase();
        if (textContext.includes(input)) {
            items[i].style.display = "";
        } else {
            items[i].style.display = "none";
        }
    }
}
