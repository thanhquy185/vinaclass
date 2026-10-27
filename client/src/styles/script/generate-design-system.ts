import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { paramCase } from "param-case";

type JsonObject = Record<string, unknown>;

interface TypographyTokenValue {
  fontFamily: string;
  fontSize: string;
  fontWeight: string | number;
  lineHeight: string;
  letterSpacing: string;
  textTransform: string;
}

const ROOT = process.cwd();

const COLOR_FILE = join(
  ROOT,
  "src/styles/design-tokens/color.styles.tokens.json"
);

const TYPO_FILE = join(
  ROOT,
  "src/styles/design-tokens/text.styles.tokens.json"
);

const OUT_DIR = join(ROOT, "src/styles/generated");

async function writeFresh(filePath: string, content: string) {
  await writeFile(filePath, content, "utf8");
}

async function readJson(filePath: string): Promise<unknown> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as unknown;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireObject(value: unknown, description: string): JsonObject {
  if (!isJsonObject(value)) {
    throw new Error(`Expected an object at ${description}.`);
  }

  return value;
}

function flattenColors(
  value: unknown,
  prefix = "",
  result: Record<string, string> = {}
): Record<string, string> {
  if (!isJsonObject(value)) return result;

  for (const [key, token] of Object.entries(value)) {
    const name = prefix ? `${prefix}-${paramCase(key)}` : paramCase(key);

    if (!isJsonObject(token)) continue;

    if (token.$type === "color" && typeof token.$value === "string") {
      result[name] = token.$value;
    } else {
      flattenColors(token, name, result);
    }
  }

  return result;
}

async function generateColors() {
  const json = await readJson(COLOR_FILE);
  const root = requireObject(json, COLOR_FILE);
  const light = flattenColors(root.Light);
  const dark = flattenColors(root.Dark);

  // Generate colors.ts with CSS variable references.
  let ts = `export const colors = {\n`;
  Object.keys(light).forEach((key) => {
    ts += `  "${key}": "var(--color-${key})",\n`;
  });
  ts += `}\n`;
  await writeFresh(join(OUT_DIR, "colors.ts"), ts);

  // Generate color values for the light and dark themes.
  let css = `/* AUTO-GENERATED FILE - DO NOT EDIT */\n\n@layer base {\n\n:root {\n`;
  Object.entries(light).forEach(([key, value]) => {
    css += `  --color-${key}: ${value};\n`;
  });
  css += `}\n\n.dark {\n`;
  Object.entries(dark).forEach(([key, value]) => {
    css += `  --color-${key}: ${value};\n`;
  });
  css += `}\n\n}\n`;
  await writeFresh(join(OUT_DIR, "colors.css"), css);
}

function readTypographyValue(value: unknown): TypographyTokenValue | undefined {
  if (!isJsonObject(value)) return undefined;

  const fontWeight = value.fontWeight;
  if (
    typeof value.fontFamily !== "string" ||
    typeof value.fontSize !== "string" ||
    (typeof fontWeight !== "string" && typeof fontWeight !== "number") ||
    typeof value.lineHeight !== "string" ||
    typeof value.letterSpacing !== "string" ||
    typeof value.textTransform !== "string"
  ) {
    return undefined;
  }

  return {
    fontFamily: value.fontFamily,
    fontSize: value.fontSize,
    fontWeight,
    lineHeight: value.lineHeight,
    letterSpacing: value.letterSpacing,
    textTransform: value.textTransform,
  };
}

function generateTypographyCSS(value: unknown) {
  let css = "";
  const classes: string[] = [];

  if (!isJsonObject(value)) return { css, classes };

  for (const [name, data] of Object.entries(value)) {
    if (!isJsonObject(data)) continue;

    const token = readTypographyValue(data.$value);
    if (!token) continue;

    const className = `text-${paramCase(name)}`;

    classes.push(className);

    css += `
.${className} {
  font-family: ${token.fontFamily};
  font-size: ${token.fontSize};
  font-weight: ${token.fontWeight};
  line-height: ${token.lineHeight};
  letter-spacing: ${token.letterSpacing};
  text-transform: ${token.textTransform};
}
`;
  }

  return { css, classes };
}

async function generateTypography() {
  const json = await readJson(TYPO_FILE);
  const root = requireObject(json, TYPO_FILE);
  const light = requireObject(root.Light, `${TYPO_FILE}:Light`);

  const typo = light.Typography;
  const components = light.Components;

  const typoResult = generateTypographyCSS(typo);
  const compResult = generateTypographyCSS(components);

  const css = typoResult.css + compResult.css;

  const classes = [...typoResult.classes, ...compResult.classes];

  let ts = `export const typography = {\n`;

  classes.forEach((c) => {
    ts += `  "${c}": "${c}",\n`;
  });

  ts += `}\n`;

  await writeFresh(join(OUT_DIR, "typography.css"), css);
  await writeFresh(join(OUT_DIR, "typography.ts"), ts);
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  await generateColors();
  await generateTypography();

  console.log("✅ Design system generated");
}

run();
