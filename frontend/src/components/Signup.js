import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css'

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setSuccessMessage] = useState(''); 
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup =async (e) => {
    e.preventDefault();
    
    // Send a POST request to your backend for user registration
  let {data}=await  axios.post('https://quiz-game1.onrender.com/api/createUser', formData)
     
        // Handle successful registration, such as redirecting to the login page
        setSuccessMessage(data.message);
        if (data.status === true) {
          // Successful login
          console.log(data.message);
          setSuccessMessage(data.message);
        }
      
        setTimeout(() => {
        
          setSuccessMessage('');
        }, 3000);
        setFormData({
          name: '',
          email: '',
          password: '',
        });
      
      
  };


 

  return (
    <div className="signup-container"> {/* Apply the CSS class to the container */}
      <h2>Sign Up</h2>
    
      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <button type="submit">Sign Up</button>
      </form>

      {message && (
    <div className={`message ${message.status ? 'success' : 'error'}`} style={{ marginTop: '10px' }}>
      {message}
    </div>
  )}

    </div>
  );
}

export default Signup;