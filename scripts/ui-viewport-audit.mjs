import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseURL = process.env.AUDIT_BASE_URL || "http://localhost:3000";
const routes = ["/", "/login", "/offline", "/privacy", "/terms"];
const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 }
];

await fs.mkdir("artifacts/ui-audit", { recursive: true });

const browser = await chromium.launch({ headless: true });
const findings = [];

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }
  });
  const page = await context.newPage();

  for (const route of routes) {
    const url = baseURL + route;
    const name = route === "/" ? "root" : route.slice(1).replaceAll("/", "_");
    const screenshot = `artifacts/ui-audit/${vp.name}-${name}.png`;

    try {
      const resp = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30000
      });

      await page.waitForTimeout(300);
      await page.screenshot({ path: screenshot, fullPage: true });

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
        const clientWidth = doc.clientWidth;

        const forms = [...document.querySelectorAll("form")].map((el) => {
          const r = el.getBoundingClientRect();
          return { width: r.width, vw: window.innerWidth };
        });

        return {
          overflowX: scrollWidth > clientWidth + 1,
          stretchedForms: forms.filter((f) => f.width > f.vw * 0.92).length
        };
      });

      if ((resp?.status() ?? 0) >= 400) {
        findings.push({
          severity: "high",
          type: "http",
          route,
          viewport: vp.name,
          status: resp.status(),
          screenshot
        });
      }

      if (metrics.overflowX) {
        findings.push({
          severity: "high",
          type: "overflow-x",
          route,
          viewport: vp.name,
          screenshot
        });
      }

      if (route === "/login" && metrics.stretchedForms > 0) {
        findings.push({
          severity: "medium",
          type: "stretched-login-form",
          route,
          viewport: vp.name,
          screenshot
        });
      }
    } catch (e) {
      findings.push({
        severity: "high",
        type: "navigation-error",
        route,
        viewport: vp.name,
        error: String(e),
        screenshot
      });
    }
  }

  await context.close();
}

await browser.close();

const report = { baseURL, routes, viewports, findings };
await fs.writeFile(
  "artifacts/ui-audit/report.json",
  JSON.stringify(report, null, 2),
  "utf8"
);

console.log("Audit complete");
console.log("Findings:", findings.length);
for (const f of findings) {
  console.log(`- [${f.severity}] ${f.type} ${f.route} (${f.viewport})`);
}
