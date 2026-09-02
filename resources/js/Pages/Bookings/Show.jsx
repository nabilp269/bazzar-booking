import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Show({ booking }) {
    const payForm = useForm({
        payment_method: 'cash_on_site',
        payment_proof: null,
    });
    const documentForm = useForm({ document: null });

    const handleDocumentSubmit = (e) => {
        e.preventDefault();
        documentForm.post(route('bookings.documents.store', booking.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                router.reload({
                    only: ['booking'],
                    preserveScroll: true,
                });
            },
        });
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        payForm.post(route('bookings.pay', booking.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                router.reload({
                    only: ['booking'],
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                            Booking Detail
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">
                            Detail Pemesanan Stand
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('bookings.index')}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Kembali
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Detail Booking" />

            <div className="min-h-screen bg-slate-100 py-8">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-emerald-800 p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                                Booking #{booking.id}
                            </p>
                            <h3 className="mt-3 text-3xl font-black">Stand {booking.stall_number}</h3>
                        </div>

                        <div className="grid gap-6 p-6 md:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Informasi Stand</p>
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Nomor Stand</span>
                                        <span className="text-lg font-black text-slate-800">{booking.stall_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Harga</span>
                                        <span className="text-lg font-black text-slate-800">
                                            Rp {Number(booking.price || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Status</span>
                                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status Pembayaran</p>
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Pembayaran</span>
                                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${booking.payment_status === 'paid' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                                            {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Booking Date</span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {new Date(booking.booking_date).toLocaleString('id-ID', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Dibuat</span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {new Date(booking.created_at).toLocaleString('id-ID', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {booking.payment_status !== 'paid' && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900">Pembayaran</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Pilih metode pembayaran. Untuk transfer bank atau e-wallet, bayar dulu melalui aplikasi/rekening tujuan, lalu unggah bukti pembayaran setelah transfer selesai.
                            </p>

                            <form onSubmit={handlePaymentSubmit} className="mt-5 space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Metode Pembayaran</label>
                                    <select
                                        value={payForm.data.payment_method}
                                        onChange={(e) => payForm.setData('payment_method', e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500"
                                    >
                                        <option value="cash_on_site">Bayar di Tempat</option>
                                        <option value="bank_transfer">Transfer Bank</option>
                                        <option value="dana">Dana</option>
                                        <option value="gopay">GoPay</option>
                                        <option value="shopeepay">ShopeePay</option>
                                        <option value="ovo">OVO</option>
                                        <option value="linkaja">LinkAja</option>
                                        <option value="credit_card">Kartu Kredit</option>
                                    </select>
                                </div>

                                {payForm.data.payment_method === 'bank_transfer' && (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                        <p className="font-bold">Instruksi pembayaran</p>
                                        <p className="mt-1">Transfer ke rekening: BCA 1234567890 a.n Bazaar Booking</p>
                                        <p className="mt-1">Jumlah: Rp {Number(booking.price || 0).toLocaleString('id-ID')}</p>
                                        <p className="mt-1">Setelah transfer, unggah bukti pembayaran di bawah ini.</p>
                                    </div>
                                )}

                                {['dana', 'gopay', 'shopeepay', 'ovo', 'linkaja', 'ewallet'].includes(payForm.data.payment_method) && (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                                        <p className="font-bold">Instruksi e-wallet</p>
                                        <p className="mt-1">Pilih aplikasi {payForm.data.payment_method.toUpperCase()} di ponsel Anda.</p>
                                        <p className="mt-1">Transfer ke nomor: 081111111111</p>
                                        <p className="mt-1">Jumlah: Rp {Number(booking.price || 0).toLocaleString('id-ID')}</p>
                                        <p className="mt-1">Setelah itu, unggah bukti pembayaran di form di bawah.</p>
                                    </div>
                                )}

                                {payForm.data.payment_method !== 'cash_on_site' && (
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">Bukti Pembayaran</label>
                                        <input
                                            type="file"
                                            onChange={(e) => payForm.setData('payment_proof', e.target.files[0])}
                                            className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                                            accept=".pdf,.png,.jpg,.jpeg"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={payForm.processing}
                                    className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {payForm.processing ? 'Mengirim Pembayaran...' : payForm.data.payment_method === 'cash_on_site' ? 'Konfirmasi Bayar di Tempat' : 'Kirim Bukti Pembayaran'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900">Unggah Dokumen</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Upload proposal, foto usaha, atau dokumen pendukung untuk verifikasi.
                            </p>

                            <form onSubmit={handleDocumentSubmit} className="mt-5 space-y-4">
                                <input
                                    type="file"
                                    onChange={(e) => documentForm.setData('document', e.target.files[0])}
                                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                />

                                <button
                                    type="submit"
                                    disabled={documentForm.processing || !documentForm.data.document}
                                    className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {documentForm.processing ? 'Mengunggah...' : 'Upload Dokumen'}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900">Dokumen Terkirim</h3>
                            <div className="mt-4 space-y-3">
                                {(booking.documents || []).length === 0 ? (
                                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                                        Belum ada dokumen yang diunggah.
                                    </p>
                                ) : (
                                    booking.documents.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{file.document_name}</p>
                                                <p className="text-xs text-slate-500">{file.mime_type}</p>
                                            </div>
                                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                                                OK
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
