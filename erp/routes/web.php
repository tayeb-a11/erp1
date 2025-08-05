<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Routes pour la vérification d'abonnement
Route::prefix('subscription')->group(function () {
    Route::get('/check', [\App\Http\Controllers\ERPSubscriptionController::class, 'checkSubscription'])->name('subscription.check');
    Route::get('/status', [\App\Http\Controllers\ERPSubscriptionController::class, 'getSubscriptionStatus'])->name('subscription.status');
    Route::get('/expired', [\App\Http\Controllers\ERPSubscriptionController::class, 'redirectToExpiredPage'])->name('subscription.expired');
});
