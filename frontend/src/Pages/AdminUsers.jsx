import { useEffect, useState } from "react";
import api from "../Api/Axios";
import Navbar from "../Components/Navbar";
import AdminSidebar from "../Components/AdminSidebar";
import "../Styles/Layouts.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [trainerData, setTrainerData] = useState({});

  useEffect(() => {
    api.get("/api/admin/users/")
      .then(res => setUsers(res.data.users))
      .catch(() => alert("Failed to load users"));
  }, []);

  const approveUser = async (id) => {
    try {
      await api.get(`/api/admin/users/approve/${id}/`);
      alert("User approved");

      const updated = await api.get("/api/admin/users/");
      setUsers(updated.data.users);
    } catch {
      alert("Approval failed");
    }
  };

  // 🔹 handle input change per user
  const handleTrainerChange = (userId, field, value) => {
    setTrainerData({
      ...trainerData,
      [userId]: {
        ...trainerData[userId],
        [field]: value
      }
    });
  };

  // 🔹 create trainer for specific user
  const createTrainer = async (user) => {
    const data = trainerData[user.id];

    if (!data?.trainer_id || !data?.password) {
      alert("Enter trainer ID and password");
      return;
    }

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("password", data.password);
    formData.append("trainer_id", data.trainer_id);

    try {
      const res = await api.post(
        "/api/accounts/trainer/create/",
        formData
      );
      alert(res.data.message);
    } catch {
      alert("Trainer creation failed");
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="main-content">
        <AdminSidebar />

        <div className="page-content">
          <h2>All Users</h2>

          <table border="1" width="100%" cellPadding="10">
            <thead>
              <tr>
                <th>Username</th>
                <th>Goal</th>
                <th>Status</th>
                <th>Approve</th>
                <th>Trainer ID</th>
                <th>Password</th>
                <th>Create Trainer</th>
              </tr>
            </thead>

            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.goal}</td>
                  <td>{user.approved ? "Approved" : "Pending"}</td>

                  <td>
                    {!user.approved && (
                      <button onClick={() => approveUser(user.id)}>
                        Approve
                      </button>
                    )}
                  </td>

                  {/* Trainer ID input */}
                  <td>
                    <input
                      placeholder="T001"
                      onChange={(e) =>
                        handleTrainerChange(
                          user.id,
                          "trainer_id",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* Trainer Password input */}
                  <td>
                    <input
                      type="password"
                      placeholder="Password"
                      onChange={(e) =>
                        handleTrainerChange(
                          user.id,
                          "password",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  {/* Create Trainer button */}
                  <td>
                    <button onClick={() => createTrainer(user)}>
                      Create Trainer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

      <div className="footer">© GymTracker 2026</div>
    </div>
  );
}

export default AdminUsers;