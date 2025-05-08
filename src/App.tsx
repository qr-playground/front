import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import About from "./pages/About/About";
import Home from "./pages/Home";
import Login from "./pages/Login";
import QrGenerator from "./pages/QrGenerator";
import QrResult from "./pages/QrResult/QrResult";
import Register from "./pages/Register";
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/generator" element={<QrGenerator />} />
            <Route path="/qr-result/:shortId" element={<QrResult />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
