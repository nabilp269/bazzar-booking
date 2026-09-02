<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $stallNumber,
        public string $bookingId,
        public float $price,
        public string $bookingDate
    ) {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Konfirmasi Booking Stand Bazaar',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-confirmation',
            with: [
                'stallNumber' => $this->stallNumber,
                'bookingId' => $this->bookingId,
                'price' => $this->price,
                'bookingDate' => $this->bookingDate,
            ],
        );
    }
}
