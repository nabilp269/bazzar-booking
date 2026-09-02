<?php

namespace App\Services;

use App\Models\Stall;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Exception;

class BookingService
{
    /**
     * Logika untuk memproses booking stand bazaar secara aman
     */
    public function createBooking(int $userId, int $stallId): Booking
    {
        return DB::transaction(function () use ($userId, $stallId) {
            
            // Ambil data stand dan LOCK baris datanya
            $stall = Stall::lockForUpdate()->findOrFail($stallId);

            // Validasi ketersediaan
            if ($stall->status !== 'available') {
                throw new Exception('Maaf, stand ini sudah dipesan orang lain atau sedang pending.');
            }

            // 1. Ubah status stand menjadi pending
            $stall->update(['status' => 'pending']);

            // 2. Buat data booking baru
            return Booking::create([
                'user_id' => $userId,
                'stall_id' => $stallId,
                'booking_date' => now(),
                'payment_status' => 'unpaid',
            ]);
        });
    }
}
