<?php

namespace App\Http\Controllers;

use App\Models\User;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {


     if(
        User::where(
            'email',
            $request->email
        )->exists()
    )
    {
        return response()->json([

            'message' => 'User already registered'

        ],409);
    }
        $validated = $request->validate([

            'name' => 'required',

            'email' => 'required|email|unique:users',

            'password' => 'required|min:8|confirmed',

        ],
         
        
        
        );

        $user = User::create([

            'name' => $validated['name'],

            'email' => $validated['email'],

            'password' => Hash::make(
                $validated['password']
            ),

            'wallet_balance' => 10000.00,

        ]);

        return response()->json([

            'message' => 'User registered successfully',

            'user' => $user

        ],201);
    }

    public function login(Request $request)
{
    $validated = $request->validate([

        'email' => 'required|email',

        'password' => 'required',

    ]);

    $user = User::where(
        'email',
        $validated['email']
    )->first();

    if(
        !$user ||
        !Hash::check(
            $validated['password'],
            $user->password
        )
    ){

        return response()->json([

            'message' => 'Invalid credentials'

        ],401);

    }

    $token = $user
             ->createToken(
                 'tradex-token'
             )
             ->plainTextToken;

    return response()->json([

        'message' => 'Login successful',

        'token' => $token,

        'user' => $user

    ],200);
}

public function profile(Request $request)
{
    $user = User::select(

        'id',

        'name',

        'email',

        'wallet_balance',

        'created_at'

    )

    ->find(

        $request->user()->id

    );

    if(!$user)
    {
        return response()->json([

            'message' => 'User not found'

        ],404);
    }

    return response()->json([

        'success' => true,

        'message' => 'Profile fetched successfully',

        'data' => [

            'id' => $user->id,

            'name' => $user->name,

            'email' => $user->email,

            'wallet_balance' => $user->wallet_balance,

            'member_since' => $user->created_at

        ]

    ],200);
}

public function logout(Request $request)
{
    $request->user()
            ->currentAccessToken()
            ->delete();

    return response()->json([

        'success' => true,

        'message' => 'Logout successful'

    ],200);
}

}