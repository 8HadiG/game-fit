import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const INITIAL_FORM_DATA = {
  sortBy: "",
  "games.free =": "",
  "games.offers_iap =": "",
  "games.ad_supported =": "",
  "games.android_version <=": "",
  "games.max_installs <=": "",
  "games.max_installs >=": "",
  "games.score <=": "",
  "games.score >=": "",
  "games.price <=": "",
  "games.price >=": "",
  "games.ratings <=": "",
  "games.ratings >=": "",
  "games.reviews <=": "",
  "games.reviews >=": "",
  "games.updated <=": "",
  "games.updated >=": "",
  "games.released <=": "",
  "games.released >=": "",
  "genres.genre IN": "",
  oneOfTags: "",
  allOfTags: "",
};

const NUMBER_FIELDS = [
  { label: "Min Installs", name: "games.max_installs >=" },
  { label: "Max Installs", name: "games.max_installs <=" },
  { label: "Min Score", name: "games.score >=" },
  { label: "Max Score", name: "games.score <=" },
  { label: "Min Price", name: "games.price >=" },
  { label: "Max Price", name: "games.price <=" },
  { label: "Min Ratings", name: "games.ratings >=" },
  { label: "Max Ratings", name: "games.ratings <=" },
  { label: "Min Reviews", name: "games.reviews >=" },
  { label: "Max Reviews", name: "games.reviews <=" },
  {
    label: "Supported Android Version",
    name: "games.android_version <=",
  },
];

const DATE_FIELDS = [
  { label: "Latest update after", name: "games.updated >=" },
  { label: "Latest update before", name: "games.updated <=" },
  { label: "Released after", name: "games.released >=" },
  { label: "Released before", name: "games.released <=" },
];

const TEXT_FIELDS = [
  {
    label: "Genres (separate multiple values with commas)",
    name: "genres.genre IN",
  },
  {
    label: "Contains at least one of these tags (comma-separated)",
    name: "oneOfTags",
  },
  {
    label: "Contains all of these tags (comma-separated)",
    name: "allOfTags",
  },
];

const SORT_OPTIONS = [
  ["games.max_installs DESC", "Installs (High to Low)"],
  ["games.max_installs ASC", "Installs (Low to High)"],
  ["games.score DESC", "Score (High to Low)"],
  ["games.score ASC", "Score (Low to High)"],
  ["games.ratings DESC", "Ratings (High to Low)"],
  ["games.ratings ASC", "Ratings (Low to High)"],
  ["games.reviews DESC", "Reviews (High to Low)"],
  ["games.reviews ASC", "Reviews (Low to High)"],
  ["games.price DESC", "Price (High to Low)"],
  ["games.price ASC", "Price (Low to High)"],
  ["games.android_version DESC", "Android version (High to Low)"],
  ["games.android_version ASC", "Android version (Low to High)"],
  ["games.updated DESC", "Latest update (Newest first)"],
  ["games.updated ASC", "Latest update (Oldest first)"],
  ["games.released DESC", "Release date (Newest first)"],
  ["games.released ASC", "Release date (Oldest first)"],
];

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

function InputField({ label, name, value, onChange, type = "text" }) {
  const id = name;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
      />
    </div>
  );
}

function InputFieldAYN({ legend, name, value, onChange }) {
  const options = [
    ["", "All"],
    ["true", "Yes"],
    ["false", "No"],
  ];

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-medium text-gray-700">
        {legend}
      </legend>

      <div className="3xs:flex-row flex flex-col gap-x-5 gap-y-1">
        {options.map(([optionValue, label]) => (
          <label
            key={optionValue}
            className="flex cursor-pointer items-center gap-1 text-sm text-gray-700"
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={onChange}
              className="h-4 w-4 accent-blue-600"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Search({ setData }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  useEffect(() => {
    setFormData((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(INITIAL_FORM_DATA)) {
        if (searchParams.has(key)) next[key] = searchParams.get(key);
      }
      return next;
    });
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams).toString();
    if (!params) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api?${params}`, { method: "GET" });
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        if (!cancelled) setData(data);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleReset() {
    setFormData({ ...INITIAL_FORM_DATA });
    setSearchParams({}, { replace: true });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    );

    setSearchParams(
      Object.fromEntries(
        Object.entries(cleanedFormData).filter(([, v]) => v !== ""),
      ),
      { replace: true },
    );

    const params = new URLSearchParams(cleanedFormData).toString();

    try {
      const res = await fetch(`/api?${params}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-5xl space-y-6 rounded-2xl bg-gray-50 p-4 sm:p-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Game Filters</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customize your search using the filters below.
        </p>
      </div>

      <SumDet
        sum="Sorting"
        det={
          <>
            <label htmlFor="sortBy" className={labelClass}>
              Sort by
            </label>

            <select
              id="sortBy"
              name="sortBy"
              value={formData.sortBy}
              onChange={handleChange}
              className={inputClass}
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </>
        }
      />

      <SumDet
        sum="Game Properties"
        det={
          <div className="xs:grid-cols-2 grid gap-x-12 gap-y-6 md:grid-cols-3">
            <InputFieldAYN
              legend="Free to download"
              name="games.free ="
              value={formData["games.free ="]}
              onChange={handleChange}
            />

            <InputFieldAYN
              legend="Contains in-app purchases"
              name="games.offers_iap ="
              value={formData["games.offers_iap ="]}
              onChange={handleChange}
            />

            <InputFieldAYN
              legend="Contains ads"
              name="games.ad_supported ="
              value={formData["games.ad_supported ="]}
              onChange={handleChange}
            />
          </div>
        }
      />

      <SumDet
        sum="Numeric Filters"
        det={
          <div className="xs:grid-cols-4 grid grid-cols-2 gap-5 md:grid-cols-6">
            {NUMBER_FIELDS.map((field, index) => (
              <div
                key={field.name}
                className={
                  index === NUMBER_FIELDS.length - 1 ? "col-span-2" : ""
                }
              >
                <InputField
                  {...field}
                  type="number"
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        }
      />

      <SumDet
        sum="Date Filters"
        det={
          <div className="grid gap-5 sm:grid-cols-2">
            {DATE_FIELDS.map((field) => (
              <InputField
                key={field.name}
                {...field}
                type="date"
                value={formData[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
        }
      />

      <SumDet
        sum="Genres & Tags"
        det={
          <div className="space-y-5">
            {TEXT_FIELDS.map((field) => (
              <InputField
                key={field.name}
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
        }
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Reset filters
        </button>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Search games
        </button>
      </div>
    </form>
  );
}

function SumDet({ sum, det }) {
  return (
    <details className="cursor-pointer rounded-xl border border-gray-200 bg-white shadow-sm">
      <summary className="px-5 pt-1 pb-2 text-lg font-semibold text-gray-900">
        {sum}
      </summary>
      <div className="mx-5 mt-1 mb-4">{det}</div>
    </details>
  );
}
