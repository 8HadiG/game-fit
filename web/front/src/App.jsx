import { useEffect, useState } from 'react';

export default function App() {
  const [data, setdata] = useState('');

  const params = new URLSearchParams({
    ageMin: 3,
    ageMax: 10
  });

  useEffect(() => {
    fetch('/api?${params}', { method: "GET" })
      .then(res => res.text())
      .then(setdata);
  }, []);

  return (
    <>
      <h1>Welcome</h1>
      <p>{data}</p>
    </>
  );
}
