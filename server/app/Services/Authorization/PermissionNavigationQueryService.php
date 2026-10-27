<?php

namespace App\Services\Authorization;

use App\Models\FunctionModel;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Collection;

class PermissionNavigationQueryService
{
    public function __construct(
        private PermissionAuthorizer $authorizer,
        private PermissionFunctionCatalogQueryService $catalogQuery
    ) {
    }

    public function getNavigation(User $user): array
    {
        $functions = $this->catalogQuery->activeFunctions();
        $allowedCodeLookup = array_fill_keys($this->authorizer->allowedCodes($user), true);
        $visibleRouteIds = [];

        foreach ($functions as $function) {
            if (!$function->route_key) {
                continue;
            }

            $viewPermission = $function->permissions->firstWhere('action_code', 'VIEW');
            if ($viewPermission && isset($allowedCodeLookup[$viewPermission->code])) {
                $visibleRouteIds[] = (int) $function->id;
            }
        }

        return [
            'roleCode' => $user->roleCode(),
            'items' => $this->buildNavigationTree(
                $functions,
                null,
                $visibleRouteIds,
                $allowedCodeLookup
            ),
        ];
    }

    private function buildNavigationTree(
        Collection $functions,
        ?int $parentId,
        array $visibleRouteIds,
        array $allowedCodeLookup,
        array $ancestors = []
    ): array {
        return $functions
            ->filter(function (FunctionModel $function) use ($parentId): bool {
                $functionParentId = $function->parent_function_id === null
                    ? null
                    : (int) $function->parent_function_id;

                return $functionParentId === $parentId;
            })
            ->sortBy('sort_order')
            ->map(function (FunctionModel $function) use (
                $functions,
                $visibleRouteIds,
                $allowedCodeLookup,
                $ancestors
            ): ?array {
                $functionId = (int) $function->id;
                if (isset($ancestors[$functionId])) {
                    return null;
                }

                $children = $this->buildNavigationTree(
                    $functions,
                    $functionId,
                    $visibleRouteIds,
                    $allowedCodeLookup,
                    $ancestors + [$functionId => true]
                );
                $canNavigate = in_array($functionId, $visibleRouteIds, true);
                $actionCodes = $function->permissions
                    ->filter(fn (Permission $permission) => isset($allowedCodeLookup[$permission->code]))
                    ->pluck('action_code')
                    ->values()
                    ->all();

                if (!$canNavigate && $children === [] && $actionCodes === []) {
                    return null;
                }

                return [
                    'id' => $function->id,
                    'code' => $function->code,
                    'functionName' => $function->function_name,
                    'nameVi' => $function->name_vi,
                    'nameEn' => $function->name_en,
                    'routeKey' => $canNavigate ? $function->route_key : null,
                    'iconKey' => $function->icon_key,
                    'sortOrder' => $function->sort_order,
                    'actionCodes' => $actionCodes,
                    'children' => $children,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }
}
