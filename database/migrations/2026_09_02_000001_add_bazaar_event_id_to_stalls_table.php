<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stalls', function (Blueprint $table) {
            $table->foreignId('bazaar_event_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('bazaar_events')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stalls', function (Blueprint $table) {
            $table->dropForeign(['bazaar_event_id']);
            $table->dropColumn('bazaar_event_id');
        });
    }
};
