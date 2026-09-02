import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const isAdminArea = route().current('admin.dashboard');

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const shellBg = isAdminArea ? 'bg-slate-950' : 'bg-slate-100';
    const navTheme = isAdminArea
        ? 'border-slate-800 bg-slate-900 text-slate-100'
        : 'border-slate-200 bg-white text-slate-700';
    const badgeTheme = isAdminArea
        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
        : 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    const headerTheme = isAdminArea
        ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white shadow-lg shadow-emerald-950/30'
        : 'bg-white shadow';

    const navItems = !isAdminArea
        ? [
              { label: 'Dashboard', href: route('dashboard'), active: route().current('dashboard') },
              { label: 'Booking Bazaar', href: route('bazaar.index'), active: route().current('bazaar.index') },
              { label: 'My Bookings', href: route('bookings.index'), active: route().current('bookings.index') || route().current('bookings.show') },
          ]
        : [{ label: 'Admin Dashboard', href: route('admin.dashboard'), active: route().current('admin.dashboard') }];

    return (
        <div className={`min-h-screen ${shellBg}`}>
            <nav className={`${navTheme} border-b`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={isAdminArea ? route('admin.dashboard') : route('dashboard')} className="flex items-center">
                                <ApplicationLogo className={`block h-9 w-auto fill-current ${isAdminArea ? 'text-white' : 'text-gray-800'}`} />
                            </Link>

                            <div className="hidden md:flex md:items-center md:gap-2">
                                {navItems.map((item) => (
                                    <NavLink key={item.label} href={item.href} active={item.active}>
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        <div className="hidden md:flex md:items-center md:gap-3">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${badgeTheme}`}>
                                {isAdminArea ? 'Admin' : 'User'}
                            </span>

                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className={`inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium leading-4 transition duration-150 ease-in-out focus:outline-none ${isAdminArea ? 'bg-slate-800 text-slate-100 hover:text-white' : 'bg-white text-gray-500 hover:text-gray-700'}`}
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={showingNavigationDropdown ? 'block md:hidden' : 'hidden md:hidden'}>
                    <div className="space-y-1 border-t border-slate-200 bg-white px-2 pb-3 pt-2">
                        {navItems.map((item) => (
                            <ResponsiveNavLink key={item.label} href={item.href} active={item.active}>
                                {item.label}
                            </ResponsiveNavLink>
                        ))}

                        <div className="mt-3 border-t border-slate-200 pt-3">
                            <div className="px-3 pb-2">
                                <div className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${badgeTheme}`}>
                                    {isAdminArea ? 'Admin Area' : 'User Area'}
                                </div>
                                <div className="text-base font-medium text-slate-800">{user.name}</div>
                                <div className="text-sm text-slate-500">{user.email}</div>
                            </div>

                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="w-full text-left">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className={headerTheme}>
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="pb-20 md:pb-0">{children}</main>

            {!isAdminArea && (
                <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
                    <div className="grid grid-cols-3 gap-1 px-2 py-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[10px] font-semibold transition ${
                                    item.active
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                <span className="mb-1 text-base">{item.label === 'Dashboard' ? '⌂' : item.label === 'Booking Bazaar' ? '▣' : '▤'}</span>
                                <span>{item.label === 'My Bookings' ? 'Bookings' : item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
            )}
        </div>
    );
}
