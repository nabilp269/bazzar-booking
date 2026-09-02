import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ bookings = [] }) {
    const totalValue = bookings.reduce((sum, item) => sum + Number(item.price || 0), 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                            My Bookings
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">
                            Riwayat Pemesanan Saya
                        </h2>
                    </div>

                    <Link
                        href={route('bazaar.index')}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        + Pesan Stand Baru
                    </Link>
                </div>
            }
        >
            <Head title="Riwayat Pemesanan" />

            <div className="min-h-screen bg-slate-100 py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Total Booking</p>
                            <p className="mt-3 text-3xl font-black text-slate-900">{bookings.length}</p>
                            <p className="text-sm text-slate-500">pemesanan</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Total Nilai</p>
                            <p className="mt-3 text-3xl font-black text-emerald-700">
                                Rp {totalValue.toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-emerald-700">nilai booking</p>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Status</p>
                            <p className="mt-3 text-3xl font-black text-amber-700">
                                {bookings.filter((item) => item.payment_status === 'unpaid').length}
                            </p>
                            <p className="text-sm text-amber-700">belum dibayar</p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <h3 className="text-xl font-black text-slate-900">Daftar Pemesanan</h3>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">📋</div>
                                <h4 className="mt-4 text-xl font-black text-slate-800">Belum Ada Booking</h4>
                                <p className="mt-2 text-sm text-slate-500">
                                    Anda belum memiliki pemesanan stand bazaar.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                                Booking #{booking.id}
                                            </p>
                                            <h4 className="mt-2 text-2xl font-black text-slate-900">
                                                Stand {booking.stall_number}
                                            </h4>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {new Date(booking.booking_date).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="rounded-xl bg-slate-100 px-3 py-2 text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Harga</p>
                                                <p className="text-base font-black text-slate-800">
                                                    Rp {Number(booking.price || 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>

                                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${booking.payment_status === 'paid' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                                                {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>

                                            <Link
                                                href={route('bookings.show', booking.id)}
                                                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                                Detail
                                            </Link>
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
