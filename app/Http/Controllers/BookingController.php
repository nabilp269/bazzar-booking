<?php

namespace App\Http\Controllers;

use App\Mail\BookingConfirmation;
use App\Models\BazaarEvent;
use App\Models\Booking;
use App\Models\BookingDocument;
use App\Models\Stall;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function dashboard()
    {
        $bookings = auth()->user()
            ->bookings()
            ->with('stall')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'bookings' => $bookings->map(function ($booking) {
                return [
                    'id'             => $booking->id,
                    'stall_number'   => $booking->stall?->stall_number,
                    'price'          => (float) ($booking->stall?->price ?? 0),
                    'payment_status' => $booking->payment_status,
                ];
            })->all(),
        ]);
    }

    public function adminDashboard()
    {
        abort_unless(auth()->check() && auth()->user()->isAdmin(), 403);

        $stalls   = Stall::all();
        $bookings = Booking::with('stall', 'user', 'documents')->latest()->limit(10)->get();
        $events   = BazaarEvent::with('organizer')->latest('start_date')->get();

        $stats = [
            'total_stalls'  => $stalls->count(),
            'available'     => $stalls->where('status', 'available')->count(),
            'pending'       => $stalls->where('status', 'pending')->count(),
            'booked'        => $stalls->where('status', 'booked')->count(),
            'paid_bookings' => $bookings->where('payment_status', 'paid')->count(),
            'total_revenue' => $bookings
                ->filter(fn ($b) => $b->payment_status === 'paid')
                ->sum(fn ($b) => (float) ($b->stall?->price ?? 0)),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats'    => $stats,
            'events'   => $events->map(function ($event) {
                return [
                    'id'             => $event->id,
                    'name'           => $event->name,
                    'location'       => $event->location,
                    'start_date'     => $event->start_date?->toDateString(),
                    'end_date'       => $event->end_date?->toDateString(),
                    'layout'         => $event->layout ?? [],
                    'is_active'      => (bool) $event->is_active,
                    'organizer_name' => $event->organizer?->name ?? 'Admin',
                ];
            })->all(),
            'bookings' => $bookings->map(function ($booking) {
                $proof = $booking->documents->last();
                return [
                    'id'                 => $booking->id,
                    'user_name'          => $booking->user?->name,
                    'stall_number'       => $booking->stall?->stall_number,
                    'price'              => (float) ($booking->stall?->price ?? 0),
                    'payment_status'     => $booking->payment_status,
                    'payment_method'     => $booking->payment_method,
                    'payment_proof_name' => $proof?->document_name,
                    'booking_date'       => $booking->booking_date,
                ];
            })->all(),
        ]);
    }

    public function pay(Request $request, Booking $booking)
    {
        abort_unless($booking->user_id === auth()->id(), 403);

        if ($booking->payment_status === 'paid') {
            return redirect()->back()->with('success', 'Pembayaran untuk booking ini sudah diterima.');
        }

        $request->validate([
            'payment_method' => ['required', 'in:bank_transfer,ewallet,dana,gopay,shopeepay,ovo,linkaja,credit_card,cash_on_site'],
            'payment_proof'  => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
        ]);

        $requiresProof = in_array($request->payment_method, [
            'bank_transfer', 'ewallet', 'dana', 'gopay', 'shopeepay', 'ovo', 'linkaja', 'credit_card',
        ], true);

        if ($requiresProof && !$request->hasFile('payment_proof')) {
            $booking->update([
                'payment_method' => $request->payment_method,
                'payment_status' => 'unpaid',
            ]);

            return redirect()->route('bookings.show', $booking->id)
                ->with('success', 'Transfer dulu ke rekening tujuan, lalu unggah bukti pembayaran agar booking bisa diverifikasi.');
        }

        $proofPath = null;
        if ($request->hasFile('payment_proof')) {
            $proofPath = $request->file('payment_proof')->storeAs(
                'payment-proofs/' . $booking->id,
                $request->file('payment_proof')->getClientOriginalName(),
                'local'
            );
        }

        DB::transaction(function () use ($booking, $request, $proofPath) {
            $booking->update([
                'payment_status' => 'paid',
                'payment_method' => $request->payment_method,
            ]);
            $booking->stall()->update(['status' => 'booked']);

            if ($proofPath) {
                BookingDocument::create([
                    'booking_id'    => $booking->id,
                    'document_name' => 'Bukti Pembayaran - ' . $request->payment_method,
                    'file_path'     => $proofPath,
                    'mime_type'     => $request->file('payment_proof')->getClientMimeType(),
                ]);
            }
        });

        $bookingDate = \Illuminate\Support\Facades\Date::parse($booking->booking_date)->format('d M Y H:i');

        Mail::to(auth()->user()->email)->send(new BookingConfirmation(
            $booking->stall->stall_number,
            (string) $booking->id,
            (float) ($booking->stall->price ?? 0),
            $bookingDate
        ));

        return redirect()->route('bookings.show', $booking->id)
            ->with('success', 'Pembayaran berhasil dikirim. Bukti pembayaran telah diterima dan menunggu verifikasi.');
    }

    public function uploadDocument(Request $request, Booking $booking)
    {
        abort_unless($booking->user_id === auth()->id(), 403);

        $request->validate([
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
        ]);

        $path = $request->file('document')->storeAs(
            'booking-documents/' . $booking->id,
            $request->file('document')->getClientOriginalName(),
            'local'
        );

        BookingDocument::create([
            'booking_id'    => $booking->id,
            'document_name' => $request->file('document')->getClientOriginalName(),
            'file_path'     => $path,
            'mime_type'     => $request->file('document')->getClientMimeType(),
        ]);

        return redirect()->route('bookings.show', $booking->id)
            ->with('success', 'Dokumen berhasil diunggah.');
    }

    public function storeEvent(Request $request)
    {
        abort_unless(auth()->check() && auth()->user()->isOrganizer(), 403);

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'location'     => ['nullable', 'string', 'max:255'],
            'start_date'   => ['required', 'date'],
            'end_date'     => ['required', 'date', 'after_or_equal:start_date'],
            'layout'       => ['required', 'array'],
            'layout.*'     => ['required', 'array'],
            'layout.*.*'   => ['required', 'string', 'max:50'],
            'organizer_id' => ['nullable', 'exists:users,id'],
            'stall_price'  => ['nullable', 'numeric', 'min:0'],
        ]);

        $layout = array_values(array_map(function ($row) {
            return array_values($row);
        }, $data['layout']));

        $organizerId = $data['organizer_id'] ?? auth()->id();
        $stallPrice  = (float) ($data['stall_price'] ?? 150000);

        $event = BazaarEvent::create([
            'name'         => $data['name'],
            'location'     => $data['location'] ?? null,
            'start_date'   => $data['start_date'],
            'end_date'     => $data['end_date'],
            'layout'       => $layout,
            'is_active'    => true,
            'organizer_id' => $organizerId,
        ]);

        // Buat stall otomatis dari layout, linked ke event ini
        $stallNumbers = collect($layout)->flatten()->unique()->filter();
        foreach ($stallNumbers as $stallNumber) {
            Stall::create([
                'bazaar_event_id' => $event->id,
                'stall_number'    => $stallNumber,
                'price'           => $stallPrice,
                'status'          => 'available',
            ]);
        }

        $count = $stallNumbers->count();
        return redirect()->route('admin.dashboard')
            ->with('success', "Event \"{$event->name}\" berhasil dibuat dengan {$count} stand.");
    }

    public function activateEvent(BazaarEvent $event)
    {
        abort_unless(auth()->check() && auth()->user()->isAdmin(), 403);

        BazaarEvent::where('is_active', true)->update(['is_active' => false]);
        $event->update(['is_active' => true]);

        return redirect()->route('admin.dashboard')->with('success', 'Event bazar aktif berhasil diubah.');
    }

    public function downloadProof(Booking $booking)
    {
        abort_unless(auth()->check() && auth()->user()->isAdmin(), 403);

        $document = $booking->documents()->latest()->first();

        if (!$document || !$document->file_path) {
            return redirect()->route('admin.dashboard')
                ->with('error', 'Belum ada bukti pembayaran untuk booking ini.');
        }

        $path = Storage::disk('local')->path($document->file_path);

        if (!file_exists($path)) {
            return redirect()->route('admin.dashboard')
                ->with('error', 'Bukti pembayaran tidak ditemukan di storage.');
        }

        $headers = [
            'Content-Type'        => $document->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $document->document_name . '"',
        ];

        return response()->file($path, $headers);
    }
}