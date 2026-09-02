import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">
                    Bazaar Booking
                </p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">
                    Masuk ke akun Anda
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Kelola pemesanan stand Anda dengan cepat dan aman.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-slate-600">
                            Ingat saya
                        </span>
                    </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
                            >
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <PrimaryButton className="w-full sm:w-auto" disabled={processing}>
                        Masuk
                    </PrimaryButton>
                </div>

                <div className="pt-2 text-center text-sm text-slate-500">
                    Belum punya akun?{' '}
                    <Link href={route('register')} className="font-semibold text-emerald-700 hover:text-emerald-800">
                        Daftar sekarang
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
