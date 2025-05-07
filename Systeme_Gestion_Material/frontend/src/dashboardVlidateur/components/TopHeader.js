import React, { useState, useEffect, useRef } from "react";
import { Bell, User, Settings, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";

const TopHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const notifRef = useRef(null);

  useEffect(() => {
    // Récupération de l'utilisateur depuis localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }

    // Récupération des nouvelles demandes de matériel
    // const fetchNotifications = async () => {
    //   try {
    //     const requests = await axiosClient.get('/material-requests');
    //     const newRequests = requests.filter(req => req.status === "En attente");
    //     setNotifications(newRequests);
    //   } catch (error) {
    //     console.error("Erreur lors de la récupération des notifications:", error);
    //   }
    // };

    // fetchNotifications();

    // Récupération du nom de l'utilisateur via API Laravel
    const fetchUserData = async () => {
      try {
        const response = await axiosClient.get("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Erreur lors de la récupération des informations utilisateur :", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white border-bottom py-2 py-md-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
      {/* Bouton menu pour mobile */}
      <button className="btn btn-light d-md-none me-2 p-2 border-0" onClick={onMenuClick}>
        <Menu size={24} className="text-muted" />
      </button>

      <h4 className="fw-bold mb-0">Bonjour, {user ? user.name : "Employé"}</h4>

      <div className="d-flex align-items-center">
        {/* Icône de Notification */}
        {/* <div className="position-relative me-3 me-md-4" ref={notifRef}>
          <button className="btn btn-light position-relative p-2 border-0" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={24} className="text-muted" />
            {notifications.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-circle">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="position-absolute top-100 end-0 bg-white shadow-sm p-3 rounded" style={{ width: "300px", maxWidth: "90vw", zIndex: 1000 }}>
              <h6 className="fw-bold">Nouvelles demandes</h6>
              <ul className="list-unstyled m-0">
                {notifications.length === 0 ? (
                  <li className="text-muted">Aucune nouvelle demande</li>
                ) : (
                  notifications.map((notif) => (
                    <li key={notif.id} className="d-flex flex-column mb-2 p-2 border-bottom">
                      <span className="fw-bold">{notif.user_name}</span>
                      <span className="text-muted">a demandé : {notif.material_name}</span>
                      <button
                        className="btn btn-link p-0 mt-1 text-primary text-start"
                        onClick={() => navigate("/nouvelle-demande")}
                      >
                        Voir la demande →
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div> */}

        {/* Dropdown Utilisateur */}
        <div className="dropdown">
          <a href="#" className="dropdown-toggle d-flex align-items-center text-decoration-none" data-bs-toggle="dropdown">
            <User className="me-2 text-muted" size={24} />
            <span className="fw-semibold d-none d-md-inline">{user ? user.name : "Utilisateur"}</span>
          </a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <a className="dropdown-item" href="#">
                <Settings size={18} className="me-2" /> Paramètres
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <LogOut size={18} className="me-2" /> Se déconnecter
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
