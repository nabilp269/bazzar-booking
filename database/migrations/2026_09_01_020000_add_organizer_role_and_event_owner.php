<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('user')->after('password');
            });
        }

        DB::table('users')->whereNull('role')->update(['role' => 'user']);
        DB::table('users')->whereNotIn('role', ['user', 'admin', 'organizer'])->update(['role' => 'user']);

        if (Schema::hasTable('bazaar_events') && !Schema::hasColumn('bazaar_events', 'organizer_id')) {
            Schema::table('bazaar_events', function (Blueprint $table) {
                $table->foreignId('organizer_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('bazaar_events', 'organizer_id')) {
            Schema::table('bazaar_events', function (Blueprint $table) {
                $table->dropConstrainedForeignId('organizer_id');
            });
        }
    }
};
