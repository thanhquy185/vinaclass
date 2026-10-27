<?php

namespace App\Services\Authorization;

use App\Models\Role;
use App\Models\User;

/**
 * Keeps the existing administration query contract while delegating each
 * read model to the service responsible for its data shape.
 */
class PermissionAdministrationQueryService
{
    public function __construct(
        private PermissionNavigationQueryService $navigationQuery,
        private PermissionFunctionCatalogQueryService $catalogQuery,
        private PermissionMatrixQueryService $matrixQuery
    ) {
    }

    public function getNavigation(User $user): array
    {
        return $this->navigationQuery->getNavigation($user);
    }

    public function getCatalog(User $actor): array
    {
        return $this->catalogQuery->getCatalog($actor);
    }

    public function getRoleMatrix(Role $role, User $actor): array
    {
        return $this->matrixQuery->getRoleMatrix($role, $actor);
    }

    public function getUserOverrideMatrix(User $user, User $actor): array
    {
        return $this->matrixQuery->getUserOverrideMatrix($user, $actor);
    }
}
