import React, { useState } from "react";
import Sidebar from "../Sidebar";
import TopHeader from "../TopHeader";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../axios-client";

const MaterialRequestForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    material_name: "",
    quantity: 1,
    justification: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axiosClient.post(`/material-requests`, formData) // Assurez-vous que la méthode d'API est correcte
      alert("Demande soumise avec succès");
      navigate("/suivi-demandes");
    } catch (err) {
      setError("Erreur lors de la soumission de la demande");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar - visible sur PC, cachée sur mobile */}
        <div
          className={`col-lg-2 col-md-3 ${sidebarOpen ? "d-block" : "d-none d-md-block"}`}
        >
          <Sidebar />
        </div>

        {/* Contenu principal */}
        <div className={`col-lg-10 col-md-9 ${sidebarOpen ? "d-none" : ""}`}>
          <TopHeader onMenuClick={toggleSidebar} />

          <div className="container-fluid p-3 p-md-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Nouvelle Demande de Matériel</h5>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nom du Matériel</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.material_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            material_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Quantité</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Justification</label>
                      <textarea
                        className="form-control"
                        value={formData.justification}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            justification: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary w-100 w-md-auto"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden
                            ></span>
                            Soumission en cours...
                          </>
                        ) : (
                          "Soumettre la Demande"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestForm;