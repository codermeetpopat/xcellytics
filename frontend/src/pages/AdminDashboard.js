import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:1000/api/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: "", email: "" });
  };

  const handleUpdateUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:1000/api/auth/users/${userId}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditingUser(null);
      fetchUsers(); // Refresh the users list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:1000/api/auth/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchUsers(); // Refresh the users list
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage Users</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  {editingUser === user._id ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleFormChange}
                      className="edit-input"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingUser === user._id ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleFormChange}
                      className="edit-input"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  {editingUser === user._id ? (
                    <div className="edit-actions">
                      <button
                        onClick={() => handleUpdateUser(user._id)}
                        className="save-btn"
                      >
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(user)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="no-users">No users found.</div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
