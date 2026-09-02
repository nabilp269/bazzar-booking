<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stalls', function (Blueprint $table) {
            $table->id();
            $table->string('stall_number')->unique(); // Contoh: A01, B05
            $table->decimal('price', 12, 2); // Menggunakan decimal agar aman untuk nominal uang
            // Status ketersediaan stand
            $table->enum('status', ['available', 'pending', 'booked'])->default('available');
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stalls');
    }
};
