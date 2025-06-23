import { createContext, useMemo, type ReactNode } from 'react';

interface AuthContextType {
    authToken: string;
}

export const AuthContext = createContext<AuthContextType>({ authToken: '' });

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const authToken = import.meta.env.VITE_AUTH_TOKEN || 'stub-token';

    const value = useMemo(() => ({ authToken }), [authToken]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};