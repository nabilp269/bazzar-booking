<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stall_id',
        'booking_date',
        'payment_status',
        'payment_method',
    ];

    protected $casts = [
        'booking_date' => 'datetime',
    ];

    // Booking ini milik siapa? (User)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Booking ini untuk stand mana? (Stall)
    public function stall(): BelongsTo
    {
        return $this->belongsTo(Stall::class);
    }

    public function documents()
    {
        return $this->hasMany(BookingDocument::class);
    }
}
