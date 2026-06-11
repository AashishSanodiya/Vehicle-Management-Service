import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Components from './pages/Components';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Revenue from './pages/Revenue';
import './App.css';

const TABS = [
  { id: 'vehicles', label: '🚗 Vehicles', },
  { id: 'services', label: '🔧 Services', },
  { id: 'components', label: '⚙️ Components', },
  { id: 'revenue', label: '📊 Revenue', },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('vehicles');

  return (
    <div className="app">
      <Toaster position="top-right" />
      <header className="app-header">
        <div className="header-content">
          <h1>🔩 AutoServ</h1>
          <p>Vehicle Service Management System</p>
        </div>
      </header>
      <nav className="app-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="app-main">
        {activeTab === 'vehicles' && <Vehicles />}
        {activeTab === 'services' && <Services />}
        {activeTab === 'components' && <Components />}
        {activeTab === 'revenue' && <Revenue />}
      </main>
    </div>
  );
}
