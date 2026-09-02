<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmasi Booking</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif; color: #1f2937;">
    <div style="max-width: 640px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #0f172a, #0f766e); padding: 28px 32px; color: white;">
            <h1 style="margin: 0; font-size: 26px;">Konfirmasi Booking Bazaar</h1>
        </div>

        <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 16px;">Halo,</p>
            <p style="margin: 0 0 24px; line-height: 1.7;">
                Terima kasih telah melakukan pemesanan stand bazaar. Berikut detail booking Anda:
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 10px 0; color: #6b7280;">ID Booking</td>
                    <td style="padding: 10px 0; font-weight: bold; text-align: right;">#{{ $bookingId }}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #6b7280;">Nomor Stand</td>
                    <td style="padding: 10px 0; font-weight: bold; text-align: right;">{{ $stallNumber }}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #6b7280;">Tanggal Booking</td>
                    <td style="padding: 10px 0; font-weight: bold; text-align: right;">{{ $bookingDate }}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #6b7280;">Total Pembayaran</td>
                    <td style="padding: 10px 0; font-weight: bold; text-align: right;">Rp {{ number_format($price, 0, ',', '.') }}</td>
                </tr>
            </table>

            <div style="padding: 18px 20px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; margin-top: 12px;">
                <p style="margin: 0; color: #065f46; font-weight: bold;">Status: Pembayaran Berhasil</p>
            </div>

            <p style="margin: 24px 0 0; line-height: 1.7; color: #374151;">
                Silakan simpan email ini sebagai bukti reservasi. Tim kami akan segera menghubungi Anda untuk tahap selanjutnya.
            </p>
        </div>
    </div>
</body>
</html>
