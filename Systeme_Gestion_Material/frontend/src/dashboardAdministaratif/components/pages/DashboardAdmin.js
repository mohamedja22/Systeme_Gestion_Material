import React, { useState, useEffect, useMemo } from "react";  
import Sidebar from "../Sidebar"; 
import TopHeader from "../TopHeader"; 
import { ClipboardList, CheckCircle, Clock, XCircle, Users, Archive } from "lucide-react";  
import axiosClient from "../../../axios-client";  

const STATUS_LIST = ["all", "approved", "pending", "rejected"];

const DashboardAdmin = () => {
  const [requests, setRequests] = useState([]); 
  const [stats, setStats] = useState({ employees: 0, validators: 0, totalStock: 0, stockDetails: [] }); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Si vous avez deux endpoints, utilisez Promise.all
        const [reqRes, statsRes] = await Promise.all([
          axiosClient.get('/material-requests'),
        ]);

        const data = reqRes.data?.data || [];
        setRequests(data);
        setStats(statsRes?.data || {
          employees: 0,
          validators: 0,
          totalStock: 0,
          stockDetails: [],
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message 
          || err.message 
          || 'Erreur serveur';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calcul des statistiques des demandes
  const requestStats = useMemo(() =>
    requests.reduce(
      (acc, { status }) => {
        acc.total++;
        if (status in acc) acc[status]++;
        return acc;
      },
      { total: 0, approved: 0, pending: 0, rejected: 0 }
    ),
    [requests]
  );

  const getStatusColor = status => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
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
        <div className={`col-lg-2 col-md-3 ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}><Sidebar/></div>
        <div className="col-lg-10 col-md-9">
          <TopHeader onMenuClick={toggleSidebar}/>
          <div className="container-fluid p-3 p-md-4">
            {/* Statistiques globales */}
            <div className="row mb-4 g-3">
              {[
                { icon: <ClipboardList size={24}/>, title: 'Total Demandes', value: requestStats.total, color: 'primary' },
                { icon: <CheckCircle size={24}/>, title: 'Approuvées', value: requestStats.approved, color: 'success' },
                { icon: <Clock size={24}/>, title: 'En Attente', value: requestStats.pending, color: 'warning' },
                { icon: <XCircle size={24}/>, title: 'Rejetées', value: requestStats.rejected, color: 'danger' },
                { icon: <Users size={24}/>, title: 'Employés', value: stats.employees, color: 'info' },
                { icon: <Users size={24}/>, title: 'Validateurs', value: stats.validators, color: 'dark' },
                { icon: <Archive size={24}/>, title: 'Total Stock', value: stats.totalStock, color: 'secondary' },
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
            {/* Tableau des demandes */}
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center bg-white">
                <h5 className="mb-0">Suivi des Demandes</h5>
                <div className="btn-group">
                  {STATUS_LIST.map(s => (
                    <button key={s}
                      className={`btn btn-sm ${filter===s?`btn-${getStatusColor(s)}`:`btn-outline-${getStatusColor(s)}`}`}
                      onClick={()=>setFilter(s)}>
                      {s==='all'? 'Toutes' : s.charAt(0).toUpperCase()+s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"/>
                    <span className="ms-2">Chargement en cours...</span>
                  </div>  
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead><tr>
                        <th>ID</th><th>Demandeur</th><th>Matériel</th><th>Quantité</th><th>Date</th>
                        <th>Statut</th><th>Livraison</th><th>Rejet</th><th className="d-none d-md-table-cell">Justification</th>
                      </tr></thead>
                      <tbody>
                        {filteredRequests.length>0 ? filteredRequests.map(r=> (
                          <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.requester_name || '-'}</td>
                            <td>{r.material_name}</td>
                            <td>{r.quantity}</td>
                            <td>{new Date(r.created_at).toLocaleDateString()}</td>
                            <td><span className={`badge bg-${getStatusColor(r.status)}`}>{r.status}</span></td>
                            <td>{r.delivery_date? new Date(r.delivery_date).toLocaleDateString(): '-'}</td>
                            <td>{r.rejection_reason|| '-'}</td>
                            <td className="d-none d-md-table-cell">{r.justification|| '-'}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="9" className="text-center">Aucune demande trouvée</td></tr>
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
export default DashboardAdmin; 