<?php

namespace App\Services\IdentityV2;

use App\Models\Role;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class IdentityV2Definitions
{
    public const ROLE_CODES = ['ADMIN', 'TEACHER', 'STUDENT'];

    public const FUNCTION_LABELS = [
        'nguoi_dung' => ['Người dùng', 'Users'],
        'do_kho' => ['Độ khó', 'Difficulty levels'],
        'hoc_phan' => ['Lớp học', 'Class groups'],
        'cau_hoi' => ['Câu hỏi', 'Questions'],
        'mon_hoc' => ['Môn học', 'Subjects'],
        'chuong' => ['Chương', 'Chapters'],
        'phan_cong' => ['Phân công', 'Assignments'],
        'de_thi' => ['Đề thi', 'Exams'],
        'nhom_quyen' => ['Nhóm quyền', 'Permission groups'],
        'ma_tran_quyen' => ['Ma trận quyền', 'Permission matrix'],
        'thong_bao' => ['Thông báo', 'Announcements'],
        'tai_lieu' => ['Tài liệu lớp học', 'Class materials'],
        'thong_ke' => ['Thống kê học tập', 'Learning statistics'],
        'thong_ke_ket_qua' => ['Kết quả học tập', 'Learning outcomes'],
        'thong_ke_de_thi' => ['Hoạt động đề thi', 'Exam activity'],
        'thong_ke_lop_hoc' => ['Lớp học & sĩ số', 'Classes & enrollment'],
        'thong_ke_cau_hoi' => ['Ngân hàng câu hỏi', 'Question bank'],
        'training_section' => ['Đào tạo', 'Teaching'],
        'learning_section' => ['Học liệu & kiểm tra', 'Learning & assessment'],
        'access_section' => ['Tài khoản & quyền', 'Accounts & access'],
        'communication_section' => ['Giao tiếp', 'Communication'],
        'analytics_section' => ['Báo cáo & thống kê', 'Reports & analytics'],
        'management_section' => ['Quản lý', 'Management'],
        'admin_section' => ['Quản trị', 'Administration'],
    ];

    public const FUNCTION_NAVIGATION = [
        'hoc_phan' => ['class-groups', 'clipboard', 10, 'training_section'],
        'mon_hoc' => ['subjects', 'folder', 20, 'training_section'],
        'phan_cong' => ['assignments', 'refresh', 30, 'training_section'],
        'cau_hoi' => ['questions', 'question', 10, 'learning_section'],
        'do_kho' => ['difficulty-levels', 'layers', 20, 'learning_section'],
        'de_thi' => ['exams', 'documentDuplicate', 30, 'learning_section'],
        'nguoi_dung' => ['users', 'user', 10, 'access_section'],
        'nhom_quyen' => ['permission-groups', 'groupUser', 20, 'access_section'],
        'ma_tran_quyen' => ['permission-matrix', 'lock', 30, 'access_section'],
        'thong_bao' => ['notifications', 'massage', 10, 'communication_section'],
        'thong_ke_ket_qua' => ['learning-statistics', 'chart-bar', 10, 'analytics_section'],
        'thong_ke_de_thi' => ['exam-statistics', 'calendar', 20, 'analytics_section'],
        'thong_ke_lop_hoc' => ['class-statistics', 'users', 30, 'analytics_section'],
        'thong_ke_cau_hoi' => ['question-statistics', 'question', 40, 'analytics_section'],
    ];

    public const FUNCTION_ACTIONS = [
        'nguoi_dung' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'LOCK'],
        'do_kho' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
        'hoc_phan' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'LOCK'],
        'cau_hoi' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH'],
        'mon_hoc' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
        'chuong' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
        'phan_cong' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'ASSIGN'],
        'de_thi' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ASSIGN'],
        'nhom_quyen' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
        'ma_tran_quyen' => ['VIEW'],
        'thong_bao' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH'],
        'tai_lieu' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
        'thong_ke_ket_qua' => ['VIEW'],
        'thong_ke_de_thi' => ['VIEW'],
        'thong_ke_lop_hoc' => ['VIEW'],
        'thong_ke_cau_hoi' => ['VIEW'],
    ];

    public const ROLE_PERMISSION_DEFAULTS = [
        'TEACHER' => [
            'hoc_phan' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
            'phan_cong' => ['VIEW'],
            'de_thi' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'ASSIGN'],
            'cau_hoi' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH'],
            'thong_bao' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH'],
            'tai_lieu' => ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
            'chuong' => ['VIEW'],
        ],
        'STUDENT' => [
            'hoc_phan' => ['VIEW'],
            'de_thi' => ['VIEW'],
            'thong_bao' => ['VIEW'],
            'tai_lieu' => ['VIEW'],
        ],
    ];

    private const RESTRICTED_ROLE_PERMISSION_ACTIONS = [
        'STUDENT' => [
            'hoc_phan' => ['VIEW'],
            'de_thi' => ['VIEW'],
            'thong_bao' => ['VIEW'],
            'tai_lieu' => ['VIEW'],
        ],
    ];

    public const NAVIGATION_GROUPS = [
        'analytics_section' => ['Báo cáo & thống kê', 'Reports & analytics', 100],
        'training_section' => ['Đào tạo', 'Teaching', 200],
        'learning_section' => ['Học liệu & kiểm tra', 'Learning & assessment', 300],
        'access_section' => ['Tài khoản & quyền', 'Accounts & access', 400],
        'communication_section' => ['Giao tiếp', 'Communication', 500],
    ];

    public const DEPRECATED_NAVIGATION_FUNCTIONS = ['thong_ke'];

    public const DEPRECATED_NAVIGATION_GROUPS = [
        'management_section',
        'admin_section',
    ];

    public const ACTION_LABELS = [
        'VIEW' => ['Xem', 'View'],
        'CREATE' => ['Thêm', 'Create'],
        'UPDATE' => ['Cập nhật', 'Update'],
        'DELETE' => ['Xóa', 'Delete'],
        'LOCK' => ['Khóa', 'Lock'],
        'PUBLISH' => ['Phát hành', 'Publish'],
        'ASSIGN' => ['Giao', 'Assign'],
        'GRADE' => ['Chấm điểm', 'Grade'],
    ];

    public static function canonicalRoleCode(Role $role): ?string
    {
        $roleCode = $role->canonicalCode();

        return in_array($roleCode, self::ROLE_CODES, true) ? $roleCode : null;
    }

    /**
     * @return array<string, Role>
     */
    public static function activeSystemRoleTargets(Collection $roles): array
    {
        $activeRoles = $roles->filter(fn (Role $role): bool => !$role->is_deleted);
        $targets = [];

        foreach ($activeRoles as $role) {
            $code = trim((string) $role->code);
            if (in_array($code, self::ROLE_CODES, true)) {
                $targets[$code] ??= $role;
            }
        }

        foreach ($activeRoles as $role) {
            $code = strtoupper(trim((string) $role->code));
            if (in_array($code, self::ROLE_CODES, true)) {
                $targets[$code] ??= $role;
            }
        }

        foreach ($activeRoles as $role) {
            $code = self::canonicalRoleCode($role);
            if ($code !== null) {
                $targets[$code] ??= $role;
            }
        }

        return $targets;
    }

    /**
     * @return array<int, array{0: string, 1: int}>
     */
    public static function inactiveSystemRoleCodeConflicts(Collection $roles, array $targets): array
    {
        $conflicts = [];

        foreach (self::ROLE_CODES as $code) {
            $targetNeedsCanonicalCode = !isset($targets[$code])
                || $targets[$code]->code !== $code;
            if (!$targetNeedsCanonicalCode) {
                continue;
            }

            foreach ($roles as $role) {
                if (
                    $role->is_deleted
                    && $role->code !== null
                    && self::canonicalRoleCode($role) === $code
                ) {
                    $conflicts[] = [$code, (int) $role->id];
                }
            }
        }

        return $conflicts;
    }

    public static function normalizeActionCode(string $action): string
    {
        $normalized = Str::slug(Str::ascii(trim($action)), '_');

        return match ($normalized) {
            'add', 'create', 'them' => 'CREATE',
            'view', 'read', 'xem' => 'VIEW',
            'update', 'edit', 'cap_nhat', 'sua' => 'UPDATE',
            'delete', 'remove', 'xoa' => 'DELETE',
            'lock', 'khoa' => 'LOCK',
            'publish', 'phat_hanh' => 'PUBLISH',
            'assign', 'giao', 'phan_cong' => 'ASSIGN',
            'grade', 'cham_diem' => 'GRADE',
            default => Str::upper(substr(preg_replace('/[^a-zA-Z0-9]+/', '_', Str::ascii(trim($action))) ?: 'LEGACY_ACTION', 0, 32)),
        };
    }

    public static function mapLegacyRoleAction(
        Role $role,
        string $functionName,
        string $legacyAction
    ): ?string {
        $actionCode = self::normalizeActionCode($legacyAction);

        return self::roleCanReceiveFunctionAction($role, $functionName, $actionCode)
            ? $actionCode
            : null;
    }

    public static function roleCanReceiveFunctionAction(
        Role $role,
        string $functionName,
        string $actionCode
    ): bool {
        $roleCode = self::canonicalRoleCode($role);
        if ($roleCode === 'ADMIN') {
            return true;
        }

        if (isset(self::RESTRICTED_ROLE_PERMISSION_ACTIONS[$roleCode])) {
            $allowedActions = self::RESTRICTED_ROLE_PERMISSION_ACTIONS[$roleCode][$functionName] ?? [];

            return in_array(strtoupper($actionCode), $allowedActions, true);
        }

        if ($functionName !== 'phan_cong') {
            return true;
        }

        if ($roleCode === 'TEACHER') {
            return strtoupper($actionCode) === 'VIEW';
        }

        return strtoupper($actionCode) !== 'ASSIGN';
    }
}
