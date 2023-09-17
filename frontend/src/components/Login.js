import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const history = useHistory();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post("api/login", formData, config);
      console.log(`status=false ${data.message}`);
      setMessage(data.message);

      if (data.status === true) {
        // Successful login
        console.log(`status=true ${data.message}`);
        let id = data.data.userId;
        history.push(`/lobby/${id}`);
      }

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log(`catch error ${error.message}`);
      // Handle network errors or other exceptions here
      setMessage("An error occurred during login.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      {message && (
        <div
          className={`message ${message.status ? "success" : "error"}`}
          style={{ marginTop: "10px" }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default Login;
