import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import TopHeader from '../TopHeader';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../../axios-client';

const MaterialRequestForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    material_name: '',
    quantity: 1,
    justification: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRequests, setUserRequests] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      
      // Soumettre la demande
      const response =  await axiosClient.post(`/material-requests`, formData);
      
      toast.success('Demande soumise avec succès', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Réinitialiser le formulaire
      setFormData({
        material_name: '',
        quantity: 1,
        justification: ''
      });

      // Rafraîchir la liste des demandes
      fetchUserRequests();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Erreur lors de la soumission de la demande';
      setError(errorMessage);
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });

      // Si l'erreur est liée à l'authentification
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchUserRequests = async () => {
    try {
      const requests = await axiosClient.get('/material-requests');
      setUserRequests(requests);
    } catch (err) {
      console.error('Erreur lors du chargement des demandes:', err);
      
      toast.error('Erreur lors du chargement des demandes', {
        position: "top-right",
        autoClose: 5000,
      });

      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    // Charger les demandes de l'utilisateur au montage du composant
    fetchUserRequests();
  }, []);

  return (
    <div className="container-fluid p-0">
      <ToastContainer />
      <div className="row g-0">
        <div className={`col-lg-2 col-md-3 ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}>
          <Sidebar />
        </div>
        
        <div className={`col-lg-10 col-md-9 ${sidebarOpen ? 'd-none' : ''}`}>
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
                        onChange={(e) => setFormData({
                          ...formData, 
                          material_name: e.target.value
                        })}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Quantité</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={formData.quantity}
                        onChange={(e) => setFormData({
                          ...formData, 
                          quantity: parseInt(e.target.value) || 1
                        })}
                        min="1"
                        required 
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Justification</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        value={formData.justification}
                        onChange={(e) => setFormData({
                          ...formData, 
                          justification: e.target.value
                        })}
                        required 
                      />
                    </div>
                    <div className="col-12">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 w-md-auto px-4"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden></span>
                            Soumission en cours...
                          </>
                        ) : 'Soumettre la Demande'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Liste des demandes de l'utilisateur */}
                {userRequests.length > 0 && (
                  <div className="mt-5">
                    <h5 className="mb-3">Vos demandes récentes</h5>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>Matériel</th>
                            <th>Quantité</th>
                            <th>Statut</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userRequests.map((request, index) => (
                            <tr key={index}>
                              <td>{request.material_name}</td>
                              <td>{request.quantity}</td>
                              <td>
                                <span className={`badge ${
                                  request.statut === 'approuvé' ? 'bg-success' : 
                                  request.statut === 'rejeté' ? 'bg-danger' : 'bg-warning'
                                }`}>
                                  {request.statut || 'en attente'}
                                </span>
                              </td>
                              <td>{new Date(request.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestForm;