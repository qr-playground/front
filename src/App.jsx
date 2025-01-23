import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QRCode from './components/QRCode/QRCode';
import RegisterWithUUID from './components/Register/RegisterWithUUID';
import RegisterWithoutUUID from './components/Register/RegisterWithoutUUID';
import Result from './components/Result/Result';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import Home from './components/Home/Home';
import PrivateRoute from './components/PrivateRoute';
import NavBar from './components/NavBar/NavBar.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './App.css';
import Layout from './components/Layout';
import MyPage from './components/MyPage/MyPage'; // 마이페이지 컴포넌트 추가

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="register/:uuid"
              element={
                <PrivateRoute>
                  <RegisterWithUUID />
                </PrivateRoute>
              }
            />
            <Route
              path="register"
              element={
                <PrivateRoute>
                  <RegisterWithoutUUID />
                </PrivateRoute>
              }
            />
            <Route
              path="result"
              element={
                <PrivateRoute>
                  <Result />
                </PrivateRoute>
              }
            />
            <Route path="qrcode" element={<QRCode />} /> {/* PrivateRoute 제거 */}
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route
              path="mypage"
              element={
                <PrivateRoute>
                  <MyPage />
                </PrivateRoute>
              }
            /> {/* 마이페이지 경로 추가 */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;