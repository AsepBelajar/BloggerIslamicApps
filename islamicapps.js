    let KOTA = "Jakarta"; 
    let NEGARA = "Indonesia";
    
    // ===== VARIABEL PENGATURAN TAMPILAN =====
    let ukuranArab = 30;
    let ukuranLatin = 14;
    let modeTampilan = "lengkap"; // "lengkap" atau "arab"
    let isCenteredContent = false; // Untuk Nadhom/Maulid
    let isDarkMode = false; // Dark mode state

    // --- MANAJEMEN HISTORY ---
    history.replaceState({ page: 'view-dashboard' }, "", "");

    function bukaHalaman(idHalaman, pushState = true) {
        document.querySelectorAll('.page-view').forEach(el => el.style.display = 'none');
        document.getElementById(idHalaman).style.display = 'block';
        window.scrollTo(0, 0);
        if (pushState) { history.pushState({ page: idHalaman }, "", ""); }
        if(idHalaman === 'view-quran' && document.getElementById('daftar-surat').innerHTML.includes('Memuat')) { loadDaftarSurat(); }
    }

    function kembali() {
        let searchInput = document.getElementById('searchInput');
        if (searchInput) { searchInput.value = ''; }
        let searchInputDzikir = document.getElementById('searchInputDzikir');
        if (searchInputDzikir) { searchInputDzikir.value = ''; }
        
        // TAMBAHAN: Reset pencarian Al-Qur'an
        let searchInputSurah = document.getElementById('searchInputSurah');
        if (searchInputSurah) { searchInputSurah.value = ''; filterPencarianSurah(); }
        let searchInputAyat = document.getElementById('searchInputAyat');
        if (searchInputAyat) { searchInputAyat.value = ''; filterPencarianAyat(); }
        
        let boxes = document.getElementsByClassName('content-box');
        for (let i = 0; i < boxes.length; i++) { boxes[i].style.display = ""; }

        history.back();
    }
    
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) { bukaHalaman(event.state.page, false); } else { bukaHalaman('view-dashboard', false); }
    });

    // ===== FUNGSI DARK MODE =====
    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        updateDarkModeIcon();
    }

    function updateDarkModeIcon() {
        // Update semua tombol dark mode di berbagai header
        const icons = document.querySelectorAll('[id^="btn-dark"] i, .page-header .btn-circle:first-of-type i, .header-actions .btn-circle:first-of-type i');
        // Selector spesifik untuk tombol dark mode (tombol pertama di actions/header kanan)
        // Karena struktur berbeda-beda, kita gunakan class atau id unuk tombol ini jika perlu, 
        // tapi di sini kita manual update icon moon/sun
        const btns = document.querySelectorAll('.btn-circle');
        btns.forEach(btn => {
            if (btn.getAttribute('title') === 'Mode Gelap/Terang') {
                btn.innerHTML = isDarkMode ? '<i class="fa-solid fa-sun"/>' : '<i class="fa-solid fa-moon"/>';
            }
        });
    }

    // ===== FUNGSI PENGATURAN TAMPILAN (SLIDER) =====
    function bukaPengaturan() {
        document.getElementById('settings-modal').style.display = 'flex';
        // Sinkronkan slider dengan nilai saat ini
        document.getElementById('slider-arab').value = ukuranArab;
        document.getElementById('val-arab').innerText = ukuranArab + 'px';
        document.getElementById('slider-latin').value = ukuranLatin;
        document.getElementById('val-latin').innerText = ukuranLatin + 'px';
    }
    
    function tutupPengaturan() {
        document.getElementById('settings-modal').style.display = 'none';
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
        if(mode === 'lengkap') document.getElementById('btn-mode-lengkap').classList.add('active');
        else document.getElementById('btn-mode-arab').classList.add('active');
        terapkanPengaturan();
    }
    
    function terapkanPengaturan() {
        // Atur body class untuk mode arab saja
        if (modeTampilan === 'arab') {
            document.body.classList.add('arab-only-mode');
        } else {
            document.body.classList.remove('arab-only-mode');
        }

        // Gunakan elemen <style> dinamis agar perubahan berlaku mutlak
        let dynamicStyle = document.getElementById('dynamic-settings-style');
        if (!dynamicStyle) {
            dynamicStyle = document.createElement('style');
            dynamicStyle.id = 'dynamic-settings-style';
            document.head.appendChild(dynamicStyle);
        }
        
        let styleCSS = `
            .teks-arab { font-size: ${ukuranArab}px !important; }
            .teks-latin, .teks-arti { font-size: ${ukuranLatin}px !important; }
        `;
        
        // Aturan Khusus saat "Mode Arab Saja" aktif
        if (modeTampilan === 'arab') {
            styleCSS += `
                /* 1. Sembunyikan teks latin dan arti */
                .teks-latin, .teks-arti { display: none !important; }
                
                /* 2. Format Teks Tersambung & Rata Kanan (Justify) */
                .arab-only-mode #quran-detail-content,
                .arab-only-mode #dzikir-content,
                .arab-only-mode #materi-content {
                    text-align: justify !important;
                    text-justify: inter-word !important;
                    direction: rtl !important; 
                    line-height: 2.8 !important; /* PERBAIKAN: Spasi antar baris atas-bawah lebih renggang */
                    padding: 0 5px !important;
                }

                /* Hilangkan box/margin pembungkus agar teks bisa mengalir (tersambung) */
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
                    margin-left: 15px !important; /* PERBAIKAN: Jarak spasi horizontal pemisah antar ayat */
                }

                /* 3. Kembalikan Format Rata Tengah & Per Baris untuk Nadzhom, Burdah & Mahalul Qiyam */
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
                    margin-left: 0 !important; /* Reset margin agar tetap presisi di tengah */
                }
            `;
        }
        
        dynamicStyle.innerHTML = styleCSS;
    }

    // --- LOKASI & JADWAL SHALAT ---
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
        if(kotaBaru && kotaBaru.trim() !== "") { KOTA = kotaBaru.trim(); document.getElementById('lokasi-teks').innerHTML = `<i class='fa-solid fa-location-dot'></i> KOTA ${KOTA.toUpperCase()}`; document.getElementById('next-prayer-name').innerText = "MEMPERBARUI WAKTU..."; ambilJadwalShalat(); }
    }

    const opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('tgl-masehi').innerText = new Date().toLocaleDateString('id-ID', opsiTanggal);

    let intervalTimer;
    async function ambilJadwalShalat() {
        try {
            const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${KOTA}&country=${NEGARA}&method=20`);
            const hasil = await res.json(); const jdw = hasil.data.timings; const hijr = hasil.data.date.hijri;
            document.getElementById('waktu-imsak').innerText = jdw.Imsak; document.getElementById('waktu-subuh').innerText = jdw.Fajr; document.getElementById('waktu-dzuhur').innerText = jdw.Dhuhr; document.getElementById('waktu-ashar').innerText = jdw.Asr; document.getElementById('waktu-maghrib').innerText = jdw.Maghrib; document.getElementById('waktu-isya').innerText = jdw.Isha;
            document.getElementById('tgl-hijri').innerText = `${hijr.day} ${hijr.month.en} ${hijr.year}`;
            mulaiHitungMundur(jdw);
        } catch (e) {}
    }

    function mulaiHitungMundur(jadwal) {
        if(intervalTimer) clearInterval(intervalTimer);
        const urutan = [ { id: 'imsak', nama: 'IMSAK', w: jadwal.Imsak }, { id: 'subuh', nama: 'SUBUH', w: jadwal.Fajr }, { id: 'dzuhur', nama: 'DZUHUR', w: jadwal.Dhuhr }, { id: 'ashar', nama: 'ASHAR', w: jadwal.Asr }, { id: 'maghrib', nama: 'MAGHRIB', w: jadwal.Maghrib }, { id: 'isya', nama: 'ISYA', w: jadwal.Isha } ];
        function updateTimer() {
            const skr = new Date(); let next = null; let tTarget = null;
            for (let i = 0; i < urutan.length; i++) { const [j, m] = urutan[i].w.split(':'); const bdg = new Date(); bdg.setHours(j, m, 0, 0); if (bdg > skr) { next = urutan[i]; tTarget = bdg; break; } }
            if (!next) { next = urutan[0]; const [j, m] = urutan[0].w.split(':'); tTarget = new Date(); tTarget.setDate(tTarget.getDate() + 1); tTarget.setHours(j, m, 0, 0); }
            document.getElementById('next-prayer-name').innerText = `MENUJU ${next.nama}`;
            document.querySelectorAll('.prayer-tab').forEach(t => t.classList.remove('active'));
            const tabAktif = document.getElementById(`tab-${next.id}`); if(tabAktif) tabAktif.classList.add('active');
            const selisih = tTarget.getTime() - new Date().getTime();
            if (selisih < 0) { ambilJadwalShalat(); return; }
            const jam = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60)); const detik = Math.floor((selisih % (1000 * 60)) / 1000);
            document.getElementById('timer').innerText = `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
        }
        updateTimer(); intervalTimer = setInterval(updateTimer, 1000);
    }

    // --- QURAN ---
    function bersihkanTeksArab(teks) { return teks.replace(/\u08D6/g, '').replace(/ࣖ/g, ''); }
    function konversiAngkaArab(angka) { return angka.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]); }
    async function loadDaftarSurat() {
        try {
            const res = await fetch('https://equran.id/api/v2/surat'); const hasil = await res.json(); let html = '';
            hasil.data.forEach(s => { let namaAman = s.namaLatin.replace(/'/g, "\\'").replace(/"/g, "&quot;"); html += `<div class="list-item" onclick="bukaIsiSurat(${s.nomor}, '${namaAman}')"><div><strong>${s.nomor}. ${s.namaLatin}</strong><br/><span style='font-size:11px; color:gray;'>${s.arti} • ${s.jumlahAyat} Ayat</span></div><div class='teks-arab' style='font-size:24px !important; margin:0; padding:0; text-align:right;'>${s.nama}</div></div>`; });
            document.getElementById('daftar-surat').innerHTML = html;
        } catch(e) { document.getElementById('daftar-surat').innerHTML = "<center>Gagal memuat Al-Qur'an.</center>"; }
    }
    async function bukaIsiSurat(no, nama) {
        bukaHalaman('view-quran-detail'); document.getElementById('judul-surat').innerText = `Surah ${nama}`; document.getElementById('quran-detail-content').innerHTML = "<div class='loader'></div><center><i>Memuat ayat...</i></center>";
        try {
            const res = await fetch(`https://equran.id/api/v2/surat/${no}`); const hasil = await res.json();
            let html = (no != 1 && no != 9) ? `<div class='teks-arab' style='text-align:center; margin-bottom:30px;'>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>` : '';
            hasil.data.ayat.forEach(a => { html += `<div style='margin-bottom:20px;'><div class='teks-arab'>${bersihkanTeksArab(a.teksArab)} <span class='ayat-marker'>${konversiAngkaArab(a.nomorAyat)}</span></div><div class='teks-latin'>${a.teksLatin}</div><div class='teks-arti'>${a.teksIndonesia}</div></div>`; });
            document.getElementById('quran-detail-content').innerHTML = html;
            isCenteredContent = false; // Quran rata kanan
            terapkanPengaturan();
        } catch(e) { document.getElementById('quran-detail-content').innerHTML = "<center>Gagal memuat ayat.</center>"; }
    }

    // ================= DATA BACAAN SHALAT FINAL =================
    const dataBacaanShalat = [
        { judul: "1. Niat Shalat (Contoh Subuh)", arab: "أُصَلِّى فَرْضَ الصُّبْح رَكَعتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لله تَعَالَى", latin: "Ushalli fardhash-shubhi rak'ataini mustaqbilal qiblati adaa'an lillaahi ta'aalaa.", arti: "Aku berniat shalat fardhu Subuh dua rakaat menghadap kiblat karena Allah Ta'ala." },
        { judul: "2. Takbiratul Ihram", arab: "اللَّهُ أَكْبَرُ", latin: "Allahu Akbar.", arti: "Allah Maha Besar." },
        { judul: "3. Doa Iftitah", arab: "اللَّهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا، إِنِّي وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالْأَرْضَ حَنِيفًا مُسْلِمًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ...", latin: "Allahu akbar kabiiraa walhamdulillaahi katsiiraa, wa subhaanallaahi bukratan wa aṣhilaa. Innii wajjahtu wajhiya lilladzii fatharas samaawaati wal ardha haniifan musliman wa maa anaa minal musyrikiin...", arti: "Allah Maha Besar. Segala puji bagi Allah dengan pujian yang banyak. Maha Suci Allah pada waktu pagi dan petang. Sesungguhnya aku hadapkan wajahku kepada Allah yang telah menciptakan langit dan bumi..." },
        { judul: "4. Surat Al-Fatihah", arab: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (1) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (2) الرَّحْمَٰنِ الرَّحِيمِ (3) مَالِكِ يَوْمِ الدِّينِ (4) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (5) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (6) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (7)", latin: "Bismillahir-rahmanir-rahim. Alhamdu lillahi rabbil-'alamin. Ar-rahmanir-rahim. Maliki yaumid-din. Iyyaka na'budu wa iyyaka nasta'in. Ihdinas-siratal-mustaqim. Siratallazina an'amta 'alaihim ghairil-maghdubi 'alaihim wa lad-dallin.", arti: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan seluruh alam..." },
        { judul: "5. Bacaan Ruku'", arab: "سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ", latin: "Subhaana rabbiyal 'azhiimi wa bihamdih. (3x)", arti: "Maha Suci Tuhanku Yang Maha Agung dan dengan memuji-Nya." },
        { judul: "6. I'tidal", arab: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ\nرَبَّنَا لَكَ الْحَمْدُ مِلْءَ السَّمَاوَاتِ وَمِلْءَ الْأَرْضِ وَمِلْءَ مَا شِئْتَ مِنْ شَيْءٍ بَعْدُ", latin: "Sami'allahu liman hamidah.\nRabbanaa lakal hamdu mil'us samaawaati wa mil'ul ardhi wa mil'u maa syi'ta min syai'in ba'du.", arti: "Allah mendengar orang yang memuji-Nya. Ya Tuhan kami, bagi-Mu segala puji, sepenuh langit dan bumi, dan sepenuh apa yang Engkau kehendaki sesudah itu." },
        { judul: "7. Bacaan Sujud", arab: "سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ", latin: "Subhaana rabbiyal a'laa wa bihamdih. (3x)", arti: "Maha Suci Tuhanku Yang Maha Tinggi dan dengan memuji-Nya." },
        { judul: "8. Duduk Diantara Dua Sujud", arab: "رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَارْفَعْنِي وَارْزُقْنِي وَاهْدِنِي وَعَافِنِي وَاعْفُ عَنِّي", latin: "Rabbighfir lii warhamnii wajburnii warfa'nii warzuqnii wahdinii wa 'aafinii wa'fu 'annii.", arti: "Ya Tuhanku, ampunilah aku, rahmatilah aku, cukupkanlah kekuranganku, angkatlah derajatku, berilah rezeki kepadaku, berilah petunjuk kepadaku, berilah kesehatan kepadaku dan maafkanlah aku." },
        { judul: "9. Tahiyyat Awal", arab: "التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ. اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ", latin: "Attahiyyaatul mubaarakaatush shalawaatuth thayyibaatu lillaah. Assalaamu 'alaika ayyuhan nabiyyu wa rahmatullahi wa barakaatuh. Assalaamu 'alainaa wa 'alaa 'ibaadillahish shaalihiin. Asyhadu allaa ilaaha illallah, wa asyhadu anna Muhammadar rasuulullah. Allahumma shalli 'alaa sayyidinaa Muhammad.", arti: "Segala penghormatan, keberkahan, shalawat dan kebaikan hanya bagi Allah. Keselamatan, rahmat dan berkah Allah semoga tercurah kepadamu wahai Nabi..." },
        { judul: "10. Tahiyyat Akhir", arab: "التَّحِيَّاتُ الْمُبَارَكَاتُ... (Sama dengan awal, dilanjutkan dengan:) وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ", latin: "...wa 'alaa aali sayyidinaa Muhammad. Kamaa shallaita 'alaa sayyidinaa Ibraahiim wa 'alaa aali sayyidinaa Ibraahiim. Wabaarik 'alaa sayyidinaa Muhammad wa 'alaa aali sayyidinaa Muhammad. Kamaa baarakta 'alaa sayyidinaa Ibraahiim wa 'alaa aali sayyidinaa Ibraahiim, fil 'aalamiina innaka hamiidum majiid.", arti: "...dan atas keluarga Nabi Muhammad, sebagaimana Engkau telah bershalawat kepada Nabi Ibrahim dan keluarga Nabi Ibrahim. Dan limpahkanlah keberkahan kepada Nabi Muhammad dan keluarganya, sebagaimana Engkau melimpahkan keberkahan kepada Nabi Ibrahim dan keluarganya..." },
        { judul: "11. Salam", arab: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", latin: "Assalaamu 'alaikum wa rahmatullah.", arti: "Keselamatan dan rahmat Allah semoga terlimpahkan kepada kalian." }
    ];

    // ================= DATA WIRID BA'DA SHALAT FINAL =================
    const dataDzikirShalat = [
        { judul: "1. Istighfar (3x)", arab: "أَسْتَغْفِرُ اللهَ الْعَظِـيْمَ الَّذِيْ لَا اِلَهَ اِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ وَأَتُوْبُ إِلَيْهِ", latin: "Astaghfirullahal 'adzhiim, alladzii laa ilaaha illaa huwal hayyul qayyuumu wa atuubu ilaih. (3x)", arti: "Aku memohon ampun kepada Allah Yang Maha Agung, yang tiada Tuhan selain Dia Yang Maha Hidup lagi Maha Berdiri Sendiri, dan aku bertaubat kepada-Nya." },
        { judul: "2. Tahlil", arab: "لَاإِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِيْ وَيُمِيْتُ وَهُوَ عَلَى كُلِّ شَيْئٍ قَدِيْرٌ", latin: "Laa ilaaha illallah wahdahu laa syariika lah, lahul mulku wa lahul hamdu yuhyii wa yumiitu wa huwa 'alaa kulli syai-in qadiir. (3x)", arti: "Tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan puji-pujian. Dia-lah Yang Menghidupkan dan Mematikan..." },
        { judul: "3. Mohon Perlindungan dari Api Neraka", arab: "اَللَّهُمَّ أَجِرْنِـى مِنَ النَّارِ", latin: "Allahumma ajirnii minan-naar. (3x)", arti: "Ya Allah, lindungilah aku dari api neraka." },
        { judul: "4. Pujian Keselamatan (Allahumma Antas Salam)", arab: "اَللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلَامُ، وَإِلَيْكَ يَعُوْدُ السَّلَامُ فَحَيِّنَارَبَّنَا بِالسَّلَامِ وَاَدْخِلْنَا الْـجَنَّةَ دَارَ السَّلَامِ تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ يَا ذَاالْـجَلَالِ وَاْلإِكْرَامِ", latin: "Allahumma antas salaam, wa minkas saaam, wa ilaika ya'uudus salaam fahayyinaa rabbanaa bis salaam wa adkhilnal jannata daaras salaam tabaarakta rabbanaa wa ta'aalaita yaa dzal jalaali wal ikraam.", arti: "Ya Allah, Engkaulah As-Salam (Yang memberikan keselamatan), dan dari-Mu keselamatan, dan kepada-Mu kembali keselamatan..." },
        { judul: "5. Membaca Al-Fatihah", arab: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ...", latin: "Bismillahir-rahmanir-rahim...", arti: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang..." },
        { judul: "6. Membaca Ayat Kursi", arab: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", latin: "Allahu laa ilaaha illaa huwal hayyul qayyuum, laa ta'khudzuhuu sinatuw walaa naum...", arti: "Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya)..." },
        { judul: "7. Membaca Tasbih, Tahmid, Takbir", arab: "سُبْحَانَ اللهِ (٣٣×) ، اَلْحَمْدُ لِلهِ (٣٣×) ، اَللهُ أَكْبَرُ (٣٣×)", latin: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (33x).", arti: "Maha Suci Allah, Segala Puji bagi Allah, Allah Maha Besar." },
        { judul: "8. Doa Setelah Shalat", arab: "اللَّهُمَّ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", latin: "Allahumma rabbanaa aatinaa fid-dunyaa hasanah wa fil-aakhiroti hasanah wa qinaa 'adzaaban-naar.", arti: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka." }
    ];

    // ================= DATA SHALAWAT MASYHUR FINAL =================
    const dataSholawat = [
        { judul: "1. Shalawat Nariyah", arab: "اللَّهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلى سَيِّدِنَا مُحَمَّدٍ الَّذِي تُنْحَلُ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ وَعَلى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ", latin: "Allahumma shalli shalaatan kaamilatan wa sallim salaaman taamman 'alaa sayyidinaa muhammadinil-ladzii tunhalu bihil-'uqadu wa tanfariju bihil-kurabu...", arti: "Ya Allah, limpahkanlah sholawat yang sempurna dan salam yang sempurna kepada junjungan kami Nabi Muhammad, yang dengan perantaraannya terlepas segala ikatan, lenyap segala kesedihan..." },
        { judul: "2. Shalawat Thibbil Qulub", arab: "اللّٰهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوْبِ وَدَوَائِهَا، وَعَافِيَةِ الْاَبْدَانِ وَشِفَائِهَا، وَنُوْرِ الْاَبْصَارِ وَضِيَائِهَا، وَعَلٰى اٰلِهِ وَصَحْبِهِ وَسَلِّمْ", latin: "Allahumme shalli 'alaa sayyidinaa Muhammadin thibbil quluubi wa dawaa-ihaa, wa 'aafiyatil abdaani wa syifaa-ihaa, wa nuuril abshaari wa dhiyaa-ihaa, wa 'alaa aalihii wa shahbihii wa sallim.", arti: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, sebagai obat hati dan penyembuhnya, penyehat badan dan kesembuhannya, cahaya mata dan sinarnya, serta kepada keluarga dan sahabatnya, dan berilah keselamatan." },
        { judul: "3. Shalawat Munjiyat", arab: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلاَةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْآفَاتِ، وَتَقْضِي لَنَا بِهَا جَمِيعَ الْحَاجَاتِ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيعِ السَّيِّئَاتِ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ، وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَايَاتِ مِنْ جَمِيعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ", latin: "Allahumma shalli 'alaa sayyidinaa Muhammadin shalaatan tunjiinaa bihaa min jamii'il ahwaali wal aafaat, wa taqdhii lanaa bihaa jamii'al haajaat...", arti: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, dengan rahmat yang menyelamatkan kami dari semua ketakutan dan malapetaka, yang memenuhi semua kebutuhan kami..." },
        { judul: "4. Shalawat Al-Fatih", arab: "اللَّهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ اَلْفَاتِحِ لِمَا أُغْلِقَ وَالْخَاتِمِ لِمَا سَبَقَ، نَاصِرِ الْحَقِّ بِالْحَقِّ، وَالْهَادِيْ إِلَى صِرَاطِكَ الْمُسْتَقِيْمِ وَعَلَى آلِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ الْعَظِيْمِ", latin: "Allahumme shalli 'alaa sayyidinaa muhammadinil faatihi limaa ughliqa, wal khaatimi limaa sabaqa, naashiril haqqi bilhaqqi, wal haadii ilaa shiraathikal mustaqiim...", arti: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, pembuka apa yang terkunci, penutup apa yang terdahulu, pembela kebenaran dengan kebenaran..." },
        { judul: "5. Shalawat Ibrahimiyah", arab: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ", latin: "Allahumma shalli 'alaa Muhammad wa 'alaa aali Muhammad, kamaa shallaita 'alaa Ibraahiim wa 'alaa aali Ibraahiim, innaka hamiidum majiid.", arti: "Ya Allah, berilah rahmat kepada Nabi Muhammad dan keluarga Nabi Muhammad, sebagaimana Engkau telah memberikan rahmat kepada Nabi Ibrahim dan keluarga Nabi Ibrahim..." }
    ];

    // ================= DATA MAULID FINAL (Termasuk Mahalul Qiyam) =================
    const menuMaulidList = [ { id: 'maulid-diba', nama: "Maulid Ad-Diba'i", pengarang: "Syekh Abdurrahman Ad-Diba'i" }, { id: 'maulid-barzanji', nama: "Maulid Al-Barzanji", pengarang: "Syekh Ja'far Al-Barzanji" }, { id: 'maulid-simtudurror', nama: "Maulid Simtudduror", pengarang: "Habib Ali bin Muhammad Al-Habsyi" }, { id: 'maulid-burdah', nama: "Qashidah Burdah", pengarang: "Imam Al-Bushiri" } ];

    const dataMaulidDetail = {
        'maulid-diba': [
            { judul: "Fasal 1: Ya Rabbi Shalli", arab: "يَا رَبِّ صَلِّ عَلىٰ مُحَمَّدْ ۞ يَا رَبِّ صَلِّ عَلَيْهِ وَسَلِّمْ\nيَا رَبِّ بَلِّغْهُ الْوَسِيْلَةْ ۞ يَا رَبِّ خُصَّهُ بِالْفَضِيْلَةْ", latin: "Yaa Rabbi shalli 'alaa Muhammad - Yaa Rabbi shalli 'alaihi wasallim\nYaa Rabbi balligh-hul wasiilah - Yaa Rabbi khusshahu bil fadhiilah", arti: "Ya Tuhanku, limpahkanlah rahmat kepada Nabi Muhammad. Ya Tuhanku, limpahkanlah rahmat dan keselamatan kepadanya..." },
            { judul: "Fasal 2: Inna Fatahna", arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ\nإِنَّا فَتَحْنَا لَكَ فَتْحًا مُبِينًا ۞ لِيَغْفِرَ لَكَ اللَّهُ مَا تَقَدَّمَ مِنْ ذَنْبِكَ وَمَا تَأَخَّرَ", latin: "Bismillaahirrahmaanirrahiim.\nInnaa fatahnaa laka fathan mubiinaa. Liyaghfira lakallaahu maa taqaddama min dzanbika wamaa ta-akhkhara", arti: "Dengan menyebut nama Allah... Sesungguhnya Kami telah memberikan kepadamu kemenangan yang nyata..." },
            { judul: "Fasal 3: Alhamdulillahil Qawiyyil Ghalib", arab: "اَلْحَمْدُ لِلّٰهِ الْقَوِيِّ الْغَالِبْ ۞ اَلْوَلِيِّ الطَّالِبْ ۞ اَلْبَاعِثِ الْوَارِثِ الْمَانِحِ السَّالِبْ", latin: "Alhamdulillaahil qawiyyil ghaalib. Al-waliyyit thaalib. Al-baa'itsil waaritsil maanihis saalib.", arti: "Segala puji bagi Allah Yang Maha Kuat lagi Maha Menang. Yang Maha Melindungi lagi Maha Menuntut..." },
            { judul: "Mahalul Qiyam (Puncak Maulid)", arab: "يَا نَبِي سَلَامٌ عَلَيْكَ ۞ يَا رَسُوْلْ سَلَامٌ عَلَيْكَ\nيَا حَبِيْبْ سَلَامٌ عَلَيْكَ ۞ صَلَوَاتُ اللهِ عَلَيْكَ\nأَشْرَقَ الْبَدْرُ عَلَيْنَا ۞ فَاخْتَفَتْ مِنْهُ الْبُدُوْرُ\nمِثْلَ حُسْنِكْ مَا رَأَيْنَا ۞ قَطُّ يَا وَجْهَ السُّرُوْرِ", latin: "Yaa Nabii salaam 'alaika - Yaa Rasuul salaam 'alaika\nYaa Habiib salaam 'alaika - Shalawaatullaah 'alaika\nAsyraqal badru 'alainaa - Fakhtafat minhul buduur\nMitsla husnik maa ra-ainaa - Qatthu yaa wajhas suruur", arti: "Wahai Nabi, salam sejahtera untukmu. Wahai Rasul, salam sejahtera untukmu. Wahai Kekasih, salam sejahtera untukmu. Sholawat Allah untukmu. Telah terbit bulan purnama pada kita, maka tenggelamlah semua bulan purnama (kalah terang). Belum pernah kami melihat ketampanan sepertimu, sama sekali wahai wajah yang penuh kebahagiaan." }
        ],
        'maulid-barzanji': [
            { judul: "Fasal 1: Abtadiul Imla", arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ\nأَبْتَدِئُ الْإِمْلَاءَ بِاسْمِ الذَّاتِ الْعَلِيَّةِ ۞ مُسْتَدِرًّا فَيْضَ الْبَرَكَاتِ عَلَى مَا أَنَالَهُ وَأَوْلَاهُ", latin: "Bismillaahirrahmaanirrahiim.\nAbtadi-ul imlaa-a bismidz dzaatil 'aliyyah, mustadirran faidlul barakaati 'alaa maa anaalahu wa awlaah.", arti: "Dengan nama Allah... Aku memulai penulisan ini dengan menyebut nama Dzat yang Maha Tinggi, seraya memohon curahan keberkahan atas apa yang telah Allah berikan dan karuniakan..." },
            { judul: "Fasal 2: Wa Ba'du", arab: "وَبَعْدُ ۞ فَأَقُوْلُ هُوَ سَيِّدُنَا مُحَمَّدُ بْنُ عَبْدِ اللهِ بْنِ عَبْدِ الْمُطَّلِبِ بْنِ هَاشِمِ بْنِ عَبْدِ مَنَافِ", latin: "Wa ba'du, fa-aquulu huwa sayyidunaa Muhammadubnu 'Abdillaahibni 'Abdil Mutthalibibni Haasyimibni 'Abdi Manaaf...", arti: "Dan setelah itu, maka aku berkata: Beliau adalah junjungan kita Muhammad bin Abdullah bin Abdul Mutthalib bin Hasyim bin Abdul Manaf..." },
            { judul: "Mahalul Qiyam (Puncak Maulid)", arab: "يَا نَبِي سَلَامٌ عَلَيْكَ ۞ يَا رَسُوْلْ سَلَامٌ عَلَيْكَ\nيَا حَبِيْبْ سَلَامٌ عَلَيْكَ ۞ صَلَوَاتُ اللهِ عَلَيْكَ\nأَشْرَقَ الْبَدْرُ عَلَيْنَا ۞ فَاخْتَفَتْ مِنْهُ الْبُدُوْرُ\nمِثْلَ حُسْنِكْ مَا رَأَيْنَا ۞ قَطُّ يَا وَجْهَ السُّرُوْرِ", latin: "Yaa Nabii salaam 'alaika - Yaa Rasuul salaam 'alaika\nYaa Habiib salaam 'alaika - Shalawaatullaah 'alaika\nAsyraqal badru 'alainaa - Fakhtafat minhul buduur\nMitsla husnik maa ra-ainaa - Qatthu yaa wajhas suruur", arti: "Wahai Nabi, salam sejahtera untukmu. Wahai Rasul, salam sejahtera untukmu. Wahai Kekasih, salam sejahtera untukmu. Sholawat Allah untukmu. Telah terbit bulan purnama pada kita, maka tenggelamlah semua bulan purnama (kalah terang). Belum pernah kami melihat ketampanan sepertimu, sama sekali wahai wajah yang penuh kebahagiaan." }
        ],
        'maulid-simtudurror': [
            { judul: "Fasal 1: Ya Rabbi Shalli", arab: "يَا رَبِّ صَلِّ عَلىٰ مُحَمَّدْ ۞ مَالَاحَ فِي الْأُفْقِ نُوْرُ كَوْكَبْ\nيَا رَبِّ صَلِّ عَلىٰ مُحَمَّدْ ۞ اَلْفَاتِحِ الْخَاتِمِ الْمُقَرَّبْ", latin: "Yaa Rabbi shalli 'alaa Muhammad - Maalaaha fil ufqi nuuru kaukab\nYaa Rabbi shalli 'alaa Muhammad - Al-faatihil khaatimil muqarrab", arti: "Ya Tuhanku, limpahkan shalawat atas Muhammad, selama cahaya bintang masih benderang di ufuk. Ya Tuhanku, limpahkan shalawat atas Muhammad, sang pembuka, penutup, dan yang didekatkan." },
            { judul: "Fasal 2: Tajallal Haqqu", arab: "تَجَلَّى الْحَقُّ فِي عَالَمِ قُدْسِهِ الْوَاسِعِ ۞ تَجَلِّيًا قَضَى بِانْتِشَارِ فَضْلِهِ فِي الْقَرِيْبِ وَالشَّاسِعِ", latin: "Tajallal haqqu fii 'aalami qudsihil waasi'. Tajalliyan qadlaa bintisyaari fadlihi fil qariibi wasy syaasi'.", arti: "Al-Haq (Allah) bertajalli di alam kesucian-Nya yang luas. Sebuah tajalli yang menetapkan tersebarnya karunia-Nya pada yang dekat dan yang jauh." },
            { judul: "Mahalul Qiyam (Puncak Maulid)", arab: "يَا نَبِي سَلَامٌ عَلَيْكَ ۞ يَا رَسُوْلْ سَلَامٌ عَلَيْكَ\nيَا حَبِيْبْ سَلَامٌ عَلَيْكَ ۞ صَلَوَاتُ اللهِ عَلَيْكَ\nأَشْرَقَ الْكَوْنُ ابْتِهَاجَا ۞ بِوُجُوْدِ الْمُصْطَفَى أَحْمَدْ\nوَلِأَهْلِ الْكَوْنِ أُنْسٌ ۞ وَسُرُوْرٌ قَدْ تَجَدَّدْ", latin: "Yaa Nabii salaam 'alaika - Yaa Rasuul salaam 'alaika\nYaa Habiib salaam 'alaika - Shalawaatullaah 'alaika\nAsyraqal kaunu-btihaajaa - Biwujuudil musthafaa Ahmad\nWa li-ahlil kauni unsun - Wa suruurun qad tajaddad", arti: "Wahai Nabi, salam sejahtera untukmu. Wahai Rasul, salam sejahtera untukmu. Alam semesta bersinar dengan penuh kegembiraan dengan kehadiran Al-Musthafa Ahmad. Dan bagi penghuni semesta, ada keintiman dan kegembiraan yang terus diperbarui." }
        ],
        'maulid-burdah': [
            { judul: "Pasal 1: Rayuan Kasih", arab: "أَمِنْ تذكرِ جِيرَانٍ بِذِي سَلَمِ ۞ مَزَجْتَ دَمْعًا جَرَى مِنْ مُقْلَةٍ بِدَمِ\nأَمْ هَبَّتِ الرِّيحُ مِنْ تِلْقَاءِ كَاظِمَةٍ ۞ وَأَوْمَضَ الْبَرْقُ فِي الظَّلْمَاءِ مِنْ إِضَمِ", latin: "Amin tadzakkuri jiiraanim bidzii salami - Mazajta dam'an jaraa min muqlatim bidami.\nAm habbatir riihu min tilqaa-i kaazhimatin - Wa awmadhal barqu fizh zhalmaa-i min idhami.", arti: "Apakah karena teringat tetangga di Dzi Salam, engkau campurkan air mata yang menetes dengan darah? Atau karena tiupan angin dari arah Kazhimah, dan kilat yang menyambar di kegelapan malam dari arah Idham?" },
            { judul: "Pasal 2: Peringatan Bahaya Hawa Nafsu", arab: "فَإِنَّ أَمَّارَتِي بِالسُّوءِ مَا اتَّعَظَتْ ۞ مِنْ جَهْلِهَا بِنَذِيرِ الشَّيْبِ وَالْهَرَمِ\nوَلَا أَعَدَّتْ مِنَ الْفِعْلِ الْجَمِيلِ قِرًى ۞ ضَيْفٍ أَلَمَّ بِرَأْسِي غَيْرَ مُحْتَشِمِ", latin: "Fa inna ammaaratii bis-suu-i mawat ta'azhat - Min jahlihaa binadziirisy syaibi wal harami.\nWa laa a'addat minal fi'lil jamiili qiraa - Dhaifin alamma bira'sii ghaira muhtasyimi.", arti: "Sesungguhnya nafsuku yang selalu menyuruh keburukan tidak mengambil pelajaran, karena kebodohannya akan peringatan uban dan masa tua. Dan dia tidak menyiapkan amal kebaikan sebagai hidangan untuk tamu (uban) yang singgah di kepalaku tanpa rasa malu." }
        ]
    };

    function bukaMenuMaulid() {
        bukaHalaman('view-daftar-maulid'); let html = '';
        menuMaulidList.forEach(m => { html += `<div class="list-item" onclick="bukaIsiMaulid('${m.id}', '${m.nama}')"><div><strong>${m.nama}</strong><br/><span style='font-size:11px; color:gray;'>Karya: ${m.pengarang}</span></div><div style='color:var(--blue-text); font-size:20px;'><i class='fa-solid fa-chevron-right'></i></div></div>`; });
        document.getElementById('daftar-maulid-content').innerHTML = html;
    }

    function bukaIsiMaulid(idMaulid, judulMaulid) { renderMateri(judulMaulid, dataMaulidDetail[idMaulid], true); } // True = centered

    // ================= DATA DZIKIR PAGI =================
    const dataDzikirPagi = [
        { judul: "1. Membaca Sayyidul Istighfar", arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", latin: "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa anaa 'abduka wa anaa 'alaa 'ahdika wa wa'dika mastatha'tu. A'udzu bika min syarri maa shana'tu abuu-u laka bini'matika 'alayya wa abuu-u bidzanbii faghfirlii fa innahu laa yaghfirudz dzunuuba illaa anta.", arti: "Ya Allah, Engkau Tuhanku, tiada Tuhan yang berhak disembah kecuali Engkau, Engkau telah menciptakanku dan aku adalah hamba-Mu. Aku tetap pada perjanjian dan janji-Mu semampuku. Aku berlindung kepada-Mu dari keburukan perbuatanku. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, maka ampunilah aku. Sesungguhnya tidak ada yang mengampuni dosa kecuali Engkau." },
        { judul: "2. Membaca Al-Fatihah", arab: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (1) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (2) الرَّحْمَٰنِ الرَّحِيمِ (3) مَالِكِ يَوْمِ الدِّينِ (4) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (5) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (6) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (7)", latin: "Bismillahir-rahmanir-rahim. Alhamdu lillahi rabbil-'alamin...", arti: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan seluruh alam..." },
        { judul: "3. Ayat Kursi", arab: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", latin: "Allahu laa ilaaha illaa huwal hayyul qayyuum...", arti: "Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya)..." },
        { judul: "4. Surat Al-Ikhlas (3x)", arab: "قُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", latin: "Qul huwallahu ahad. Allahu shamad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad. (3x)", arti: "Katakanlah: Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada seorang pun yang setara dengan Dia." },
        { judul: "5. Surat Al-Falaq (3x)", arab: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِنْ شَرِّ مَا خَلَقَ ۞ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", latin: "Qul a'udzu birabbil falaq. Min syarri maa khalaq. Wa min syarri ghaasiqin idzaa waqab. Wa min syarrin naffaatsaati fil 'uqad. Wa min syarri haasidin idzaa hasad. (3x)", arti: "Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh (fajar), dari kejahatan makhluk-Nya..." },
        { judul: "6. Surat An-Nas (3x)", arab: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَٰهِ النَّاسِ ۞ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ", latin: "Qul a'udzu birabbin naas. Malikin naas. Ilaahin naas. Min syarril waswaasil khannaas. Alladzii yuwaswisu fii shuduurin naas. Minal jinnati wan naas. (3x)", arti: "Katakanlah: Aku berlindung kepada Tuhannya manusia. Raja manusia. Sembahan manusia..." },
        { judul: "7. Doa Pagi (Allahumma Bika Ashbahn)", arab: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", latin: "Allahumma bika ashbahnaa wa bika amsainaa wa bika nahyaa wa bika namuutu wa ilaikan nushuur.", arti: "Ya Allah, dengan rahmat-Mu kami memasuki waktu pagi, dengan rahmat-Mu kami memasuki waktu petang, dengan rahmat-Mu kami hidup dan dengan kehendak-Mu kami mati, dan kepada-Mu kami kembali." },
        { judul: "8. Doa Perlindungan Pagi", arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ عَلَيْكَ تَوَكَّلْتُ وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ مَا شَاءَ اللَّهُ كَانَ وَمَا لَمْ يَشَأْ لَمْ يَكُنْ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ أَعْلَمُ أَنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ وَأَنَّ اللَّهَ قَدْ أَحَاطَ بِكُلِّ شَيْءٍ عِلْمًا", latin: "Allahumma anta rabbii laa ilaaha illaa anta 'alayka tawakkaltu wa anta rabbul 'arsyil 'azhiim. Maa syaa'allaahu kaana wa maa lam yasya' lam yakun wa laa hawla wa laa quwwata illaa billahil 'aliyyil 'azhiim. A'lamu annallaaha 'alaa kulli syay-in qadiir wa annallaaha qad ahaatha bikulli syay-in 'ilma.", arti: "Ya Allah, Engkau Tuhanku, tiada Tuhan yang berhak disembah kecuali Engkau, kepada-Mu aku bertawakal dan Engkau Tuhan Arsy yang agung..." },
        { judul: "9. Tasbih Pagi (33x)", arab: "سُبْحَانَ اللهِ وَبِحَمْدِهِ", latin: "Subhanallaahi wa bihamdih. (33x)", arti: "Maha Suci Allah dengan segala pujian bagi-Nya." },
        { judul: "10. Tahmid Pagi (33x)", arab: "سُبْحَانَ اللهِ الْعَظِيمِ", latin: "Subhanallahil 'azhiim. (33x)", arti: "Maha Suci Allah Yang Maha Agung." },
        { judul: "11. Takbir Pagi (34x)", arab: "اللهُ أَكْبَرُ", latin: "Allahu Akbar. (34x)", arti: "Allah Maha Besar." },
        { judul: "12. Doa Penutup Pagi", arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", latin: "Allahumma anta rabbii laa ilaaha illaa anta...", arti: "Ya Allah, Engkau Tuhanku, tiada Tuhan yang berhak disembah kecuali Engkau..." }
    ];

    // ================= DATA DZIKIR PETANG =================
    const dataDzikirPetang = [
        { judul: "1. Membaca Sayyidul Istighfar", arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", latin: "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa anaa 'abduka wa anaa 'alaa 'ahdika wa wa'dika mastatha'tu. A'udzu bika min syarri maa shana'tu abuu-u laka bini'matika 'alayya wa abuu-u bidzanbii faghfirlii fa innahu laa yaghfirudz dzunuuba illaa anta.", arti: "Ya Allah, Engkau Tuhanku, tiada Tuhan yang berhak disembah kecuali Engkau, Engkau telah menciptakanku dan aku adalah hamba-Mu..." },
        { judul: "2. Membaca Al-Fatihah", arab: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (1) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (2) الرَّحْمَٰنِ الرَّحِيمِ (3) مَالِكِ يَوْمِ الدِّينِ (4) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (5) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (6) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (7)", latin: "Bismillahir-rahmanir-rahim. Alhamdu lillahi rabbil-'alamin...", arti: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang..." },
        { judul: "3. Ayat Kursi", arab: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", latin: "Allahu laa ilaaha illaa huwal hayyul qayyuum...", arti: "Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya)..." },
        { judul: "4. Surat Al-Ikhlas (3x)", arab: "قُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", latin: "Qul huwallahu ahad. Allahu shamad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad. (3x)", arti: "Katakanlah: Dialah Allah, Yang Maha Esa..." },
        { judul: "5. Surat Al-Falaq (3x)", arab: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِنْ شَرِّ مَا خَلَقَ ۞ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", latin: "Qul a'udzu birabbil falaq. Min syarri maa khalaq... (3x)", arti: "Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh (fajar)..." },
        { judul: "6. Surat An-Nas (3x)", arab: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَٰهِ النَّاسِ ۞ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ", latin: "Qul a'udzu birabbin naas. Malikin naas... (3x)", arti: "Katakanlah: Aku berlindung kepada Tuhannya manusia..." },
        { judul: "7. Doa Petang (Allahumma Bika Amsaina)", arab: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ", latin: "Allahumma bika amsainaa wa bika ashbahnaa wa bika nahyaa wa bika namuutu wa ilaikal mashiir.", arti: "Ya Allah, dengan rahmat-Mu kami memasuki waktu petang, dengan rahmat-Mu kami memasuki waktu pagi, dengan rahmat-Mu kami hidup dan dengan kehendak-Mu kami mati, dan kepada-Mu kami kembali." },
        { judul: "8. Doa Perlindungan Petang", arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ عَلَيْكَ تَوَكَّلْتُ وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ مَا شَاءَ اللَّهُ كَانَ وَمَا لَمْ يَشَأْ لَمْ يَكُنْ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ أَعْلَمُ أَنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ وَأَنَّ اللَّهَ قَدْ أَحَاطَ بِكُلِّ شَيْءٍ عِلْمًا", latin: "Allahumma anta rabbii laa ilaaha illaa anta 'alayka tawakkaltu wa anta rabbul 'arsyil 'azhiim...", arti: "Ya Allah, Engkau Tuhanku, tiada Tuhan yang berhak disembah kecuali Engkau..." },
        { judul: "9. Tasbih Petang (33x)", arab: "سُبْحَانَ اللهِ وَبِحَمْدِهِ", latin: "Subhanallaahi wa bihamdih. (33x)", arti: "Maha Suci Allah dengan segala pujian bagi-Nya." },
        { judul: "10. Tahmid Petang (33x)", arab: "سُبْحَانَ اللهِ الْعَظِيمِ", latin: "Subhanallahil 'azhiim. (33x)", arti: "Maha Suci Allah Yang Maha Agung." },
        { judul: "11. Takbir Petang (34x)", arab: "اللهُ أَكْبَرُ", latin: "Allahu Akbar. (34x)", arti: "Allah Maha Besar." },
        { judul: "12. Doa Penutup Petang", arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", latin: "Allahumma anta rabbii laa ilaaha illaa anta...", arti: "Ya Allah, Engkau Tuhanku, tiada Tuhan yang berhak disembah kecuali Engkau..." }
    ];

    let currentDzikirData = dataDzikirPagi;

    function bukaDzikirPagiPetang() {
        bukaHalaman('view-dzikir');
        document.getElementById('dzikir-title').innerText = "Dzikir Pagi & Petang";
        switchTabDzikir('pagi');
    }

    function switchTabDzikir(tab) {
        document.getElementById('tab-pagi').classList.remove('active');
        document.getElementById('tab-petang').classList.remove('active');
        document.getElementById('tab-' + tab).classList.add('active');
        
        if (tab === 'pagi') {
            currentDzikirData = dataDzikirPagi;
        } else {
            currentDzikirData = dataDzikirPetang;
        }
        
        renderDzikirContent();
    }

    function renderDzikirContent() {
        let html = '';
        currentDzikirData.forEach(item => { 
            html += `<div class='content-box'><div class='content-title'>${item.judul}</div><div class='teks-arab'>${item.arab.replace(/\n/g, '<br/>')}</div><div class='teks-latin'>${item.latin.replace(/\n/g, '<br/>')}</div><div class='teks-arti'>${item.arti.replace(/\n/g, '<br/>')}</div></div>`; 
        });
        document.getElementById('dzikir-content').innerHTML = html;
        isCenteredContent = false;
        terapkanPengaturan();
    }

    function filterPencarianDzikir() {
        let input = document.getElementById('searchInputDzikir').value.toLowerCase();
        let dzikirContent = document.getElementById('dzikir-content');
        let boxes = dzikirContent.getElementsByClassName('content-box');
        
        for (let i = 0; i < boxes.length; i++) {
            let textContext = boxes[i].innerText.toLowerCase();
            if (textContext.includes(input)) {
                boxes[i].style.display = "";
            } else {
                boxes[i].style.display = "none";
            }
        }
    }

    // ================= DATA DOA HARIAN FINAL =================
    const dataDoaHarian = [
        { judul: "Sayyidul Istighfar", arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ...", latin: "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa anaa 'abduka...", arti: "Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah kecuali Engkau..." },
        { judul: "Doa Bangun Tidur", arab: "اَلْحَمْدُ لِلَّهِ الَّذِيْ أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُوْرُ", latin: "Alhamdulillahilladzi ahyaanaa ba'da maa amaatanaa wa ilaihin nusyuur.", arti: "Segala puji bagi Allah yang menghidupkan kami kembali..." },
        { judul: "Doa Sebelum Tidur", arab: "بِاسْمِكَ اللَّهُمَّ أَحْيَا وَبِاسْمِكَ أَمُوتُ", latin: "Bismikallahumma ahyaa wa bismika amuut.", arti: "Dengan nama-Mu ya Allah aku hidup, dan dengan nama-Mu aku mati." },
        { judul: "Doa Keluar Rumah", arab: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", latin: "Bismillaahi tawakkaltu 'alallaahi laa hawla wa laa quwwata illaa billaah.", arti: "Dengan nama Allah, aku bertawakal kepada Allah, tiada daya dan upaya kecuali dengan pertolongan Allah." }
    ];

    function renderMateri(judul, data, centered = false) {
        bukaHalaman('view-materi'); document.getElementById('materi-title').innerText = judul; 
        let html = '';
        data.forEach(item => { 
            html += `<div class='content-box ${centered ? 'centered-arab' : ''}'><div class='content-title'>${item.judul}</div><div class='teks-arab'>${item.arab.replace(/\n/g, '<br/>')}</div><div class='teks-latin'>${item.latin.replace(/\n/g, '<br/>')}</div><div class='teks-arti'>${item.arti.replace(/\n/g, '<br/>')}</div></div>`; 
        });
        document.getElementById('materi-content').innerHTML = html;
        isCenteredContent = centered;
        terapkanPengaturan();
    }









// ================= 2. DATA NADHOM ASMAUL HUSNA (VERSI BISMILLAHI BADA'NA SESUAI LINK) =================
const dataAsmaulHusnaLengkap = [
    { a: "بِسْمِ اللهِ بَدَأْنَا ۞ وَالْحَمْدُ لِرَبِّنَا", l: "Bismillaahi bada'naa - Walhamdu lirabbinaa", t: "Dengan nama Allah kami memulai, Segala puji bagi Tuhan kami" },
    { a: "وَالصَّلاَةُ وَالسَّلاَمُ ۞ لِلنَّبِيِّ حَبِيْبِنَا", l: "Wash shalaatu was salaam - Linnabiyyi habiibinaa", t: "Shalawat dan salam, Untuk Nabi Kekasih kami" },
    { a: "يَا اَللهُ يَارَبَّنَا ۞ اَنْتَ مَقْصُوْدُنَا", l: "Yaa Allahu Yaa Rabbanaa - Anta maqshuudunaa", t: "Ya Allah Ya Tuhan kami, Engkaulah tujuan kami" },
    { a: "رِضَاكَ مَطْلُوْبُنَا ۞ دُنْيَانَا وَاُخْرَانَا", l: "Ridhaaka mathluubunaa - Dun-yaanaa wa ukhraanaa", t: "Ridha-Mu yang kami cari, Di dunia dan di akhirat kami" },
    { a: "يَا رَحْمٰنُ يَارَحِيْمُ ۞ يَامَلِكُ يَاقُدُّوْسُ", l: "Yaa Rahmaanu Yaa Rahiim - Yaa Maliku Yaa Qudduus", t: "Ya Maha Pengasih, Ya Maha Penyayang, Ya Maha Raja, Ya Maha Suci" },
    { a: "يَاسَلاَمُ يَامُؤْمِنُ ۞ يَامُهَيْمِنُ يَاعَزِيْزُ", l: "Yaa Salaamu Yaa Mu'min - Yaa Muhaiminu Yaa 'Aziiz", t: "Ya Pemberi Keselamatan, Ya Pemberi Keamanan, Ya Pemelihara, Ya Maha Perkasa" },
    { a: "يَاجَبَّارُ يَامُتَكَبِّرُ ۞ يَاخَالِقُ يَابَارِئُ", l: "Yaa Jabbaaru Yaa Mutakabbir - Yaa Khaaliqu Yaa Baari'", t: "Ya Maha Pemaksa, Ya Maha Memiliki Kebesaran, Ya Pencipta, Ya Yang Melepaskan" },
    { a: "يَامُصَوِّرُ يَاغَفَّارُ ۞ يَاقَهَّارُ يَاوَهَّابُ", l: "Yaa Mushawwiru Yaa Ghaffaar - Yaa Qahhaaru Yaa Wahhaab", t: "Ya Pembentuk Rupa, Ya Maha Pengampun, Ya Maha Menundukkan, Ya Pemberi Karunia" },
    { a: "يَارَزَّاقُ يَافَتَّاحُ ۞ يَاعَلِيْمُ يَاقَابِضُ", l: "Yaa Razzaaqu Yaa Fattaah - Yaa 'Aliimu Yaa Qaabidh", t: "Ya Pemberi Rezeki, Ya Pembuka Rahmat, Ya Maha Mengetahui, Ya Yang Menyempitkan" },
    { a: "يَابَاسِطُ يَاخَافِضُ ۞ يَارَافِعُ يَامُعِزُّ", l: "Yaa Baasithu Yaa Khaafidh - Yaa Raafi'u Yaa Mu'izz", t: "Ya Yang Melapangkan, Ya Yang Merendahkan, Ya Yang Meninggikan, Ya Yang Memuliakan" },
    { a: "يَامُذِلُّ يَاسَمِيْعُ ۞ يَابَصِيْرُ يَاحَكَمُ", l: "Yaa Mudzillu Yaa Samii' - Yaa Bashiiru Yaa Hakam", t: "Ya Yang Menghinakan, Ya Maha Mendengar, Ya Maha Melihat, Ya Maha Menetapkan" },
    { a: "يَاعَدْلُ يَالَطِيْفُ ۞ يَاخَبِيْرُ يَاحَلِيْمُ", l: "Yaa 'Adlu Yaa Lathiif - Yaa Khabiiru Yaa Haliim", t: "Ya Maha Adil, Ya Maha Lembut, Ya Maha Mengetahui, Ya Maha Penyantun" },
    { a: "يَاعَظِيْمُ يَاغَفُوْرُ ۞ يَا شَكُوْرُ يَا عَلِيُّ", l: "Yaa 'Azhiimu Yaa Ghafuur - Yaa Syakuuru Yaa 'Aliyy", t: "Ya Maha Agung, Ya Maha Pengampun, Ya Maha Menghargai, Ya Maha Tinggi" },
    { a: "يَا كَبِيْرُ يَا حَفِيْظُ ۞ يَا مُقِيْتُ يَا حَسِيْبُ", l: "Yaa Kabiiru Yaa Hafiizh - Yaa Muqiitu Yaa Hasiib", t: "Ya Maha Besar, Ya Maha Memelihara, Ya Pemberi Kecukupan, Ya Maha Membuat Perhitungan" },
    { a: "يَا جَلِيْلُ يَا كَرِيْمُ ۞ يَا رَقِيْبُ يَا مُجِيْبُ", l: "Yaa Jaliilu Yaa Kariim - Yaa Raqiibu Yaa Mujiib", t: "Ya Maha Mulia, Ya Maha Pemurah, Ya Maha Mengawasi, Ya Mengabulkan Doa" },
    { a: "يَا وَاسِعُ يَا حَكِيْمُ ۞ يَا وَدُوْدُ يَا مَجِيْدُ", l: "Yaa Waasi'u Yaa Hakiim - Yaa Waduudu Yaa Majiid", t: "Ya Maha Luas, Ya Maha Bijaksana, Ya Maha Penuh Cinta, Ya Maha Mulia" },
    { a: "يَا بَاعِثُ يَا شَهِيْدُ ۞ يَا حَقُّ يَا وَكِيْلُ", l: "Yaa Baa'itsu Yaa Syahiid - Yaa Haqqu Yaa Wakiil", t: "Ya Yang Membangkitkan, Ya Maha Menyaksikan, Ya Maha Benar, Ya Maha Memelihara" },
    { a: "يَا قَوِيُّ يَا مَتِيْنُ ۞ يَا وَلِيُّ يَا حَمِيْدُ", l: "Yaa Qawiyyu Yaa Matiin - Yaa Waliyyu Yaa Hamiid", t: "Ya Maha Kuat, Ya Maha Kokoh, Ya Maha Melindungi, Ya Maha Terpuji" },
    { a: "يَا مُحْصِيْ يَا مُبْدِئُ ۞ يَا مُعِيْدُ يَا مُحْيِى", l: "Yaa Muhshii Yaa Mubdi' - Yaa Mu'iidu Yaa Muhyii", t: "Ya Maha Menghitung, Ya Maha Memulai, Ya Maha Mengembalikan, Ya Yang Menghidupkan" },
    { a: "يَا مُمِيْتُ يَا حَيُّ ۞ يَا قَيُّوْمُ يَا وَاجِدُ", l: "Yaa Mumiitu Yaa Hayyu - Yaa Qayyuumu Yaa Waajid", t: "Ya Yang Mematikan, Ya Maha Hidup, Ya Maha Berdiri Sendiri, Ya Penemu" },
    { a: "يَا مَاجِدُ يَا وَاحِدُ ۞ يَا أَحَدُ يَا صَمَدُ", l: "Yaa Maajidu Yaa Waahid - Yaa Ahadu Yaa Shamad", t: "Ya Maha Mulia, Ya Maha Esa, Ya Yang Tunggal, Ya Tempat Meminta" },
    { a: "يَا قَادِرُ يَا مُقْتَدِرُ ۞ يَا مُقَدِّمُ يَا مُؤَخِّرُ", l: "Yaa Qaadiru Yaa Muqtadir - Yaa Muqaddimu Yaa Muakhkhir", t: "Ya Maha Kuasa, Ya Yang Menentukan, Ya Yang Mendahulukan, Ya Yang Mengakhirkan" },
    { a: "يَا أَوَّلُ يَا آخِرُ ۞ يَا ظَاهِرُ يَا بَاطِنُ", l: "Yaa Awwalu Yaa Aakhir - Yaa Zhaahiru Yaa Baathin", t: "Ya Yang Awal, Ya Yang Akhir, Ya Yang Nyata, Ya Yang Tersembunyi" },
    { a: "يَا وَالِيْ يَا مُتَعَالِيْ ۞ يَا بَرُّ يَا تَوَّابُ", l: "Yaa Waalii Yaa Muta'aalii - Yaa Barru Yaa Tawwaab", t: "Ya Yang Memerintah, Ya Yang Maha Tinggi, Ya Maha Dermawan, Ya Penerima Taubat" },
    { a: "يَا مُنْتَقِمُ يَا عَفُوُّ ۞ يَا رَؤُوْفُ يَا مَالِكُ الْمُلْكِ", l: "Yaa Muntaqimu Yaa 'Afuww - Yaa Ra'uufu Yaa Maalikul Mulk", t: "Ya Penuntut Balas, Ya Maha Pemaaf, Ya Maha Pengasih, Ya Pemilik Kerajaan" },
    { a: "ذَاالْجَلاَلِ وَالْاِكْرَامِ ۞ يَا مُقْسِطُ يَا جَامِعُ", l: "Dzal Jalaali Wal Ikraam - Yaa Muqsithu Yaa Jaami'", t: "Pemilik Kebesaran & Kemuliaan, Ya Yang Maha Adil, Ya Yang Mengumpulkan" },
    { a: "يَا غَنِيُّ يَا مُغْنِيْ ۞ يَا مَانِعُ يَا ضَارُّ", l: "Yaa Ghaniyyu Yaa Mughnii - Yaa Maani'u Yaa Dhaar", t: "Ya Maha Kaya, Ya Pemberi Kekayaan, Ya Yang Mencegah, Ya Penimpa Bahaya" },
    { a: "يَا نَافِعُ يَا نُوْرُ ۞ يَا هَادِيْ يَا بَدِيْعُ", l: "Yaa Naafi'u Yaa Nuur - Yaa Haadii Yaa Badii'", t: "Ya Pemberi Manfaat, Ya Maha Bercahaya, Ya Pemberi Petunjuk, Ya Pencipta Tiada Banding" },
    { a: "يَا بَاقِيْ يَا وَارِثُ ۞ يَا رَشِيْدُ يَا صَبُوْرُ", l: "Yaa Baaqii Yaa Waaritsu - Yaa Rasyiidu Yaa Shabuur", t: "Ya Maha Kekal, Ya Maha Pewaris, Ya Maha Pandai, Ya Maha Sabar" },
    { a: "عَزَّ جَلَّ ذِكْرُهُ ۞ بِاَسْمَاءِكَ الْحُسْنَى", l: "'Azza Jalla Dzikruhu - Bi-asmaaikal Husnaa", t: "Maha Agung dan Mulia sebutan-Nya, Dengan Asmaul Husna-Mu" },
    { a: "اِغْفِرْلَنَا ذُنُوْبَنَا ۞ وَلِوَالِدِيْنَا", l: "Ighfirlanaa dzunuubanaa - Waliwaalidiinaa", t: "Ampunilah dosa-dosa kami, Dan dosa kedua orang tua kami" },
    { a: "وَذُرِّيَّاتِنَا ۞ كَفِّرْ عَنْ سَيِّئَاتِنَا", l: "Wadzurriyyaatinaa - Kaffir 'an sayyi-aatinaa", t: "Dan keturunan kami, Hapuskanlah keburukan kami" },
    { a: "وَاسْتُرْ عَلَى عُيُوْبِنَا ۞ وَاجْبُرْ عَلَى نُقْصَانِنَا", l: "Wastur 'alaa 'uyuubinaa - Wajbur 'alaa nuqshaaninaa", t: "Dan tutupilah aib-aib kami, Dan tambal lah kekurangan kami" },
    { a: "وَارْفَعْ دَرَجَاتِنَا ۞ وَزِدْنَا عِلْمًا نَافِعًا", l: "Warfa' darajaatinaa - Wazidnaa 'ilman naafi'an", t: "Dan angkatlah derajat kami, Dan tambahkanlah ilmu yang bermanfaat" },
    { a: "وَرِزْقًا وَاسِعًا ۞ حَلاَلاً طَيِّبًا", l: "Warizqan waasi'an - Halaalan thayyiban", t: "Dan rezeki yang luas, Halal lagi baik" },
    { a: "وَعَمَلاً صَالِحًا ۞ وَنَوِّرْ قُلُوْبَنَا", l: "Wa 'amalan shaalihan - Wanawwir quluubanaa", t: "Dan amal yang shalih, Dan terangilah hati kami" },
    { a: "وَيَسِّرْ أُمُوْرَنَا ۞ وَصَحِّحْ أَجْسَادَنَا", l: "Wayassir umuuranaa - Washahhih ajsaadanaa", t: "Dan mudahkanlah urusan kami, Dan sehatkanlah badan kami" },
    { a: "دَائِمَ حَيَاتِنَا ۞ إِلَى الْخَيْرِ قَرِّبْنَا", l: "Daa-ima hayaatinaa - Ilal khairi qarribnaa", t: "Selama kehidupan kami, Dekatkanlah kami pada kebaikan" },
    { a: "عَنِ الشَّرِّ بَاعِدْنَا ۞ وَقُرْبَى رَجَائُنَا", l: "'Anisy syarri baa'idnaa - Waqurbaa rajaa-unaa", t: "Jauhkanlah kami dari keburukan, Dan dekatkanlah harapan kami" },
    { a: "أَخِيْرًا نِلْنَا الْمُنَى ۞ بَلِّغْ مَقَاصِدَنَا", l: "Akhiiran nilnal munaa - Balligh maqaashidanaa", t: "Hingga akhirnya kami meraih cita-cita, Sampaikanlah maksud-maksud kami" },
    { a: "وَاقْضِ حَوَائِجَنَا ۞ وَالْحَمْدُ لِإِلَهِنَا", l: "Waqdhi hawaa-ijanaa - Walhamdu li-ilaahinaa", t: "Dan penuhilah hajat kebutuhan kami, Segala puji bagi Tuhan kami" },
    { a: "اَلَّذِيْ هَدَانَا ۞ صَلِّ وَسَلِّمْ عَلَى", l: "Alladzii hadaanaa - Shalli wasallim 'alaa", t: "Yang telah memberi hidayah kepada kami, Limpahkanlah shalawat dan salam atas" },
    { a: "طَهَ خَلِيْلِ الرَّحْمٰنِ ۞ وَآلِهِ وَصَحْبِهِ", l: "Thahaa khaliilir rahmaan - Wa aalihii washahbihii", t: "Nabi Thaha (Muhammad) kekasih Ar-Rahman, Beserta keluarga dan sahabatnya" },
    { a: "إِلَى آخِرِ الزَّمَانِ", l: "Ilaa aakhiriz zamaan", t: "Hingga akhir zaman" }
];

    function renderAsmaulHusna() {
        bukaHalaman('view-materi'); document.getElementById('materi-title').innerText = "Nadhom Asmaul Husna"; let html = '';
        // Menggunakan kelas centered-arab untuk Nadhom
        dataAsmaulHusnaLengkap.forEach(item => { html += `<div class='content-box centered-arab' style='text-align:center; padding: 20px 10px; border-bottom: 2px dashed #eee;'><div class='teks-arab' style='text-align:center !important; text-justify:auto; margin-bottom:10px; font-size: 28px !important; color: #1e399b;'>${item.a}</div><div class='teks-latin' style='text-align:center !important; font-weight:bold; color:var(--blue-card); font-size: 16px; margin-bottom: 5px;'>${item.l}</div><div class='teks-arti' style='text-align:center !important; border:none; padding:0; margin:0; font-size: 13px;'>${item.t}</div></div>`; });
        document.getElementById('materi-content').innerHTML = html;
        isCenteredContent = true; // Tandai sebagai konten centered
        terapkanPengaturan();
    }

    ambilJadwalShalat();

// ================= FUNGSI PENCARIAN DI SEMUA FEATURE =================
    function filterPencarianGlobal() {
        let input = document.getElementById('searchInput').value.toLowerCase();
        let materiContent = document.getElementById('materi-content');
        let boxes = materiContent.getElementsByClassName('content-box');
        
        for (let i = 0; i < boxes.length; i++) {
            let textContext = boxes[i].innerText.toLowerCase();
            if (textContext.includes(input)) {
                boxes[i].style.display = "";
            } else {
                boxes[i].style.display = "none";
            }
        }
    }

// ================= FUNGSI PENCARIAN AL-QUR'AN =================
    function filterPencarianSurah() {
        let input = document.getElementById('searchInputSurah').value.toLowerCase();
        let container = document.getElementById('daftar-surat');
        let items = container.getElementsByClassName('list-item');
        
        for (let i = 0; i < items.length; i++) {
            let textContext = items[i].innerText.toLowerCase();
            if (textContext.includes(input)) {
                items[i].style.display = "";
            } else {
                items[i].style.display = "none";
            }
        }
    }

    function filterPencarianAyat() {
        let input = document.getElementById('searchInputAyat').value.toLowerCase();
        let container = document.getElementById('quran-detail-content');
        let items = container.children;
        
        for (let i = 0; i < items.length; i++) {
            if(items[i].className === 'loader') continue; // abaikan ikon loading
            
            let textContext = items[i].innerText.toLowerCase();
            if (textContext.includes(input)) {
                items[i].style.display = "";
            } else {
                items[i].style.display = "none";
            }
        }
    }
// ================= DATA & FUNGSI KITAB HADITS =================
const daftarKitabHadits = [
    { id: 'bukhari', arab: 'صحيح البخاري', nama: 'Shahih Bukhari', tokoh: 'Imam Bukhari' },
    { id: 'muslim', arab: 'صحيح مسلم', nama: 'Shahih Muslim', tokoh: 'Imam Muslim' },
    { id: 'tirmidzi', arab: 'سنن الترمذي', nama: 'Sunan Tirmidzi', tokoh: 'Imam Tirmidzi' },
    { id: 'abudawud', arab: 'سنن أبي داود', nama: 'Sunan Abu Dawud', tokoh: 'Imam Abu Daud' },
    { id: 'nasai', arab: 'سنن النسائي', nama: 'Sunan Nasa\'i', tokoh: 'Imam Nasa\'i' },
    { id: 'ibnumajah', arab: 'سنن ابن ماجه', nama: 'Sunan Ibnu Majah', tokoh: 'Imam Ibnu Majah' },
    { id: 'darimi', arab: 'سنن الدارمي', nama: 'Sunan Darimi', tokoh: 'Imam Darimi' },
    { id: 'ahmad', arab: 'مسند أحمد', nama: 'Musnad Ahmad', tokoh: 'Imam Ahmad' },
    { id: 'malik', arab: 'موطأ مالك', nama: 'Muwatha\' Malik', tokoh: 'Imam Malik' },
    { id: 'daruquthni', arab: 'سنن الدارقطني', nama: 'Sunan Daruquthni', tokoh: 'Imam Daruquthni' },
    { id: 'ibnukhuzaimah', arab: 'صحيح ابن خزيمة', nama: 'Shahih Ibnu Khuzaimah', tokoh: 'Imam Ibnu Khuzaimah' }
];

function bukaHadits() {
    // Sembunyikan halaman lain
    let pages = document.getElementsByClassName('page-view');
    for(let i=0; i<pages.length; i++) {
        pages[i].style.display = 'none';
    }
    document.getElementById('view-hadits').style.display = 'block';

    // Render HTML dengan class persis seperti Surah
    let html = '';
    daftarKitabHadits.forEach((kitab, index) => {
        html += `
        <div class='list-item list-kitab' onclick='bukaDetailKitab("${kitab.id}", "${kitab.nama}")'>
            <div style='display:flex; align-items:center; flex: 1;'>
                <div class='nomor-arab'>${index + 1}</div>
                <div>
                    <div style='font-weight: bold; font-size: 16px; color: var(--text-dark); margin-bottom: 3px;'>${kitab.nama}</div>
                    <div style='font-size: 12px; color: var(--text-gray);'><i class='fa-solid fa-pen-nib'></i> ${kitab.tokoh}</div>
                </div>
            </div>
            <div class='teks-arab' style='margin-bottom:0; padding-top:0; font-size: 24px !important;'>${kitab.arab}</div>
        </div>`;
    });
    
    document.getElementById('hadits-content').innerHTML = html;
    window.scrollTo(0, 0);
}

function filterPencarianHadits() {
    let input = document.getElementById('searchInputHadits').value.toLowerCase();
    let container = document.getElementById('hadits-content');
    let items = container.getElementsByClassName('list-kitab');
    
    for (let i = 0; i < items.length; i++) {
        let textContext = items[i].innerText.toLowerCase();
        if (textContext.includes(input)) {
            items[i].style.display = "flex";
        } else {
            items[i].style.display = "none";
        }
    }
}

function bukaDetailKitab(idKitab, namaKitab) {
    alert("Insya Allah, isi dari Kitab " + namaKitab + " akan segera tersedia.");
}
