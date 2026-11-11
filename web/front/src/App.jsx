import { useEffect, useState } from 'react';
import Card from './components/Card';

export default function App() {
  const [data, setdata] = useState([]);

  const params = new URLSearchParams({
    'sortBy': "games.price DESC",
    'games.max_installs <=': 1_000_000,
    'games.max_installs >=': 1_000,
    'oneOfTags': ['casual', 'ppp'],
    'allOfTags': ["action", "stylIzed"],
    "genres.genre IN": ["aCtion", " ", '', true, ' ', "", 'Strategy'],
    ageMin: 3,
    ageMax: 10
  }).toString();

  useEffect(() => {
    fetch(`/api?${params}`, { method: "GET" })
      .then(res => res.json())
      .then(setdata);
  }, []);

  return (
    <>
      <ul className="grid gap-4 p-4 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        {data.map((item) => (
          <li key={item.id} className="w-full max-w-[260px] mx-auto">
            <Card {...item} />
          </li>
        ))}
      </ul>
    </>
  );
}
