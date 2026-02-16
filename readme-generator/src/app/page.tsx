"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface TechItem {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface GenerateResponse {
  readme: string;
  techStack?: TechItem[];
  languages?: string[];
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  async function handleGenerate() {
    setError(null);
    setCopied(false);

    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setError("Por favor, introduce la URL de tu repositorio de GitHub.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "No se pudo generar el README.");
        setResult(null);
        return;
      }

      setResult({
        readme: data.readme,
        techStack: data.techStack,
        languages: data.languages,
      });
    } catch (err) {
      setError("Ha ocurrido un error al llamar a la API.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.readme) return;

    try {
      await navigator.clipboard.writeText(result.readme);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    } catch {
      setError("No se pudo copiar al portapapeles.");
    }
  }

  return (
    <main className="container py-5">
      {/* Header / Hero Section */}
      <section className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">OpenDocs AI</h1>
        <p className="lead mt-3">
          Genera documentación técnica de alto nivel usando IA y estilos
          profesionales.
        </p>
      </section>

      {/* Input Section */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <label htmlFor="repoUrl" className="form-label fw-bold">
                URL de tu repositorio en GitHub
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="repoUrl"
                  placeholder="https://github.com/milpagit/mi-proyecto"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  <span>{loading ? "Generando..." : "Generar README"}</span>
                </button>
              </div>
              <div className="form-text mt-3">
                Analizaremos tu código para crear secciones de tecnologías,
                instalación y más.
              </div>
              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Built With Section */}
      {result?.techStack && result.techStack.length > 0 && (
        <div className="row justify-content-center mb-4">
          <div className="col-md-10">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-3">Built With</h2>
                <div className="d-flex flex-wrap gap-2">
                  {result.techStack.map((tech) => {
                    const color = tech.color.replace("#", "");
                    const label = encodeURIComponent(tech.name);
                    const logo = encodeURIComponent(tech.slug);
                    const src = `https://img.shields.io/badge/-${label}-${color}?style=for-the-badge&logo=${logo}&logoColor=white`;

                    return (
                      <img
                        key={tech.id}
                        src={src}
                        alt={tech.name}
                        height={32}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {result?.readme && (
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-sm mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-bold">Vista previa del README</span>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleCopy}
                >
                  {copied ? "Copiado" : "Copiar Markdown"}
                </button>
              </div>
              <div className="card-body">
                <ReactMarkdown>{result.readme}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="pt-5 mt-5 border-top text-center text-muted small">
        Created by Milpagit
      </footer>

      {/* Toasts */}
      {showToast && (
        <div
          className="toast-container position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1080 }}
        >
          <div className="toast show align-items-center text-bg-success border-0 shadow-sm">
            <div className="d-flex">
              <div className="toast-body">README copiado al portapapeles.</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
