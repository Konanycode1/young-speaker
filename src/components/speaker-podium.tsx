"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./avatar";

type PodiumSpeaker = { name: string; username: string; initials: string; color: string; weeklyVotes: number };

const TRACK_HEIGHT = 240;
const MIN_BAR_HEIGHT = 56;

export function SpeakerPodium({ ranked }: { ranked: PodiumSpeaker[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const maxVotes = Math.max(...ranked.map((speaker) => speaker.weeklyVotes), 1);
  const columns = [1, 0, 2].map((index) => ({ speaker: ranked[index], rank: index }));

  return <div className="podium" ref={ref}>
    {columns.map(({ speaker, rank }) => speaker ? <div className="podium-col" key={speaker.username}>
      <Avatar initials={speaker.initials} color={speaker.color} size="md" />
      <b>{speaker.name}</b>
      <div className="podium-track" style={{ height: TRACK_HEIGHT }}>
        <div className={`podium-bar ${["first", "second", "third"][rank]}`} style={{ height: visible ? Math.max(MIN_BAR_HEIGHT, (speaker.weeklyVotes / maxVotes) * TRACK_HEIGHT) : 0 }}>
          <span>{speaker.weeklyVotes}</span>
        </div>
      </div>
    </div> : <div className="podium-col podium-empty" key={`empty-${rank}`} />)}
  </div>;
}
