"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_KEY_STORAGE_KEY = "opendocs_gemini_api_key";
const MODEL_STORAGE_KEY = "opendocs_gemini_model";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedKey = window.localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
    const storedModel = window.localStorage.getItem(MODEL_STORAGE_KEY) ?? "";

    setApiKey(storedKey);
    setModel(storedModel);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
        window.localStorage.setItem(MODEL_STORAGE_KEY, model.trim());
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 mb-3">Settings · Bring Your Own Key (BYOK)</h1>
              <p className="text-muted small mb-4">
                Your Gemini API key is stored{" "}
                <strong>only in your browser</strong> (localStorage). It is
                never sent to or stored on the server.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="geminiKey" className="form-label fw-bold">
                    Gemini API Key
                  </label>
                  <input
                    id="geminiKey"
                    type="password"
                    className="form-control"
                    placeholder="Paste your GEMINI_API_KEY here"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    autoComplete="off"
                  />
                  <div className="form-text">
                    You can create or manage your key in Google AI Studio.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="geminiModel" className="form-label fw-bold">
                    Gemini Model (optional)
                  </label>
                  <input
                    id="geminiModel"
                    type="text"
                    className="form-control"
                    placeholder="e.g. gemini-2.0-flash, gemini-2.0-pro"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                  <div className="form-text">
                    Leave blank to use the default model in the app.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 d-inline-flex justify-content-center align-items-center gap-2"
                  disabled={saving}
                >
                  {saving && (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  <span>{saving ? "Saving..." : "Save settings"}</span>
                </button>

                {saved && (
                  <div
                    className="alert alert-success mt-3 mb-0 py-2 small"
                    role="alert"
                  >
                    Settings saved locally. You can now generate READMEs using
                    your own key.
                  </div>
                )}
              </form>

              <hr className="my-4" />

              <p className="small mb-1 fw-bold">Need help finding your key?</p>
              <ol className="small ps-3 mb-2">
                <li>Open Google AI Studio in your browser.</li>
                <li>Go to the API keys section.</li>
                <li>Create a new key or copy an existing one.</li>
                <li>Paste it in the field above and click "Save settings".</li>
              </ol>

              <p className="small mb-0">
                <span className="text-muted">Tip:</span> You can always come
                back here to update or clear your key.
              </p>

              <div className="mt-4 text-center">
                <Link href="/" className="btn btn-outline-secondary btn-sm">
                  ← Back to generator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
