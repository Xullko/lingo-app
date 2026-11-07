// Bundles index.html + css/ + js/ into one file: dist/lingocards.html
// That single file is what gets published as the Claude artifact.
// Run:  node build.js
const fs = require("fs");
const path = require("path");

const root = __dirname;
const read = p => fs.readFileSync(path.join(root, p), "utf8");

let html = read("index.html");

// Inline the stylesheet and the two scripts.
html = html.replace('<link rel="stylesheet" href="css/styles.css">', () => "<style>\n" + read("css/styles.css") + "</style>");
// Inline every local script tag (config, the 10 word levels, services, app) in page order.
let count = 0;
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, file) => { count++; return "<script>\n" + read(file) + "</script>"; });
if (!count) throw new Error("No local scripts found in index.html");

// The artifact host adds its own <!doctype>, <head>, charset and viewport,
// so strip those wrappers and keep only the page content.
html = html
  .replace(/<!doctype html>\s*/i, "")
  .replace(/<html[^>]*>\s*/i, "")
  .replace(/<\/?head>\s*/gi, "")
  .replace(/<\/?body>\s*/gi, "")
  .replace(/<\/html>\s*/i, "")
  .replace(/<meta charset="utf-8">\s*/i, "")
  .replace(/<meta name="viewport"[^>]*>\s*/i, "");

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist", "lingocards.html"), html);
console.log("Built dist/lingocards.html (" + Math.round(html.length / 1024) + " KB)");
