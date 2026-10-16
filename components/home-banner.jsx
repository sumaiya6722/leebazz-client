"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

export function HomeBanner({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[activeIndex];
  const showPrevious = () =>
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  const showNext = () => setActiveIndex((index) => (index + 1) % slides.length);

  return (
    <section className="home-banner" aria-label="Featured collections">
      <div className="home-banner-image" key={slide.image}>
        <img src={slide.image} alt="" />
      </div>
      <div className="home-banner-shade" />
      <button
        className="home-banner-arrow home-banner-previous"
        onClick={showPrevious}
        aria-label="Previous banner"
      >
        <ChevronLeft />
      </button>
      <div className="home-banner-copy" key={slide.title}>
        <span>{slide.eyebrow}</span>
        <h1>{slide.title}</h1>
        <p>{slide.subtitle}</p>
        <Link href={slide.href} className="home-banner-cta">
          {slide.cta} <ArrowUpRight size={16} />
        </Link>
      </div>
      <button
        className="home-banner-arrow home-banner-next"
        onClick={showNext}
        aria-label="Next banner"
      >
        <ChevronRight />
      </button>
      <div
        className="home-banner-dots"
        aria-label={`Slide ${activeIndex + 1} of ${slides.length}`}
      >
        {slides.map((item, index) => (
          <button
            key={item.title}
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
