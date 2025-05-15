import React from 'react';
import './styles/_header.scss';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">Smart Learn EFIC</div>
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/courses">Courses</a>
        <a href="/profile">Profile</a>
      </nav>
      <div className="user-menu">
        <span className="username">John Doe</span>
        <button>Logout</button>
      </div>
    </header>
  );
}
