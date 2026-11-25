import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/Layout";
import Search from "./components/Search";
import Info from "./components/Info/Info";
import Card from "./components/Card";
import Page from "./components/Page";

export default function App() {
  const initData = ["Explore Android Games"];
  const [data, setData] = useState(initData);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Search setData={setData} />
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 p-4">
                  {data[0] === initData[0] ? (
                    <p>{data[0]}</p>
                  ) : data.length === 0 ? (
                    "No Games Found"
                  ) : (
                    data.map((item) => (
                      <li key={item.id} className="mx-auto w-full max-w-65">
                        <Card {...item} />
                      </li>
                    ))
                  )}
                </ul>
              </>
            }
          />
          <Route path="/info" element={<Info />} />
          <Route path="/page" element={<Page />} />
        </Routes>
      </Layout>
    </div>
  );
}
