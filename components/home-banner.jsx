"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export function HomeBanner({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || rotationPaused || prefersReducedMotion || isFocused || isHovered) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length, rotationPaused, prefersReducedMotion, isFocused, isHovered]);

  if (!slides.length) return null;
  const slide = slides[activeIndex];
  const showPrevious = () => {
    setRotationPaused(true);
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  };
  const showNext = () => {
    setRotationPaused(true);
    setActiveIndex((index) => (index + 1) % slides.length);
  };

  return (
    <section
      className="home-banner"
      aria-label="Featured collections"
      aria-roledescription="carousel"
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="home-banner-image" key={slide.image}>
        <Image src={slide.image} alt="" fill sizes="100vw" priority={activeIndex === 0} unoptimized />
      </div>
      <div className="home-banner-shade" />
      <button
        type="button"
        className="home-banner-arrow home-banner-previous"
        onClick={showPrevious}
        aria-label="Previous banner"
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <div
        className="home-banner-copy"
        key={slide.title}
        role="group"
        aria-roledescription="slide"
        aria-label={`${activeIndex + 1} of ${slides.length}: ${slide.title}`}
        aria-live={rotationPaused || prefersReducedMotion ? "polite" : "off"}
      >
        <span>{slide.eyebrow}</span>
        <h1>{slide.title}</h1>
        <p>{slide.subtitle}</p>
        <Link href={slide.href} className="home-banner-cta">
          {slide.cta} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <button
        type="button"
        className="home-banner-arrow home-banner-next"
        onClick={showNext}
        aria-label="Next banner"
      >
        <ChevronRight aria-hidden="true" />
      </button>
      {slides.length > 1 && (
        <div className="home-banner-controls" role="group" aria-label="Carousel controls">
          {!prefersReducedMotion && (
            <button
              type="button"
              className="home-banner-rotation"
              onClick={() => setRotationPaused((paused) => !paused)}
              aria-label="Pause automatic slide rotation"
              aria-pressed={rotationPaused}
            >
              {rotationPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            </button>
          )}
          <div className="home-banner-dots" role="group" aria-label="Choose a slide">
            {slides.map((item, index) => (
              <button
                type="button"
                key={item.title}
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => {
                  setRotationPaused(true);
                  setActiveIndex(index);
                }}
                aria-label={`Show slide ${index + 1}: ${item.title}`}
                aria-pressed={index === activeIndex}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
