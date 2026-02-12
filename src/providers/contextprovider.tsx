'use client'
import { AuthProvider } from "@/contexts/AuthContext"
import { CreditProvider } from "@/contexts/CreditContext"
import { EngagementProvider } from "@/contexts/EngagementContext"
import { SettingProvider } from "@/contexts/SettingContext"
import { WSProvider } from "@/contexts/SocketContext"
import { UserDataProvider } from "@/contexts/userDataContext"

const PRIVY_CONFIGURED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

const ContextProvider = ({ children }: any) => {
    // When Privy is not configured, skip Auth/WS/UserData providers
    // that depend on usePrivy() hook
    if (!PRIVY_CONFIGURED) {
        return (
            <SettingProvider>
                <CreditProvider>
                    <EngagementProvider>
                        {children}
                    </EngagementProvider>
                </CreditProvider>
            </SettingProvider>
        )
    }

    return (
        <SettingProvider>
            <AuthProvider>
                <CreditProvider>
                <EngagementProvider>
                <UserDataProvider>
                    <WSProvider>
                        {children}
                    </WSProvider>
                </UserDataProvider>
                </EngagementProvider>
                </CreditProvider>
            </AuthProvider>
        </SettingProvider>
    )
}

export default ContextProvider
