const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "coverage",
  ".turbo",
]);

const SKIP_FILES = new Set(["next-env.d.ts"]);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (SKIP_DIRS.has(name.name)) continue;
      walk(p, out);
    } else {
      out.push(p);
    }
  }
  return out;
}

function stripTsLike(filePath, content) {
  const ext = path.extname(filePath);
  const scriptKind =
    ext === ".tsx"
      ? ts.ScriptKind.TSX
      : ext === ".jsx"
        ? ts.ScriptKind.JSX
        : ext === ".js"
          ? ts.ScriptKind.JS
          : ts.ScriptKind.TS;

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: true,
  });

  return printer.printFile(sourceFile);
}

function stripCss(content) {
  let s = content.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/^\s*\/\/.*$/gm, "");
  return s;
}

function stripHtml(content) {
  return content.replace(/<!--[\s\S]*?-->/g, "");
}

function main() {
  const allFiles = walk(ROOT);
  let changed = 0;

  for (const abs of allFiles) {
    const rel = path.relative(ROOT, abs).split(path.sep).join("/");
    if (SKIP_FILES.has(path.basename(abs))) continue;

    const ext = path.extname(abs);
    if (![".ts", ".tsx", ".js", ".jsx", ".css", ".html"].includes(ext)) continue;

    const before = fs.readFileSync(abs, "utf8");
    let after;

    try {
      if (ext === ".css") {
        after = stripCss(before);
      } else if (ext === ".html") {
        after = stripHtml(before);
      } else {
        after = stripTsLike(abs, before);
      }
    } catch (e) {
      console.error(`Skip (parse error): ${rel}`, e.message);
      continue;
    }

    if (after !== before) {
      fs.writeFileSync(abs, after, "utf8");
      changed++;
      console.log(rel);
    }
  }

  console.log(`Done. Updated ${changed} file(s).`);
}

main();
