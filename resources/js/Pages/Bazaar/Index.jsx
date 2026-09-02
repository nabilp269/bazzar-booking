import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';

export default function Index({ auth, stalls = [], event = {} }) {
    const form = useForm({ stall_id: '' });
    const [selectedStallId, setSelectedStallId] = useState(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());
    const page = usePage();
    const flash = page.props.flash || {};

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['stalls'],
                preserveScroll: true,
                onSuccess: () => {
                    setLastUpdatedAt(new Date());
                },
            });
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const totalStalls = stalls.length;
    const availableStalls = stalls.filter((stall) => stall.status === 'available').length;
    const pendingStalls = stalls.filter((stall) => stall.status === 'pending').length;
    const bookedStalls = stalls.filter((stall) => stall.status === 'booked').length;
    const selectedStall = stalls.find((stall) => stall.id === selectedStallId) || null;

    function handleSelectStall(stall) {
        if (stall.status !== 'available') {
            return;
        }

        setSelectedStallId(stall.id);
    }

    function handleConfirmBooking() {
        if (!selectedStall) {
            return;
        }

        const message = `Apakah Anda yakin ingin memesan Stand ${selectedStall.stall_number}?`;

        if (!window.confirm(message)) {
            return;
        }

        form.setData('stall_id', selectedStall.id);

        form.post(route('bazaar.book'), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedStallId(null);
                setLastUpdatedAt(new Date());
                router.reload({
                    only: ['stalls'],
                    preserveScroll: true,
                });
            },
            onError: () => {
                setSelectedStallId(null);
            },
        });
    }

    function cardClass(status, isSelected = false) {
        if (status === 'available') {
            return isSelected
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-lg ring-2 ring-emerald-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100 cursor-pointer';
        }

        if (status === 'pending') {
            return 'border-amber-200 bg-amber-50 text-amber-900 cursor-not-allowed opacity-90';
        }

        if (status === 'booked') {
            return 'border-rose-200 bg-rose-50 text-rose-900 cursor-not-allowed opacity-90';
        }

        return 'border-slate-200 bg-slate-100 text-slate-700';
    }

    function badgeClass(status) {
        if (status === 'available') return 'bg-emerald-600 text-white';
        if (status === 'pending') return 'bg-amber-500 text-white';
        if (status === 'booked') return 'bg-rose-500 text-white';
        return 'bg-slate-500 text-white';
    }

    function statusLabel(status) {
        if (status === 'available') return 'Tersedia';
        if (status === 'pending') return 'Menunggu';
        if (status === 'booked') return 'Terisi';
        return 'Tidak diketahui';
    }

    const steps = [
        'Pilih nomor stand yang kosong',
        'Cek ringkasan pemesanan',
        'Konfirmasi dan lanjutkan pembayaran',
    ];

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                            Booking Bazaar
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">
                            Pusat Penyewaan Stand Bazaar
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold uppercase text-emerald-800">
                            Sistem Aktif
                        </span>
                        <span className="text-[10px] text-emerald-700">
                            {lastUpdatedAt.toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            })}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Booking Bazaar" />

            <div className="min-h-screen bg-slate-100 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash.success && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
                            <p className="font-bold">Berhasil</p>
                            <p className="text-sm">{flash.success}</p>
                        </div>
                    )}

                    {flash.error && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
                            <p className="font-bold">Terjadi Kesalahan</p>
                            <p className="text-sm">{flash.error}</p>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
                        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
                                        Informasi Booking
                                    </p>
                                    <h3 className="mt-3 text-3xl font-black leading-tight">
                                        Pilih stand yang ideal untuk bisnis Anda.
                                    </h3>
                                </div>
                                <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl md:flex">
                                    🏪
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                {steps.map((step, index) => (
                                    <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                                            0{index + 1}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-100">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            {selectedStall ? (
                                <>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Stand Terpilih
                                    </p>
                                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
                                        <div>
                                            <p className="text-sm text-emerald-700">Nomor Stand</p>
                                            <p className="text-2xl font-black text-emerald-900">
                                                {selectedStall.stall_number}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                                Harga
                                            </p>
                                            <p className="text-base font-black text-slate-800">
                                                Rp {Number(selectedStall.price || 0).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleConfirmBooking}
                                        disabled={form.processing}
                                        className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {form.processing ? 'Memproses...' : 'Konfirmasi Pemesanan'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedStallId(null)}
                                        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Pilih Lagi
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Status Hari Ini
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                                            <span className="text-sm text-slate-600">Tersedia</span>
                                            <span className="text-xl font-black text-emerald-600">{availableStalls}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                                            <span className="text-sm text-slate-600">Pending</span>
                                            <span className="text-xl font-black text-amber-500">{pendingStalls}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                                            <span className="text-sm text-slate-600">Terisi</span>
                                            <span className="text-xl font-black text-rose-500">{bookedStalls}</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-slate-500">
                                        Pilih salah satu stand hijau di layout bawah untuk memulai pemesanan.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            { label: 'Total Stand', value: totalStalls, accent: 'text-slate-700', bg: 'bg-white', border: 'border-slate-200' },
                            { label: 'Tersedia', value: availableStalls, accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                            { label: 'Pending', value: pendingStalls, accent: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                            { label: 'Terisi', value: bookedStalls, accent: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
                        ].map((item) => (
                            <div key={item.label} className={`rounded-2xl border ${item.border} ${item.bg} p-5 shadow-sm`}>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                    {item.label}
                                </p>
                                <p className={`mt-3 text-3xl font-black ${item.accent}`}>{item.value}</p>
                                <p className="text-sm text-slate-500">Unit</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Jadwal Bazaar</p>
                            <h3 className="mt-3 text-2xl font-black text-slate-900">{event.name || 'Bazaar Kota'}</h3>
                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="font-semibold text-slate-700">Organizer</p>
                                    <p className="mt-1">{event.organizer_name || 'Admin'}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="font-semibold text-slate-700">Lokasi</p>
                                    <p className="mt-1">{event.location || 'Belum diatur'}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="font-semibold text-slate-700">Tanggal Mulai</p>
                                    <p className="mt-1">
                                        {event.start_date
                                            ? new Date(event.start_date).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                              })
                                            : 'Belum diatur'}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="font-semibold text-slate-700">Tanggal Selesai</p>
                                    <p className="mt-1">
                                        {event.end_date
                                            ? new Date(event.end_date).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                              })
                                            : 'Belum diatur'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Denah Penempatan Stand</p>
                            <h3 className="mt-3 text-2xl font-black text-slate-900">Layout Bazaar</h3>
                            <div className="mt-4 space-y-3">
                                {(event.layout || []).map((row, rowIndex) => (
                                    <div key={rowIndex} className="grid grid-cols-5 gap-2">
                                        {row.map((stallCode) => {
                                            const stall = stalls.find((item) => item.stall_number === stallCode);
                                            const status = stall?.status || 'available';
                                            const statusClass =
                                                status === 'available'
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                    : status === 'pending'
                                                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                                                      : 'bg-rose-100 text-rose-800 border-rose-200';

                                            return (
                                                <div
                                                    key={stallCode}
                                                    className={`rounded-xl border px-2 py-3 text-center text-sm font-bold ${statusClass}`}
                                                >
                                                    {stallCode}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Layout Stand Bazaar</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Klik stand yang masih tersedia untuk melanjutkan pemesanan.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                                        <span>Tersedia</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                                        <span>Pending</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                                        <span>Terisi</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {stalls.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                                    🏪
                                </div>
                                <h3 className="mt-4 text-xl font-black text-slate-800">Belum Ada Stand</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Data stand masih kosong. Silakan tambah data stand terlebih dahulu.
                                </p>
                            </div>
                        ) : (
                            <div className="p-5">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                    {stalls.map((stall) => {
                                        const price = Number(stall.price) || 0;
                                        const isSelected = selectedStallId === stall.id;
                                        const isAvailable = stall.status === 'available';

                                        return (
                                            <button
                                                key={stall.id}
                                                type="button"
                                                disabled={!isAvailable || form.processing}
                                                onClick={() => handleSelectStall(stall)}
                                                className={`flex min-h-[180px] flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${cardClass(stall.status, isSelected)}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-xl shadow-sm">
                                                        🏪
                                                    </div>
                                                    {isSelected && (
                                                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                                                            Dipilih
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-lg font-black">Stand {stall.stall_number}</p>
                                                    <p className="mt-1 text-xs font-medium opacity-80">
                                                        Rp {price.toLocaleString('id-ID')}
                                                    </p>
                                                </div>

                                                <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${badgeClass(stall.status)}`}>
                                                    {statusLabel(stall.status)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}