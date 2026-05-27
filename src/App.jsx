import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAutoRefreshToken } from "./utils/useAutoRefreshToken";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CotizaAhoraModal from "./components/CotizaAhoraModal";
import QueEs from "./components/QueEs";
import Beneficios from "./components/Beneficios";
import Servicios from "./components/Servicios";
import Casos from "./components/Casos";
import Normativa from "./components/Normativa";
import FAQ from "./components/FAQ";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import AcceptInvitation from "./components/AcceptInvitation";
import PrivateRoute from "./components/guards/PrivateRoute";
import Footer from "./components/Footer";

export default function App() {

  useAutoRefreshToken();

  const [cotizaOpen, setCotizaOpen] = useState(false);

  return (
    <Router>
      <Header onOpenQuote={() => setCotizaOpen(true)} />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero onOpenQuote={() => setCotizaOpen(true)} />
              <QueEs />
              <Beneficios />
              <Servicios />
              <Normativa />
              <FAQ />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
      <CotizaAhoraModal open={cotizaOpen} onClose={() => setCotizaOpen(false)} />
    </Router>
  );
}