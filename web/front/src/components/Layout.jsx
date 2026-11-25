import { useState } from "react";
import { Link } from "react-router-dom";
import logoSvg from "../assets/logo.svg";
import logoPng from "../assets/logo.png";

export default function Layout({ children }) {
  const [imgSrc, setImgSrc] = useState(logoSvg);

  return (
    <div className="flex min-h-screen flex-col">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={imgSrc}
              alt="GameFit Logo"
              className="h-12 w-auto sm:h-14"
              onError={() => setImgSrc(logoPng)}
            />
            <span className="xs:block hidden text-xl font-bold">GameFit</span>
          </Link>

          {/* Navigation */}
          <nav className="flex gap-4 text-sm font-medium sm:gap-6 sm:text-base">
            <Link
              to="/"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </Link>
            <Link
              to="/info#about"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="mx-auto w-full max-w-7xl grow px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-auto w-full border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
          {/* Footer Logo */}
          <div className="flex items-center gap-3">
            <img
              src={imgSrc}
              alt="Logo"
              className="h-8 w-auto opacity-80"
              onError={() => setImgSrc(logoPng)}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              © 2026 Hadi. Licensed under MIT.
            </span>
          </div>

          {/* Footer Links */}
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link
              to="/info#contact"
              className="transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
