import React, { useState, useEffect } from "react";
import { useParams, Redirect } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import io from "socket.io-client";

function StartGame() {
  const { roomId, userId } = useParams();
  const [socket, setSocket] = useState(null);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const history = useHistory();
  useEffect(() => {
    // Create a socket connection when the component mounts
    const newSocket = io.connect("http://localhost:5000"); // Replace with your server URL
    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Join the room using the socket when roomId changes
      socket.emit("join-room", roomId, userId);
      socket.emit("join-conditions", roomId, userId);
      socket.on("users-list", (newUserList) => {
        // Update the usersInRoom state with the new list of users
        setUsersInRoom(newUserList);
      });

      socket.on("start-game", () => {
        // Game has started, you can set the gameStarted state to true
        setGameStarted(true);
      });
    }
  }, [socket, roomId, userId]);

  // Redirect to the Gameplay component when the game starts
  if (gameStarted) {
    history.push(`/gameplay/${roomId}/${userId}`);
    //return <Redirect to={`/gameplay/${roomId}/${userId}`} />;
  }

  return (
    <div>
      <h2>Start Game</h2>
      {usersInRoom.length < 2 ? (
        <p>Waiting for other users to join...</p>
      ) : (
        <p>Both users have joined. Starting the game...</p>
      )}
      <p>Users in the room:</p>
      <ul>
        {usersInRoom.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
}

export default StartGame;
