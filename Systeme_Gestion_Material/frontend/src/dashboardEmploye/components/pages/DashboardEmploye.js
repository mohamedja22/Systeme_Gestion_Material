import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../Sidebar';
import TopHeader from '../TopHeader';
import { ClipboardList, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from 'react-bootstrap';
import axiosClient from '../../../axios-client';

const Dashboard = () => {
  const [requestStats, setRequestStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'accept' ou 'reject'
  const [justification, setJustification] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axiosClient.get('/material-requests');
        const data = response.data?.data || [];

        setRequests(data);  
        setLoading(false);  

        const stats = data.reduce((acc, req) => { 
          acc.total++;  
          switch (req.status) {
            case 'approved': acc.approved++; break;
            case 'pending': acc.pending++; break;
            case 'rejected': acc.rejected++; break;
            default: break;
          }
          return acc;
        }, { total: 0, approved: 0, pending: 0, rejected: 0 });

        setRequestStats(stats); 
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setError(err.response?.data?.message || 'Erreur de chargement des demandes');
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const updateRequestStatus = async (id, status, extraData = {}) => {
    const original = [...requests]; 
    // Save original state for rollback in case of error 
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, ...extraData } : r)); 

    try {
      const payloadStatus = status === 'accepted' ? 'approved' : status;
      await axiosClient.patch(`/material-requests/${id}`, { status: payloadStatus, ...extraData });

      // Update stats
      setRequestStats(prev => {
        const stats = { ...prev };
        const orig = original.find(r => r.id === id);
        if (orig) {
          // decrement original status
          switch (orig.status) {
            case 'approved': stats.approved--; break;
            case 'pending': stats.pending--; break;
            case 'rejected': stats.rejected--; break;
          }
          // increment new
          switch (payloadStatus) {
            case 'approved': stats.approved++; break;
            case 'pending': stats.pending++; break;
            case 'rejected': stats.rejected++; break;
          }
        }
        return stats;
      });
    } catch (err) {
      console.error('Erreur de la mise à jour:', err);
      setRequests(original);
      setError(err.response?.data?.message || 'Échec de la mise à jour');
    }
  };

  const getStatusDisplay = status => {
    switch (status) {
      case 'approved':
      case 'accepted': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'approved':
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const handleOpenModal = (id, mode) => {
    setSelectedRequestId(id);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleSubmitModal = async () => {
    if (modalMode === 'accept') { 
      await updateRequestStatus(selectedRequestId, 'accepted', { delivery_date: deliveryDate });  
    } else {  
      await updateRequestStatus(selectedRequestId, 'rejected', { rejection_reason: justification });  
    } 
    setShowModal(false);  
    setDeliveryDate('');  
    setJustification(''); 
  };  

  const filteredRequests = useMemo(() =>
     requests.filter(r =>
      filter === 'all' || 
      r.status === (filter === 'accepted' ? 'approved' : filter)
      ), [requests, filter]);

  const toggleSidebar = () =>  
    setSidebarOpen(!sidebarOpen);             

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div className={`col-lg-2 col-md-3 ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}>
          <Sidebar />
        </div>  

        <div className={`col-lg-10 col-md-9 ${sidebarOpen ? 'd-none' : ''}`}>
          <TopHeader onMenuClick={toggleSidebar} />
          
          <div className="container-fluid p-3 p-md-4">
            {/* Stats Cards */}
            <div className="row mb-4 g-3">
              {[ 
                { icon: <ClipboardList size={24} />, title: 'Total', value: requestStats.total, color: 'primary' },
                { icon: <CheckCircle size={24} />, title: 'Approuvées', value: requestStats.approved, color: 'success' },
                { icon: <Clock size={24} />, title: 'En Attente', value: requestStats.pending, color: 'warning' },
                { icon: <XCircle size={24} />, title: 'Rejetées', value: requestStats.rejected, color: 'danger' }
              ].map((stat, i) => (
                <div className="col-6 col-md-3" key={i}>
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body d-flex align-items-center">
                      <div className={`me-3 text-${stat.color}`}>{stat.icon}</div>
                      <div>
                        <h6 className="card-title mb-1">{stat.title}</h6>
                        <h4 className="card-text fw-bold">{stat.value}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Demandes Table */}
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Historique Des Demandes</h5>
                <div className="btn-group" role="group">
                  {['all','accepted','pending','rejected'].map(status => (
                    <button 
                      key={status} 
                      className={`btn btn-sm ${filter === status ? `btn-${getStatusColor(status)}`:`btn-outline-${getStatusColor(status)}`}`} 
                      onClick={() => setFilter(status)}>
                      {status === 'all' ? 'Toutes' : getStatusDisplay(status)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Matériel</th>
                          <th>Quantité</th>
                          <th>Date</th>
                          <th>Statut</th>
                          <th>Livraison</th>
                          <th>Rejet</th>
                          <th className="d-none d-md-table-cell">Justification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map(req=> (
                          <tr key={req.id}>
                            <td>{req.id}</td>
                            <td>{req.material}</td> 
                            <td>{req.quantity}</td> 
                            <td>{new Date(req.created_at).toLocaleDateString()}</td> 

                            <td><Badge bg={getStatusColor(req.status)}>{getStatusDisplay(req.status)}</Badge></td> 
                            <td>{req.status === 'approved' && req.delivery_date ? new Date(req.delivery_date).toLocaleDateString() : '-'}</td>
                            <td>{req.status==='rejected'&& req.rejection_reason ? req.rejection_reason:'-'}</td>

                            <td className="d-none d-md-table-cell">{req.justification||'-'}</td> 
                            
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!filteredRequests.length && <div className="text-center text-muted py-4">Aucune demande trouvée</div>}
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
                <h5 className="modal-title">{modalMode==='accept'?'Approuver la demande':'Rejeter la demande'}</h5>
                <button type="button" className="btn-close" onClick={()=>setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {modalMode==='accept'?<><label className="form-label">Date de livraison</label><input type="date" className="form-control" value={deliveryDate} onChange={e=>setDeliveryDate(e.target.value)}/></>:
                <><label className="form-label">Justification du refus</label><textarea className="form-control" value={justification} onChange={e=>setJustification(e.target.value)}></textarea></>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Annuler</button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitModal}>Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
