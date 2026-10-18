/* eslint-disable */
// @ts-nocheck

import fs from "fs-extra";
import path from "path";
import { paramCase } from "param-case";

const ROOT = process.cwd();

const COLOR_FILE = path.join(
  ROOT,
  "src/styles/design-tokens/color.styles.tokens.json"
);

const TYPO_FILE = path.join(
  ROOT,
  "src/styles/design-tokens/text.styles.tokens.json"
);

const OUT_DIR = path.join(ROOT, "src/styles/generated");

/* ------------------------------------------------ */
/* UTIL */
/* ------------------------------------------------ */

async function writeFresh(filePath: string, content: string) {
  await fs.ensureFile(filePath);

  // clear file content
  await fs.truncate(filePath);

  // write new content
  await fs.writeFile(filePath, content);
}

/* ------------------------------------------------ */
/* COLOR GENERATOR */
/* ------------------------------------------------ */

function flattenColors(obj: any, prefix = "", result: any = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const name = prefix ? `${prefix}-${paramCase(key)}` : paramCase(key);

    if ((value as any).$type === "color") {
      result[name] = (value as any).$value;
    } else if (typeof value === "object") {
      flattenColors(value, name, result);
    }
  }

  return result;
}

async function generateColors() {
  const json = await fs.readJson(COLOR_FILE);
  const light = flattenColors(json.Light);
  const dark = flattenColors(json.Dark);

  // 1. Generate colors.ts với var() thay vì hardcode hex
  let ts = `export const colors = {\n`;
  Object.keys(light).forEach((key) => {
    ts += `  "${key}": "var(--color-${key})",\n`;
  });
  ts += `}\n`;
  await writeFresh(path.join(OUT_DIR, "colors.ts"), ts);

  // 2. Generate colors.css với :root và .dark
  let css = `/* AUTO-GENERATED FILE - DO NOT EDIT */\n\n@layer base {\n\n:root {\n`;
  Object.entries(light).forEach(([key, value]) => {
    css += `  --color-${key}: ${value};\n`;
  });
  css += `}\n\n.dark {\n`;
  Object.entries(dark).forEach(([key, value]) => {
    css += `  --color-${key}: ${value};\n`;
  });
  css += `}\n\n}\n`;
  await writeFresh(path.join(OUT_DIR, "colors.css"), css);
}

/* ------------------------------------------------ */
/* TYPOGRAPHY GENERATOR */
/* ------------------------------------------------ */

function generateTypographyCSS(obj: any) {
  let css = "";
  const classes: string[] = [];

  for (const [name, data] of Object.entries(obj)) {
    const v: any = (data as any).$value;

    const className = `text-${paramCase(name)}`;

    classes.push(className);

    css += `
.${className} {
  font-family: ${v.fontFamily};
  font-size: ${v.fontSize};
  font-weight: ${v.fontWeight};
  line-height: ${v.lineHeight};
  letter-spacing: ${v.letterSpacing};
  text-transform: ${v.textTransform};
}
`;
  }

  return { css, classes };
}

async function generateTypography() {
  const json = await fs.readJson(TYPO_FILE);

  const typo = json.Light.Typography;
  const components = json.Light.Components;

  const typoResult = generateTypographyCSS(typo);
  const compResult = generateTypographyCSS(components);

  const css = typoResult.css + compResult.css;

  const classes = [...typoResult.classes, ...compResult.classes];

  let ts = `export const typography = {\n`;

  classes.forEach((c) => {
    ts += `  "${c}": "${c}",\n`;
  });

  ts += `}\n`;

  await writeFresh(path.join(OUT_DIR, "typography.css"), css);
  await writeFresh(path.join(OUT_DIR, "typography.ts"), ts);
}

/* ------------------------------------------------ */
/* RUN */
/* ------------------------------------------------ */

async function run() {
  await fs.ensureDir(OUT_DIR);

  await generateColors();
  await generateTypography();

  console.log("✅ Design system generated");
}

run();
