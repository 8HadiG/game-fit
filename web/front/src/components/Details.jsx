import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const numberFormat = new Intl.NumberFormat("en-US");

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? numberFormat.format(number) : value;
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatBoolean(value) {
  if (value === null || value === undefined) return null;
  return value ? "Yes" : "No";
}

function InfoTip({ text }) {
  return (
    <span className="group relative ml-1 inline-flex items-center justify-center">
      <span
        title={text}
        className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-gray-400 text-[10px] font-bold text-gray-500 dark:border-gray-500 dark:text-gray-400"
      >
        ?
      </span>
    </span>
  );
}

function Value({ value, children }) {
  const content = children ?? value;

  if (content === null || content === undefined || content === "") {
    return (
      <span className="text-gray-400 italic dark:text-gray-500">
        Not available
      </span>
    );
  }

  return content;
}

function Stat({ label, value, help }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
        {label}
        {help && <InfoTip text={help} />}
      </div>

      <div className="text-xl font-bold wrap-break-word text-gray-900 sm:text-2xl dark:text-white">
        <Value value={value} />
      </div>
    </div>
  );
}

function Detail({ label, value, help }) {
  return (
    <div className="flex flex-col justify-between gap-1 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:items-center dark:border-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {label}
        {help && <InfoTip text={help} />}
      </span>

      <span className="text-sm font-medium wrap-break-word text-gray-900 dark:text-gray-100">
        <Value value={value} />
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Description({ description }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative min-w-0">
      <div
        className={`prose prose-gray dark:prose-invert prose-headings:font-bold prose-img:rounded-xl prose-a:text-blue-600 dark:prose-a:text-blue-400 max-w-none wrap-break-word transition-[max-height] duration-500 ease-in-out ${
          expanded ? "max-h-none" : "max-h-24 overflow-hidden"
        }`}
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {!expanded && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent via-gray-50/70 to-gray-50 dark:via-gray-950/70 dark:to-gray-950"
        />
      )}

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="relative mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-400/10"
      >
        {expanded ? <>Show less</> : <>Read more</>}
      </button>
    </div>
  );
}

export default function Details() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("No game ID was provided.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchGame() {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(
          `/api/apps/details?id=${encodeURIComponent(id)}`,
        );

        if (!res.ok) {
          throw new Error(
            "Details for the requested game don't exist or are currently unavailable.",
          );
        }

        const json = await res.json();

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchGame();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading game information...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
          <div className="mb-4 text-4xl">🎮</div>
          <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Game details unavailable
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {error || "Unable to load game details."}
          </p>
        </div>
      </main>
    );
  }

  // Handle screenshots whether API returns an array or JSON string
  let screenshots = [];

  try {
    screenshots = Array.isArray(data.screenshots)
      ? data.screenshots
      : typeof data.screenshots === "string"
        ? JSON.parse(data.screenshots)
        : [];
  } catch {
    screenshots = [];
  }

  if (!Array.isArray(screenshots)) screenshots = [];

  const tags = Array.isArray(data.tags)
    ? data.tags
        .map((tag) => (typeof tag === "string" ? tag : tag?.name))
        .filter(Boolean)
    : [];

  const description = data.description_html;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      {/* HERO */}
      <div className="relative overflow-hidden">
        {data.header_image ? (
          <div className="absolute inset-0 h-72 overflow-hidden lg:h-96">
            <img
              src={data.header_image}
              alt=""
              className="h-full w-full object-cover opacity-30 dark:opacity-25"
            />
            <div className="absolute inset-0 bg-linear-to-b from-white/50 via-gray-50/70 to-gray-50 dark:from-gray-950/40 dark:via-gray-950/75 dark:to-gray-950" />
          </div>
        ) : (
          <div className="absolute inset-0 h-72 bg-linear-to-br from-purple-200 to-blue-200 dark:from-purple-950 dark:to-blue-950" />
        )}

        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-10 lg:px-6 lg:pt-20">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-end">
            {/* APP ICON */}
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-gray-200 shadow-xl lg:h-36 lg:w-36 dark:border-gray-800 dark:bg-gray-700">
              {data.icon ? (
                <img
                  src={data.icon}
                  alt={`${data.title || "Game"} icon`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  🎮
                </div>
              )}
            </div>

            {/* TITLE */}
            <div className="min-w-0 flex-1 text-center lg:text-left">
              <div className="mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                {data.genre?.name || "Android Game"}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight wrap-break-word text-gray-900 lg:text-5xl dark:text-white">
                <Value value={data.title} />
              </h1>

              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-gray-600 lg:text-base dark:text-gray-300">
                <Value value={data.summary} />
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {data.developer?.name && (
                  <span className="rounded-full bg-white/80 px-3 py-1 text-lg font-medium dark:bg-gray-800/80">
                    {data.developer.name}
                  </span>
                )}

                {data.free !== null && data.free !== undefined && (
                  <span
                    className={
                      data.free
                        ? "rounded-full bg-green-100 px-3 py-1 text-lg text-green-700 dark:bg-green-900/50 dark:text-green-300"
                        : "rounded-full bg-yellow-100 px-3 py-1 text-lg text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                    }
                  >
                    {data.free ? "Free to play" : "Paid game"}
                  </span>
                )}

                {data.offers_iap === 1 && (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-lg text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                    In App Purchases
                  </span>
                )}

                {data.ad_supported === 1 && (
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-lg text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    Contains ads
                  </span>
                )}
              </div>
            </div>

            {/* PLAY BUTTON */}
            <div className="shrink-0">
              {data.url ? (
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700"
                >
                  <span>▶</span>
                  View on Play Store
                </a>
              ) : (
                <span className="text-lg text-gray-400">
                  Store link unavailable
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="mx-auto max-w-6xl space-y-7 px-4 pb-16 sm:px-6">
        {/* STATISTICS */}
        <Section title="Game Statistics">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label="Downloads"
              value={formatNumber(data.max_installs)}
              help="Maximum estimated installation count reported by the data provider."
            />

            <Stat
              label="Rating"
              value={
                Number.isFinite(Number(data.score))
                  ? `${Math.trunc(data.score * 10 ** 2) / 10 ** 2} / 5`
                  : null
              }
              help="Average user rating out of five stars."
            />

            <Stat
              label="Ratings"
              value={formatNumber(data.ratings)}
              help="Total number of individual star ratings."
            />

            <Stat
              label="Reviews"
              value={formatNumber(data.reviews)}
              help="Number of written user reviews."
            />
          </div>
        </Section>

        {/* SCREENSHOTS */}
        <Section title="Screenshots">
          {screenshots.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
              {screenshots.map((src, index) => (
                <div key={`${src}-${index}`} className="shrink-0 snap-start">
                  <img
                    src={src}
                    alt={`Screenshot ${index + 1}`}
                    loading="lazy"
                    className="h-64 w-auto rounded-2xl border border-gray-200 bg-gray-100 object-contain sm:h-80 dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>
              ))}
            </div>
          ) : (
            <Value value={null} />
          )}
        </Section>

        {/* DESCRIPTION */}
        <Section title="About this game">
          {description ? (
            <Description description={description} />
          ) : (
            <Value value={null} />
          )}
        </Section>

        {/* GAME DETAILS */}
        <Section title="Game Details">
          <Detail
            label="Price"
            value={
              data.price != null
                ? Number(data.price) === 0
                  ? "Free"
                  : `$${data.price}`
                : null
            }
            help="Listed app price. Optional in-app purchases may cost extra."
          />

          <Detail
            label="Free"
            value={formatBoolean(data.free)}
            help="Whether the game is free to download."
          />

          <Detail
            label="Contains advertisements"
            value={formatBoolean(data.ad_supported)}
            help="Whether advertisements are supported in the game."
          />

          <Detail
            label="In-app purchases"
            value={formatBoolean(data.offers_iap)}
            help="Whether optional purchases can be made inside the game."
          />

          <Detail
            label="Android version"
            value={data.android_version}
            help="Minimum Android version required by the app, as reported by the provider."
          />

          <Detail label="Genre" value={data.genre?.name} />

          <Detail label="Release date" value={formatDate(data.released)} />

          <Detail label="Last updated" value={formatDate(data.updated)} />
        </Section>

        {/* DEVELOPER */}
        <Section title="Developer">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                <Value value={data.developer?.name} />
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Game developer / publisher
              </p>
            </div>

            {data.developer?.website ? (
              <a
                href={data.developer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold break-all text-blue-600 hover:underline dark:text-blue-400"
              >
                Visit developer website ↗
              </a>
            ) : (
              <Value value={null} />
            )}
          </div>
        </Section>

        {/* TAGS */}
        <Section title="Categories & Tags">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <Value value={null} />
          )}
        </Section>

        {/* FOOTER */}
        <footer className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          Game details provided by GameFit.
        </footer>
      </div>
    </main>
  );
}
