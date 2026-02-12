'use client'
import Link from "next/link";
import { XIcon } from "../icos/svg";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { CreditBalance } from "../wallet/CreditBalance";
import { XPBar } from "../engagement/XPBar";
import { StreakIndicator } from "../engagement/StreakIndicator";
import { useState } from "react";

const WalletConnectModal = dynamic(() => import("../modal/walletConnectModal"), { ssr: false });
const PRIVY_CONFIGURED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

const games = [
    { name: 'Crash', href: '/crash', emoji: '🚀' },
    { name: 'Tigrinho', href: '/tigrinho', emoji: '🐯' },
    { name: 'Coinflip', href: '/coinflip', emoji: '🪙' },
    { name: 'Mines', href: '/mines', emoji: '💣' },
    { name: 'Dice', href: '/dice', emoji: '🎲' },
];

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col w-full fixed top-0 left-0 z-50">
            {/* Top bar - social links */}
            <div className="items-center w-full h-[36px] bg-black/90 flex shrink-0 px-4 md:px-6 gap-2">
                <div className="flex gap-1 md:gap-2.5">
                    <Link href={"https://x.com/cornel_p"} target="_blank" className="group relative overflow-hidden transition duration-300 bg-[#303030] text-sm font-medium h-6 w-6 p-0 min-w-0 flex items-center justify-center text-white/50 hover:text-white rounded-[6px] cursor-pointer">
                        <XIcon />
                    </Link>
                    <Link href={"https://x.com/cornel_p"} target="_blank" className="group relative overflow-hidden transition duration-300 bg-[#303030] text-sm font-medium h-6 w-6 p-0 min-w-0 flex items-center justify-center text-white/50 hover:text-white rounded-[6px] cursor-pointer">
                        <DiscordLogoIcon />
                    </Link>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <StreakIndicator />
                    <XPBar />
                </div>
            </div>

            {/* Main nav */}
            <div className="flex items-center h-[64px] justify-between w-full px-4 md:px-6 bg-black/80 backdrop-blur-md border-b border-white/5">
                {/* Logo + Games */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <img src="/caramelo.png" alt="Caramelo" className="w-10 h-10 rounded-full object-cover" />
                        <span className="hidden sm:block text-lg font-bold text-[#ff4444]">Caramelo</span>
                    </Link>

                    {/* Desktop game links */}
                    <div className="hidden md:flex items-center gap-1">
                        {games.map((game) => (
                            <Link key={game.href} href={game.href}>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                    <span className="text-sm">{game.emoji}</span>
                                    <span className="uppercase text-sm font-bold bg-gradient-to-r from-primary-100 via-primary-50 to-primary-200 bg-clip-text text-transparent">
                                        {game.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <CreditBalance />
                    {PRIVY_CONFIGURED && <WalletConnectModal />}

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden flex flex-col gap-1 p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className={`block w-5 h-0.5 bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`block w-5 h-0.5 bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
                    <div className="flex flex-col gap-1">
                        {games.map((game) => (
                            <Link
                                key={game.href}
                                href={game.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <span className="text-xl">{game.emoji}</span>
                                <span className="text-white font-semibold">{game.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
