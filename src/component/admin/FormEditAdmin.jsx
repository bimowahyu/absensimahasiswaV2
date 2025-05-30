import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

export const FormEditAdmin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { id } = useParams(); 

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${getApiBaseUrl()}/users/${id}`, { withCredentials: true });
        const user = response.data;
        // Isi state dengan data pengguna
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
      } catch (error) {
        setMsg("Gagal mengambil data pengguna");
      }
    };

    fetchUserData();
  }, [id]);

  const updateUser = async (e) => {
    e.preventDefault();
    if (password !== confPassword) {
        setMsg('Password Konfirmasi tidak cocok');
        return;
    }

    try {
      await axios.put(`${getApiBaseUrl()}/users/${id}`, {
        name: name,
        email: email,
        role: role,
        password: password,
        confPassword: confPassword,
      }, { withCredentials: true });
      navigate('/admin/data');
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg || "Terjadi kesalahan");
      } else {
        setMsg("Terjadi kesalahan");
      }
    }
};

  return (
    <div>
      <div className="card is-shadowless">
        <div className="card-content">
          <div className="content">
            <p className="subtitle">Edit User</p>
            <form onSubmit={updateUser}>
              <p className="has-text-centered">{msg}</p>
              <div className="field">
                <label className="label">Name</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Email</label>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Password (Kosongkan jika tidak ingin mengubah)</label>
                <div className="control">
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="******"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Confirm Password</label>
                <div className="control">
                  <input
                    type="password"
                    className="input"
                    value={confPassword}
                    onChange={(e) => setConfPassword(e.target.value)}
                    placeholder="******"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Role</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="">Pilih Role</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="field">
                <div className="control">
                  <button type="submit" className="button is-success">
                    Update
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
