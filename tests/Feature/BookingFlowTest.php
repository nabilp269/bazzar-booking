<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDocument;
use App\Models\Stall;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BookingFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_dashboard_and_booking_history(): void
    {
        $user = User::factory()->create();
        $stall = Stall::create([
            'stall_number' => 'A01',
            'price' => 150000,
            'status' => 'available',
        ]);

        $booking = Booking::create([
            'user_id' => $user->id,
            'stall_id' => $stall->id,
            'booking_date' => now(),
            'payment_status' => 'unpaid',
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk();

        $this->actingAs($user)
            ->get('/bookings')
            ->assertOk();

        $this->actingAs($user)
            ->get('/bookings/' . $booking->id)
            ->assertOk();
    }

    public function test_user_can_complete_payment_and_admin_can_view_dashboard(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);
        $stall = Stall::create([
            'stall_number' => 'A02',
            'price' => 200000,
            'status' => 'pending',
        ]);

        $booking = Booking::create([
            'user_id' => $user->id,
            'stall_id' => $stall->id,
            'booking_date' => now(),
            'payment_status' => 'unpaid',
        ]);

        $this->actingAs($user)
            ->post('/bookings/' . $booking->id . '/pay', [
                'payment_method' => 'dana',
                'payment_proof' => UploadedFile::fake()->create('bukti-dana.jpg', 200, 'image/jpeg'),
            ])
            ->assertRedirect();

        $booking->refresh();
        $this->assertSame('paid', $booking->payment_status);
        $this->assertSame('dana', $booking->payment_method);
        $this->assertSame('booked', $booking->stall->fresh()->status);

        $this->actingAs($admin)
            ->get('/admin/dashboard')
            ->assertOk();
    }

    public function test_user_can_pay_cash_on_site_without_uploading_proof_first(): void
    {
        $user = User::factory()->create();
        $stall = Stall::create([
            'stall_number' => 'A03',
            'price' => 250000,
            'status' => 'available',
        ]);

        $booking = Booking::create([
            'user_id' => $user->id,
            'stall_id' => $stall->id,
            'booking_date' => now(),
            'payment_status' => 'unpaid',
        ]);

        $this->actingAs($user)
            ->post('/bookings/' . $booking->id . '/pay', [
                'payment_method' => 'cash_on_site',
            ])
            ->assertRedirect();

        $booking->refresh();
        $this->assertSame('paid', $booking->payment_status);
        $this->assertSame('cash_on_site', $booking->payment_method);
    }

    public function test_user_can_upload_booking_document(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $stall = Stall::create([
            'stall_number' => 'A04',
            'price' => 250000,
            'status' => 'available',
        ]);

        $booking = Booking::create([
            'user_id' => $user->id,
            'stall_id' => $stall->id,
            'booking_date' => now(),
            'payment_status' => 'paid',
        ]);

        $this->actingAs($user)
            ->post('/bookings/' . $booking->id . '/documents', [
                'document' => UploadedFile::fake()->create('proposal.pdf', 100, 'application/pdf'),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('booking_documents', [
            'booking_id' => $booking->id,
            'document_name' => 'proposal.pdf',
        ]);
    }

    public function test_admin_user_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->actingAs($admin)
            ->get('/admin/dashboard')
            ->assertOk();

        $user = User::factory()->create([
            'role' => 'user',
        ]);

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertForbidden();
    }

    public function test_admin_can_create_a_new_bazaar_event_with_location_layout(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->actingAs($admin)
            ->post('/admin/events', [
                'name' => 'Bazaar Nusantara',
                'location' => 'Bandung',
                'start_date' => '2026-11-10',
                'end_date' => '2026-11-12',
                'layout' => [
                    ['A01', 'A02'],
                    ['A03', 'A04'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('bazaar_events', [
            'name' => 'Bazaar Nusantara',
            'location' => 'Bandung',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_open_payment_proof_in_browser_without_download(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $stall = Stall::create([
            'stall_number' => 'A05',
            'price' => 300000,
            'status' => 'pending',
        ]);

        $booking = Booking::create([
            'user_id' => User::factory()->create()->id,
            'stall_id' => $stall->id,
            'booking_date' => now(),
            'payment_status' => 'paid',
            'payment_method' => 'dana',
        ]);

        $path = 'payment-proofs/' . $booking->id . '/bukti-dana.jpg';
        Storage::disk('local')->put($path, 'fake-image-content');

        BookingDocument::create([
            'booking_id' => $booking->id,
            'document_name' => 'bukti-dana.jpg',
            'file_path' => $path,
            'mime_type' => 'image/jpeg',
        ]);

        $response = $this->actingAs($admin)
            ->get('/admin/bookings/' . $booking->id . '/proof');

        $response->assertOk();
        $this->assertStringContainsString('inline', strtolower($response->headers->get('Content-Disposition')));
    }

    public function test_bazaar_page_handles_missing_event_table_gracefully(): void
    {
        $user = User::factory()->create();

        Schema::dropIfExists('bazaar_events');

        $this->actingAs($user)
            ->get('/bazaar')
            ->assertOk();
    }

    public function test_organizer_can_create_event_with_ownership(): void
    {
        $organizer = User::factory()->create([
            'role' => 'organizer',
        ]);

        $this->actingAs($organizer)
            ->post('/admin/events', [
                'name' => 'Bazaar Organizer Test',
                'location' => 'Yogyakarta',
                'start_date' => '2026-12-01',
                'end_date' => '2026-12-03',
                'layout' => [
                    ['A01', 'A02'],
                    ['A03', 'A04'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('bazaar_events', [
            'name' => 'Bazaar Organizer Test',
            'location' => 'Yogyakarta',
            'organizer_id' => $organizer->id,
        ]);
    }
}
