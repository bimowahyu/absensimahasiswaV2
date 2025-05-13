import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {IoSaveOutline,IoDuplicateOutline,IoCalculatorOutline, IoStorefrontOutline, IoAccessibilityOutline, IoLocationOutline, IoCalendarOutline, IoArchive, IoPerson, IoPricetag, IoHome, IoLogOut } from "react-icons/io5";
import { useDispatch } from "react-redux";
//import { LogOut, reset } from "../fitur/AuthSlice";
import { LogOutAdmin, reset } from "../fitur/AuthSlice";
import "../component/admin/css/sideBar.css";
import { FaBars } from "react-icons/fa";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const logout = () => {
    dispatch(LogOutAdmin());
    dispatch(reset());
    navigate("/loginadmin");
  };

  return (
    <div>
      <aside className={`menu ${isOpen ? "open" : ""}`}>
        <div className="sidebar">
          <div className={`hamburger-menu ${isOpen ? "open" : ""}`} onClick={toggleSidebar}>
            <FaBars />
          </div>
          <ul className="menu-list">
            <li>
              <NavLink to="/DashboardAdmin"><IoHome /> Dashboard</NavLink>
            </li>
            <li className="dropdown">
              <NavLink to="#" onClick={toggleDropdown} className="dropdown-toggle"><IoCalendarOutline /> Data Absensi</NavLink>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <NavLink to="/data/bulanan">Bulanan</NavLink>
                  </li>
                  <li>
                    <NavLink to="/data">Data Absensi</NavLink>
                  </li>
                  <li>
                    <NavLink to="/absenmanual">Absensi Manual</NavLink>
                  </li>
                  <li>
                    <NavLink to="/editdata">Edit Absensi</NavLink>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <NavLink to="/datagaji"><IoArchive />Data Penggajian</NavLink>
            </li>
            <li>
              <NavLink to="/datagajicabang"><IoSaveOutline />Export Data Gaji</NavLink>
            </li>
            <li>
              <NavLink to="/creategaji"><IoCalculatorOutline /> Penggajian</NavLink>
            </li>
            <li>
              <NavLink to="/datalokasi"><IoLocationOutline /> Data Cabang</NavLink>
            </li>
            <li>
              <NavLink to="/datalokasi/tambah"><IoPricetag /> Tambah Data Cabang</NavLink>
            </li>
            <li>
              <NavLink to="/datamahasiswa"><IoAccessibilityOutline /> Data Mahasiswa</NavLink>
            </li>
            <li>
              <NavLink to="/mahasiswa/tambah"><IoDuplicateOutline /> Tambah Data Mahasiswa</NavLink>
            </li>
          </ul>
          <p className="menu-label">Settings</p>
          <ul className="menu-list">
            <li>
              <NavLink to="/admin"><IoPerson /> Profile</NavLink>
            </li>
            <li>
              <NavLink to="/admin/data"><IoStorefrontOutline /> Data Admin</NavLink>
            </li>
            <li>
              <button onClick={logout} className="button is-red">
                <IoLogOut /> Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
