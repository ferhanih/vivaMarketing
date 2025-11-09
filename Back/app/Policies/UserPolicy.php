<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }
    public function delete ($authUser, $targetUser) : bool{
        return $authUser->id === $targetUser->id || $authUser->isAdmin();
    }

    public function update ($authUser, $targetUser) : bool{
        return $authUser->id === $targetUser->id;
    }

//    public function view ($authUser, $targetUser) : bool{
//        return $authUser->id === $targetUser->id || $authUser->isAdmin();
//    }
    public function viewAny ($authUser) : bool{
        return $authUser->isAdmin();
    }
}
