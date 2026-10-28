import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import Navbar from './components/layout/Navbar';
import SessionBanner from './components/layout/SessionBanner';
import Footer from './components/layout/Footer';
import Toast from './components/common/Toast';

import ImageGenStudioPage from './pages/ImageGenStudioPage';
import DbVerificationPage from './pages/DbVerificationPage';
import AuditLogsPage from './pages/AuditLogsPage';

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-navy-950">
          {/* Top Navbar */}
          <Navbar />

          {/* Active Forensic Session / Case Bar */}
          <SessionBanner />

          {/* Router Content Viewport */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<ImageGenStudioPage />} />
              <Route path="/db-verification" element={<DbVerificationPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Forensic System Footer */}
          <Footer />

          {/* Global System Notifications / Toasts */}
          <Toast />
        </div>
      </BrowserRouter>
    </SessionProvider>
  );
}
