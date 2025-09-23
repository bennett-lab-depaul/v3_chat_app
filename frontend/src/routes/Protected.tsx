import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useEffect } from "react";
import { Spinner } from "react-bootstrap";

// Users who are not logged in can only get to the signup or login pages
export function Protected() {
    const { user, authTokens, refresh } = useAuth();

    useEffect(() => {
        const loadUser = async () => {
            if (!user && authTokens) {
                await refresh(authTokens.refresh);
            }
        }

        loadUser();
    }, [])

    if (!user && !authTokens) {
        return <Navigate to="/login" replace />;
    }
    
    return (
        user ? <Outlet /> : <Spinner />
    );
}

// Users who are logged in already can't get to the signup or login pages
export function Unprotected() {
    const { user } = useAuth();
    return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// =======================================================================
// Patient / Caregiver
// =======================================================================
// Only caregivers can view
export function IsCaregiver() {
    const { user, profile } = useAuth();
    return (user.id === profile.caregiver.id) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
// Only patients can view
export function IsPatient() {
    const { user, profile } = useAuth();
    return (user.id === profile.plwd.id) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
