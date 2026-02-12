'use client'
import { AuthProvider } from "@/contexts/AuthContext"
import { ChatMessagesProvider } from "@/contexts/ChatContext"
import { CreditProvider } from "@/contexts/CreditContext"
import { EngagementProvider } from "@/contexts/EngagementContext"
import { SettingProvider } from "@/contexts/SettingContext"
import { WSProvider } from "@/contexts/SocketContext"
import { UserDataProvider } from "@/contexts/userDataContext"

const ContextProvider = ({ children }: any) => {
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