<?php

namespace App\Services;

use App\Models\Difficulty;
use App\Models\User;
use App\Policies\DifficultyPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DifficultyService
{
    public function __construct(private DifficultyPolicy $difficultyPolicy)
    {
    }

    public function getAll(User $viewer)
    {
        abort_unless($this->difficultyPolicy->viewCatalog($viewer), 403);

        return Difficulty::query()
            ->withCount('questions')
            ->orderByDesc('id')
            ->get();
    }

    public function getOne(Difficulty $difficulty, User $viewer): Difficulty
    {
        abort_unless($this->difficultyPolicy->view($viewer, $difficulty), 404);

        return $difficulty->loadCount('questions');
    }

    public function create(array $data, User $actor): Difficulty
    {
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($data, $actorId): Difficulty {
            $actor = $this->lockActor($actorId);
            abort_unless($this->difficultyPolicy->manage($actor, 'create'), 403);

            return Difficulty::query()->create($data)->loadCount('questions');
        });
    }

    public function update(Difficulty $difficulty, array $data, User $actor): Difficulty
    {
        $difficultyId = (int) $difficulty->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($difficultyId, $data, $actorId): Difficulty {
            $actor = $this->lockActor($actorId);
            abort_unless($this->difficultyPolicy->manage($actor, 'update'), 403);
            $difficulty = Difficulty::query()->lockForUpdate()->findOrFail($difficultyId);
            $difficulty->update($data);

            return $difficulty->refresh()->loadCount('questions');
        });
    }

    public function delete(Difficulty $difficulty, User $actor): bool
    {
        $difficultyId = (int) $difficulty->id;
        $actorId = (int) $actor->id;

        return DB::transaction(function () use ($difficultyId, $actorId): bool {
            $actor = $this->lockActor($actorId);
            abort_unless($this->difficultyPolicy->manage($actor, 'delete'), 403);
            $difficulty = Difficulty::query()->lockForUpdate()->findOrFail($difficultyId);

            // Preserve referenced difficulty levels so existing questions remain valid.
            if ($difficulty->questions()->exists()) {
                throw ValidationException::withMessages([
                    'difficulty' => ['This difficulty is currently in use and cannot be deleted.'],
                ]);
            }

            return (bool) $difficulty->delete();
        });
    }

    private function lockActor(int $actorId): User
    {
        return User::query()
            ->with('role')
            ->lockForUpdate()
            ->findOrFail($actorId);
    }
}
