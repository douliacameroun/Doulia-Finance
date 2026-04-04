import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import Clients from './pages/Clients';
import Invoicing from './pages/Invoicing';
import Services from './pages/Services';
import Projects from './pages/Projects';
import BudgetPage from './pages/BudgetPage';
import ChatWidget from './components/ChatWidget';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-doulia-dark text-white">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulateur" element={<Simulator />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/facturation" element={<Invoicing />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projets" element={<Projects />} />
            <Route path="/budget" element={<BudgetPage />} />
          </Routes>
        </main>

        {/* Floating Assistant Widget */}
        <ChatWidget />
      </div>
    </Router>
  );
}
