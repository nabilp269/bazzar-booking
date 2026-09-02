import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function Dashboard({ stats = {}, bookings = [], events = [] }) {
    const [selectedProofId, setSelectedProofId] = useState(null);
    const selectedProofBooking = bookings.find((booking) => booking.id === selectedProofId) || null;
    const [layoutRows, setLayoutRows] = useState(2);
    const [layoutCols, setLayoutCols] = useState(2);
    const eventForm = useForm({
        name: '',
        location: '',
        start_date: '',
        end_date: '',
        layout_rows: 'A01, A02\nA03, A04',
    });

    const generateLayout = (rows, cols) => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const layout = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                const code = letters[i] + String(j + 1).padStart(2, '0');
                row.push(code);
            }
            layout.push(row);
        }
        return layout;
    };

    const previewLayout = generateLayout(layoutRows, layoutCols);

    const handleGenerateLayout = () => {
        const layout = generateLayout(layoutRows, layoutCols);
        const layoutString = layout.map((row) => row.join(', ')).join('\n');
        eventForm.setData('layout_rows', layoutString);
        console.log('Layout generated:', layoutString);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['stats', 'bookings'],
                preserveScroll: true,
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleEventSubmit = (e) => {
        e.preventDefault();

        // Validate required fields
        if (!eventForm.data.name || !eventForm.data.start_date || !eventForm.data.end_date) {
            alert('Silakan isi: Nama Event, Tanggal Mulai, dan Tanggal Selesai');
            return;
        }

        const layout = eventForm.data.layout_rows
            .split('\n')
            .map((row) => row.split(',').map((cell) => cell.trim()).filter(Boolean))
            .filter((row) => row.length > 0);

        if (layout.length === 0) {
            alert('Silakan generate layout denah terlebih dahulu dengan klik "Buat Layout"');
            return;
        }

        // Gunakan Inertia form post dengan data yang sudah di-format
        eventForm.transform(() => ({
            name: eventForm.data.name,
            location: eventForm.data.location || '',
            start_date: eventForm.data.start_date,
            end_date: eventForm.data.end_date,
            layout: layout,
        })).post(route('admin.events.store'), {
            preserveScroll: true,
            onSuccess: () => {
                alert('✓ Event bazar berhasil dibuat dan denah aktif diperbarui.');
                eventForm.reset('name', 'location', 'start_date', 'end_date', 'layout_rows');
                setLayoutRows(2);
                setLayoutCols(2);
                router.reload();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                let errorMsg = 'Gagal membuat event:\n';
                for (const field in errors) {
                    const msgs = Array.isArray(errors[field]) ? errors[field].join(', ') : errors[field];
                    errorMsg += `• ${field}: ${msgs}\n`;
                }
                alert(errorMsg);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                            Admin Panel
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">
                            Dashboard Admin Bazaar
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-slate-100 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {selectedProofBooking && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
                            <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                            Preview Bukti
                                        </p>
                                        <h3 className="mt-1 text-xl font-black text-slate-900">
                                            {selectedProofBooking.user_name} — Stand {selectedProofBooking.stall_number}
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProofId(null)}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                    >
                                        Tutup
                                    </button>
                                </div>

                                <div className="bg-slate-100 p-3">
                                    <iframe
                                        src={route('admin.bookings.proof', selectedProofBooking.id)}
                                        title="Preview bukti pembayaran"
                                        className="h-[70vh] w-full rounded-2xl border-0 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Total Stand</p>
                            <p className="mt-3 text-3xl font-black text-slate-900">{stats.total_stalls ?? 0}</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Tersedia</p>
                            <p className="mt-3 text-3xl font-black text-emerald-700">{stats.available ?? 0}</p>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Pending</p>
                            <p className="mt-3 text-3xl font-black text-amber-700">{stats.pending ?? 0}</p>
                        </div>

                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Terisi</p>
                            <p className="mt-3 text-3xl font-black text-rose-700">{stats.booked ?? 0}</p>
                        </div>

                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Pendapatan</p>
                            <p className="mt-3 text-2xl font-black text-blue-700">
                                Rp {(stats.total_revenue ?? 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Kelola Event</p>
                                <h3 className="mt-2 text-2xl font-black text-slate-900">Buat Event Bazaar Baru</h3>
                            </div>
                        </div>

                        <form onSubmit={handleEventSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Nama Event <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    required
                                    value={eventForm.data.name}
                                    onChange={(e) => eventForm.setData('name', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="Contoh: Bazaar Nusantara"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Lokasi</label>
                                <input
                                    value={eventForm.data.location}
                                    onChange={(e) => eventForm.setData('location', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="Contoh: Bandung"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Tanggal Mulai <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    required
                                    type="date"
                                    value={eventForm.data.start_date}
                                    onChange={(e) => eventForm.setData('start_date', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Tanggal Selesai <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    required
                                    type="date"
                                    value={eventForm.data.end_date}
                                    onChange={(e) => eventForm.setData('end_date', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Layout Denah <span className="text-rose-600">*</span>
                                </label>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold text-slate-600">Jumlah Baris</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="26"
                                                value={layoutRows}
                                                onChange={(e) => setLayoutRows(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold text-slate-600">Kolom per Baris</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={layoutCols}
                                                onChange={(e) => setLayoutCols(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={handleGenerateLayout}
                                                className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 active:scale-95"
                                            >
                                                Buat Layout
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p className="mb-3 text-xs font-semibold text-slate-600">Preview ({layoutRows} Baris × {layoutCols} Kolom):</p>
                                        <div className="space-y-2 rounded-lg bg-white p-3">
                                            {previewLayout.map((row, rowIndex) => (
                                                <div key={rowIndex} className="flex flex-wrap gap-1">
                                                    {row.map((code) => (
                                                        <span
                                                            key={code}
                                                            className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700"
                                                        >
                                                            {code}
                                                        </span>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">Ubah jumlah baris/kolom dan klik "Buat Layout" untuk update preview dan form denah.</p>
                                    </div>

                                    {eventForm.data.layout_rows && (
                                        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                            <p className="mb-2 text-xs font-semibold text-emerald-700">✓ Layout Denah Siap Dikirim:</p>
                                            <div className="whitespace-pre-wrap rounded-lg bg-white p-2 text-xs font-mono text-slate-700">
                                                {eventForm.data.layout_rows}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={eventForm.processing}
                                    className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {eventForm.processing ? 'Menyimpan...' : 'Simpan Event & Denah'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Ringkasan Pembayaran</p>
                                    <h3 className="mt-2 text-2xl font-black text-slate-900">Hasil Bayaran User</h3>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-emerald-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Sudah Bayar</p>
                                    <p className="mt-3 text-3xl font-black text-emerald-700">
                                        {bookings.filter((booking) => booking.payment_status === 'paid').length}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-amber-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Belum Bayar</p>
                                    <p className="mt-3 text-3xl font-black text-amber-700">
                                        {bookings.filter((booking) => booking.payment_status !== 'paid').length}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Metode Pembayaran</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {['cash_on_site', 'bank_transfer', 'dana', 'gopay', 'shopeepay', 'ovo', 'linkaja', 'credit_card']
                                        .map((method) => {
                                            const total = bookings.filter((booking) => booking.payment_method === method).length;
                                            if (!total) return null;
                                            return (
                                                <span key={method} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                                                    {method}: {total}
                                                </span>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Bukti Pembayaran</p>
                            <h3 className="mt-2 text-2xl font-black text-slate-900">Verifikasi Bukti User</h3>
                            <div className="mt-5 space-y-3">
                                {bookings.filter((booking) => booking.payment_proof_name).length === 0 ? (
                                    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Belum ada bukti pembayaran yang dikirim.</div>
                                ) : (
                                    bookings
                                        .filter((booking) => booking.payment_proof_name)
                                        .map((booking) => (
                                            <div key={booking.id} className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{booking.user_name}</p>
                                                    <p className="text-xs text-slate-500">Stand {booking.stall_number} • {booking.payment_method}</p>
                                                    <p className="text-xs text-slate-500">{booking.payment_proof_name}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProofId(booking.id)}
                                                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                                                >
                                                    Lihat Bukti
                                                </button>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <h3 className="text-xl font-black text-slate-900">Event Bazaar Aktif</h3>
                        </div>

                        {events.length === 0 ? (
                            <div className="p-5 text-sm text-slate-500">Belum ada event bazar yang dibuat.</div>
                        ) : (
                            <div className="space-y-4 p-5">
                                {events.map((eventItem) => (
                                    <div key={eventItem.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-lg font-black text-slate-900">{eventItem.name}</p>
                                                <p className="text-sm text-slate-500">{eventItem.location || 'Lokasi belum diatur'}</p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${eventItem.is_active ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'}`}>
                                                {eventItem.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Organizer: <span className="font-semibold text-slate-800">{eventItem.organizer_name}</span>
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {eventItem.start_date ? new Date(eventItem.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                            {' '} sampai {' '}
                                            {eventItem.end_date ? new Date(eventItem.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                        </p>
                                        {eventItem.layout && eventItem.layout.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {eventItem.layout.map((row, rowIndex) => (
                                                    <div key={`${eventItem.id}-${rowIndex}`} className="flex flex-wrap gap-2">
                                                        {row.map((stallCode) => (
                                                            <span key={`${eventItem.id}-${rowIndex}-${stallCode}`} className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm">
                                                                {stallCode}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <h3 className="text-xl font-black text-slate-900">Booking Terbaru</h3>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-sm text-slate-500">Belum ada booking masuk.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                                Booking #{booking.id}
                                            </p>
                                            <h4 className="mt-2 text-xl font-black text-slate-900">
                                                {booking.user_name} — Stand {booking.stall_number}
                                            </h4>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {new Date(booking.booking_date).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                                    Metode: {booking.payment_method || 'Belum dipilih'}
                                                </span>
                                                {booking.payment_proof_name ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedProofId(booking.id)}
                                                        className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700 hover:bg-emerald-200"
                                                    >
                                                        Lihat Bukti: {booking.payment_proof_name}
                                                    </button>
                                                ) : (
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                                        Bukti: Belum ada
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl bg-slate-100 px-3 py-2 text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Nilai</p>
                                                <p className="text-base font-black text-slate-800">
                                                    Rp {Number(booking.price || 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>

                                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${booking.payment_status === 'paid' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                                                {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
