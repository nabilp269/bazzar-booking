import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 text-white lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-3">
                                <ApplicationLogo className="h-12 w-12 fill-current text-white" />
                                <span className="text-xl font-black tracking-[0.2em] text-emerald-200">
                                    BAZAAR
                                </span>
                            </Link>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-200">
                                Booking Platform
                            </p>
                            <h1 className="mt-5 max-w-sm text-4xl font-black leading-tight">
                                Kelola stand bazaar dengan lebih cepat dan rapi.
                            </h1>
                            <p className="mt-4 max-w-md text-sm leading-6 text-slate-200">
                                Proses pemesanan, pembayaran, dan verifikasi dokumen jadi lebih mudah untuk user dan admin.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-2xl font-black text-emerald-300">10</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">Stand</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-2xl font-black text-emerald-300">24/7</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">Akses</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-2xl font-black text-emerald-300">Live</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">Status</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 lg:p-10">
                        <div className="mb-6 flex items-center justify-between lg:hidden">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <ApplicationLogo className="h-10 w-10 fill-current text-emerald-600" />
                                <span className="text-lg font-black tracking-[0.22em] text-slate-800">BAZAAR</span>
                            </Link>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
