import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';

function formatDate(d) {
    if (!d) return 'Belum diatur';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPrice(p) {
    return 'Rp ' + Number(p || 0).toLocaleString('id-ID');
}

// ─── Event Card ─────────────────────────────────────────────────────────────

function EventCard({ event, onSelect }) {
    const available = event.stats?.available ?? 0;
    const total     = event.stats?.total ?? 0;
    const pct       = total > 0 ? Math.round((available / total) * 100) : 0;

    return (
        <button
            type="button"
            onClick={() => onSelect(event)}
            className="group w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:border-emerald-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-3xl group-hover:bg-emerald-100">
                    🏪
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">
                    Aktif
                </span>
            </div>

            <div className="mt-4">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-800">
                    {event.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{event.location}</p>
            </div>

            <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                    <span>📅</span>
                    <span>{formatDate(event.start_date)} — {formatDate(event.end_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <span>👤</span>
                    <span>Organizer: <strong className="text-slate-800">{event.organizer_name}</strong></span>
                </div>
            </div>

            <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Ketersediaan Stand</span>
                    <span className="text-emerald-700">{available} / {total} tersedia</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div
                        className="h-2 rounded-full bg-emerald-500 transition-all"
                        style={{ width: pct + '%' }}
                    />
                </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 text-sm font-bold text-emerald-700">
                Lihat Stand
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );
}

// ─── Stall Grid ──────────────────────────────────────────────────────────────

function StallGrid({ event, onBack }) {
    const page  = usePage();
    const flash = page.props.flash || {};
    const form  = useForm({ stall_id: '' });
    const [selectedStallId, setSelectedStallId] = useState(null);
    const [lastUpdatedAt, setLastUpdatedAt]      = useState(new Date());
    const [localStalls, setLocalStalls]          = useState(event.stalls || []);

    useEffect(() => {
        setLocalStalls(event.stalls || []);
    }, [event.stalls]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['events'],
                preserveScroll: true,
                onSuccess: () => setLastUpdatedAt(new Date()),
            });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const selectedStall = localStalls.find((s) => s.id === selectedStallId) || null;
    const available     = localStalls.filter((s) => s.status === 'available').length;
    const pending       = localStalls.filter((s) => s.status === 'pending').length;
    const booked        = localStalls.filter((s) => s.status === 'booked').length;

    function handleSelectStall(stall) {
        if (stall.status !== 'available') return;
        setSelectedStallId(stall.id);
    }

    function handleConfirmBooking() {
        if (!selectedStall) return;
        if (!window.confirm(
            'Pesan Stand ' + selectedStall.stall_number +
            ' seharga ' + formatPrice(selectedStall.price) + '?'
        )) return;
        form.setData('stall_id', selectedStall.id);
        form.post(route('bazaar.book'), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedStallId(null);
                router.reload({ only: ['events'], preserveScroll: true });
            },
            onError: () => setSelectedStallId(null),
        });
    }

    function cardClass(status, isSelected) {
        if (status === 'available') {
            return isSelected
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-lg ring-2 ring-emerald-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100 cursor-pointer';
        }
        if (status === 'pending') return 'border-amber-200 bg-amber-50 text-amber-900 cursor-not-allowed opacity-80';
        if (status === 'booked')  return 'border-rose-200 bg-rose-50 text-rose-900 cursor-not-allowed opacity-80';
        return 'border-slate-200 bg-slate-100 text-slate-700';
    }
    function badgeClass(status) {
        if (status === 'available') return 'bg-emerald-600 text-white';
        if (status === 'pending')   return 'bg-amber-500 text-white';
        if (status === 'booked')    return 'bg-rose-500 text-white';
        return 'bg-slate-500 text-white';
    }
    function statusLabel(status) {
        if (status === 'available') return 'Tersedia';
        if (status === 'pending')   return 'Pending';
        if (status === 'booked')    return 'Terisi';
        return '—';
    }

    return (
        <div className="space-y-6">
            {flash.success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                    <p className="font-bold">Berhasil</p>
                    <p className="text-sm">{flash.success}</p>
                </div>
            )}
            {flash.error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                    <p className="font-bold">Terjadi Kesalahan</p>
                    <p className="text-sm">{flash.error}</p>
                </div>
            )}

            {/* Event info banner */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-white transition"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Pilih event lain
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                            Event Terpilih
                        </p>
                        <h3 className="mt-2 text-3xl font-black leading-tight">{event.name}</h3>
                        <p className="mt-1 text-emerald-200">{event.location}</p>
                    </div>
                    <div className="hidden shrink-0 items-center justify-center rounded-2xl bg-white/10 p-4 text-3xl md:flex">
                        🏪
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Tanggal Mulai</p>
                        <p className="mt-1 text-sm font-semibold text-white">{formatDate(event.start_date)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Tanggal Selesai</p>
                        <p className="mt-1 text-sm font-semibold text-white">{formatDate(event.end_date)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Organizer</p>
                        <p className="mt-1 text-sm font-semibold text-white">{event.organizer_name}</p>
                    </div>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Total',    value: localStalls.length, color: 'text-slate-700',   bg: 'bg-white',      border: 'border-slate-200'   },
                    { label: 'Tersedia', value: available,           color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                    { label: 'Pending',  value: pending,             color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
                    { label: 'Terisi',   value: booked,              color: 'text-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-200'    },
                ].map((item) => (
                    <div key={item.label} className={'rounded-2xl border ' + item.border + ' ' + item.bg + ' p-4 shadow-sm'}>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                        <p className={'mt-2 text-3xl font-black ' + item.color}>{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Booking panel + compact layout */}
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* Booking confirmation panel */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    {selectedStall ? (
                        <>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                Stand Terpilih
                            </p>
                            <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-emerald-700">Nomor Stand</p>
                                        <p className="text-2xl font-black text-emerald-900">
                                            {selectedStall.stall_number}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                                        <p className="text-[10px] font-bold uppercase text-slate-400">Harga</p>
                                        <p className="text-base font-black text-slate-800">
                                            {formatPrice(selectedStall.price)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleConfirmBooking}
                                disabled={form.processing}
                                className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                                Cara Booking
                            </p>
                            <ol className="mt-3 space-y-2 text-sm text-slate-600">
                                {[
                                    'Klik stand hijau yang tersedia',
                                    'Cek ringkasan dan harga',
                                    'Konfirmasi pemesanan',
                                ].map((step, i) => (
                                    <li key={step} className="flex items-start gap-2">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                                            {i + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                            <p className="mt-4 text-xs text-slate-400">
                                Update otomatis •{' '}
                                {lastUpdatedAt.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </p>
                        </>
                    )}
                </div>

                {/* Compact layout map */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4">
                        <h3 className="text-base font-black text-slate-900">Peta Stand</h3>
                        <p className="mt-0.5 text-xs text-slate-500">Klik stand hijau</p>
                    </div>
                    {localStalls.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">Belum ada stand.</div>
                    ) : (
                        <div className="p-4">
                            <div className="flex flex-wrap gap-1.5">
                                {localStalls.map((stall) => {
                                    const isSelected  = selectedStallId === stall.id;
                                    const isAvailable = stall.status === 'available';
                                    const colorClass  = stall.status === 'available'
                                        ? (isSelected
                                            ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200')
                                        : stall.status === 'pending'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800';
                                    return (
                                        <button
                                            key={stall.id}
                                            type="button"
                                            disabled={!isAvailable || form.processing}
                                            onClick={() => handleSelectStall(stall)}
                                            className={'rounded-lg border px-2 py-1.5 text-xs font-bold transition ' + colorClass + (!isAvailable ? ' cursor-not-allowed opacity-75' : ' cursor-pointer')}
                                        >
                                            {stall.stall_number}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold text-slate-500">
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Tersedia</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Pending</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Terisi</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full stall grid */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                    <h3 className="text-xl font-black text-slate-900">Semua Stand — {event.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Klik stand hijau untuk memulai pemesanan.
                    </p>
                </div>

                {localStalls.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                            🏪
                        </div>
                        <h3 className="mt-4 text-xl font-black text-slate-800">Belum Ada Stand</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Stand untuk event ini belum tersedia.
                        </p>
                    </div>
                ) : (
                    <div className="p-5">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {localStalls.map((stall) => {
                                const isSelected  = selectedStallId === stall.id;
                                const isAvailable = stall.status === 'available';
                                return (
                                    <button
                                        key={stall.id}
                                        type="button"
                                        disabled={!isAvailable || form.processing}
                                        onClick={() => handleSelectStall(stall)}
                                        className={'flex min-h-[160px] flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ' + cardClass(stall.status, isSelected)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-lg shadow-sm">
                                                🏪
                                            </div>
                                            {isSelected && (
                                                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                                                    Dipilih
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-base font-black">
                                                Stand {stall.stall_number}
                                            </p>
                                            <p className="mt-1 text-xs font-medium opacity-75">
                                                {formatPrice(stall.price)}
                                            </p>
                                        </div>
                                        <span className={'inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ' + badgeClass(stall.status)}>
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
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Index({ events = [] }) {
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Sync selected event with fresh server data after auto-reload
    useEffect(() => {
        if (selectedEvent) {
            const fresh = events.find((e) => e.id === selectedEvent.id);
            if (fresh) setSelectedEvent(fresh);
        }
    }, [events]);

    const isEventView = selectedEvent !== null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                            {isEventView ? selectedEvent.name : 'Booking Bazaar'}
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">
                            {isEventView ? 'Pilih Stand' : 'Daftar Event Bazaar'}
                        </h2>
                    </div>

                    {isEventView && (
                        <button
                            type="button"
                            onClick={() => setSelectedEvent(null)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            ← Event Lain
                        </button>
                    )}
                </div>
            }
        >
            <Head title={isEventView ? selectedEvent.name : 'Booking Bazaar'} />

            <div className="min-h-screen bg-slate-100 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {isEventView ? (
                        <StallGrid
                            event={selectedEvent}
                            onBack={() => setSelectedEvent(null)}
                        />
                    ) : events.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl">
                                🏪
                            </div>
                            <h3 className="mt-6 text-2xl font-black text-slate-800">
                                Belum Ada Event Aktif
                            </h3>
                            <p className="mt-3 text-slate-500">
                                Admin belum membuat event bazaar. Coba lagi nanti.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">
                                {events.length} event aktif tersedia. Pilih event yang ingin kamu ikuti.
                            </p>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onSelect={setSelectedEvent}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
