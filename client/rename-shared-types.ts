/// <reference types="node" />
import { Node, Project, SyntaxKind, type PropertySignature } from "ts-morph";
import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";

type RenameMap = Record<string, string>;

type RenameConfig = {
  /** tên type cũ -> tên type mới */
  types: RenameMap;
  /** "Type" hoặc "Type.nested.path" -> { thuộcTínhCũ: thuộcTínhMới } */
  properties: Record<string, RenameMap>;
  /**
   * Đổi chuỗi literal:
   * - Key có dấu "." (vd "CreateDeThiPayload.cauHinh"): chỉ đổi trong property đó.
   * - Key không có dấu "." (vd "ExamStatus"): đổi trên toàn project.
   */
  stringLiterals?: Record<string, RenameMap>;
};

const DRY_RUN = process.argv.includes("--dry-run");

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const typesFilePath = path.join(projectRoot, "src/types/index.ts");
const configPath = path.join(projectRoot, "rename-shared-types.json");
const config = JSON.parse(await readFile(configPath, "utf8")) as RenameConfig;

const project = new Project({
  tsConfigFilePath: path.join(projectRoot, "tsconfig.app.json"),
});
const sourceFile = project.getSourceFile(typesFilePath);

if (!sourceFile) {
  throw new Error(`Không tìm thấy file type: ${typesFilePath}`);
}
const typesFile = sourceFile;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMembers(node: Node): Node[] {
  if (Node.isInterfaceDeclaration(node) || Node.isTypeLiteral(node)) {
    return node.getMembers();
  }
  if (Node.isTypeAliasDeclaration(node)) {
    const typeNode = node.getTypeNode();
    return typeNode && Node.isTypeLiteral(typeNode)
      ? typeNode.getMembers()
      : [];
  }
  return [];
}

/** Lấy mọi declaration cùng tên (interface khai báo trùng sẽ được TS gộp lại). */
function findDeclarations(typeName: string) {
  return [
    ...typesFile.getInterfaces().filter((item) => item.getName() === typeName),
    ...typesFile.getTypeAliases().filter((item) => item.getName() === typeName),
  ];
}

/** Tìm property theo đường dẫn, vd ["pivot", "sinhVienId"]. Duyệt mọi declaration cùng tên. */
function findProperty(
  typeName: string,
  propertyPath: string[]
): PropertySignature | undefined {
  for (const declaration of findDeclarations(typeName)) {
    let members: Node[] = getMembers(declaration);

    for (let index = 0; index < propertyPath.length; index += 1) {
      const member = members.find(
        (item): item is PropertySignature =>
          Node.isPropertySignature(item) &&
          item.getName() === propertyPath[index]
      );
      if (!member) break;
      if (index === propertyPath.length - 1) return member;

      let nextType = member.getTypeNode();
      if (nextType && Node.isArrayTypeNode(nextType)) {
        nextType = nextType.getElementTypeNode();
      }
      if (!nextType || !Node.isTypeLiteral(nextType)) break;
      members = nextType.getMembers();
    }
  }
  return undefined;
}

const depth = (key: string) => key.split(".").length;

// ---------------------------------------------------------------------------
// 1. Đổi chuỗi literal (làm trước, khi tên type/thuộc tính còn là tên cũ)
// ---------------------------------------------------------------------------

for (const [key, literalMap] of Object.entries(config.stringLiterals ?? {})) {
  if (key.includes(".")) {
    // Phạm vi hẹp: chỉ trong một property (vd Omit<CauHinhThi, "...">)
    const [baseType, ...nested] = key.split(".");
    const property = findProperty(baseType, nested);
    if (!property) {
      console.warn(`Bỏ qua stringLiterals ${key}: không tìm thấy property.`);
      continue;
    }
    for (const literal of property.getDescendantsOfKind(
      SyntaxKind.StringLiteral
    )) {
      if (literal.wasForgotten()) continue;
      const value = literal.getLiteralValue();
      if (Object.hasOwn(literalMap, value) && literalMap[value] !== value) {
        literal.setLiteralValue(literalMap[value]);
        console.log(
          `Đã đổi literal trong ${key}: "${value}" -> "${literalMap[value]}"`
        );
      }
    }
  } else {
    // Phạm vi toàn project (vd giá trị của ExamStatus)
    let count = 0;
    for (const file of project.getSourceFiles()) {
      for (const literal of file.getDescendantsOfKind(
        SyntaxKind.StringLiteral
      )) {
        if (literal.wasForgotten()) continue;
        const value = literal.getLiteralValue();
        if (Object.hasOwn(literalMap, value) && literalMap[value] !== value) {
          literal.setLiteralValue(literalMap[value]);
          count += 1;
        }
      }
    }
    console.log(`Đã đổi ${count} literal của ${key} trên toàn project`);
  }
}

// ---------------------------------------------------------------------------
// 2. Đổi tên thuộc tính (path sâu trước để tên property cha chưa bị đổi)
// ---------------------------------------------------------------------------

const propertyEntries = Object.entries(config.properties).sort(
  ([a], [b]) => depth(b) - depth(a)
);

for (const [key, propertyMap] of propertyEntries) {
  const [baseType, ...nestedPath] = key.split(".");

  for (const [oldName, newName] of Object.entries(propertyMap)) {
    if (oldName === newName) continue;

    const declaration = findProperty(baseType, [...nestedPath, oldName]);
    if (!declaration) {
      if (findProperty(baseType, [...nestedPath, newName])) {
        console.log(
          `Bỏ qua ${key}.${oldName}: đã là "${newName}" (đổi theo type cha/khai báo khác).`
        );
      } else {
        console.warn(
          `Bỏ qua thuộc tính ${key}.${oldName}: không tìm thấy declaration.`
        );
      }
      continue;
    }

    declaration.rename(newName);
    console.log(`Đã đổi thuộc tính ${key}.${oldName} -> ${newName}`);
  }
}

// ---------------------------------------------------------------------------
// 3. Đổi tên type
// ---------------------------------------------------------------------------

for (const [oldName, newName] of Object.entries(config.types)) {
  if (oldName === newName) continue;

  const declarations = findDeclarations(oldName);
  if (declarations.length === 0) {
    console.warn(`Bỏ qua type ${oldName}: không tìm thấy declaration.`);
    continue;
  }

  if (findDeclarations(newName).length > 0) {
    console.warn(
      `Bỏ qua type ${oldName} -> ${newName}: tên đích đã tồn tại trong file.`
    );
    continue;
  }

  // Rename 1 declaration sẽ đổi luôn các declaration được gộp cùng symbol
  declarations[0].rename(newName);
  console.log(`Đã đổi type ${oldName} -> ${newName}`);
}

// ---------------------------------------------------------------------------
// 4. Lưu
// ---------------------------------------------------------------------------

if (DRY_RUN) {
  console.log("\n[--dry-run] Không ghi file. Bỏ cờ --dry-run để lưu thay đổi.");
} else {
  await project.save();
  console.log(
    "\nĐã lưu thay đổi. Hãy chạy `tsc --noEmit` (hoặc `vue-tsc --noEmit`) để kiểm tra."
  );
}
