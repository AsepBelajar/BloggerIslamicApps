// ==========================================
// 1. VARIABEL GLOBAL & PENGATURAN TAMPILAN
// ==========================================
let KOTA = "Jakarta"; 
let NEGARA = "Indonesia";
let ukuranArab = 30;
let ukuranLatin = 14;
let modeTampilan = "lengkap"; 
let isCenteredContent = false; 
let isDarkMode = false; 

// Wadah Penampung Data JSON
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
// 2. INISIALISASI & PENARIK DATA JSON
// ==========================================
muatDataJSON();
deteksiLokasi(); 

function muatDataJSON() {
    const linkGithubJSON = "https://raw.githack.com/AsepBelajar/BloggerIslamicApps/main/data.json";
    const urlAntiCache = linkGithubJSON + "?t=" + new Date().getTime();

    fetch(urlAntiCache)
        .then(async response => {
            if (!response.ok) throw new Error('Gagal memuat JSON');
            const teksJSON = await response.text();
            try {
                return JSON.parse(teksJSON);
            } catch (error) {
                alert("⚠️ FORMAT JSON ERROR: Ada tanda koma/kutip yang salah di data.json GitHub Anda.");
                throw error;
            }
        })
        .then(data => {
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
        })
        .catch(error => console.log("Gagal menarik data JSON."));
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
    
    // Pemicu Al-Quran (Akan memanggil script Al-Quran yang dipisah jika ada)
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
    
    if (typeof filterPencarianSurah === "function") { filterPencarianSurah(); }
    
    let boxes = document.getElementsByClassName('content-box');
    for (let i = 0; i < boxes.length; i++) { boxes[i].style.display = ""; }

    window.history.back();
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) { bukaHalaman(event.state.page, false); } 
    else { bukaHalaman('view-dashboard', false); }
});

// ==========================================
// 4. PENGATURAN TAMPILAN & CSS DINAMIS
// ==========================================
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.querySelectorAll('.btn-circle').forEach(btn => {
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

function updateSliderArab(val) { ukuranArab = val; document.getElementById('val-arab').innerText = val + 'px'; terapkanPengaturan(); }
function updateSliderLatin(val) { ukuranLatin = val; document.getElementById('val-latin').innerText = val + 'px'; terapkanPengaturan(); }

function setModeTampilan(mode) {
    modeTampilan = mode;
    document.getElementById('btn-mode-lengkap').classList.remove('active');
    document.getElementById('btn-mode-arab').classList.remove('active');
    document.getElementById(mode === 'lengkap' ? 'btn-mode-lengkap' : 'btn-mode-arab').classList.add('active');
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
        /* Sembunyikan terjemahan dan latin */
        .teks-latin, .teks-arti { display: none !important; }
        
        /* ============================================
           1. KONTAINER UTAMA - Tetap RTL dan Justify
           ============================================ */
        .arab-only-mode #quran-detail-content,
        .arab-only-mode #dzikir-content,
        .arab-only-mode #materi-content {
            direction: rtl !important;
            text-align: justify !important;
            text-align-last: right !important;
            line-height: 2.5 !important;
            padding: 15px !important;
            /* HAPUS whitespace antar child elements */
            font-size: 0 !important;
            word-spacing: -0.5em !important; /* Trik tambahan */
        }
        
        /* ============================================
           2. CONTENT-BOX - Ubah ke INLINE (bukan inline-block)
           ============================================ */
        .arab-only-mode .content-box {
            display: inline !important; 
            border: 0px none transparent !important; /* ⬅️ Paksa hilangkan border */
            outline: none !important;                /* ⬅️ Hilangkan outline */
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            font-size: ${ukuranArab}px !important;
            word-spacing: normal !important;
        }
        
        /* ============================================
           3. TEKS ARAB - Ubah ke INLINE
           ============================================ */
        .arab-only-mode .content-box .teks-arab {
            display: inline !important;  /* ✅ Inline agar justify bekerja */
            direction: inherit !important;
            letter-spacing: normal !important;
            word-spacing: normal !important;
        }
        
              /* ============================================
           4. AYAT MARKER - HAPUS PAKSAAN BIDI (Clean RTL)
           ============================================ */
        .arab-only-mode .ayat-marker {
            display: inline-block !important;
            /* HAPUS: unicode-bidi: isolate */
            /* HAPUS: direction: rtl */
            margin: 0 8px !important;
            vertical-align: middle !important;
            line-height: normal !important; /* Tetap pertahankan agar tidak lonjong */
            position: relative !important;
            top: -0.15em !important;
        }

        
        /* ============================================
           5. BISMILLAH - PAKSA BLOCK UNTUK CENTER 100%
           ============================================ */
        .arab-only-mode #quran-detail-content > .content-box:first-child {
            display: block !important; /* ⬅️ RAHASIA UTAMA: Keluar dari aliran inline agar bisa 100% lebar */
            text-align: center !important;
            margin-bottom: 25px !important;
            width: 100% !important;
        }
        .arab-only-mode #quran-detail-content > .content-box:first-child .teks-arab {
            display: block !important;
            text-align: center !important;
        }        
        6. PERBAIKAN TAMBAHAN
           ============================================ */
        .arab-only-mode .content-box .teks-arab::after {
            content: " "; /* Tambahkan spasi setiap ayat */
        }
        

        `;
    }
    dynamicStyle.innerHTML = styleCSS;
}

function gabungkanTeksArab() {
    if (modeTampilan !== 'arab') return;
    
    const kontainer = document.querySelector('#quran-detail-content') || 
                      document.querySelector('#dzikir-content') || 
                      document.querySelector('#materi-content');
    
    if (!kontainer) return;
    
    const contentBoxes = kontainer.querySelectorAll('.content-box');
    if (contentBoxes.length === 0) return;
    
    // Buat wadah baru untuk teks yang digabung
    const teksGabung = document.createElement('div');
    teksGabung.className = 'arab-merged-text';
    teksGabung.style.cssText = `
        direction: rtl;
        text-align: justify;
        text-align-last: right;
        line-height: 2.5;
        font-size: ${ukuranArab}px;
    `;
    
    // Salin konten dari setiap content-box
    contentBoxes.forEach((box, index) => {
        const teksArab = box.querySelector('.teks-arab');
        const ayatMarker = box.querySelector('.ayat-marker');
        
        if (teksArab) {
            // Tambahkan teks Arab
            const spanTeks = document.createElement('span');
            spanTeks.className = 'teks-arab';
            spanTeks.textContent = teksArab.textContent + ' ';
            teksGabung.appendChild(spanTeks);
            
            // Tambahkan nomor ayat jika ada
            if (ayatMarker) {
                const spanMarker = document.createElement('span');
                spanMarker.className = 'ayat-marker';
                spanMarker.textContent = ayatMarker.textContent;
                spanMarker.style.cssText = `
                    display: inline-block;
                    unicode-bidi: isolate;
                    direction: rtl;
                    margin: 0 5px;
                    vertical-align: middle;
                    font-size: 0.7em;
                    position: relative;
                    top: -0.1em;
                `;
                teksGabung.appendChild(spanMarker);
                teksGabung.appendChild(document.createTextNode(' '));
            }
        }
    });
    
    // Sembunyikan content-box asli dan tampilkan teks gabungan
    contentBoxes.forEach(box => box.style.display = 'none');
    
    // Pastikan tidak duplikat
    const existingMerged = kontainer.querySelector('.arab-merged-text');
    if (existingMerged) existingMerged.remove();
    
    kontainer.insertBefore(teksGabung, kontainer.firstChild);
}

function renderUmum(judulTitle, arrayData, viewTargetId = 'view-dzikir', contentId = 'dzikir-content', titleId = 'dzikir-title') {
    // ... kode existing ...
    
    terapkanPengaturan();
    
    // ✅ Panggil fungsi penggabungan teks
    setTimeout(() => {
        gabungkanTeksArab();
    }, 100); // Delay sedikit untuk memastikan CSS diterapkan
}

// ==========================================
// 5. JADWAL SHALAT (WAKTU OTOMATIS)
// ==========================================
async function deteksiLokasi() {
    if (navigator.geolocation) {
        let lokasiTeksEl = document.getElementById('lokasi-teks');
        if (lokasiTeksEl) lokasiTeksEl.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> MENCARI LOKASI...";
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const lat = position.coords.latitude; const lon = position.coords.longitude;
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                const data = await res.json();
                KOTA = data.address.city || data.address.town || data.address.county || data.address.state || "Jakarta";
                if (lokasiTeksEl) lokasiTeksEl.innerHTML = `<i class='fa-solid fa-location-dot'></i> KOTA ${KOTA.toUpperCase()}`;
                ambilJadwalShalat();
            } catch (e) { ambilJadwalShalat(); }
        }, () => { ambilJadwalShalat(); });
    } else { ambilJadwalShalat(); }
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
if(elTglMasehi) { elTglMasehi.innerText = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }

let intervalTimer;
async function ambilJadwalShalat() {
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${KOTA}&country=${NEGARA}&method=20`);
        const hasil = await res.json(); 
        const jdw = hasil.data.timings; 
        const hijr = hasil.data.date.hijri;
        
        ['imsak','subuh','dzuhur','ashar','maghrib','isya'].forEach(w => {
            let el = document.getElementById(`waktu-${w}`);
            if(el) el.innerText = jdw[w.charAt(0).toUpperCase() + w.slice(1)] || jdw.Fajr || jdw.Dhuhr || jdw.Asr || jdw.Maghrib || jdw.Isha; 
        });
        document.getElementById('waktu-imsak').innerText = jdw.Imsak;
        document.getElementById('waktu-subuh').innerText = jdw.Fajr;
        document.getElementById('waktu-dzuhur').innerText = jdw.Dhuhr;
        document.getElementById('waktu-ashar').innerText = jdw.Asr;
        document.getElementById('waktu-maghrib').innerText = jdw.Maghrib;
        document.getElementById('waktu-isya').innerText = jdw.Isha;
        
        let elHijri = document.getElementById('tgl-hijri');
        if(elHijri) elHijri.innerText = `${hijr.day} ${hijr.month.en} ${hijr.year}`;
        
        mulaiHitungMundur(jdw);
    } catch (e) {}
}

function mulaiHitungMundur(jadwal) {
    if(intervalTimer) clearInterval(intervalTimer);
    const urutan = [ { id: 'imsak', nama: 'IMSAK', w: jadwal.Imsak }, { id: 'subuh', nama: 'SUBUH', w: jadwal.Fajr }, { id: 'dzuhur', nama: 'DZUHUR', w: jadwal.Dhuhr }, { id: 'ashar', nama: 'ASHAR', w: jadwal.Asr }, { id: 'maghrib', nama: 'MAGHRIB', w: jadwal.Maghrib }, { id: 'isya', nama: 'ISYA', w: jadwal.Isha } ];
    function updateTimer() {
        const skr = new Date(); let next = null; let tTarget = null;
        for (let i = 0; i < urutan.length; i++) { 
            const [j, m] = urutan[i].w.split(':'); const bdg = new Date(); bdg.setHours(j, m, 0, 0); 
            if (bdg > skr) { next = urutan[i]; tTarget = bdg; break; } 
        }
        if (!next) { 
            next = urutan[0]; const [j, m] = urutan[0].w.split(':'); 
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
    updateTimer(); intervalTimer = setInterval(updateTimer, 1000);
}

// ==========================================
// 6. FUNGSI PERENDERAN DATA JSON
// ==========================================
function renderUmum(judulTitle, arrayData, viewTargetId = 'view-dzikir', contentId = 'dzikir-content', titleId = 'dzikir-title') {
    bukaHalaman(viewTargetId);
    let titleEl = document.getElementById(titleId);
    if(titleEl) titleEl.innerText = judulTitle;
    let contentEl = document.getElementById(contentId);
    if(!contentEl) return;
    
    if(!arrayData || arrayData.length === 0) {
        contentEl.innerHTML = "<center><br/><i>Sistem sedang memuat data, silakan kembali lalu buka ulang menu ini...</i></center>";
        return;
    }

    let html = '';
    arrayData.forEach(item => {
        let judulHtml = item.judul ? `<div class='content-title'>${item.judul}</div>` : '';
        let arabHtml = item.arab || item.a ? `<div class='teks-arab'>${item.arab || item.a}</div>` : '';
        let latinHtml = item.latin || item.l ? `<div class='teks-latin'>${item.latin || item.l}</div>` : '';
        let artiHtml = item.arti || item.t ? `<div class='teks-arti'>${item.arti || item.t}</div>` : '';
        html += `<div class='content-box'>${judulHtml}${arabHtml}${latinHtml}${artiHtml}</div>`;
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
    if(!dataAsmaulHusna || dataAsmaulHusna.length === 0) { contentEl.innerHTML = "<center><br/><i>Memuat...</i></center>"; return; }

    let html = '';
    dataAsmaulHusna.forEach(item => {
        html += `<div class='content-box centered-arab'><div class='teks-arab'>${item.arab || item.a}</div><div class='teks-latin'>${item.latin || item.l}</div><div class='teks-arti'>${item.arti || item.t}</div></div>`;
    });
    contentEl.innerHTML = html;
    isCenteredContent = true; terapkanPengaturan();
}

function bukaMenuMaulid() {
    bukaHalaman('view-materi');
    let titleEl = document.getElementById('materi-title'); if(titleEl) titleEl.innerText = "Pilihan Maulid";
    let contentEl = document.getElementById('materi-content'); if(!contentEl) return;
    if(!dataMaulidDetail || Object.keys(dataMaulidDetail).length === 0) { contentEl.innerHTML = "<center><br/><i>Memuat...</i></center>"; return; }

    let kunciPertama = Object.keys(dataMaulidDetail)[0];
    let dataMaulid = dataMaulidDetail[kunciPertama] || [];
    let html = '';
    dataMaulid.forEach(item => {
        let judulHtml = item.judul ? `<div class='content-title' style='text-align:center;'>${item.judul}</div>` : '';
        html += `<div class='content-box centered-arab'>${judulHtml}<div class='teks-arab'>${item.arab || item.a}</div><div class='teks-latin'>${item.latin || item.l}</div><div class='teks-arti'>${item.arti || item.t}</div></div>`;
    });
    contentEl.innerHTML = html;
    isCenteredContent = true; terapkanPengaturan();
}

function filterPencarianDzikir() {
    let inputEl = document.getElementById('searchInputDzikir'); if(!inputEl) return;
    let input = inputEl.value.toLowerCase();
    let container = document.getElementById('dzikir-content') || document.getElementById('materi-content');
    if(!container) return;
    
    let items = container.getElementsByClassName('content-box');
    for (let i = 0; i < items.length; i++) {
        items[i].style.display = items[i].innerText.toLowerCase().includes(input) ? "" : "none";
    }
}
