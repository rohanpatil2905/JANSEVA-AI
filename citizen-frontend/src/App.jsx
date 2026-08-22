import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Language from "./pages/Language";
import SubmitComplaint from "./pages/SubmitComplaint";
import ComplaintPreview from "./pages/ComplaintPreview";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import TrackComplaint from "./pages/TrackComplaint";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import OfficialDashboard from "./pages/OfficialDashboard";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/language"
          element={
            <ProtectedRoute>
              <Language />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submit-complaint"
          element={
            <ProtectedRoute>
              <SubmitComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preview"
          element={
            <ProtectedRoute>
              <ComplaintPreview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute>
              <MyComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaint/:id"
          element={
            <ProtectedRoute>
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track/:id"
          element={
            <ProtectedRoute>
              <TrackComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/official"
          element={
            <ProtectedRoute>
              <OfficialDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;