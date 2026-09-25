let currentDateKey = "";
let currentDate = null;
let entries = {};

const surahNames = ["Al-Fatihah", "Al-Baqarah", "Ali Imran", "An-Nisa", "Al-Maidah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Yasin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hasyr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Tagabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddatstsir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Gasyiyah", "Al-Fajr", "Al-Balad", "Asy-Syams", "Al-Lail", "Ad-Duha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takasur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nasr", "Al-Lahab", "Al-Ikhlas", "Al-Falaq", "An-Nas"];
let autoSaveTimer = null;
let toastTimer = null;
let verseRequestTimer = null;
let verseRequestId = 0;

/** Membaca data diary dengan aman dari localStorage. */
function loadEntries() {
  try { return JSON.parse(localStorage.getItem("diary_entries") || "{}"); } catch (error) { return {}; }
}

/** Mengembalikan struktur entri kosong untuk tanggal baru. */
function loadEntry(dateKey) {
  return entries[dateKey] || { diary: "", tadabbur: { surah: "", ayat: "", teksAyat: "", refleksi: "" }, dailyRefleksi: { syukur: "", pelajaran: "", target: "" }, mood: "", energi: 5, wordCount: 0, lastUpdated: null };
}

/** Mengisi form dengan data entri yang tersimpan. */
function populateForm(entry) {
  document.getElementById("diaryText").value = entry.diary || "";
  const surahSelect = document.getElementById("surahSelect");
  const savedSurah = entry.tadabbur?.surah || "";
  const savedSurahOption = Array.from(surahSelect.options).find((option) => option.value === savedSurah || option.textContent === savedSurah);
  surahSelect.value = savedSurahOption?.value || "";
  document.getElementById("ayatNumber").value = entry.tadabbur?.ayat || "";
  document.getElementById("ayatArabic").value = entry.tadabbur?.teksArab || "";
  document.getElementById("ayatTranslation").value = entry.tadabbur?.terjemahan || entry.tadabbur?.teksAyat || "";
  document.getElementById("tadabburText").value = entry.tadabbur?.refleksi || "";
  document.getElementById("refleksiSyukur").value = entry.dailyRefleksi?.syukur || "";
  document.getElementById("refleksiPelajaran").value = entry.dailyRefleksi?.pelajaran || "";
  document.getElementById("refleksiTarget").value = entry.dailyRefleksi?.target || "";
  document.getElementById("energyLevel").value = entry.energi || 5;
  document.getElementById("energyValue").textContent = `${entry.energi || 5} / 10`;
  document.querySelectorAll(".mood-button").forEach((button) => button.classList.toggle("active", button.dataset.mood === entry.mood));
  updateWordCount();
}

/** Menghitung jumlah kata tulisan diary. */
function countWords(text) { return text.trim() ? text.trim().split(/\s+/).length : 0; }

/** Menampilkan jumlah kata terbaru pada form. */
function updateWordCount() { document.getElementById("wordCount").textContent = `${countWords(document.getElementById("diaryText").value)} kata`; }

/** Mengambil semua nilai form menjadi satu objek entri. */
function collectFormData() {
  return {
    diary: document.getElementById("diaryText").value,
    tadabbur: { surah: document.getElementById("surahSelect").selectedOptions[0]?.textContent || "", ayat: document.getElementById("ayatNumber").value, teksArab: document.getElementById("ayatArabic").value, terjemahan: document.getElementById("ayatTranslation").value, teksAyat: document.getElementById("ayatTranslation").value, refleksi: document.getElementById("tadabburText").value },
    dailyRefleksi: { syukur: document.getElementById("refleksiSyukur").value, pelajaran: document.getElementById("refleksiPelajaran").value, target: document.getElementById("refleksiTarget").value },
    mood: document.querySelector(".mood-button.active")?.dataset.mood || "",
    energi: Number(document.getElementById("energyLevel").value),
    wordCount: countWords(document.getElementById("diaryText").value),
    lastUpdated: new Date().toISOString()
  };
}

/** Menyimpan isi form ke localStorage dan memberi umpan balik. */
function saveEntry(silent = false) {
  const entry = collectFormData();
  entries[currentDateKey] = entry;
  try { localStorage.setItem("diary_entries", JSON.stringify(entries)); } catch (error) { showToast("Penyimpanan tidak tersedia"); return; }
  const savedAt = new Date(entry.lastUpdated).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const saveStatus = document.getElementById("saveStatus");
  saveStatus.textContent = `Tersimpan ✓ ${savedAt}`;
  saveStatus.classList.add("saved");
  if (!silent) showToast("Berhasil disimpan ✓");
}

/** Menjadwalkan penyimpanan otomatis setelah pengguna berhenti mengetik. */
function scheduleAutoSave() { clearTimeout(autoSaveTimer); autoSaveTimer = setTimeout(() => saveEntry(true), 3000); }

/** Mengganti tab aktif dan memperbarui atribut aksesibilitasnya. */
function activateTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => { const active = tab.dataset.tab === tabName; tab.classList.toggle("active", active); tab.setAttribute("aria-selected", String(active)); });
  document.querySelectorAll(".tab-content").forEach((content) => { content.hidden = content.id !== `tab-${tabName}`; content.classList.toggle("active", content.id === `tab-${tabName}`); });
}

/** Menampilkan notifikasi singkat setelah aksi simpan. */
function showToast(message) { const toast = document.getElementById("toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2000); }

/** Mengaktifkan atau menonaktifkan tema gelap. */
function toggleDarkMode() { const isDark = document.body.classList.toggle("dark"); try { localStorage.setItem("diary_theme", isDark ? "dark" : "light"); } catch (error) { /* storage unavailable */ } document.getElementById("themeToggle").textContent = isDark ? "☀️" : "🌙"; }

/** Menerapkan preferensi tema dari localStorage. */
function initDarkMode() { let theme = "light"; try { theme = localStorage.getItem("diary_theme") || "light"; } catch (error) { /* storage unavailable */ } document.body.classList.toggle("dark", theme === "dark"); document.getElementById("themeToggle").textContent = theme === "dark" ? "☀️" : "🌙"; }

/** Mengisi pilihan surah pada dropdown. */
function populateSurahOptions() { const select = document.getElementById("surahSelect"); surahNames.forEach((surah, index) => { const option = document.createElement("option"); option.value = String(index + 1); option.textContent = surah; select.append(option); }); select.insertAdjacentHTML("afterbegin", '<option value="">Pilih surah</option>'); }

/** Mengambil teks Arab dan terjemahan ayat dari AlQuran Cloud API. */
async function fetchAyah() {
  const surahSelect = document.getElementById("surahSelect");
  const ayatNumber = document.getElementById("ayatNumber");
  const apiStatus = document.getElementById("apiStatus");
  const surahNumber = Number(surahSelect.value);
  const ayat = Number(ayatNumber.value);
  const requestId = ++verseRequestId;
  if (!surahNumber || !ayat || ayat < 1) {
    apiStatus.textContent = "";
    return;
  }

  clearTimeout(verseRequestTimer);
  verseRequestTimer = setTimeout(async () => {
    apiStatus.className = "api-status";
    apiStatus.textContent = "Mengambil ayat...";
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayat}/editions/quran-uthmani,id.indonesian`);
      if (!response.ok) throw new Error("API request failed");
      const result = await response.json();
      if (requestId !== verseRequestId) return;
      if (result.code !== 200 || !Array.isArray(result.data) || result.data.length < 2) throw new Error("Ayat tidak ditemukan");
      const arabic = result.data[0]?.text;
      const translation = result.data[1]?.text;
      if (!arabic || !translation) throw new Error("Ayat tidak ditemukan");
      document.getElementById("ayatArabic").value = arabic;
      document.getElementById("ayatTranslation").value = translation;
      apiStatus.className = "api-status success";
      apiStatus.textContent = "Ayat berhasil dimuat.";
      scheduleAutoSave();
    } catch (error) {
      if (requestId !== verseRequestId) return;
      apiStatus.className = "api-status error";
      apiStatus.textContent = "Ayat belum bisa dimuat. Periksa surah, nomor ayat, atau koneksi internet.";
    }
  }, 350);
}

/** Menyiapkan seluruh interaksi halaman diary. */
function initDiary() {
  const params = new URLSearchParams(window.location.search);
  const date = params.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { window.location.href = "index.html"; return; }
  currentDateKey = date;
  currentDate = new Date(`${date}T00:00:00`);
  document.getElementById("dateTitle").textContent = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(currentDate);
  entries = loadEntries();
  populateSurahOptions();
  populateForm(loadEntry(currentDateKey));
  initDarkMode();
  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => activateTab(tab.dataset.tab)));
  document.querySelectorAll("textarea, select, input").forEach((input) => input.addEventListener("input", () => { updateWordCount(); scheduleAutoSave(); }));
  document.getElementById("surahSelect").addEventListener("change", fetchAyah);
  document.getElementById("ayatNumber").addEventListener("input", fetchAyah);
  document.querySelectorAll(".mood-button").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".mood-button").forEach((item) => item.classList.remove("active")); button.classList.add("active"); scheduleAutoSave(); }));
  document.getElementById("energyLevel").addEventListener("input", (event) => { document.getElementById("energyValue").textContent = `${event.target.value} / 10`; scheduleAutoSave(); });
  document.getElementById("saveBtn").addEventListener("click", () => saveEntry());
  document.getElementById("themeToggle").addEventListener("click", toggleDarkMode);
  document.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); saveEntry(); } if (event.key === "Escape") window.location.href = "index.html"; });
}

document.addEventListener("DOMContentLoaded", initDiary);
