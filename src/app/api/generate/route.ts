import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface GenerateBody {
  repoUrl?: string;
}

interface SimpleIconTech {
  id: string; // Identificador interno, ej: "react"
  name: string; // Nombre legible, ej: "React"
  slug: string; // Slug de Simple Icons, ej: "react"
  color: string; // Color oficial de Simple Icons
}

interface SimpleIconTechConfig extends SimpleIconTech {
  aliases?: string[]; // Nombres alternativos o paquetes relacionados
}

interface DetectedStack {
  technologies: SimpleIconTech[];
  rawDependencies: string[];
  languages: string[];
}

const SIMPLE_ICONS_TECHS: SimpleIconTechConfig[] = [
  {
    id: "javascript",
    name: "JavaScript",
    slug: "javascript",
    color: "#F7DF1E",
    aliases: ["js"],
  },
  {
    id: "typescript",
    name: "TypeScript",
    slug: "typescript",
    color: "#3178C6",
    aliases: ["ts"],
  },
  {
    id: "nodejs",
    name: "Node.js",
    slug: "nodedotjs",
    color: "#339933",
    aliases: ["node", "node.js"],
  },
  {
    id: "react",
    name: "React",
    slug: "react",
    color: "#61DAFB",
    aliases: ["react-dom"],
  },
  {
    id: "nextjs",
    name: "Next.js",
    slug: "nextdotjs",
    color: "#000000",
    aliases: ["next", "next.js"],
  },
  {
    id: "express",
    name: "Express",
    slug: "express",
    color: "#000000",
  },
  {
    id: "bootstrap",
    name: "Bootstrap",
    slug: "bootstrap",
    color: "#7952B3",
  },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    slug: "tailwindcss",
    color: "#06B6D4",
  },
  {
    id: "python",
    name: "Python",
    slug: "python",
    color: "#3776AB",
  },
  {
    id: "django",
    name: "Django",
    slug: "django",
    color: "#092E20",
  },
  {
    id: "flask",
    name: "Flask",
    slug: "flask",
    color: "#000000",
  },
  {
    id: "fastapi",
    name: "FastAPI",
    slug: "fastapi",
    color: "#009688",
  },
  {
    id: "go",
    name: "Go",
    slug: "go",
    color: "#00ADD8",
    aliases: ["golang"],
  },
  {
    id: "java",
    name: "Java",
    slug: "java",
    color: "#007396",
  },
  {
    id: "spring",
    name: "Spring",
    slug: "spring",
    color: "#6DB33F",
    aliases: ["spring-boot", "spring boot"],
  },
  {
    id: "mysql",
    name: "MySQL",
    slug: "mysql",
    color: "#4479A1",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    slug: "postgresql",
    color: "#4169E1",
    aliases: ["postgres"],
  },
  {
    id: "mongodb",
    name: "MongoDB",
    slug: "mongodb",
    color: "#47A248",
  },
  {
    id: "redis",
    name: "Redis",
    slug: "redis",
    color: "#DC382D",
  },
];

function parseGitHubRepo(url: string): { owner: string; repo: string } | null {
  try {
    const match = url.match(
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/i,
    );
    if (!match) return null;
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");
    return { owner, repo };
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url, { next: { revalidate: 60 } }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.text();
}

function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "OpenDocs-AI-Readme-Generator",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function fetchGitHubFileContent(
  owner: string,
  repo: string,
  path: string,
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
    path,
  )}`;

  const res = await fetch(url, {
    headers: getGitHubHeaders(),
    next: { revalidate: 120 },
  }).catch(() => null);

  if (!res || !res.ok) return null;

  const data: any = await res.json().catch(() => null);
  if (!data || typeof data.content !== "string") return null;

  const encoding = data.encoding || "base64";
  if (encoding !== "base64") return null;

  try {
    const buffer = Buffer.from(data.content, "base64");
    return buffer.toString("utf8");
  } catch {
    return null;
  }
}

async function fetchGitHubLanguages(
  owner: string,
  repo: string,
): Promise<string[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/languages`;

  const res = await fetch(url, {
    headers: getGitHubHeaders(),
    next: { revalidate: 300 },
  }).catch(() => null);

  if (!res || !res.ok) return [];

  const data: any = await res.json().catch(() => null);
  if (!data || typeof data !== "object") return [];

  return Object.keys(data);
}

function normalizeName(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

function parseRequirementsTxt(content: string | null): string[] {
  if (!content) return [];

  const names: string[] = [];
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const namePart = line.split(/[<>=!~]/)[0] || "";
    const normalized = normalizeName(namePart);
    if (normalized) {
      names.push(normalized);
    }
  }

  return names;
}

function parseGoMod(content: string | null): string[] {
  if (!content) return [];

  const names: string[] = [];
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//")) continue;

    // Ejemplos de líneas relevantes:
    // require github.com/gin-gonic/gin v1.9.1
    // github.com/labstack/echo/v4 v4.11.1
    const parts = line.split(/\s+/);
    if (parts[0] === "require" && parts.length >= 2) {
      const name = normalizeName(parts[1]);
      if (name) names.push(name);
    } else if (!["module", "go", "replace"].includes(parts[0])) {
      const name = normalizeName(parts[0]);
      if (name) names.push(name);
    }
  }

  return names;
}

function detectTechnologiesFromNames(
  dependencyNames: string[],
  languages: string[],
): SimpleIconTech[] {
  const tokens = new Set<string>();

  for (const dep of dependencyNames) {
    const normalized = normalizeName(dep);
    if (normalized) tokens.add(normalized);
  }

  for (const lang of languages) {
    const normalized = normalizeName(lang);
    if (normalized) tokens.add(normalized);
  }

  const result: SimpleIconTech[] = [];

  for (const config of SIMPLE_ICONS_TECHS) {
    const allAliases = new Set<string>(
      [config.id, ...(config.aliases ?? [])].map((v) => v.toLowerCase()),
    );

    let matched = false;

    for (const token of tokens) {
      if (allAliases.has(token)) {
        matched = true;
        break;
      }

      for (const alias of allAliases) {
        if (token.includes(alias)) {
          matched = true;
          break;
        }
      }

      if (matched) break;
    }

    if (matched) {
      result.push({
        id: config.id,
        name: config.name,
        slug: config.slug,
        color: config.color,
      });
    }
  }

  return result;
}

async function detectProjectStack(
  owner: string,
  repo: string,
): Promise<DetectedStack> {
  const [packageJsonContent, requirementsContent, goModContent, languages] =
    await Promise.all([
      fetchGitHubFileContent(owner, repo, "package.json"),
      fetchGitHubFileContent(owner, repo, "requirements.txt"),
      fetchGitHubFileContent(owner, repo, "go.mod"),
      fetchGitHubLanguages(owner, repo),
    ]);

  const dependencyNames = new Set<string>();

  if (packageJsonContent) {
    try {
      const pkg = JSON.parse(packageJsonContent) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      const deps = Object.keys(pkg.dependencies ?? {});
      const devDeps = Object.keys(pkg.devDependencies ?? {});

      for (const name of [...deps, ...devDeps]) {
        const normalized = normalizeName(name);
        if (normalized) dependencyNames.add(normalized);
      }
    } catch {
      // Ignorar errores de parseo de package.json
    }
  }

  for (const name of parseRequirementsTxt(requirementsContent)) {
    dependencyNames.add(name);
  }

  for (const name of parseGoMod(goModContent)) {
    dependencyNames.add(name);
  }

  const dependenciesArray = Array.from(dependencyNames);
  const technologies = detectTechnologiesFromNames(
    dependenciesArray,
    languages,
  );

  return {
    technologies,
    rawDependencies: dependenciesArray,
    languages,
  };
}

async function basicGitHubScrape(owner: string, repo: string): Promise<string> {
  const readmeMainUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
  const readmeMasterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
  const pkgMainUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`;
  const pkgMasterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/package.json`;

  const [readmeMain, readmeMaster, pkgMain, pkgMaster] = await Promise.all([
    fetchText(readmeMainUrl),
    fetchText(readmeMasterUrl),
    fetchText(pkgMainUrl),
    fetchText(pkgMasterUrl),
  ]);

  const readme = readmeMain ?? readmeMaster ?? "";
  const pkg = pkgMain ?? pkgMaster ?? "";

  const parts: string[] = [];
  parts.push(`# Información básica del repositorio`);
  parts.push(`Owner: ${owner}`);
  parts.push(`Repo: ${repo}`);

  if (pkg) {
    parts.push("\n## package.json (contenido crudo)\n");
    // Limitar tamaño para no enviar archivos enormes a la IA
    parts.push(pkg.slice(0, 6000));
  }

  if (readme) {
    parts.push("\n## README existente (si hay)\n");
    parts.push(readme.slice(0, 8000));
  }

  return parts.join("\n\n");
}

function formatStackContext(stack: DetectedStack): string {
  if (!stack.technologies.length && !stack.languages.length) {
    return "";
  }

  const lines: string[] = [];

  if (stack.technologies.length) {
    lines.push(
      "## Tecnologías detectadas (a partir de dependencias y lenguajes)",
    );
    for (const tech of stack.technologies) {
      lines.push(`- ${tech.name}`);
    }
  }

  if (stack.languages.length) {
    lines.push("\n## Lenguajes detectados (GitHub Languages API)");
    for (const lang of stack.languages) {
      lines.push(`- ${lang}`);
    }
  }

  return lines.join("\n");
}

async function generateReadmeWithGemini(context: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en el entorno.");
  }

  const configuredModel = process.env.GEMINI_MODEL;
  const candidateModels = configuredModel
    ? [configuredModel]
    : [
        // Series 2.5 (ajusta los nombres exactos según tu consola de Gemini)
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        // Series 1.5 y pro clásicos
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-pro",
      ];

  const prompt = `Act as an expert Technical Writer.

You will receive a compact summary of a public GitHub repository, including:
- Basic repository metadata (owner, repo name).
- A subset of key files such as README.md, package.json, requirements.txt or go.mod.
- A detected technology stack (frameworks, languages, databases).

Using ONLY the information provided below under "Repository data", generate a complete, production-ready README.md in **English** with a clear, professional tone.

Strict requirements:
- Do not invent features, APIs, or technologies that are not clearly implied by the data.
- If something is not specified (e.g. license, deployment steps), add a short generic note instead of hallucinating details.
- Prefer concise, scannable sections over long paragraphs.

The README.md MUST include, in this order:
1. Project title and one-sentence tagline.
2. Short description / overview.
3. A **Tech Stack** section using a Markdown table. Use the detected technologies (frameworks, languages, databases, tooling) when possible. Example columns: Technology | Category | Notes.
4. **Features** section (bulleted list; only based on what's reasonably inferred from the data).
5. **Prerequisites** section (Node.js / Python / Go / databases, etc., only when implied by dependencies).
6. **Installation** section with copy-pastable commands (npm / yarn / pnpm / pip / go, etc., depending on the stack).
7. **Usage** section with basic examples (how to run dev server, build, run tests, or binary, depending on the data).
8. **Scripts** (or Commands) section if a package.json or similar exists, summarizing the most relevant scripts.
9. **Folder structure** (optional, only if it can be reasonably inferred from the provided data).
10. **Contributing** section (generic but professional guidelines are fine).
11. **License** section (if the license can be inferred from the data; otherwise, add a short note indicating that the license is not clearly specified).

Formatting rules:
- Use clean Markdown: headings (##, ###), bullet lists, and tables where appropriate.
- Use code blocks for command-line instructions and code examples.
- Avoid HTML unless strictly necessary.

Repository data (files, dependencies, technologies, and languages):
${context}`;
  const tried: string[] = [];

  for (const model of candidateModels) {
    const endpoint =
      "https://generativelanguage.googleapis.com/v1/models/" +
      encodeURIComponent(model) +
      ":generateContent?key=" +
      encodeURIComponent(apiKey);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    }).catch((err) => {
      // Network-level error, registrar y continuar probando siguientes modelos
      console.error("Error de red al llamar a Gemini", { model, err });
      return null;
    });

    tried.push(model);

    if (!res) {
      continue;
    }

    if (!res.ok) {
      // Si es un 404, probamos con el siguiente modelo candidato
      if (res.status === 404) {
        continue;
      }

      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Error al llamar a Gemini con el modelo '${model}': ${res.status} ${errorText}`,
      );
    }

    const data: any = await res.json();
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const text = parts
      .map((p: any) => p.text ?? "")
      .join("\n")
      .trim();

    if (!text) {
      throw new Error(
        `Gemini no devolvió contenido de texto usando el modelo '${model}'.`,
      );
    }

    // Si llegamos aquí, este modelo funcionó
    return text;
  }

  throw new Error(
    `No se pudo llamar a Gemini con ninguno de los modelos candidatos. Modelos probados: ${tried.join(", ")}. Revisa en Google AI Studio cuáles modelos soporta tu API key y configura GEMINI_MODEL en .env.local en consecuencia.`,
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as GenerateBody;
    const repoUrl = body.repoUrl?.trim();

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Falta el campo 'repoUrl' en el cuerpo de la petición." },
        { status: 400 },
      );
    }

    const parsed = parseGitHubRepo(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "La URL proporcionada no parece ser un repositorio público de GitHub válido.",
        },
        { status: 400 },
      );
    }

    const [context, stack] = await Promise.all([
      basicGitHubScrape(parsed.owner, parsed.repo),
      detectProjectStack(parsed.owner, parsed.repo),
    ]);

    const stackContext = formatStackContext(stack);
    const fullContext = stackContext
      ? `${context}\n\n${stackContext}`
      : context;

    const readme = await generateReadmeWithGemini(fullContext);

    return NextResponse.json({
      readme,
      techStack: stack.technologies,
      languages: stack.languages,
    });
  } catch (error: any) {
    console.error("Error en /api/generate", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ha ocurrido un error inesperado al generar el README.",
      },
      { status: 500 },
    );
  }
}
