// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link" activeClassName="active">Dashboard</NavLink>
        <NavLink to="/courses" className="sidebar-link" activeClassName="active">Courses</NavLink>
        <NavLink to="/quizzes" className="sidebar-link" activeClassName="active">Quizzes</NavLink>
        <NavLink to="/attendance" className="sidebar-link" activeClassName="active">Attendance</NavLink>
        <NavLink to="/profile" className="sidebar-link" activeClassName="active">Profile</NavLink>
      </nav>
    </aside>
  );
}
