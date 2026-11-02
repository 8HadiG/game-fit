import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="flex flex-row justify-between gap-4 p-4">
        <Link to="/contact">Contact</Link>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return <h1 className="text-blue-600">Home Page</h1>;
}

function About() {
  return <h1 className="text-blue-500">About Page</h1>;
}

function Contact() {
  return <h1 className="text-blue-400">Contact Page</h1>;
}
