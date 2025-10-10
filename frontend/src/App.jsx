import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider            } from "@/context/AuthProvider";

import { Unprotected, Protected, AppLayout, IsCaregiver, IsPatient } from "@/routes";

import { Dashboard, History, ChatDetails, Chat, ProgressSummary, Goal, ChatAlbum, DaySummary, 
    WeekSummary, Analysis, Alert, Transcript, Practice, Settings } from "@/pages";
import Login           from "@/pages/Login";
import SignUp          from "@/pages/SignUp";
import Schedule        from "@/pages/Schedule";

import "./App.css";

// --------------------------------------------------------------------
// Routes and Pages
// --------------------------------------------------------------------
// ToDo: Almost all of them are shared, we just don't show everything to patients... ?
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}> 

            {/* Public Routes */}
            <Route element={ <Unprotected/> }> 
                <Route path="/login"   element={<Login  />} />
                <Route path="/signup"  element={<SignUp />} />
            </Route>

            {/* Protected Routes */}
            <Route element={ <Protected/> }>
                {/* Patient */}
                <Route element={ <IsPatient/> }>
                    <Route path="/chat" element={<Chat />} />
                </Route>

                {/* Caregiver */}
                <Route element={ <IsCaregiver /> } >
                    <Route path="/dashboard"   element={<Dashboard   />} />
                    <Route path="/chatdetails" element={<ChatDetails />} />
                    <Route path="/alert"       element={<Alert       />} />
                    <Route path="/practice"    element={<Practice    />} />
                    <Route path="/settings"    element={<Settings    />} />
                </Route>

                {/* Shared */}
                <Route path="/history"  element={<History         />} />
                <Route path="/schedule" element={<Schedule        />} />
                <Route path="/progress" element={<ProgressSummary />} />
                <Route path="/goal"     element={<Goal            />} />
                <Route path="/album"    element={<ChatAlbum       />} />
                <Route path="/week"     element={<WeekSummary     />} />
                <Route path="/day"      element={<DaySummary      />} />
                <Route path="/analysis" element={<Analysis        />} />
                <Route path="/transcript" element={<Transcript    />} />
                
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/goal" replace />} />
            
        </Route>

      </Routes>
    </AuthProvider>
  );
}
