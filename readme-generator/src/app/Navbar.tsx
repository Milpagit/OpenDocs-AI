"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "opendocs_theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-bs-theme", theme);
}

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function handleToggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    }
    applyTheme(next);
  }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand fw-bold">
          OpenDocs AI
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2 gap-lg-0">
            <li className="nav-item">
              <Link href="/" className="nav-link">
                Generator
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/settings" className="nav-link">
                Settings
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/github-token" className="nav-link">
                Private Repository
              </Link>
            </li>
            <li className="nav-item">
              <a
                href="https://github.com/milpagit/OpenDocs-AI"
                className="nav-link"
                target="_blank"
                rel="noreferrer"
              >
                Repository
              </a>
            </li>
            <li className="nav-item ms-lg-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleToggleTheme}
              >
                {theme === "light" ? "Dark mode" : "Light mode"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
