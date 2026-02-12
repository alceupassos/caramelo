'use client'
import React from "react";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import ContextProvider from "./contextprovider";
import { PrivyProvider } from "@privy-io/react-auth";
import { ModalProvider } from "@/contexts/modalContext";
import {toSolanaWalletConnectors} from "@privy-io/react-auth/solana";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

const InnerApp = ({ children }: { children: React.ReactNode }) => {
    return (
        <HeroUIProvider>
            <ContextProvider>
                <ModalProvider>
                    <main className="dark text-foreground bg-background">
                        <ToastProvider placement="top-right" />
                        {children}
                    </main>
                </ModalProvider>
            </ContextProvider>
        </HeroUIProvider>
    );
};

const Provider = ({ children }: any) => {
    // Privy requires a valid app ID - skip it entirely if not configured
    if (!PRIVY_APP_ID) {
        return <InnerApp>{children}</InnerApp>;
    }

    return (
        <PrivyProvider
            appId={PRIVY_APP_ID}
            clientId={PRIVY_CLIENT_ID}
            config={{
                "appearance": {
                    "accentColor": "#8A0000",
                    "theme": "#FFFFFF",
                    "showWalletLoginFirst": true,
                    logo: "https://lavender-necessary-trout-238.mypinata.cloud/ipfs/bafkreifjiniza7k2btq5jzpu355k6qvpgqhpspmgvc5tm44couwo3ngiru",
                    "walletChainType": "solana-only",
                },
                "loginMethods": [
                    "wallet"
                ],
                "fundingMethodConfig": {
                    "moonpay": {
                        "useSandbox": true
                    }
                },
                "embeddedWallets": {
                    "requireUserPasswordOnCreate": false,
                    "showWalletUIs": true,
                    "solana": {
                        "createOnLogin": "users-without-wallets"
                    }
                },
                externalWallets: {solana: {connectors: toSolanaWalletConnectors()}}
            }}
        >
            <InnerApp>{children}</InnerApp>
        </PrivyProvider>
    );
}

export default Provider;
