<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StallController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Halaman utama langsung ke login
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route(auth()->user()->isAdmin() ? 'admin.dashboard' : 'dashboard');
    }

    return redirect()->route('login');
});

// Dashboard Utama setelah Login
Route::get('/dashboard', [BookingController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Semua Route yang wajib Login dimasukkan di sini
Route::middleware('auth')->group(function () {
    // Fitur Profile bawaan Laravel Breeze
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Fitur Tambahan: Booking Stand Bazaar
    Route::get('/bazaar', [StallController::class, 'index'])->name('bazaar.index');
    Route::post('/bazaar/book', [StallController::class, 'book'])->name('bazaar.book');

    Route::get('/bookings', function () {
        $bookings = auth()->user()->bookings()->with('stall')->latest()->get();

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'stall_number' => $booking->stall?->stall_number,
                    'price' => (float) $booking->stall?->price,
                    'booking_date' => $booking->booking_date,
                    'payment_status' => $booking->payment_status,
                    'status' => $booking->stall?->status,
                ];
            })->all(),
        ]);
    })->name('bookings.index');

    Route::get('/bookings/{booking}', function ($bookingId) {
        $booking = auth()->user()->bookings()->with('stall')->findOrFail($bookingId);

        return Inertia::render('Bookings/Show', [
            'booking' => [
                'id' => $booking->id,
                'stall_number' => $booking->stall?->stall_number,
                'price' => (float) $booking->stall?->price,
                'booking_date' => $booking->booking_date,
                'payment_status' => $booking->payment_status,
                'status' => $booking->stall?->status,
                'created_at' => $booking->created_at,
            ],
        ]);
    })->name('bookings.show');

    Route::post('/bookings/{booking}/pay', [BookingController::class, 'pay'])->name('bookings.pay');
    Route::post('/bookings/{booking}/documents', [BookingController::class, 'uploadDocument'])->name('bookings.documents.store');

    Route::get('/admin/dashboard', [BookingController::class, 'adminDashboard'])
        ->name('admin.dashboard');
    Route::post('/admin/events', [BookingController::class, 'storeEvent'])
        ->name('admin.events.store');
    Route::post('/admin/events/{event}/activate', [BookingController::class, 'activateEvent'])
        ->name('admin.events.activate');
    Route::get('/admin/bookings/{booking}/proof', [BookingController::class, 'downloadProof'])
        ->name('admin.bookings.proof');
});

require __DIR__.'/auth.php';
