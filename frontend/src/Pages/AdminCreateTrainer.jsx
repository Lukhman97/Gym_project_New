import { useEffect, useState } from "react";
import api from "../Api/Axios";
import Navbar from "../Components/Navbar";

function AdminCreateTrainer() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [trainerId, setTrainerId] = useState("");

  // 🔹 Load admin-created users (GET API)
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const res = await api.get("/api/accounts/register/");
        setUsers(res.data.users);
      } catch (err) {
        alert("Failed to load admin users");
      }
    };

    fetchAdminUsers();
  }, []);

  // 🔹 Create trainer
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!selectedUser || !trainerId) {
      alert("Select user and enter trainer ID");
      return;
    }

    const formData = new FormData();
    formData.append("username", selectedUser);
    formData.append("trainer_id", trainerId);

    const res = await api.post(
      "/api/accounts/trainer/create/",
      formData
    );

    alert(res.data.message);
  };

  return (
    <div>
      <Navbar />
      <h2>Create Trainer</h2>

      <form onSubmit={handleCreate}>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select Admin User</option>
          {users.map((u, index) => (
            <option key={index} value={u.username}>
              {u.username}
            </option>
          ))}
        </select>

        <input
          placeholder="Trainer ID (T001)"
          onChange={(e) => setTrainerId(e.target.value)}
        />

        <button type="submit">Create Trainer</button>
      </form>
    </div>
  );
}

export default AdminCreateTrainer;