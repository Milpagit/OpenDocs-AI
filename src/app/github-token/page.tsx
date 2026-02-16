"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const GITHUB_TOKEN_STORAGE_KEY = "opendocs_github_token";

export default function GitHubTokenPage() {
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(GITHUB_TOKEN_STORAGE_KEY) ?? "";
    setToken(stored);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, token.trim());
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
    }
    setToken("");
    setSaved(false);
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 mb-3">GitHub Access Token</h1>
              <p className="text-muted small mb-4">
                This token is used to read private repositories when generating
                documentation. It is stored{" "}
                <strong>only in your browser</strong>
                (localStorage) and never sent to or stored on the server.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="githubToken" className="form-label fw-bold">
                    GitHub Personal Access Token
                  </label>
                  <input
                    id="githubToken"
                    type="password"
                    className="form-control"
                    placeholder="Paste your GitHub token here"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    autoComplete="off"
                  />
                  <div className="form-text">
                    Recommended scopes: read-only access to the repositories you
                    want to document.
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1 d-inline-flex justify-content-center align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving && (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    )}
                    <span>{saving ? "Saving..." : "Save token"}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                </div>

                {saved && (
                  <div
                    className="alert alert-success mt-3 mb-0 py-2 small"
                    role="alert"
                  >
                    Token saved locally. You can now use private repositories in
                    the generator.
                  </div>
                )}
              </form>

              <hr className="my-4" />

              <p className="small mb-1 fw-bold">How to get a GitHub token?</p>
              <ol className="small ps-3 mb-2">
                <li>Open GitHub and go to Settings → Developer settings.</li>
                <li>Open "Personal access tokens" and create a new token.</li>
                <li>Give it read access to the repositories you need.</li>
                <li>Copy the token and paste it in the field above.</li>
              </ol>

              <p className="small mb-0">
                <span className="text-muted">Note:</span> You can remove or
                rotate this token at any time from your GitHub account.
              </p>

              <div className="mt-4 text-center">
                <Link href="/" className="btn btn-outline-secondary btn-sm">
                  f Back to generator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
