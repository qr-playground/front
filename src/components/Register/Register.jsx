import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { registerUser } from '../../api/api';

const Register = () => {
  const { uuid } = useParams();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');

  const handleRegister = async () => {
    const result = await registerUser({ name, userId, qrId: uuid });
    console.log(result);
  };

  useEffect(() => {
    console.log(`UUID from URL: ${uuid}`);
  }, [uuid]);

  return (
    <div>
      <h1>등록하기</h1>
      <div>
        <label>
          이름:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleRegister}>등록하기</button>
    </div>
  );
};

export default Register;