import type { ComponentType, SVGProps } from "react";
import { createElement } from "react";

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

const svgRawFiles = import.meta.glob("./icons/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Tự động thay màu cứng (black, #000, #000000) → currentColor
// Cho phép điều chỉnh màu icon qua className="text-{color}" hoặc style={{ color }}
function normalizeColors(svg: string): string {
  return (
    svg
      // Xóa opacity khi đi kèm với màu đen
      .replace(
        /(fill|stroke)="(black|#000|#000000)"\s+\1-opacity="[^"]*"/gi,
        '$1="currentColor"'
      )
      // Chuyển màu đen thành currentColor
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

// Chuyển đổi đường dẫn file thành tên key (ví dụ: ./icons/academic-cap.svg → academicCap)
Object.entries(svgRawFiles).forEach(([path, component]) => {
  const name = path
    .split("/")
    .pop()
    ?.replace(".svg", "")
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()); // kebab-case → camelCase

  if (name && typeof component === "string") {
    Icons[name] = createSvgComponent(component);
  }
});

export type IconName = keyof typeof Icons;
