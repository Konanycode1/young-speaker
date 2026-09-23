"use client";

import { useEffect, useState } from "react";

export type Testimonial = { id: string; quote: string; author: string; challengeTitle: string; challengeSlug: string };

export function ChallengeTestimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % items.length), 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;
  const current = items[index];

  return <section className="challenge-testimonials container">
    <span className="eyebrow">Ils l’ont vécu</span>
    <h2>Ce que la communauté en retient</h2>
    <div className="testimonial-rotator">
      <blockquote key={current.id}>
        <p>« {current.quote} »</p>
        <footer>— {current.author} <small>· {current.challengeTitle}</small></footer>
      </blockquote>
      {items.length > 1 && <div className="testimonial-dots">
        {items.map((item, itemIndex) => <button key={item.id} type="button" aria-label={`Témoignage ${itemIndex + 1}`} className={itemIndex === index ? "active" : ""} onClick={() => setIndex(itemIndex)} />)}
      </div>}
    </div>
  </section>;
}
