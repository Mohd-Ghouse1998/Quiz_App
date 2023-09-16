// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Gameplay from './components/Gameplay';
import StartGame from './components/Startgame';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';


function App() {
  return (
    <Router>
      <div className="App">
      <Redirect from="/" to="/home" />
        <Route path="/home" component={Home} />
        <Route path="/lobby/:userId" component={Lobby} />
        <Route path="/gameplay/:roomId/:userId" component={Gameplay} />
        <Route path="/startgame/:roomId/:userId" component={StartGame} />
       
        {/* Add more routes for other pages */}
      </div>
    </Router>
  );
}

export default App;
