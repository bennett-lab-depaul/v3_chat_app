import { createContext, useContext, useState } from "react";
import { Spinner } from "../components/Spinner";

import { setAccess, User, Profile, getProfile } from "@/api"
import { Tokens  } from "@/api/models"
import * as authApi  from "@/api/auth";

// Create the context (describes what any component will get when it calls useAuth())
interface AuthCtx { 
    user?: User; 
    profile?: Profile, 
    authTokens: Tokens,
    login(username: string, password: string): Promise<void>; 
    refresh(refreshToken: string): Promise<void>;
    logout(): void; 
}

const AuthContext = createContext<AuthCtx>(null!);

// ====================================================================
// AuthProvider 
// ====================================================================
// Local state only holds User & Profile data, client.ts manages access tokens.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user,    setUser   ] = useState<User   >();
    const [profile, setProfile] = useState<Profile>();
    const [error,   setError  ] = useState<string >(); 
    const [authTokens, setAuthTokens] = useState(() => (localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null));
    const [loading, setLoading] = useState(false);

    // Login
    const login  = async (username: string, password: string) => {
        try {
            // POST to /token/ & get Token/User information
            setLoading(true);
            const response = await authApi.login(username, password);  // { access, user }
            setAccess(response.access);
            setUser  (response.user  ); 
            localStorage.setItem('authTokens', JSON.stringify(response));
            setAuthTokens(response);
            
            // Fetch user profile; blocks until the profile returns and we have data to populate pages
            await getProfile().then(setProfile).catch(console.error);
        } catch (err) { 
            setError((err as Error).message); 
            console.log((err as Error).message); 
            throw err; // ToDo: Add toast back here
        } finally     { setLoading(false); }
    };

    const refresh = async (refreshToken: string) => {
        try {
            const response = await authApi.refreshToken(refreshToken);
            setAccess(response.access);
            setAuthTokens(response);
            setUser(response.user);
            localStorage.setItem('authTokens', JSON.stringify(response));
            await getProfile().then(setProfile).catch(console.error);
        } catch (err) {
            setError((err as Error).message); 
            console.log((err as Error).message); 
            throw err; // ToDo: Add toast back here
        } finally     { setLoading(false); }
    }

    // Logout (reset the User and Profile to undefined)
    const logout = () => { 
        setAccess(undefined); 
        setUser(undefined); 
        setProfile(undefined); 
        localStorage.removeItem('authTokens')
        setAuthTokens(null)
    };

    // Return AuthContext
    return (
        <AuthContext.Provider value={{ user, profile, authTokens, login, refresh, logout }}>
            { loading ? <Spinner/> : children }
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
