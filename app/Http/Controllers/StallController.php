<?php

namespace App\Http\Controllers;

use App\Models\BazaarEvent;
use App\Models\Stall;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Exception;

class StallController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Menampilkan halaman utama — daftar semua event aktif beserta stand-nya
     */
    public function index(Request $request)
    {
        $events = [];

        try {
            if (Schema::hasTable('bazaar_events')) {
                $events = BazaarEvent::with(['organizer', 'stalls'])
                    ->where('is_active', true)
                    ->orderBy('start_date')
                    ->get()
                    ->map(function ($event) {
                        return [
                            'id'             => $event->id,
                            'name'           => $event->name,
                            'location'       => $event->location ?? 'Belum ditentukan',
                            'organizer_name' => $event->organizer?->name ?? 'Admin',
                            'start_date'     => $event->start_date?->toDateString(),
                            'end_date'       => $event->end_date?->toDateString(),
                            'layout'         => $event->layout ?? [],
                            'stalls'         => $event->stalls
                                ->sortBy('stall_number')
                                ->values()
                                ->map(fn ($s) => [
                                    'id'           => $s->id,
                                    'stall_number' => $s->stall_number,
                                    'price'        => (float) $s->price,
                                    'status'       => $s->status,
                                ])->all(),
                            'stats' => [
                                'total'     => $event->stalls->count(),
                                'available' => $event->stalls->where('status', 'available')->count(),
                                'pending'   => $event->stalls->where('status', 'pending')->count(),
                                'booked'    => $event->stalls->where('status', 'booked')->count(),
                            ],
                        ];
                    })->all();
            }
        } catch (\Throwable $e) {
            $events = [];
        }

        return Inertia::render('Bazaar/Index', [
            'events' => $events,
        ]);
    }

    /**
     * Memproses booking ketika user klik tombol sewa
     */
    public function book(Request $request)
    {
        $request->validate([
            'stall_id' => 'required|exists:stalls,id'
        ]);

        try {
            $this->bookingService->createBooking(
                auth()->id(),
                $request->stall_id
            );

            return redirect()->back()->with('success', 'Stand berhasil dipesan! Silakan lakukan pembayaran.');

        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
