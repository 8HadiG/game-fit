import { useEffect, useState } from 'react';
import Card from './components/Card';

export default function App() {
  const [data, setdata] = useState('');

  const params = new URLSearchParams({
    'max_installs <=': 1_000_000,
    'max_installs >=': 1_000,
    ageMin: 3,
    ageMax: 10
  }).toString();

  useEffect(() => {
    fetch(`/api?${params}`, { method: "GET" })
      .then(res => res.text())
      .then(setdata);
  }, []);

  const cardData = {
    title: "Wireless Headphones",
    subtitle: "Noise cancelling",
    image: "https://picsum.photos/400/200",
    description: "Premium sound with 30h battery life.",
    tag: "New",
    value: "$199",
    action: { label: "Buy now", onClick: () => alert("Added!") },
  };

  return (
    <>
      <h1>Welcome</h1>
      <Card data={cardData} />
      <p>{data}</p>
    </>
  );
}
