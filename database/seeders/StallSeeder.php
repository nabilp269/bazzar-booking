<?php

namespace Database\Seeders;

use App\Models\Stall;
use Illuminate\Database\Seeder;

class StallSeeder extends Seeder
{
    public function run(): void
    {
        // Membuat data stand otomatis A01 sampai A10
        for ($i = 1; $i <= 10; $i++) {
            $stallNumber = 'A' . str_pad($i, 2, '0', STR_PAD_LEFT);

            Stall::firstOrCreate(
                ['stall_number' => $stallNumber],
                [
                    'price' => 150000.00,
                    'status' => 'available',
                ]
            );
        }
    }
}
