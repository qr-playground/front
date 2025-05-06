import React from "react";
import Navbar from "../Navbar";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <p>© 2024 QR World. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
