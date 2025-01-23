import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { viewData } from '../../api/api';

const Result = () => {
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState(null);

  const handleView = async () => {
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      return;
    }
    const data = await viewData();
    setResult(data);
  };

  return (
    <div>
      <h1>결과 보기</h1>
      <button onClick={handleView}>결과 가져오기</button>
      {result && (
        <div>
          <h2>결과:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Result;