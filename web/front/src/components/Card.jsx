import { useState } from "react";

export default function Card({
  app_id,
  header_image,
  icon,
  title,
  developer,
  free,
  price,
  offers_iap,
  ad_supported,
  max_installs,
  score,
}) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [iconLoaded, setIconLoaded] = useState(false);

  let installs = max_installs;
  if (max_installs >= 10_000_000_000) {
    installs = `${Math.trunc(max_installs / 10 ** 8) / 10 ** 1}B`;
  } else if (max_installs >= 1_000_000_000) {
    installs = `${Math.trunc(max_installs / 10 ** 7) / 10 ** 2}B`;
  } else if (max_installs >= 100_000_000) {
    installs = `${Math.trunc(max_installs / 10 ** 6)}M`;
  } else if (max_installs >= 10_000_000) {
    installs = `${Math.trunc(max_installs / 10 ** 5) / 10 ** 1}M`;
  } else if (max_installs >= 1_000_000) {
    installs = `${Math.trunc(max_installs / 10 ** 4) / 10 ** 2}M`;
  } else if (max_installs >= 100_000) {
    installs = `${Math.trunc(max_installs / 10 ** 3)}K`;
  } else if (max_installs >= 10_000) {
    installs = `${Math.trunc(max_installs / 10 ** 2) / 10 ** 1}K`;
  } else if (max_installs >= 1_000) {
    installs = `${Math.trunc(max_installs / 10 ** 1) / 10 ** 2}K`;
  }

  return (
    <a
      href={`/apps/details?id=${encodeURIComponent(app_id)}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <article className="relative aspect-3/4 w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow-lg dark:bg-gray-800">
        {!bgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700" />
        )}
        {header_image && (
          <img
            src={header_image}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setBgLoaded(true)}
            onError={() => setBgLoaded(false)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${bgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        )}

        <div className="absolute inset-0 bg-white/40 dark:bg-black/50" />

        <div className="relative z-10 flex h-full flex-col justify-end gap-1 p-3 text-gray-900 dark:text-gray-100">
          <div className="flex items-center gap-2">
            {!iconLoaded && (
              <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-400 dark:bg-gray-600" />
            )}
            {icon && (
              <div className="relative h-10 w-10 shrink-0">
                {!iconLoaded && (
                  <div className="absolute inset-0 animate-pulse rounded-xl bg-gray-400 dark:bg-gray-600" />
                )}
                <img
                  src={icon}
                  alt={title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onLoad={() => setIconLoaded(true)}
                  onError={() => setIconLoaded(false)}
                  className={`h-10 w-10 rounded-xl object-cover shadow transition-opacity duration-500 ${iconLoaded ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            )}
            <h3 className="line-clamp-2 text-sm font-bold sm:text-base">
              {title}
            </h3>
          </div>

          <p className="truncate text-xs opacity-80">{developer.name}</p>

          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-white">
              {free ? "Free" : `${price}$`}
            </span>
            {offers_iap == 1 && (
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-white">
                IAP
              </span>
            )}
            {ad_supported == 1 && (
              <span className="rounded bg-orange-600 px-1.5 py-0.5 text-white">
                Ads
              </span>
            )}
          </div>

          <div className="flex justify-between text-[11px] opacity-90">
            <span>⭐ {Math.trunc(score * 10 ** 2) / 10 ** 2}</span>
            <span>{installs} ⬇️</span>
          </div>
        </div>
      </article>
    </a>
  );
}
