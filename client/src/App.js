import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateEventRequest from "./pages/NewEventRequest";
import ViewRequest from "./pages/EventRequestDetails";
import EditEventRequest from "./pages/EditEventRequest";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import CreateEvent from "./pages/CreateEvent";
import Reports from "./pages/Reports";
import Layout from "./pages/Layout";

function App() {
  return (
    <BrowserRouter>
    <Layout>
        <Routes>
        <Route path="/" element={<Login />} />
        {/* LOGIN ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />}/>


          {/* CLIENT ROUTES */}
        <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /></ProtectedRoute>}/>        
        <Route path="/client/new-request" element={<ProtectedRoute><CreateEventRequest /></ProtectedRoute>} />
        <Route path="/request/:id" element={<ProtectedRoute><ViewRequest /></ProtectedRoute>} />
        <Route path="/client/edit-request/:id" element={ <ProtectedRoute><EditEventRequest/></ProtectedRoute>}/>

        {/* MANAGER ROUTES */}

        <Route path="/manager/create-event/:request_id" element={<CreateEvent />} /> 
        <Route path="/manager/create-event/:request_id" element={<CreateEvent />} />

        {/* REPORTS */}
        <Route path="/reports" element={<Reports/>} />
      </Routes>
    </Layout>
    
    </BrowserRouter>
  );
}

export default App;
