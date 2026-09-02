<?php

namespace App\Http\Controllers;

use App\Models\BazaarEvent;
use App\Models\Stall;
use App\Services\BookingService;
use Illuminate\Http\Request;
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
     * Menampilkan halaman utama denah stand bazaar
     */
    public function index()
    {
        $activeEvent = null;

        try {
            if (schema_has_table('bazaar_events')) {
                $activeEvent = BazaarEvent::with('organizer')->where('is_active', true)->latest('start_date')->first();
            }
        } catch (\Throwable $e) {
            $activeEvent = null;
        }

        $stalls = Stall::orderBy('stall_number', 'asc')->get();

        return Inertia::render('Bazaar/Index', [
            'stalls' => $stalls->toArray(),
            'event' => $activeEvent ? [
                'id' => $activeEvent->id,
                'name' => $activeEvent->name,
                'location' => $activeEvent->location,
                'organizer_name' => $activeEvent->organizer?->name ?? 'Admin',
                'start_date' => $activeEvent->start_date?->toDateString(),
                'end_date' => $activeEvent->end_date?->toDateString(),
                'layout' => $activeEvent->layout ?? [],
            ] : [
                'name' => config('bazaar.event_name'),
                'location' => 'Belum ditentukan',
                'organizer_name' => 'Admin',
                'start_date' => config('bazaar.start_date'),
                'end_date' => config('bazaar.end_date'),
                'layout' => config('bazaar.layout'),
            ],
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
