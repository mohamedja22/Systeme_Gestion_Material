import axiosClient from "./axios-client"; 
import { useRef, useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import { useStateContext } from "./ContextProvider";  

export default function AuthPage() {  
  const navigate = useNavigate(); 
  const { setUser, setToken } = useStateContext();  

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loginEmailRef = useRef();
  const loginPasswordRef = useRef();
  const loginRoleRef = useRef();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      email: loginEmailRef.current.value,
      password: loginPasswordRef.current.value,
      role: loginRoleRef.current.value,
    };

    try {
      await axiosClient.get("/sanctum/csrf-cookie");
      const { data } = await axiosClient.post("/login", payload);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);

      switch (payload.role) {
        case "admin":
          navigate("/dashboard-administaratif");
          break;
        case "validateur":
          navigate("/dashboard-validateur");
          break;
        case "employe":
          navigate("/dashboard-employe");
          break;
        default:
          navigate("/login");
      }
    } catch (err) {
      const res = err.response;
      if (res?.status === 401) {
        setMessage("Email ou mot de passe incorrect");
      } else {
        setMessage("Erreur de connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light p-2 p-sm-3 p-md-4">
      <div className="row shadow rounded-4 overflow-hidden mx-auto" style={{ maxWidth: "1000px", width: "100%" }}>
        <div className="col-12 col-md-6 p-0">
          <img src="./Images/login3.jpg" alt="Login Visual" className="img-fluid w-100 d-md-none" style={{ maxHeight: "200px", objectFit: "cover" }} />
          <img src="./Images/loginPic.jpg" alt="Login Visual" className="img-fluid h-100 w-100 d-none d-md-block" style={{ objectFit: "cover" }} />
        </div>
        <div className="col-12 col-md-6 bg-white p-3 p-sm-4 p-lg-5">
          <h2 className="text-center mb-3 mb-md-4 text-primary fw-bold fs-3 fs-md-2">
            Connexion
          </h2>

          {message && <div className="alert alert-danger text-center py-2">{message}</div>}

          <form onSubmit={handleLogin} className="px-0 px-sm-2">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
                <input type="email" ref={loginEmailRef} className="form-control" required placeholder="Votre email" />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Mot de passe</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                <input type="password" ref={loginPasswordRef} className="form-control" required placeholder="Votre mot de passe" />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Rôle</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person-badge-fill"></i></span>
                <select ref={loginRoleRef} className="form-select" required>
                  <option value="">Choisir un rôle</option>
                  <option value="admin">Admin</option>
                  <option value="validateur">Validateur</option>
                  <option value="employe">Employé</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 mt-2" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// import axiosClient from "./axios-client";
// import { useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useStateContext } from "./ContextProvider";
// import "./AuthPage.css"; // We'll create this CSS file

// export default function AuthPage() {
//   const navigate = useNavigate();
//   const { setUser, setToken } = useStateContext();

//   const [message, setMessage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isFocused, setIsFocused] = useState({
//     email: false,
//     password: false,
//     role: false
//   });

//   const loginEmailRef = useRef();
//   const loginPasswordRef = useRef();
//   const loginRoleRef = useRef();

//   const handleFocus = (field) => setIsFocused({...isFocused, [field]: true});
//   const handleBlur = (field) => setIsFocused({...isFocused, [field]: false});

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage(null);

//     const payload = {
//       email: loginEmailRef.current.value,
//       password: loginPasswordRef.current.value,
//       role: loginRoleRef.current.value,
//       remember: rememberMe
//     };

//     try {
//       await axiosClient.get("/sanctum/csrf-cookie");
//       const { data } = await axiosClient.post("/login", payload);
//       setUser(data.user);
//       setToken(data.token);
//       localStorage.setItem("token", data.token);

//       switch (payload.role) {
//         case "admin":
//           navigate("/dashboard-administaratif");
//           break;
//         case "validateur":
//           navigate("/dashboard-validateur");
//           break;
//         case "employe":
//           navigate("/dashboard-employe");
//           break;
//         default:
//           navigate("/login");
//       }
//     } catch (err) {
//       const res = err.response;
//       if (res?.status === 401) {
//         setMessage("Email ou mot de passe incorrect");
//       } else {
//         setMessage("Erreur de connexion");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <div className="auth-header">
//           <div className="logo-placeholder">
//             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
//               <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
//               <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
//             </svg>
//           </div>
//           <h2>Welcome Back</h2>
//           <p>Connectez-vous à votre espace de gestion</p>
//         </div>

//         {message && <div className="auth-message">{message}</div>}

//         <form onSubmit={handleLogin} className="auth-form">
//           <div className={`form-group ${isFocused.email ? 'focused' : ''}`}>
//             <label>Email</label>
//             <div className="input-wrapper">
//               <input 
//                 type="email" 
//                 ref={loginEmailRef}
//                 onFocus={() => handleFocus('email')}
//                 onBlur={() => handleBlur('email')}
//                 required
//                 placeholder="email@example.com"
//               />
//               <span className="input-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
//                   <polyline points="22,6 12,13 2,6"></polyline>
//                 </svg>
//               </span>
//             </div>
//           </div>

//           <div className={`form-group ${isFocused.password ? 'focused' : ''}`}>
//             <label>Password</label>
//             <div className="input-wrapper">
//               <input 
//                 type="password" 
//                 ref={loginPasswordRef}
//                 onFocus={() => handleFocus('password')}
//                 onBlur={() => handleBlur('password')}
//                 required
//                 placeholder="••••••••"
//               />
//               <span className="input-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                   <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//                 </svg>
//               </span>
//             </div>
//           </div>

//           <div className={`form-group ${isFocused.role ? 'focused' : ''}`}>
//             <label>Role</label>
//             <div className="input-wrapper">
//               <select 
//                 ref={loginRoleRef}
//                 onFocus={() => handleFocus('role')}
//                 onBlur={() => handleBlur('role')}
//                 required
//               >
//                 <option value="">Select your role</option>
//                 <option value="admin">Admin</option>
//                 <option value="validateur">Validateur</option>
//                 <option value="employe">Employé</option>
//               </select>
//               <span className="input-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//                   <circle cx="9" cy="7" r="4"></circle>
//                   <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
//                   <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
//                 </svg>
//               </span>
//             </div>
//           </div>

//           <div className="form-options">
//             <label className="checkbox-container">
//               <input 
//                 type="checkbox" 
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//               />
//               <span className="checkmark"></span>
//               Remember me
//             </label>
//           </div>

//           <button type="submit" className="auth-button" disabled={loading}>
//             {loading ? (
//               <span className="spinner"></span>
//             ) : (
//               'Sign In'
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }