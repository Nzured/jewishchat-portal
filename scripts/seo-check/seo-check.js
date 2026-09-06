#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = parseArgs(process.argv.slice(2));
const BASE_URL = (args["base-url"] || "").replace(/\/$/, "");
const MODE = args["mode"] || "pr"; // 'pr' | 'production'
const GROUP_SERVICE_API = args["api-base-url"] || "https://api.chatlist.link/group-service";

if (!BASE_URL) {
  console.error("Missing required --base-url");
  process.exit(0); // still exit 0 - warn-only, don't break the pipeline over a config mistake
}

const STATIC_SAMPLES = [
  { path: "/", type: "homepage", expectIndexable: true },
  { path: "/categories", type: "category-index", expectIndexable: true },
  { path: "/search?q=test", type: "search", expectIndexable: false },
  { path: "/login", type: "login-external", expectIndexable: false },
  { path: "/add-group", type: "add-group", expectIndexable: false },
];

async function fetchHtml(url) {
  const res = await fetch(url, {
    redirect: "manual",
    headers: { "User-Agent": "ChatList-SEO-Check/1.0 (+https://chatlist.link)" },
  });
  const status = res.status;
  const location = res.headers.get("location");
  const html = status >= 200 && status < 300 ? await res.text() : "";
  return { status, location, html };
}

function extractTag(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : null;
}

function checkCanonical(html) {
  const href = extractTag(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const issues = [];
  if (!href) {
    issues.push('No <link rel="canonical"> found');
  } else {
    if (href.includes("?")) issues.push(`Canonical contains a query string: ${href}`);
    if (href.endsWith("/") && href !== BASE_URL + "/")
      issues.push(`Canonical has a trailing slash: ${href}`);
    if (!href.startsWith("https://")) issues.push(`Canonical is not https: ${href}`);
  }
  return { href, issues };
}

function checkTitleAndDescription(html) {
  const title = extractTag(html, /<title>([^<]*)<\/title>/i);
  const description = extractTag(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  );
  const issues = [];
  if (!title || !title.trim()) issues.push("Missing or empty <title>");
  else if (title.length > 60) issues.push(`Title exceeds 60 chars (${title.length}): "${title}"`);
  if (!description || !description.trim()) issues.push("Missing or empty meta description");
  else if (description.length > 155)
    issues.push(`Meta description exceeds 155 chars (${description.length})`);
  return { title, description, issues };
}

function checkSingleH1(html) {
  const matches = html.match(/<h1[\s>]/gi) || [];
  const issues = [];
  if (matches.length === 0) issues.push("No <h1> found");
  if (matches.length > 1)
    issues.push(`Found ${matches.length} <h1> tags - spec requires exactly one`);
  return { count: matches.length, issues };
}

function checkJsonLd(html) {
  const blocks = [
    ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];
  const issues = [];
  const parsedTypes = [];

  if (blocks.length === 0) {
    issues.push('No JSON-LD (<script type="application/ld+json">) found');
    return { count: 0, types: [], issues };
  }

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1]);
      const graph = parsed["@graph"] || [parsed];
      for (const node of graph) {
        if (node["@type"]) parsedTypes.push(node["@type"]);
      }
    } catch (e) {
      issues.push(`JSON-LD block failed to parse: ${e.message}`);
    }
  }
  return { count: blocks.length, types: parsedTypes, issues };
}

function checkNoindex(html, expectIndexable) {
  const robotsContent = extractTag(
    html,
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i,
  );
  const isNoindex = robotsContent ? robotsContent.toLowerCase().includes("noindex") : false;
  const issues = [];

  if (expectIndexable && isNoindex) {
    issues.push("Page is unexpectedly noindexed - should be indexable");
  }
  if (!expectIndexable && !isNoindex) {
    issues.push("Page should be noindexed (per FR-SEO-CAN-03) but no noindex directive found");
  }
  return { robotsContent, isNoindex, issues };
}

async function checkPage(sample) {
  const url = BASE_URL + sample.path;
  const result = { path: sample.path, type: sample.type, url, issues: [] };

  try {
    const { status, html } = await fetchHtml(url);
    result.status = status;

    if (status >= 400) {
      result.issues.push(`Unexpected HTTP ${status} for a page expected to be reachable`);
      return result;
    }

    const canonical = checkCanonical(html);
    const meta = checkTitleAndDescription(html);
    const h1 = checkSingleH1(html);
    const jsonLd = checkJsonLd(html);
    const noindex = checkNoindex(html, sample.expectIndexable);

    result.canonical = canonical.href;
    result.title = meta.title;
    result.h1Count = h1.count;
    result.jsonLdTypes = jsonLd.types;
    result.isNoindex = noindex.isNoindex;

    if (sample.expectIndexable) {
      result.issues.push(...canonical.issues, ...meta.issues, ...h1.issues, ...jsonLd.issues);
    }
    result.issues.push(...noindex.issues);
  } catch (e) {
    result.issues.push(`Fetch failed: ${e.message}`);
  }

  return result;
}

async function checkThinPageSample() {
  try {
    const res = await fetch(`${GROUP_SERVICE_API}/api/v1/groups/categories`);
    if (!res.ok) return { skipped: true, reason: `Could not fetch category list (${res.status})` };
    const body = await res.json();
    const categories = body.data || [];

    for (const cat of categories.slice(0, 15)) {
      // check a bounded sample, not every category
      const idxRes = await fetch(
        `${GROUP_SERVICE_API}/api/v1/seo/categories/${cat.slug}/indexable`,
      );
      if (!idxRes.ok) continue;
      const idxBody = await idxRes.json();
      if (idxBody.data && idxBody.data.indexable === false) {
        return await checkPage({
          path: `/${cat.slug}`,
          type: "thin-category (live)",
          expectIndexable: false,
        });
      }
    }
    return { skipped: true, reason: "No currently-thin category found to sample" };
  } catch (e) {
    return { skipped: true, reason: `Thin-page check errored: ${e.message}` };
  }
}

async function run() {
  const results = [];
  for (const sample of STATIC_SAMPLES) {
    results.push(await checkPage(sample));
  }

  const thinPageResult = await checkThinPageSample();
  if (!thinPageResult.skipped) {
    results.push(thinPageResult);
  }

  const totalIssues = results.reduce((sum, r) => sum + (r.issues ? r.issues.length : 0), 0);

  const report = buildReport(results, thinPageResult, totalIssues);
  console.log(report);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
  }

  const outPath = path.join(process.cwd(), "seo-check-report.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify({ baseUrl: BASE_URL, mode: MODE, totalIssues, results }, null, 2),
  );

  const mdPath = path.join(process.cwd(), "seo-check-report.md");
  fs.writeFileSync(mdPath, report);

  console.log(`\nFull JSON report written to ${outPath}`);
  console.log(`Markdown report written to ${mdPath}`);

  process.exit(0);
}

function buildReport(results, thinPageResult, totalIssues) {
  const lines = [];
  lines.push(`## SEO Check Report - ${MODE === "pr" ? "PR Preview" : "Production"}\n`);
  lines.push(`**Base URL:** ${BASE_URL}`);
  lines.push(`**Total issues found:** ${totalIssues}${totalIssues === 0 ? " ✅" : " ⚠️"}\n`);

  for (const r of results) {
    const statusIcon = !r.issues || r.issues.length === 0 ? "✅" : "⚠️";
    lines.push(`### ${statusIcon} ${r.type} - \`${r.path}\``);
    if (r.status) lines.push(`- HTTP status: ${r.status}`);
    if (r.title) lines.push(`- Title: "${r.title}"`);
    if (r.canonical) lines.push(`- Canonical: ${r.canonical}`);
    if (r.jsonLdTypes && r.jsonLdTypes.length)
      lines.push(`- JSON-LD types: ${r.jsonLdTypes.join(", ")}`);
    if (typeof r.isNoindex === "boolean") lines.push(`- Noindexed: ${r.isNoindex}`);
    if (r.issues && r.issues.length) {
      lines.push(`- **Issues:**`);
      for (const issue of r.issues) lines.push(`  - ${issue}`);
    }
    lines.push("");
  }

  if (thinPageResult && thinPageResult.skipped) {
    lines.push(`_Thin-page live check skipped: ${thinPageResult.reason}_\n`);
  }

  lines.push("---");
  lines.push("_This check is informational only (FR-SEO-MON-01) - it never blocks a deploy._");

  return lines.join("\n");
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      out[key] = value;
    }
  }
  return out;
}

run();
