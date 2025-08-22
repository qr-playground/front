import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import About from "./pages/About/About";
import Guestbook from "./pages/Guestbook/Guestbook";
import GuestbookResult from "./pages/Guestbook/GuestbookResult";
import Home from "./pages/Home";
import Login from "./pages/Login";
import QrGenerator from "./pages/QrGenerator";
import QrResult from "./pages/QrResult/QrResult";
import Register from "./pages/Register";
import Search from "./pages/Search";
import MyQrcodeResult from "./pages/Settings/MyQrcodeResult";
import MyQrCodes from "./pages/Settings/MyQrCodes";
import Settings from "./pages/Settings/Settings";
import { initializeDeviceId } from "./utils/deviceId";
import { trackPageView } from "./utils/gtag";

// 페이지 변경 시 구글 애널리틱스 추적
function GATracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location]);

  return null;
}

function App() {
  // Device ID 초기화 및 첫 페이지 추적
  useEffect(() => {
    const setupApp = async () => {
      try {
        await initializeDeviceId();
        trackPageView();
      } catch (error) {
        console.error("앱 초기화 중 오류 발생:", error);
      }
    };

    setupApp();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter basename="/">
        <GATracker />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/generator" element={<QrGenerator />} />
            <Route path="/generator/edit/:shortId" element={<QrGenerator />} />
            <Route path="/qr-result/:shortId" element={<QrResult />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/my-qrcodes"
              element={
                <ProtectedRoute>
                  <MyQrCodes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/my-qrcodes/:shortId/result"
              element={
                <ProtectedRoute>
                  <MyQrcodeResult />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/guestbook/:shortId" element={<Guestbook />} />
            <Route
              path="/guestbook/:shortId/result"
              element={<GuestbookResult />}
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
