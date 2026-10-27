export type PermissionAction = "read" | "create" | "update" | "delete";

export interface PermissionItem {
  key: string;
  name: string;
  /** CRUD actions enabled for this function in the global function catalog. */
  availableActions?: PermissionAction[];
  actions: {
    read: boolean; // View
    create: boolean; // Create
    update: boolean; // Update
    delete: boolean; // Delete
  };
}

export interface PermissionFormData {
  groupName: string;
  permissions: PermissionItem[];
}

export interface Role {
  id: number;
  roleName: string;
  code?: string | null;
  /** Deletion state: 0 is active and 1 is deleted. */
  isDeleted: number;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
  /** Number of users assigned to this role. */
  totalUsers: number;
}

export type RoleNameSortDirection = "asc" | "desc";

export interface RoleBase {
  code?: string | null;
  roleName: string;
  roleDetails: RoleDetailItem[];
}

export type RoleCreate = Pick<RoleBase, "roleName"> &
  Partial<Pick<RoleBase, "roleDetails">>;

export interface RoleResponse extends RoleBase {
  id: number;
}

export interface RoleDetail extends RoleBase {
  id: number;
}

export type RoleUpdate = Partial<RoleBase>;

export interface RoleDetailItem {
  functionName: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface FunctionCatalogItem {
  id: number;
  functionName: string;
  code?: string | null;
  nameVi?: string | null;
  nameEn?: string | null;
  routeKey?: string | null;
  iconKey?: string | null;
  sortOrder?: number;
  parentFunctionId?: number | null;
  status?: boolean;
  actionCodes?: string[];
}

export type SidebarItem = {
  icon: string;
  labelKey: string;
  labelText?: string;
  to: string;
  permission: string;
};

export type SidebarSection = {
  title: string | null;
  titleText?: string;
  items: SidebarItem[];
};

export interface PermissionNavigationNode {
  id: number;
  code: string;
  functionName: string;
  nameVi: string | null;
  nameEn: string | null;
  routeKey: string | null;
  iconKey: string | null;
  sortOrder: number;
  actionCodes: string[];
  children: PermissionNavigationNode[];
}

export interface PermissionNavigationResponse {
  roleCode: string | null;
  items: PermissionNavigationNode[];
}

export interface PermissionMatrixItem {
  id: number;
  code: string;
  actionCode: string;
  nameVi: string;
  nameEn: string;
  grantedByRole: boolean;
  override: "GRANT" | "DENY" | null;
  allowed: boolean;
  assignable?: boolean;
}

export interface PermissionMatrixFunction {
  id: number;
  code: string;
  nameVi: string | null;
  nameEn: string | null;
  routeKey: string | null;
  iconKey: string | null;
  sortOrder: number;
  parentFunctionId: number | null;
  permissions: PermissionMatrixItem[];
}

export interface RolePermissionMatrix {
  role: { id: number; code: string | null; name: string };
  functions: PermissionMatrixFunction[];
}

export interface UserPermissionOverrideMatrix {
  user: { id: number; roleCode: string | null };
  functions: PermissionMatrixFunction[];
}
