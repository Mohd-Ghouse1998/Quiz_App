const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDb = require("./config/db");
const route = require("./routes/route");
let createRoom = require("./controllers/createRoom");
const roomModel = require("./models/roomModel");
const userModel = require("./models/userModel");
const http = require("http");
const socketIo = require("socket.io");
connectDb();
const app = express();
app.use(cors());
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/api", route);

const usersInRooms = {};
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);

    const roomGameStarted = {};

    socket.on("game-started", (roomId, currentQuestionIndex) => {
      console.log(currentQuestionIndex);
      if (currentQuestionIndex < 4) {
       // const nextQuestionIndex = currentQuestionIndex;
        const questions = createRoom.sampleQuestions;
        const nextQuestion = questions[currentQuestionIndex];

        io.to(roomId).emit("game-started", nextQuestion, currentQuestionIndex);
        const timerDuration = 50000;
        setTimeout(() => {
          io.to(roomId).emit("game-over");
          return;
        }, timerDuration);
      }
    });

    // The "join-room" event listener can remain as it is
    socket.on("adding-users", async (roomId, userId) => {
      if (!usersInRooms[roomId]) {
        usersInRooms[roomId] = [];
      }
      if (usersInRooms[roomId].includes(userId)) {
        io.to(roomId).emit("users-list", usersInRooms[roomId]);
      } else {
        usersInRooms[roomId].push(userId);
        io.to(roomId).emit("users-list", usersInRooms[roomId]);
      }

      console.log("hiiiii");
      const room = await roomModel.findById(roomId);
      if (!room) {
        socket.emit("game-error", { message: "Room not found" });
        return;
      }

      // Check if the room is full
      if (room.users.length > 2) {
        socket.emit("game-error", { message: "Room is full" });
        return;
      }

      // Check if the user exists
      const user = await userModel.findById(userId);
      if (!user) {
        socket.emit("game-error", { message: "User not found" });
        return;
      }

      // Check if the user is already in a room
      // if (user.currentRoom) {
      //   socket.emit("game-error", { message: "User is already in a room" });
      //   return;
      // }

      // Add the user to the room and update user's currentRoom field
      console.log("user pushed ");
      room.users.push(userId);
      await room.save();
      user.currentRoom = roomId;
      await user.save();

      if (room.gameInProgress) {
        return res.status(400).json({ error: "Game is already in progress" });
      }

      if (room.users.length === 2) {
        console.log("lenght");
        io.to(roomId).emit("start-game");
        roomGameStarted[roomId] = true;
      } else if (room.users.length < 2) {
        socket.emit("game-error", {
          message: "At least 2 users are required to start the game",
        });
        return;
      }
    });

    socket.on("answer-question", (data) => {
      // Handle the answer and emit a response to the room
      io.to(data.roomId).emit("question-result", { correct: true });
    });

    //io.to(roomId).emit("users-list", usersInRooms[roomId]);

   
  });


  socket.on("disconnect", () => {
    console.log("A user disconnected");

    for (const roomId in usersInRooms) {
      const index = usersInRooms[roomId].indexOf(socket.userId);
      if (index !== -1) {
        usersInRooms[roomId].splice(index, 1);

        io.to(roomId).emit("users-list", usersInRooms[roomId]);
      }
    }
  });

  // Define the "game-started" event listener outside of the "join-room" event listener
});
module.exports = {server,io}
server.listen(process.env.PORT || 5000, () => {
  console.log(`Express is running on port ${process.env.PORT || 5000}`);
});
