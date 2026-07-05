"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Calendar.module.css";

// Hari Libur Nasional & Cuti Bersama Indonesia 2026
// Sumber: Keputusan Pemerintah RI (perkiraan berdasarkan pola kalender)
const HOLIDAYS = {
  "2026-01-01": { name: "Tahun Baru Masehi", type: "nasional" },
  "2026-01-29": { name: "Tahun Baru Imlek 2577", type: "nasional" },
  "2026-02-17": { name: "Isra Mi'raj Nabi Muhammad SAW", type: "nasional" },
  "2026-03-22": { name: "Hari Raya Nyepi (Tahun Baru Saka 1948)", type: "nasional" },
  "2026-03-20": { name: "Nuzulul Quran", type: "nasional" },
  "2026-04-03": { name: "Wafat Isa Almasih", type: "nasional" },
  "2026-04-12": { name: "Hari Raya Idul Fitri 1447 H", type: "nasional" },
  "2026-04-13": { name: "Hari Raya Idul Fitri 1447 H (Hari ke-2)", type: "nasional" },
  "2026-04-10": { name: "Cuti Bersama Idul Fitri", type: "cuti" },
  "2026-04-14": { name: "Cuti Bersama Idul Fitri", type: "cuti" },
  "2026-04-15": { name: "Cuti Bersama Idul Fitri", type: "cuti" },
  "2026-05-01": { name: "Hari Buruh Internasional", type: "nasional" },
  "2026-05-14": { name: "Kenaikan Isa Almasih", type: "nasional" },
  "2026-05-16": { name: "Hari Raya Waisak 2570", type: "nasional" },
  "2026-06-01": { name: "Hari Lahir Pancasila", type: "nasional" },
  "2026-06-19": { name: "Hari Raya Idul Adha 1447 H", type: "nasional" },
  "2026-07-10": { name: "Tahun Baru Islam 1448 H", type: "nasional" },
  "2026-08-17": { name: "Hari Kemerdekaan RI ke-81", type: "nasional" },
  "2026-09-18": { name: "Maulid Nabi Muhammad SAW", type: "nasional" },
  "2026-10-25": { name: "Hari Natal (Paskah)", type: "nasional" },
  "2026-12-25": { name: "Hari Natal", type: "nasional" },
  "2026-12-24": { name: "Cuti Bersama Natal", type: "cuti" },
  "2026-12-31": { name: "Cuti Bersama Tahun Baru", type: "cuti" },
  // 2025
  "2025-01-01": { name: "Tahun Baru Masehi", type: "nasional" },
  "2025-01-27": { name: "Isra Mi'raj Nabi Muhammad SAW", type: "nasional" },
  "2025-01-29": { name: "Tahun Baru Imlek 2576", type: "nasional" },
  "2025-03-14": { name: "Hari Raya Nyepi (Tahun Baru Saka 1947)", type: "nasional" },
  "2025-03-29": { name: "Hari Raya Idul Fitri 1446 H", type: "nasional" },
  "2025-03-30": { name: "Hari Raya Idul Fitri 1446 H (Hari ke-2)", type: "nasional" },
  "2025-03-31": { name: "Cuti Bersama Idul Fitri", type: "cuti" },
  "2025-04-01": { name: "Cuti Bersama Idul Fitri", type: "cuti" },
  "2025-04-18": { name: "Wafat Isa Almasih", type: "nasional" },
  "2025-05-01": { name: "Hari Buruh Internasional", type: "nasional" },
  "2025-05-12": { name: "Hari Raya Waisak 2569", type: "nasional" },
  "2025-05-29": { name: "Kenaikan Isa Almasih", type: "nasional" },
  "2025-06-01": { name: "Hari Lahir Pancasila", type: "nasional" },
  "2025-06-06": { name: "Hari Raya Idul Adha 1446 H", type: "nasional" },
  "2025-06-27": { name: "Tahun Baru Islam 1447 H", type: "nasional" },
  "2025-08-17": { name: "Hari Kemerdekaan RI ke-80", type: "nasional" },
  "2025-09-05": { name: "Maulid Nabi Muhammad SAW", type: "nasional" },
  "2025-12-25": { name: "Hari Natal", type: "nasional" },
  "2025-12-26": { name: "Cuti Bersama Natal", type: "cuti" },
  // 2027
  "2027-01-01": { name: "Tahun Baru Masehi", type: "nasional" },
  "2027-02-17": { name: "Tahun Baru Imlek 2578", type: "nasional" },
  "2027-03-11": { name: "Hari Raya Nyepi (Tahun Baru Saka 1949)", type: "nasional" },
  "2027-04-01": { name: "Hari Raya Idul Fitri 1448 H", type: "nasional" },
  "2027-04-02": { name: "Hari Raya Idul Fitri 1448 H (Hari ke-2)", type: "nasional" },
  "2027-03-26": { name: "Wafat Isa Almasih", type: "nasional" },
  "2027-05-01": { name: "Hari Buruh Internasional", type: "nasional" },
  "2027-05-06": { name: "Kenaikan Isa Almasih", type: "nasional" },
  "2027-05-05": { name: "Hari Raya Waisak 2571", type: "nasional" },
  "2027-06-01": { name: "Hari Lahir Pancasila", type: "nasional" },
  "2027-06-09": { name: "Hari Raya Idul Adha 1448 H", type: "nasional" },
  "2027-06-29": { name: "Tahun Baru Islam 1449 H", type: "nasional" },
  "2027-08-17": { name: "Hari Kemerdekaan RI ke-82", type: "nasional" },
  "2027-09-08": { name: "Maulid Nabi Muhammad SAW", type: "nasional" },
  "2027-12-25": { name: "Hari Natal", type: "nasional" },
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarWidget() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(null);
  };

  // Collect holidays for current month to display in list below
  const monthHolidays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = formatDateKey(currentYear, currentMonth, d);
    if (HOLIDAYS[key]) {
      monthHolidays.push({ day: d, ...HOLIDAYS[key] });
    }
  }

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  // Build calendar grid cells
  const cells = [];
  // Empty cells before the first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className={styles.dayCell}></div>);
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatDateKey(currentYear, currentMonth, d);
    const holiday = HOLIDAYS[dateKey];
    const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();
    const isSunday = dayOfWeek === 0;
    const isTodayDate = isToday(d);
    const isSelected = selectedDate === d;

    let cellClass = styles.dayCell;
    if (holiday?.type === "nasional") cellClass += ` ${styles.holiday}`;
    else if (holiday?.type === "cuti") cellClass += ` ${styles.cutiDay}`;
    else if (isSunday) cellClass += ` ${styles.sunday}`;
    if (isTodayDate) cellClass += ` ${styles.today}`;
    if (isSelected) cellClass += ` ${styles.selected}`;

    cells.push(
      <div
        key={d}
        className={cellClass}
        onClick={() => setSelectedDate(d === selectedDate ? null : d)}
        title={holiday ? holiday.name : ""}
      >
        <span className={styles.dayNumber}>{d}</span>
        {holiday && <span className={styles.holidayDot}></span>}
      </div>
    );
  }

  const selectedDateKey = selectedDate ? formatDateKey(currentYear, currentMonth, selectedDate) : null;
  const selectedHoliday = selectedDateKey ? HOLIDAYS[selectedDateKey] : null;

  return (
    <div className={styles.calendarCard}>
      {/* Calendar Header */}
      <div className={styles.calendarHeader}>
        <div className={styles.calendarHeaderLeft}>
          <h3 className={styles.calendarTitle}>
            📅 Kalender {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
        </div>
        <div className={styles.calendarNav}>
          <button onClick={goToToday} className={styles.todayBtn}>Hari Ini</button>
          <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft size={18} /></button>
          <button onClick={nextMonth} className={styles.navBtn}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Day Names */}
      <div className={styles.dayNames}>
        {DAY_NAMES.map(day => (
          <div key={day} className={`${styles.dayName} ${day === "Min" ? styles.sundayLabel : ""}`}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={styles.calendarGrid}>
        {cells}
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className={styles.selectedInfo}>
          <span className={styles.selectedDate}>
            {selectedDate} {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          {selectedHoliday ? (
            <span className={`${styles.selectedLabel} ${selectedHoliday.type === "nasional" ? styles.labelMerah : styles.labelCuti}`}>
              {selectedHoliday.name}
            </span>
          ) : (
            <span className={styles.selectedLabel}>Hari Biasa</span>
          )}
        </div>
      )}

      {/* Monthly Holiday List */}
      {monthHolidays.length > 0 && (
        <div className={styles.holidayList}>
          <h4 className={styles.holidayListTitle}>Hari Libur & Cuti Bulan Ini</h4>
          <ul className={styles.holidayItems}>
            {monthHolidays.map((h, i) => (
              <li key={i} className={styles.holidayItem}>
                <span className={`${styles.holidayBadge} ${h.type === "nasional" ? styles.badgeMerah : styles.badgeCuti}`}>
                  {h.day}
                </span>
                <span className={styles.holidayName}>{h.name}</span>
                <span className={`${styles.holidayType} ${h.type === "nasional" ? styles.typeMerah : styles.typeCuti}`}>
                  {h.type === "nasional" ? "Libur Nasional" : "Cuti Bersama"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
