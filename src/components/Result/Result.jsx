import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { viewData } from '../../api/api';

const Result = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  const handleView = async () => {
    // const data = await viewData(id);
    const data = "에라이 몰랑"; // 임시로 데이터를 넣어봅니다.
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