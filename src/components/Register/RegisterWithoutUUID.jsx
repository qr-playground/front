import React, { useState } from 'react';
import { registerUser } from '../../api/api';

const RegisterWithoutUUID = () => {
  const [qrId, setQrId] = useState('');
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const result = await registerUser({ qrId, nickname, userId, password });
    console.log(result);
  };

  return (
    <div>
      <h1>등록하기</h1>
      <div>
        <label>
          QR코드 ID:
          <input
            type="text"
            value={qrId}
            onChange={(e) => setQrId(e.target.value)}
          />
        </label>
      </div>
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

export default RegisterWithoutUUID;