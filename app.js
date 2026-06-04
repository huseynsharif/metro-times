"use strict";

/* ============================================================
   Bakı metrosu — Əhmədli ⇄ Həzi Aslanov məkik qatarı
   ------------------------------------------------------------
   Hər iki stansiyanın RƏSMİ "yola düşmə vaxtı" cədvəli
   (iş günləri / şənbə-bazar). Bütün hesablamalar BAKI VAXTINA
   görə aparılır (UTC+4, yay vaxtı yoxdur), cihazın saat
   qurşağından asılı deyil.
   ============================================================ */

// Bakı UTC+4-dədir və yay/qış vaxtı keçidi yoxdur (2016-dan).
const TZ_OFFSET_MS = 4 * 60 * 60 * 1000;

// Xidmət 5:55–~0:48 arası işləyir; 1:00–5:55 arası reys yoxdur.
// Saatı bundan kiçik olan vaxtlar (0:xx) gecə yarısından sonrakı,
// yəni növbəti təqvim gününə aid reyslərdir.
const NIGHT_THRESHOLD_H = 5;

/* --- Rəsmi cədvəllər: hər stansiyadan yola düşmə vaxtları -----
   Hər massiv həmin stansiyanın platformasındakı lövhədən
   götürülüb. Şənbə-bazar intervalı stabil 7 dəq, iş günləri
   isə saata görə dəyişir (5 ↔ 7 dəq).                           */

const SCHEDULE = {
  // Əhmədlidən yola düşmə
  ahmedli: {
    weekday: [
      "6:00","6:07","6:14","6:21","6:28","6:35","6:42","6:49","6:56",
      "7:02","7:07","7:12","7:17","7:22","7:27","7:32","7:37","7:42","7:47","7:52","7:57",
      "8:02","8:07","8:12","8:17","8:22","8:27","8:32","8:37","8:42","8:47","8:52","8:57",
      "9:02","9:07","9:12","9:17","9:22","9:27","9:33","9:40","9:47",
      "9:54","10:01","10:08","10:15","10:22","10:29","10:36","10:43","10:50","10:57",
      "11:04","11:11","11:18","11:25","11:32","11:39","11:46","11:53",
      "12:00","12:07","12:14","12:21","12:28","12:35","12:42","12:49","12:56",
      "13:03","13:10","13:17","13:24","13:31","13:38","13:45","13:52","13:59",
      "14:06","14:13","14:20","14:27","14:34","14:41","14:48","14:55",
      "15:02","15:09","15:16","15:23","15:30","15:37","15:44","15:51","15:58",
      "16:05","16:12","16:19","16:26","16:33","16:40","16:47","16:54",
      "17:00","17:05","17:10","17:15","17:20","17:25","17:30","17:35","17:40","17:45","17:50","17:55",
      "18:00","18:05","18:10","18:15","18:20","18:25","18:30","18:35","18:40","18:45","18:50","18:55",
      "19:01","19:08","19:15","19:22","19:29","19:36","19:43","19:50","19:57",
      "20:04","20:11","20:18","20:25","20:32","20:39","20:46","20:53",
      "21:00","21:07","21:14","21:21","21:28","21:35","21:42","21:49","21:56",
      "22:03","22:10","22:17","22:24","22:31","22:38","22:45","22:52","22:59",
      "23:06","23:13","23:20","23:27","23:34","23:41","23:48","23:55",
      "0:02","0:09","0:16","0:23","0:30","0:37","0:44","0:51"
    ],
    weekend: [
      "6:00","6:07","6:14","6:21","6:28","6:35","6:42","6:49","6:56",
      "7:03","7:10","7:17","7:24","7:31","7:38","7:45","7:52","7:59",
      "8:06","8:13","8:20","8:27","8:34","8:41","8:48","8:55",
      "9:02","9:09","9:16","9:23","9:30","9:37","9:44","9:51","9:58",
      "10:05","10:12","10:19","10:26","10:33","10:40","10:47","10:54",
      "11:01","11:08","11:15","11:22","11:29","11:36","11:43","11:50","11:57",
      "12:04","12:11","12:18","12:25","12:32","12:39","12:46","12:53",
      "13:00","13:07","13:14","13:21","13:28","13:35","13:42","13:49","13:56",
      "14:03","14:10","14:17","14:24","14:31","14:38","14:45","14:52","14:59",
      "15:06","15:13","15:20","15:27","15:34","15:41","15:48","15:55",
      "16:02","16:09","16:16","16:23","16:30","16:37","16:44","16:51","16:58",
      "17:05","17:12","17:19","17:26","17:33","17:40","17:47","17:54",
      "18:01","18:08","18:15","18:22","18:29","18:36","18:43","18:50","18:57",
      "19:04","19:11","19:18","19:25","19:32","19:39","19:46","19:53",
      "20:00","20:07","20:14","20:21","20:28","20:35","20:42","20:49","20:56",
      "21:03","21:10","21:17","21:24","21:31","21:38","21:45","21:52","21:59",
      "22:06","22:13","22:20","22:27","22:34","22:41","22:48","22:55",
      "23:02","23:09","23:16","23:23","23:30","23:37","23:44","23:51","23:58",
      "0:05","0:12","0:19","0:26","0:33","0:40","0:47","0:54"
    ]
  },

  // Həzi Aslanovdan yola düşmə
  hazi: {
    weekday: [
      "5:55","6:04","6:11","6:18","6:25","6:32","6:39","6:46","6:53",
      "7:00","7:05","7:10","7:15","7:20","7:25","7:30","7:35","7:40","7:45","7:50","7:55",
      "8:00","8:05","8:10","8:15","8:20","8:25","8:30","8:35","8:40","8:45","8:50","8:55",
      "9:00","9:05","9:10","9:15","9:20","9:25","9:30","9:37","9:44","9:51","9:58",
      "10:05","10:12","10:19","10:26","10:33","10:40","10:47","10:54",
      "11:01","11:08","11:15","11:22","11:29","11:36","11:43","11:50","11:57",
      "12:04","12:11","12:18","12:25","12:32","12:39","12:46","12:53",
      "13:00","13:07","13:14","13:21","13:28","13:35","13:42","13:49","13:56",
      "14:03","14:10","14:17","14:24","14:31","14:38","14:45","14:52","14:59",
      "15:06","15:13","15:20","15:27","15:34","15:41","15:48","15:55",
      "16:02","16:09","16:16","16:23","16:30","16:37","16:44","16:51","16:58",
      "17:03","17:08","17:13","17:18","17:23","17:28","17:33","17:38","17:43","17:48","17:53",
      "17:58","18:03","18:08","18:13","18:18","18:23","18:28","18:33","18:38","18:43","18:48","18:53","18:58",
      "19:05","19:12","19:19","19:26","19:33","19:40","19:47","19:54",
      "20:01","20:08","20:15","20:22","20:29","20:36","20:43","20:50","20:57",
      "21:04","21:11","21:18","21:25","21:32","21:39","21:46","21:53",
      "22:00","22:07","22:14","22:21","22:28","22:35","22:42","22:49","22:56",
      "23:03","23:10","23:17","23:24","23:31","23:38","23:45","23:52","23:59",
      "0:06","0:13","0:20","0:27","0:34","0:41","0:48"
    ],
    weekend: [
      "5:55","6:04","6:11","6:18","6:25","6:32","6:39","6:46","6:53",
      "7:00","7:07","7:14","7:21","7:28","7:35","7:42","7:49","7:56",
      "8:03","8:10","8:17","8:24","8:31","8:38","8:45","8:52","8:59",
      "9:06","9:13","9:20","9:27","9:34","9:41","9:48","9:55",
      "10:02","10:09","10:16","10:23","10:30","10:37","10:44","10:51","10:58",
      "11:05","11:12","11:19","11:26","11:33","11:40","11:47","11:54",
      "12:01","12:08","12:15","12:22","12:29","12:36","12:43","12:50","12:57",
      "13:04","13:11","13:18","13:25","13:32","13:39","13:46","13:53",
      "14:00","14:07","14:14","14:21","14:28","14:35","14:42","14:49","14:56",
      "15:03","15:10","15:17","15:24","15:31","15:38","15:45","15:52","15:59",
      "16:06","16:13","16:20","16:27","16:34","16:41","16:48","16:55",
      "17:02","17:09","17:16","17:23","17:30","17:37","17:44","17:51","17:58",
      "18:05","18:12","18:19","18:26","18:33","18:40","18:47","18:54",
      "19:01","19:08","19:15","19:22","19:29","19:36","19:43","19:50","19:57",
      "20:04","20:11","20:18","20:25","20:32","20:39","20:46","20:53",
      "21:00","21:07","21:14","21:21","21:28","21:35","21:42","21:49","21:56",
      "22:03","22:10","22:17","22:24","22:31","22:38","22:45","22:52","22:59",
      "23:06","23:13","23:20","23:27","23:34","23:41","23:48","23:55",
      "0:02","0:09","0:16","0:23","0:30","0:37","0:46"
    ]
  }
};

/* ------------------------------------------------------------ */

const pad = (n) => String(n).padStart(2, "0");

function parseHM(str) {
  const [h, m] = str.split(":").map(Number);
  return { h, m };
}

// "Bakı saatı" — real UTC üzərinə +4 saat. getUTC* metodları ilə
// oxunduqda Bakının divar saatını verir.
function bakuNow() {
  return new Date(Date.now() + TZ_OFFSET_MS);
}

// Verilmiş Bakı tarixinin gecə yarısının (00:00) timestamp-i.
function bakuMidnight(d) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

// Verilmiş stansiya cədvəli üçün dünən/bu gün/sabah pəncərəsindəki
// bütün yola düşmə anlarını qur. Element: { ts, weekend }.
function allDepartures(stationSchedule) {
  const now = bakuNow();
  const todayMid = bakuMidnight(now);
  const out = [];

  for (let off = -1; off <= 1; off++) {
    const base = new Date(todayMid + off * 86400000);
    const dow = base.getUTCDay(); // 0 = Bazar, 6 = Şənbə
    const weekend = dow === 0 || dow === 6;
    const list = weekend ? stationSchedule.weekend : stationSchedule.weekday;
    const baseMid = bakuMidnight(base);

    for (const s of list) {
      const { h, m } = parseHM(s);
      // 0:xx kimi vaxtlar gecə yarısından sonra → növbəti gün
      const dayAdd = h < NIGHT_THRESHOLD_H ? 1 : 0;
      const ts = baseMid + dayAdd * 86400000 + (h * 60 + m) * 60000;
      out.push({ ts, weekend });
    }
  }
  out.sort((a, b) => a.ts - b.ts);
  return out;
}

// İndidən sonrakı ilk `count` reysi qaytar.
function nextN(departures, nowMs, count) {
  return departures.filter((d) => d.ts > nowMs).slice(0, count);
}

// timestamp (Bakı çərçivəsi) → "HH:MM"
function clockHM(ts) {
  const d = new Date(ts);
  return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes());
}

// qalan ms → geri sayım mətni
function countdown(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

/* --- DOM ----------------------------------------------------- */

const el = {
  clock: document.getElementById("baku-clock"),
  dayType: document.getElementById("day-type"),
  cards: {
    ahmedli: {
      big: document.getElementById("ahmedli-big"),
      next: document.getElementById("ahmedli-next"),
      after: document.getElementById("ahmedli-after"),
      card: document.getElementById("card-ahmedli"),
    },
    hazi: {
      big: document.getElementById("hazi-big"),
      next: document.getElementById("hazi-next"),
      after: document.getElementById("hazi-after"),
      card: document.getElementById("card-hazi"),
    },
  },
};

function render() {
  const now = bakuNow();
  const nowMs = now.getTime();

  // Başlıq: Bakı saatı
  el.clock.textContent =
    pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());

  // Hər stansiya öz cədvəli ilə müstəqil hesablanır
  const ahmedli = nextN(allDepartures(SCHEDULE.ahmedli), nowMs, 2);
  const hazi = nextN(allDepartures(SCHEDULE.hazi), nowMs, 2);

  // Gün tipini ən yaxın reysin xidmət gününə görə göstər
  const ref = ahmedli[0] || hazi[0];
  if (ref) {
    el.dayType.textContent = ref.weekend ? "İstirahət günü" : "İş günü";
  }

  updateCard(el.cards.ahmedli, ahmedli, nowMs);
  updateCard(el.cards.hazi, hazi, nowMs);
}

function updateCard(card, list, nowMs) {
  if (list.length === 0) {
    card.big.textContent = "—";
    card.next.textContent = "Növbəti reys yoxdur";
    card.after.textContent = "";
    return;
  }

  const first = list[0];
  const remaining = first.ts - nowMs;
  card.big.textContent = countdown(remaining);
  card.next.textContent = clockHM(first.ts);

  // Uzun gecə fasiləsi (30 dəqiqədən çox) — solğunlaşdır
  card.card.classList.toggle("waiting", remaining > 30 * 60000);

  card.after.textContent = list[1] ? "Sonra: " + clockHM(list[1].ts) : "";
}

// Hər ¼ saniyə yenilə (geri sayım rəvan getsin)
render();
setInterval(render, 250);
