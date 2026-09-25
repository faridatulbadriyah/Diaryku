let currentDate = new Date();
let entries = {};

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/** Membaca seluruh entri diary dari localStorage. */
function loadEntries() {
  try {
    const savedEntries = localStorage.getItem("diary_entries");
    return savedEntries ? JSON.parse(savedEntries) : {};
  } catch (error) {
    return {};
  }
}

/** Mengubah Date menjadi kunci tanggal lokal YYYY-MM-DD. */
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Menggambar ulang kotak tanggal untuk bulan yang aktif. */
function renderCalendar() {
  const calendarGrid = document.getElementById("calendarGrid");
  calendarGrid.replaceChildren();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;
  const todayKey = formatDateKey(new Date());

  for (let index = 0; index < offset; index += 1) {
    const blank = document.createElement("span");
    blank.className = "calendar-day other-month";
    calendarGrid.append(blank);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = formatDateKey(date);
    const dayButton = document.createElement("button");
    dayButton.type = "button";
    dayButton.className = "calendar-day";
    dayButton.textContent = day;
    dayButton.setAttribute("aria-label", `Buka diary ${dateKey}`);
    if (entries[dateKey]) dayButton.classList.add("has-entry");
    if (dateKey === todayKey) dayButton.classList.add("today");
    dayButton.addEventListener("click", () => goToDiary(dateKey));
    calendarGrid.append(dayButton);
  }
  const trailingDays = (7 - (offset + daysInMonth) % 7) % 7;
  for (let index = 0; index < trailingDays; index += 1) {
    const blank = document.createElement("span");
    blank.className = "calendar-day other-month";
    calendarGrid.append(blank);
  }
  document.getElementById("monthYear").textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

/** Membuka halaman diary untuk tanggal tertentu. */
function goToDiary(dateKey) {
  window.location.href = `diary.html?date=${dateKey}`;
}

/** Bergeser ke bulan sebelumnya. */
function prevMonth() {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderCalendar();
  updateStats();
}

/** Bergeser ke bulan berikutnya. */
function nextMonth() {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderCalendar();
  updateStats();
}

/** Mengembalikan kalender ke bulan sekarang. */
function goToToday() {
  currentDate = new Date();
  renderCalendar();
  updateStats();
}

/** Memperbarui statistik entri, streak, dan kata bulan aktif. */
function updateStats() {
  const monthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const monthlyEntries = Object.entries(entries).filter(([dateKey]) => dateKey.startsWith(monthPrefix));
  const totalWords = monthlyEntries.reduce((sum, [, entry]) => sum + Number(entry.wordCount || 0), 0);
  let streak = 0;
  const cursor = new Date();
  const todayKey = formatDateKey(cursor);
  if (!entries[todayKey]) cursor.setDate(cursor.getDate() - 1);
  while (entries[formatDateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  document.getElementById("totalEntries").textContent = monthlyEntries.length;
  document.getElementById("currentStreak").textContent = streak;
  document.getElementById("totalWords").textContent = totalWords.toLocaleString("id-ID");
  document.getElementById("emptyState").hidden = monthlyEntries.length !== 0;
}

/** Mengaktifkan atau menonaktifkan tema gelap dan menyimpan pilihannya. */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark");
  try { localStorage.setItem("diary_theme", isDark ? "dark" : "light"); } catch (error) { /* storage unavailable */ }
  document.getElementById("themeToggle").textContent = isDark ? "☀️" : "🌙";
}

/** Menerapkan tema tersimpan saat halaman dimuat. */
function initDarkMode() {
  let theme = "light";
  try { theme = localStorage.getItem("diary_theme") || "light"; } catch (error) { /* storage unavailable */ }
  document.body.classList.toggle("dark", theme === "dark");
  document.getElementById("themeToggle").textContent = theme === "dark" ? "☀️" : "🌙";
}

document.addEventListener("DOMContentLoaded", () => {
  entries = loadEntries();
  initDarkMode();
  renderCalendar();
  updateStats();
  document.getElementById("prevMonth").addEventListener("click", prevMonth);
  document.getElementById("nextMonth").addEventListener("click", nextMonth);
  document.getElementById("todayButton").addEventListener("click", goToToday);
  document.getElementById("themeToggle").addEventListener("click", toggleDarkMode);
});
