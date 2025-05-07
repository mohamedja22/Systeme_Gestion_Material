import React, { useState, useEffect, useRef } from "react"; 
import {Bell, User, Settings, LogOut, CheckCircle, XCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import axiosClient from "../../axios-client"; 

const TopHeader = ({ onMenuClick }) => {  
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const notifRef = useRef(null);

  // Récupération des notifications non lues
  const fetchNotifications = async () => {
    try {
      const { data } = await axiosClient.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Erreur de récupération des notifications:", error);
    }
  };

  // Marquage comme lu
  const markAsRead = async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Erreur de marquage comme lu:", error);
    }
  };

  // Marquage tout comme lu
  const markAllAsRead = async () => {
    try {
      await axiosClient.put('/notifications/read-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur de marquage global:", error);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

    const fetchUserData = async () => {
      try {
        const response = await axiosClient.get("/user");
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Erreur utilisateur:", error);
      }
    };

    fetchUserData();
    fetchNotifications();
    
    // Polling toutes les minutes
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    axiosClient.post('/logout').finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    });
  };

  return (
    <header className="bg-white border-bottom py-2 py-md-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
      <button className="btn btn-light d-md-none me-2 p-2 border-0" onClick={onMenuClick}>
        <Menu size={24} className="text-muted" />
      </button>

      <h4 className="fw-bold mb-0">Bonjour, {user?.name || "Chargement..."}</h4>

      <div className="d-flex align-items-center">
        {/* Notifications */}
        <div className="position-relative me-3 me-md-4" ref={notifRef}>
          <button
            className="btn btn-light position-relative p-2 border-0"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={24} className="text-muted" />
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-circle">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="position-absolute top-100 end-0 bg-white shadow-sm p-3 rounded"
                 style={{ width: "350px", maxWidth: "90vw", zIndex: 1000 }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Notifications</h6>
                {notifications.length > 0 && (
                  <button 
                    className="btn btn-sm btn-link text-primary p-0"
                    onClick={markAllAsRead}
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              
              <ul className="list-unstyled m-0" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <li className="text-muted py-2 text-center">Aucune notification</li>
                ) : (
                  notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className="d-flex align-items-start mb-2 p-2 rounded hover-bg"
                      role="button"
                      onClick={() => markAsRead(notif.id)}
                    >
                      {notif.data.status === "approved" ? (
                        <CheckCircle size={18} className="text-success me-2 mt-1" />
                      ) : (
                        <XCircle size={18} className="text-danger me-2 mt-1" />
                      )}
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <span className="fw-medium">{notif.data.material_name}</span>
                          <small className="text-muted">
                            {new Date(notif.created_at).toLocaleTimeString()}
                          </small>
                        </div>
                        <div className="d-flex">
                          <small className="me-2">
                            Statut: <span className="fw-medium">
                              {notif.data.status === "approved" ? "Approuvé" : "Rejeté"}
                            </span>
                          </small>
                        </div>
                        {notif.data.Justification && (
                          <small className="text-muted d-block">
                            Motif: {notif.data.Justification}
                          </small>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Menu utilisateur */}
        <div className="dropdown">
          <button
            className="dropdown-toggle d-flex align-items-center text-decoration-none bg-transparent border-0"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <User className="me-2 text-muted" size={24} />
            <span className="fw-semibold d-none d-md-inline">
              {user?.name || "Utilisateur"}
            </span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item">
                <Settings size={18} className="me-2" /> Paramètres
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                className="dropdown-item text-danger"
                onClick={handleLogout}
              >
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