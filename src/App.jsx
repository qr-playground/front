import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QRCode from './components/QRCode/QRCode';
import Register from './components/Register/Register';
import Result from './components/Result/Result';
import './App.css';

const App = () => {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [centerText, setCenterText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [borderThickness, setBorderThickness] = useState(15);
  const [data, setData] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/register/:uuid" element={<Register />} />
        <Route path="/result/:uuid" element={<Result />} />
        <Route path="/" element={
          <div className="container">
            <div className="input-group">
              <label>
                Top Text:
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                />
              </label>
            </div>
            <div className="input-group">
              <label>
                Bottom Text:
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                />
              </label>
            </div>
            <div className="input-group">
              <label>
                Center Text:
                <input
                  type="text"
                  value={centerText}
                  onChange={(e) => setCenterText(e.target.value)}
                />
              </label>
            </div>
            <div className="input-group">
              <label>
                Font Size:
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                />
              </label>
            </div>
            <div className="input-group">
              <label>
                Border Thickness:
                <input
                  type="number"
                  value={borderThickness}
                  onChange={(e) => setBorderThickness(e.target.value)}
                />
              </label>
            </div>
            <div className="input-group">
              <label>
                Data:
                <input
                  type="text"
                  value={data}
                  placeholder="이동할 링크를 입력하세요"
                  onChange={(e) => setData(e.target.value)}
                />
              </label>
            </div>
            <QRCode 
              topText={topText} 
              bottomText={bottomText} 
              centerText={centerText} 
              fontSize={fontSize} 
              borderThickness={borderThickness} 
              data={data}
            />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;