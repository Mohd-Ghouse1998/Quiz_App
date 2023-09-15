import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Startgame from './Startgame';
import Gameplay from './Gameplay';

function Game() {
  const { roomId, userId } = useParams();
  const [socket, setSocket] = useState(null);
  const [userJoined, setUserJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Create a socket connection when the component mounts
    const newSocket = io.connect('http://localhost:5000'); // Replace with your server URL
    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Emit the join-room event and provide a callback
      socket.emit('join-room', roomId, userId, (success) => {
        if (success) {
          // User has successfully joined the room
          setUserJoined(true);
        } else {
          // Handle the case where joining failed
          // For example, display an error message to the user
        }
      });

      socket.on('start-game', () => {
        // Game has started, you can set the gameStarted state to true
        setGameStarted(true);
      });
    }
  }, [socket, roomId, userId]);

  // Use history.push to navigate between components
  if (userJoined) {
    if (gameStarted) {
      return <Gameplay />;
    } else {
      return <Startgame />;
    }
  } else {
    return <p>Joining the room...</p>;
  }
}

export default Game;
