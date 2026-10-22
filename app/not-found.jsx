
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-[#faf8f4] text-[#242321] flex flex-col items-center justify-center px-5 py-16 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#bd492e]">
        Oops, a little detour
      </p>

      <h1 className="font-serif text-[120px] leading-none sm:text-[170px]">
        404
      </h1>

      <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
        This page wandered off.
      </h2>

      <p className="mt-5 max-w-md text-sm leading-7 text-[#69645e] sm:text-base">
        The page you’re looking for may have moved, been deleted,
        or never existed. But there’s still something lovely to discover.
      </p>

      {/* Fashion-inspired illustration */}
      <div className="relative my-10 flex h-32 w-full max-w-md items-center justify-center">
        <svg
          viewBox="0 0 420 130"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="A spool of rust-colored thread connected to a clothing tag"
          role="img"
        >
          {/* Thread */}
          <path
            d="M65 88 C110 45, 125 115, 180 78
               C215 48, 225 110, 270 77
               C292 60, 306 74, 320 80"
            stroke="#bd492e"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Clothing tag */}
          <path
            d="M28 57 L77 43 L99 69 L79 96 L28 102 Z"
            fill="#eee4d5"
            stroke="#c7b69e"
            strokeWidth="1.2"
          />
          <circle cx="77" cy="69" r="3" stroke="#a9977d" />
          <text
            x="51"
            y="81"
            fill="#bd492e"
            fontSize="17"
            fontFamily="Georgia, serif"
            fontWeight="bold"
          >
            L.
          </text>

          {/* Spool */}
          <rect x="302" y="32" width="43" height="68" rx="5" fill="#9f3c25" />
          {Array.from({ length: 11 }, (_, i) => (
            <path
              key={i}
              d={`M303 ${39 + i * 5} Q323 ${32 + i * 5} 344 ${39 + i * 5}`}
              stroke="#d87852"
              strokeWidth="1.5"
            />
          ))}
          <ellipse cx="323.5" cy="33" rx="25" ry="8" fill="#e4d0b4" stroke="#a9977d" />
          <ellipse cx="323.5" cy="33" rx="9" ry="3" fill="#8a7155" />
          <ellipse cx="323.5" cy="100" rx="25" ry="8" fill="#d8c2a4" stroke="#a9977d" />
        </svg>
      </div>

      <div className="flex w-fit max-w-full flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="border border-[#bd492e] bg-[#bd492e] px-5 py-3 font-serif text-sm text-white transition-colors hover:bg-white"
        >
          Back to home
        </Link>

        <Link
          href="/shop"
          className="border border-[#33312d] px-5 py-3 font-serif text-sm transition-colors hover:bg-[#a33b24]"
        >
          Explore the collection
        </Link>
      </div>

      <p className="mt-7 text-sm text-[#69645e]">
        Looking for something specific?{" "}
        <Link
          href="/shop"
          className="text-[#bd492e] underline underline-offset-4 hover:text-[#8e321f]"
        >
          Browse our collection
        </Link>
      </p>
    </main>
  );
}
