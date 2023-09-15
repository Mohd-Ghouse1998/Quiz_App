import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css'

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [successMessage, setSuccessMessage] = useState(''); 
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup =async (e) => {
    e.preventDefault();
    
    // Send a POST request to your backend for user registration
  let {data}=await  axios.post('http://localhost:5000/api/createUser', formData)
     
        // Handle successful registration, such as redirecting to the login page
        console.log(data)
        setSuccessMessage(data.message);
        setTimeout(() => {
        
          setSuccessMessage('');
        }, 5000);
        setFormData({
          name: '',
          email: '',
          password: '',
        });
      
      
  };

  return (
    <div className="signup-container"> {/* Apply the CSS class to the container */}
      <h2>Sign Up</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
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
    </div>
  );
}

export default Signup;



