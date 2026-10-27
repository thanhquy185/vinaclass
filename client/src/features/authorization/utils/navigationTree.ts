import type { PermissionNavigationNode } from "@/shared/types";

export function flattenPermissionNavigation(
  nodes: PermissionNavigationNode[],
): PermissionNavigationNode[] {
  const result: PermissionNavigationNode[] = [];
  const pending = [...nodes].reverse();

  while (pending.length > 0) {
    const node = pending.pop();
    if (!node) continue;

    result.push(node);

    for (let index = node.children.length - 1; index >= 0; index -= 1) {
      pending.push(node.children[index]);
    }
  }

  return result;
}
