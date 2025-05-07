import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import PropTypes from "prop-types";
import Sidebar from "../Sidebar";
import TopHeader from "../TopHeader";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../axios-client";
import { Badge } from "react-bootstrap";

// Hook personnalisé pour gérer les demandes
const useDemandes = () => {
  const [state, setState] = useState({ demandes: [], loading: true, error: null });
  const fetchDemandes = useCallback(async (signal) => {
    try { 
      const response = await axiosClient.get('/material-requests');  
      setState(prev => ({ ...prev, demandes: response.data.data, loading: false, error: null })); 
    } catch (err) {
      if (!signal?.aborted) {
        setState(prev => ({ ...prev, loading: false, error: err.response?.data?.message || "Erreur de chargement des demandes" }));
      }}}, []);

  const updateDemandeStatus = useCallback(async (id, status, extraData = {}) => {
    const originalDemandes = state.demandes;

    setState(prev => ({ ...prev, demandes: prev.demandes.map(d => d.id === id ? { ...d, status, ...extraData } : d )}));
    try {
      await axiosClient.put(`/material-requests/${id}`, { status, ...extraData });
      return true;
    } catch (err) {
      setState(prev => ({ ...prev, demandes: originalDemandes, error: err.response?.data?.message || "Échec de la mise à jour"}));
      return false;
    }},
     [state.demandes]);

  return {
    demandes: state.demandes,
    loading: state.loading,
    error: state.error,
    fetchDemandes,
    updateDemandeStatus
  };
};

// Ligne du tableau
const TableRow = memo(({ demande, onOpenModal }) => (
  <tr>
    <td>{demande.id}</td>
    <td>{demande.user?.name || '-'}</td> 
    <td>{demande.material}</td>
    <td>{demande.quantity}</td>
    <td>{new Date(demande.created_at).toLocaleDateString()}</td>
    <td>
      <Badge bg={
        demande.status === 'approved' ? 'success' :
        demande.status === 'rejected' ? 'danger' :
        'secondary'
      }>
        {
          demande.status === 'approved' ? 'Approuvée' :
          demande.status === 'rejected' ? 'Rejetée' :
          'En attente'
        }
      </Badge>
    </td>
    <td>
      {demande.status === 'accepted' && demande.delivery_date ? (
        new Date(demande.delivery_date).toLocaleDateString()
      ) : (
        "-"
      )}
    </td>
    <td>
      {demande.status === 'rejected' && demande.rejection_reason ? (
        demande.rejection_reason
      ) : (
        "-"
      )}
    </td>
    <td>
      {demande.justification || "-"}
    </td>
    <td>
      {demande.status === 'pending' ? (
        <>
          <button className="btn btn-sm btn-outline-success me-2" onClick={() => onOpenModal(demande.id, 'accept')}>Approuver</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onOpenModal(demande.id, 'reject')}> Rejeter </button>
        </>
      ) : (
        <span className="text-muted">Action effectuée</span>
      )}
    </td>
  </tr>
));

TableRow.propTypes = {
  demande: PropTypes.shape({
    id: PropTypes.number.isRequired,
    material: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    created_at: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    justification: PropTypes.string,
    rejection_reason: PropTypes.string,
    delivery_date: PropTypes.string,
    user: PropTypes.shape({
      name: PropTypes.string
    })
  }).isRequired,
  onOpenModal: PropTypes.func.isRequired
};

// Composant principal
const Demandes = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    demandes,
    loading,
    error,
    fetchDemandes,
    updateDemandeStatus
  } = useDemandes();

  const [selectedDemandeId, setSelectedDemandeId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'accept' ou 'reject'
  const [justification, setJustification] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchDemandes(controller.signal);
    return () => controller.abort();
  }, [fetchDemandes]);

  const handleOpenModal = (id, mode) => {
    setSelectedDemandeId(id);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleSubmitModal = async () => {
    if (modalMode === 'accept') {
      await updateDemandeStatus(selectedDemandeId, "approved", {
        delivery_date: deliveryDate
      });
    } else {
      await updateDemandeStatus(selectedDemandeId, "rejected", {
        rejection_reason: justification
      });
    }
    setShowModal(false);
    setDeliveryDate('');
    setJustification('');
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const memoizedDemandes = useMemo(() => demandes, [demandes]);

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div className={`col-lg-2 col-md-3 ${sidebarOpen ? "d-block" : "d-none d-md-block"}`}>
          <Sidebar />
        </div>

        <div className={`col-lg-10 col-md-9 ${sidebarOpen ? "d-none" : ""}`}>
          <TopHeader onMenuClick={toggleSidebar} />

          <div className="container-fluid p-3 p-md-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Gestion des Demandes</h5>
              </div>

              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead> 
                        <tr>  
                          <th>ID</th>
                          <th>Demandeur</th>
                          <th>Matériel</th>
                          <th>Quantité</th>
                          <th>Date</th>
                          <th>Statut</th> 
                          <th>Date de Livraison</th>
                          <th>Motif de Rejet</th>
                          <th>Justification</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody> 
                        {memoizedDemandes.map((demande) => (
                          <TableRow
                            key={demande.id}
                            demande={demande}
                            onOpenModal={handleOpenModal}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'accept' ? 'Approuver la demande' : 'Rejeter la demande'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {modalMode === 'accept' ? (
                  <>
                    <label className="form-label">Date de livraison</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={deliveryDate} 
                      onChange={(e) => setDeliveryDate(e.target.value)} />
                  </>
                ) : (
                  <>
                    <label className="form-label">Justification du refus</label>
                    <textarea 
                      className="form-control" 
                      value={justification} 
                      onChange={(e) => setJustification(e.target.value)} >  
                    </textarea>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}> Annuler </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitModal}> Confirmer </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demandes;