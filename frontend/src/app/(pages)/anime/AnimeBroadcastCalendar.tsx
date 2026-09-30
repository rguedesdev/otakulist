"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FiCalendar, FiPlay } from "react-icons/fi";

import styles from "./anime.module.css";

type AnimeBroadcastDay = "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";

type AnimeBroadcastItem = {
  id: string;
  title: string;
  slug: string;
  image: string;
  day: AnimeBroadcastDay;
  time: string;
  detail: string;
};

const days: Array<{ key: AnimeBroadcastDay; short: string; label: string }> = [
  { key: "SUNDAY", short: "Dom", label: "Domingo" },
  { key: "MONDAY", short: "Seg", label: "Segunda-feira" },
  { key: "TUESDAY", short: "Ter", label: "Terça-feira" },
  { key: "WEDNESDAY", short: "Qua", label: "Quarta-feira" },
  { key: "THURSDAY", short: "Qui", label: "Quinta-feira" },
  { key: "FRIDAY", short: "Sex", label: "Sexta-feira" },
  { key: "SATURDAY", short: "Sáb", label: "Sábado" },
];

function currentDayInJapan(): AnimeBroadcastDay {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", weekday: "long" })
    .format(new Date())
    .toUpperCase() as AnimeBroadcastDay;
}

function AnimeBroadcastCalendar({ items }: { items: AnimeBroadcastItem[] }) {
  const [selectedDay, setSelectedDay] = useState<AnimeBroadcastDay>(currentDayInJapan);
  const selectedDayLabel = days.find((day) => day.key === selectedDay)?.label ?? selectedDay;
  const selectedItems = useMemo(
    () => items.filter((item) => item.day === selectedDay).sort((left, right) => left.time.localeCompare(right.time)),
    [items, selectedDay],
  );

  return (
    <section className={styles.schedulePanel} aria-labelledby="schedule-title">
      <div className={styles.panelHeading}>
        <div><span className={styles.sectionKicker}>Agenda semanal · JST</span><h2 id="schedule-title">Calendário de transmissão</h2></div>
        <FiCalendar aria-hidden="true" />
      </div>
      <div className={styles.scheduleDays}>
        {days.map((day) => {
          const count = items.filter((item) => item.day === day.key).length;
          return (
            <button
              aria-label={`${day.label}: ${count} ${count === 1 ? "título" : "títulos"}`}
              aria-pressed={selectedDay === day.key}
              className={selectedDay === day.key ? styles.scheduleActive : undefined}
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              type="button"
            >
              <strong>{day.short}</strong><span>{count} {count === 1 ? "título" : "títulos"}</span>
            </button>
          );
        })}
      </div>
      {selectedItems.map((item) => (
        <Link className={styles.todaySchedule} href={`/anime/${item.slug}`} key={item.id}>
          <span className={styles.time}>{item.time}</span>
          <Image src={item.image} alt="" width={46} height={62} unoptimized />
          <span><strong>{item.title}</strong><small>{item.detail}</small></span>
          <span className={styles.releaseState}><FiPlay aria-hidden="true" />JST</span>
        </Link>
      ))}
      {selectedItems.length === 0 && (
        <p className={styles.emptySchedule}>Nenhuma transmissão cadastrada para {selectedDayLabel}.</p>
      )}
    </section>
  );
}

export { AnimeBroadcastCalendar };
export type { AnimeBroadcastDay, AnimeBroadcastItem };
