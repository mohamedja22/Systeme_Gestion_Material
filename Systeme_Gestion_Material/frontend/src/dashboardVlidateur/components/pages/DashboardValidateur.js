import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../Sidebar';
import TopHeader from '../TopHeader';
import { Badge } from 'react-bootstrap';
import { ClipboardList, CheckCircle, Clock, XCircle } from 'lucide-react';
import axiosClient from '../../../axios-client';

const DashboardValidateur = () => {
  const [requestStats, setRequestStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchEmployeeRequests = async () => {
      try {
        const response = await axiosClient.get('/material-requests');
        const data = response.data?.data || [];

        setRequests(data);
        setLoading(false);

        const stats = data.reduce(
          (acc, request) => {
            acc.total++;
            switch (request.status) {
              case 'approved': acc.approved++; break;
              case 'pending': acc.pending++; break;
              case 'rejected': acc.rejected++; break;
              default: break;
            }
            return acc;
          },
          { total: 0, approved: 0, pending: 0, rejected: 0 }
        );

        setRequestStats(stats);
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setError(err.response?.data?.message || 'Erreur de chargement des demandes');
        setLoading(false);
      }
    };

    fetchEmployeeRequests();
  }, []);

  const getStatusDisplay = status => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'approved':
      case 'Approuvé': return 'success';
      case 'rejected':
      case 'Rejeté': return 'danger';
      case 'pending':
      case 'En attente': return 'warning';
      default: return 'secondary';
    }
  };

  const filteredRequests = useMemo(
    () => requests.filter(r => filter === 'all' || r.status === filter),
    [requests, filter]
  );

  const toggleSidebar = () => setSidebarOpen(open => !open);

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
                <div className="btn-group"> 
                  {['all', 'approved', 'pending', 'rejected'].map(status => (
                    <button 
                      key={status} 
                      className={`btn btn-sm ${filter === status ? `btn-${getStatusColor(status)}` : `btn-outline-${getStatusColor(status)}`}`}
                      onClick={() => setFilter(status)}
                    >
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
                          <th>Date</th>
                          <th>Matériel</th>
                          <th>Quantité</th>
                          <th className="d-none d-md-table-cell">Justification</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.length > 0 ? filteredRequests.map(request => (
                          <tr key={request.id}>
                            <td>{new Date(request.created_at).toLocaleDateString()}</td>
                            <td>{request.material_name}</td>
                            <td>{request.quantity}</td>
                            <td className="d-none d-md-table-cell">{request.justification || '-'}</td>
                            <td><Badge bg={getStatusColor(request.status)}>{getStatusDisplay(request.status)}</Badge></td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="text-center text-muted py-4">Aucune demande trouvée</td></tr>
                        )}
                      </tbody>
                    </table>
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

export default DashboardValidateur;
