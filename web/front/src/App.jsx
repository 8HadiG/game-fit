import { useState } from 'react';
import AdvanceSearch from './components/AdvanceSearch'
import Card from './components/Card';

export default function App() {
  const initData = ["Browse Android Games"]
  const [data, setData] = useState(initData);

  return (
    <>
      <AdvanceSearch setData={setData} />
      <ul className="grid gap-4 p-4 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        {(data[0] === initData[0]) ? <p>{data[0]}</p> :
          (data.length === 0) ? "No Games Found" : data.map((item) => (
            <li key={item.id} className="w-full max-w-[260px] mx-auto">
              <Card {...item} />
            </li>
          ))}
      </ul>
    </>
  );
}
