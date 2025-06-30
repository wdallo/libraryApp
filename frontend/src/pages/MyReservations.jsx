import { useEffect, useState } from "react";
import apiClient from "../utils/apiClient";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import Card from "../components/Card";

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    // Get token from user object in localStorage/sessionStorage
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
      const response = await apiClient.get(`/api/reservations`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendReservation = async (reservationId) => {
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
      const response = await apiClient.put(
        `/api/reservations/${reservationId}/extend`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error("Error extending reservation:", error);
      alert(error.response?.data?.message || "Failed to extend reservation");
    }
  };

  const handleReturnBook = async (reservationId) => {
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }
    if (!token) return;

    if (
      !confirm(
        "Are you sure you want to request to return this book? It will need admin approval."
      )
    )
      return;

    try {
      const response = await apiClient.put(
        `/api/reservations/${reservationId}/return`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error("Error requesting book return:", error);
      alert(error.response?.data?.message || "Failed to request book return");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-black" style={{ marginTop: "-25px" }}>
        <span
          role="img"
          aria-label="Reservations"
          style={{ marginRight: "0.5rem" }}
        >
          🎟️
        </span>
        My Book Reservations
      </h2>

      {reservations.length === 0 ? (
        <div className="text-center">
          {" "}
          <img
            style={{ marginBottom: "50px" }}
            src={import.meta.env.VITE_API_URL + "/uploads/no_data.png"}
          ></img>
          <h5>No Reservations Made</h5>
          <p>You don't have any book reservations yet.</p>
          <Link to="/books" className="btn btn-dark">
            Browse Books Collection
          </Link>
        </div>
      ) : (
        <div className="books-grid">
          {reservations.map((reservation) => (
            <Card
              key={reservation._id}
              type="reservation"
              reservation={reservation}
              onExtend={handleExtendReservation}
              onReturn={handleReturnBook}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReservations;
