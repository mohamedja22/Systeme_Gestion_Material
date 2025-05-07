import React, { useState, useEffect, useRef } from "react";
import { Bell, User, Settings, LogOut, CheckCircle, XCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";

const TopHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }

    // const fetchNotifications = async () => {
    //   try {
    //     const requests = await axiosClient.getUserRequests();
    //     const newNotifications = Array.isArray(requests)
    //       ? requests
    //          .filter(
    //            (req) => req.status === "Approuvé" || req.status === "Rejeté"
    //         ) 
    //       : [];
    //     setNotifications(newNotifications);
    //   } catch (error) {
    //     console.error("Erreur lors de la récupération des notifications:", error);
    //   }
    // };

    const fetchUserData = async () => {
      try {
        const response = await axiosClient.get("/user");  
        setUser(response.data); 
        localStorage.setItem("user", JSON.stringify(response.data));  
      } catch (error) { 
        console.error("Erreur lors de la récupération des informations utilisateur :", error);
      }
    };

    // fetchNotifications();
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
      {/* Bouton menu mobile */}
      <button className="btn btn-light d-md-none me-2 p-2 border-0" onClick={onMenuClick}>
        <Menu size={24} className="text-muted" />
      </button>

      <h4 className="fw-bold mb-0">Bonjour, {user ? user.name : "Employé"}</h4>

      <div className="d-flex align-items-center">
        {/* Icône de Notification */}
        {/* <div className="position-relative me-3 me-md-4" ref={notifRef}>
          <button className="btn btn-light position-relative p-2 border-0" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={24} className="text-muted" />
            { {notifications.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-circle">
                {notifications.length}
              </span>
            )} }
          </button>

          {{showNotifications && (
            <div className="position-absolute top-100 end-0 bg-white shadow-sm p-3 rounded" style={{ width: "300px", maxWidth: "90vw", zIndex: 1000 }}>
              <h6 className="fw-bold">Notifications</h6>
              <ul className="list-unstyled m-0">
                {notifications.length === 0 ? (
                  <li className="text-muted">Aucune notification</li>
                ) : (
                  notifications.map((notif) => (
                    <li key={notif.id} className="d-flex align-items-center mb-2">
                      {notif.status === "Approuvé" ? (
                        <CheckCircle size={18} className="text-success me-2" />
                      ) : (
                        <XCircle size={18} className="text-danger me-2" />
                      )}
                      <span className="text-truncate">{notif.material_name} - {notif.status}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}}
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
