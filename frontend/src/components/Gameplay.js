import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import "./Gameplay.css";

function Gameplay() {
  const { roomId, userId } = useParams();
  const [socket, setSocket] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [timer, setTimer] = useState(10);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [timerExpired, setTimerExpired] = useState(false);
  const [userAnswerSubmitted, setUserAnswerSubmitted] = useState(false);

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
      console.log("joined room front client side");

      // Listen for events from the server
      socket.on("users-list", (userList) => {
        // Update the usersInRoom state with the new list of users
        setUsersInRoom(userList);
      });

      socket.on("game-error", (errorData) => {
        alert(errorData.message); // Display the error message to the user
      });

      socket.emit("game-started", roomId, currentQuestionIndex);

      socket.on("game-started", (question, abc) => {
        // Handle the next question event
        console.log(question, abc);
        setQuestions((prevQuestions) => [...prevQuestions, question]);
        setTimer(10); // Reset the timer for the new question
        setUserAnswer("");
        setUserAnswerSubmitted(false);
        setIsLastQuestion(false);
      });

      socket.on("game-over", (scores) => {
        // Handle the game over event
        console.log("game over client side");
        
        setIsLastQuestion(true);
        setTimerExpired(true);
        // Calculate the final score here if needed
      });
    }
  }, [socket, roomId, userId]);

  useEffect(() => {
    // Start a timer for each question
    if (currentQuestionIndex <= 4 && !isLastQuestion) {
      const interval = setInterval(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        } else {
          // Handle time's up, move to the next question
          setTimerExpired(true);
          if (!userAnswerSubmitted) {
            // User hasn't submitted an answer, so emit "submit-answer"
            socket.emit("submit-answer", roomId, currentQuestionIndex);
          }

          if (currentQuestionIndex < 4) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setTimer(10);
          } else {
            // If it's the last question, set isLastQuestion to true
           // setIsLastQuestion(true);
            clearInterval(interval);
          }
        }
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [currentQuestionIndex, timer, roomId, socket, userAnswerSubmitted, isLastQuestion]);

  const handleAnswerSubmit = () => {
    // Check if the user's answer is correct and questions are defined
    if (
      questions[currentQuestionIndex] &&
      userAnswer === questions[currentQuestionIndex].correctAnswer
    ) {
      // Award 10 points for a correct answer
      setScore(score + 10);
    }
    setUserAnswerSubmitted(true);
    socket.emit("submit-answer", roomId, currentQuestionIndex);
    // Move to the next question if questions are defined
    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimer(10);
      setUserAnswer("");
    } else {
      // If it's the last question, set isLastQuestion to true
      //setIsLastQuestion(true);
    }
  };

  return (
    <div className="gameplay-container">
      <h2>Gameplay</h2>
      <div className="users-list">
        <h3>Users in the room:</h3>
        <ul>
          {usersInRoom.map((user) => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>
      {currentQuestionIndex < questions.length && !isLastQuestion ? (
        <div className="question-container">
          <h3>Question {currentQuestionIndex + 1}</h3>
          {questions[currentQuestionIndex] ? (
            <div>
              <p className="question-text">
                {questions[currentQuestionIndex].question}
              </p>
              <p className="timer-text">Time Remaining: {timer} seconds</p>
              <input
                type="text"
                placeholder="Your answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
              <button className="submit-button" onClick={handleAnswerSubmit}>
                Submit Answer
              </button>
            </div>
          ) : null}
        </div>
      ) : isLastQuestion ? (
        <div className="game-over-container">
          <h3>Game Over</h3>
          <p>Your Score: {score}</p>
        </div>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
}

export default Gameplay;
