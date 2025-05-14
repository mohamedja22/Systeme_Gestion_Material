import React, { useState, useEffect } from "react";
import axiosClient from "../../../axios-client.js";
import Sidebar from "../Sidebar.js";
import TopHeader from "../TopHeader.js";
import { useNavigate } from "react-router-dom";

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    matricule: "",
    name: "",
    email: "",  
    password: "", 
    role: "employé",  
  });
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Options de rôle
  const roleOptions = [
    { value: "employé", label: "Employé" },
    { value: "validateur", label: "Validateur" },
    // { value: "admin", label: "Administrateur" },
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosClient.get("/employees");
        setEmployees(response.data.data);
      } catch (error) {
        console.error("Erreur de chargement des employés:", error);
      }
    };
    fetchEmployees();
  }, []);

  const validateEmployeeForm = () => {  
    const requiredFieldsFilled =
      employeeForm.matricule.trim() !== "" && 
      employeeForm.name.trim() !== "" &&  
      employeeForm.email.trim() !== "" && 
      employeeForm.role.trim() !== "";  
  
    const passwordValid = selectedEmployee ? true : employeeForm.password.trim() !== "";
  
    return requiredFieldsFilled && passwordValid;
  };  

  const handleAddEmployee = async () => {
    if (!validateEmployeeForm()) return;
    setLoading(true);

    try {
      const response = await axiosClient.post("/employees", employeeForm);
      setEmployees([...employees, response.data]);
      setError(null);
      resetEmployeeForm();
      setShowModal(false);
    } catch (error) {
      setError("Erreur d'ajout d'employé");
      console.error(error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee || !validateEmployeeForm()) return;

    setLoading(true);
    try {
      const response = await axiosClient.put(`/employees/${selectedEmployee.id}`, employeeForm);
      setEmployees(
        employees.map((emp) =>
          emp.id === selectedEmployee.id ? response.data : emp
        )
      );
      setError(null);
      resetEmployeeForm();
      setShowModal(false);
    } catch (error) {
      setError("Erreur de mise à jour");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axiosClient.delete(`/employees/${id}`);
      setEmployees(employees.filter((emp) => emp.id !== id));
      setError(null);
    } catch (error) {
      setError("Erreur de suppression");
      console.error(error);
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeForm({
      matricule: employee.matricule,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    });
    setShowModal(true);
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      matricule: "",
      name: "",
      email: "",
      password: "",
      role: "employé",
    });
    setSelectedEmployee(null);
  };

  const openModal = (modalId) => {
    document.getElementById(modalId).classList.add("show");
    document.body.classList.add("modal-open");
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);
  };

  const closeModal = (modalId) => { 
    document.getElementById(modalId).classList.remove("show");
    document.body.classList.remove("modal-open");
    document.querySelector(".modal-backdrop")?.remove();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div
          className={`col-lg-2 col-md-3 ${
            sidebarOpen ? "d-block" : "d-none d-md-block"
          }`}
        >
          <Sidebar />
        </div>

        <div className={`col-lg-10 col-md-9 ${sidebarOpen ? "d-none" : ""}`}>
          <TopHeader onMenuClick={toggleSidebar} />

          <div className="container-fluid p-3 p-md-4">
            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
              </div>
            )}

            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Gestion des Employés</h5>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    resetEmployeeForm();
                    setShowModal(true);
                  }}
                >
                  <i className="bi bi-plus"></i> Ajouter un Employé
                </button>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Matricule</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.matricule}</td>
                          <td>{employee.name}</td>
                          <td>{employee.email}</td>
                          <td>
                            <span
                              className={`badge ${
                                employee.role === "admin"
                                  ? "bg-danger"
                                  : 
                                  employee.role === "validateur"
                                  ? "bg-primary"
                                  : "bg-secondary"
                              }`}
                            >
                              {employee.role}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-warning" onClick={() => handleEditEmployee(employee)}
                              >
                                <i className="bi bi-pencil"></i> Modifier
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteEmployee(employee.id) }
                              >
                                <i className="bi bi-trash"></i> Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className={`modal ${showModal ? "d-block" : ""}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedEmployee ? "Modifier Employé" : "Ajouter un Employé"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Matricule</label>
                  <input
                    type="text"
                    className="form-control"
                    value={employeeForm.matricule}
                    onChange={(e) =>
                      setEmployeeForm({ ...employeeForm, matricule: e.target.value,})
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className="form-control"
                    value={employeeForm.name}
                    onChange={(e) =>
                      setEmployeeForm({ ...employeeForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={employeeForm.email}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        email: e.target.value,
                      })
                    }
                    required  
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    value={employeeForm.password}
                    onChange={(e) =>
                      setEmployeeForm({ ...employeeForm, password: e.target.value })
                    }
                    required={!selectedEmployee} // optionnel : pas requis pour modification
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rôle</label>
                  <select
                    className="form-select"
                    value={employeeForm.role}
                    onChange={(e) =>
                      setEmployeeForm({ ...employeeForm, role: e.target.value })
                    }
                    required
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Fermer
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  selectedEmployee ? handleUpdateEmployee : handleAddEmployee
                }
                disabled={loading}
              >
                {loading ? "Chargement..." : selectedEmployee ? "Mettre à jour" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
