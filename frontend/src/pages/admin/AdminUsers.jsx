import { useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useFormValidation from "../../hooks/useFormValidation";
import {
  ValidatedInput,
  ValidatedSelect,
} from "../../components/ValidationComponents";
import {
  faBackward,
  faBan,
  faCheck,
  faMagnifyingGlass,
  faPen,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);

  // User form validation
  const userFormValidation = useFormValidation(
    {
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
    },
    "userUpdate"
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get("/api/admin/users", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    userFormValidation.setMultipleValues({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };
  const handleUpdateUser = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate the form
    const isValid = await userFormValidation.validate();
    if (!isValid) {
      return;
    }

    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }

    if (!token) return;

    try {
      await apiClient.put(
        `/api/admin/users/${selectedUser._id}`,
        userFormValidation.values,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setShowEditModal(false);
      userFormValidation.reset();
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          if (err.path) {
            backendErrors[err.path] = [err.msg];
          }
        });
        userFormValidation.setServerErrors(backendErrors);
      } else {
        alert(error.response?.data?.message || "Failed to update user");
      }
    }
  };

  const handleBanUser = (user) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const confirmBanUser = async () => {
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }

    if (!token) return;

    try {
      await apiClient.put(
        `/api/admin/users/${selectedUser._id}/ban`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setShowBanModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error banning user:", error);
      alert(error.response?.data?.message || "Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId) => {
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }

    if (!token) return;

    try {
      await apiClient.put(
        `/api/admin/users/${userId}/unban`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      alert(error.response?.data?.message || "Failed to unban user");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">
          <FontAwesomeIcon icon={faUsers} className="me-2" />
          User Management
        </h2>
      </div>
      {/* Search */}
      <div className="row mb-4">
        <div className="col-md-9">
          <div className="input-group">
            <input
              name="search"
              type="text"
              className="form-control"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
          </div>
        </div>
        <div className="col-md-3 d-flex justify-content-end">
          <Link to={-1} className="btn btn-outline-secondary">
            <FontAwesomeIcon icon={faBackward} /> Go Back
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      {user.firstName} {user.lastName}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin" ? "bg-danger" : "bg-primary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.status === "banned" ? "bg-danger" : "bg-success"
                        }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEditUser(user)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        {user.status !== "banned" ? (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleBanUser(user)}
                            disabled={user.role === "admin"}
                          >
                            <FontAwesomeIcon icon={faBan} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleUnbanUser(user._id)}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Edit User Modal */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          userFormValidation.reset();
        }}
        title="Edit User"
        type="confirm"
        onConfirm={handleUpdateUser}
        confirmText="Update"
        confirmButtonClass="btn-primary"
        confirmDisabled={
          !userFormValidation.isValid || userFormValidation.isSubmitting
        }
      >
        <form onSubmit={handleUpdateUser}>
          <ValidatedInput
            label="First Name"
            fieldName="firstName"
            formValidation={userFormValidation}
            placeholder="Enter first name"
          />
          <ValidatedInput
            label="Last Name"
            fieldName="lastName"
            formValidation={userFormValidation}
            placeholder="Enter last name"
          />
          <ValidatedInput
            label="Email"
            fieldName="email"
            type="email"
            formValidation={userFormValidation}
            placeholder="Enter email address"
          />
          <ValidatedSelect
            label="Role"
            fieldName="role"
            formValidation={userFormValidation}
            options={[
              { value: "user", label: "User" },
              { value: "admin", label: "Admin" },
            ]}
          />
        </form>
      </Modal>
      {/* Ban User Modal */}
      <Modal
        show={showBanModal}
        onHide={() => setShowBanModal(false)}
        title="Ban User"
        type="confirm"
        onConfirm={confirmBanUser}
        confirmText="Ban User"
        confirmButtonClass="btn-danger"
      >
        <p>
          Are you sure you want to ban{" "}
          <strong>
            {selectedUser?.firstName} {selectedUser?.lastName}
          </strong>
          ?
        </p>
        <p className="text-muted">
          This will prevent them from accessing the system until they are
          unbanned.
        </p>
      </Modal>
    </div>
  );
}

export default AdminUsers;
