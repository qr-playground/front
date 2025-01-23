import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { registerUser } from '../../api/api';

const RegisterWithUUID = () => {
  const { uuid } = useParams();
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const result = await registerUser({ nickname, userId, password, qrId: uuid });
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
          닉네임:
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          아이디:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          비밀번호:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleRegister}>등록하기</button>
    </div>
  );
};

export default RegisterWithUUID;