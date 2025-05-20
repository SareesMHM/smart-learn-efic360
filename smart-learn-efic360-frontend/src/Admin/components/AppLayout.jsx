// src/components/AppLayout.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/AppLayout.scss';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <Sidebar />
      <main className="app-layout__content">{children}</main>
    </div>
  );
}
