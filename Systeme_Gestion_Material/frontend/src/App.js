import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages Admin
import DashboardAdmin from "./dashboardAdministaratif/components/pages/DashboardAdmin";
import EmployeeManagement from "./dashboardAdministaratif/components/pages/EmployeeManagementAdmin";
import Demandes from "./dashboardAdministaratif/components/pages/DemandesAdmin";
import Stocks from "./dashboardAdministaratif/components/pages/Stocks";

// Pages Validateur
import DashboardValidateur from "./dashboardVlidateur/components/pages/DashboardValidateur";
import MaterialListeValidateur from "./dashboardVlidateur/components/pages/MaterialListeValidateur";

// Pages Employé
import DashboardEmploye from "./dashboardEmploye/components/pages/DashboardEmploye";
import MaterialRequestForm from "./dashboardEmploye/components/pages/MaterialRequestFormEmploye";

// Auth
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import { ContextProvider } from "./ContextProvider";

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          {/* Page de login */}
          <Route path="/login" element={<Login />} />

          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            {/* Admin */}
            <Route path="/dashboard-administaratif" element={<DashboardAdmin />} />
            <Route path="/EmployeeManagement-administaratif" element={<EmployeeManagement />} />
            <Route path="/demandes-administaratif" element={<Demandes />} />
            <Route path="/stock-administaratif" element={<Stocks />} />

            {/* Validateur */}
            <Route path="/dashboard-validateur" element={<DashboardValidateur />} />
            <Route path="/nouvelle-demande-validateur" element={<MaterialListeValidateur />} />

            {/* Employé */}
            <Route path="/dashboard-employe" element={<DashboardEmploye />} />
            <Route path="/nouvelle-demande-employe" element={<MaterialRequestForm />} />
          </Route>

          {/* Route par défaut */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;
