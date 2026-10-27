import type { ComponentType, SVGProps } from "react";
import { createElement } from "react";

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

const svgRawFiles = import.meta.glob("./icons/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Automatically replace hard-coded black values (black, #000, #000000) with currentColor.
// Icon colors can be customized with className="text-{color}" or style={{ color }}.
function normalizeColors(svg: string): string {
  return (
    svg
      // Remove opacity when it is paired with black.
      .replace(
        /(fill|stroke)="(black|#000|#000000)"\s+\1-opacity="[^"]*"/gi,
        '$1="currentColor"'
      )
      // Replace black with currentColor.
      .replace(/(fill|stroke)="(black|#000|#000000)"/gi, '$1="currentColor"')
  );
}

function createSvgComponent(rawSvg: string): SvgComponent {
  const processed = normalizeColors(rawSvg);
  const viewBox = processed.match(/viewBox="([^"]*)"/)?.[1];
  const rootFill = processed.match(/<svg[^>]+\bfill="([^"]*)"/)?.[1];
  const inner = processed.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] ?? "";

  return function SvgIcon(props: SVGProps<SVGSVGElement>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, width = 24, height = 24, ...rest } = props;
    return createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      ...(viewBox !== undefined ? { viewBox } : {}),
      ...(rootFill !== undefined ? { fill: rootFill } : {}),
      width,
      height,
      ...rest,
      dangerouslySetInnerHTML: { __html: inner },
    });
  };
}

export const Icons: Record<string, SvgComponent> = {};

// Convert a file path into a key (for example, ./icons/academic-cap.svg becomes academicCap).
Object.entries(svgRawFiles).forEach(([path, component]) => {
  const name = path
    .split("/")
    .pop()
    ?.replace(".svg", "")
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()); // Convert kebab-case to camelCase.

  if (name && typeof component === "string") {
    Icons[name] = createSvgComponent(component);
  }
});

export type IconName = keyof typeof Icons;
