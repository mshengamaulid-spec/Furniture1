import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      const payload = {
        username: username.trim(),
        password,
        role,
      };
      const cleanEmail = email.trim();
      const cleanPhone = phone.trim();
      if (cleanEmail) payload.email = cleanEmail;
      if (cleanPhone) payload.phone = cleanPhone;

      await axios.post('/api/auth/register/', payload);
      alert('Account created, please login');
      navigate('/login');
    } catch (error) {
      const detail = error?.response?.data;
      const message =
        typeof detail === 'string'
          ? detail
          : detail?.email?.[0] ||
            detail?.username?.[0] ||
            detail?.password?.[0] ||
            detail?.role?.[0] ||
            detail?.phone?.[0] ||
            'Registration failed';
      setErrorMessage(message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <div className="input-group">
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="input-group">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="carpenter">Carpenter</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Register</button>
        </form>
        <p>Already have an account? <Link to="/login" className="link">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;
