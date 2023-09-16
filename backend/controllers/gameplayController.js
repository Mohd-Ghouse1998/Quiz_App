
const roomModel = require("../models/roomModel");
const userModel = require("../models/userModel");
const sampleQuestions = [
  {
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Venus", "Jupiter"],
    correctAnswer: "Mars",
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["Giraffe", "Elephant", "Blue Whale", "Hippopotamus"],
    correctAnswer: "Blue Whale",
  },
  {
    question: "Who painted the Mona Lisa?",
    options: [
      "Leonardo da Vinci",
      "Pablo Picasso",
      "Vincent van Gogh",
      "Michelangelo",
    ],
    correctAnswer: "Leonardo da Vinci",
  },
  {
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctAnswer: "Carbon Dioxide",
  },
  
];




function selectRandomQuestions(allQuestions) {
 
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  
  return allQuestions.slice(0, 5);
}


const handleGameplay = async (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.params.userId;
  try {
   
    const room = await roomModel.findById(roomId);
    const user = await userModel.findById(userId);
    if (!room || !user) {
      return res.status(404).json({ error: "Room or user not found" });
    }

   
    if (room.gameInProgress) {
      return res.status(400).json({ error: "Game is already in progress" });
    }

    

  
    console.log("start......................");
   
    const questions = selectRandomQuestions(sampleQuestions);
    console.log("end......................");
    
    room.gameInProgress = true;
    room.questions = questions;
    room.currentQuestionIndex = 0;
    room.scores = {}; 
    console.log("Emitting next-question event with question:", questions[0]);
    console.log(roomId)
 
    req.io.to(roomId).emit("next-question", questions[0]);

   
    await room.save();

    res.status(200).json({ message: "Game started successfully" });
  } catch (error) {
    console.error("Error handling gameplay:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const answerQuestion = async (req, res) => {
  const { roomId, userId } = req.params;
  const { answer } = req.body;

  try {
   
    const room = await roomModel.findById(roomId);
    const user = await userModel.findById(userId);

    if (!room || !user) {
      return res.status(404).json({ error: "Room or user not found" });
    }

    
    if (!room.gameInProgress) {
      return res.status(400).json({ error: "Game is not in progress" });
    }

   
    const currentQuestion = room.questions[room.currentQuestionIndex];

    if (!currentQuestion) {
      
      return res.status(400).json({ error: "No more questions" });
    }

   
    const isCorrect = currentQuestion.correctAnswer === answer;

    
    if (!room.scores[userId]) {
      room.scores[userId] = 0;
    }

    if (isCorrect) {
      room.scores[userId] += 10; 
    }

   
    room.currentQuestionIndex++;

    if (room.currentQuestionIndex < room.questions.length) {
     
      req.io
        .to(roomId)
        .emit("next-question", room.questions[room.currentQuestionIndex]);
    } else {
     
      req.io.to(roomId).emit("game-over", room.scores);

     
      room.gameInProgress = false;
      await room.save();
    }

    res
      .status(200)
      .json({ message: isCorrect ? "Correct answer" : "Incorrect answer" });
  } catch (error) {
    console.error("Error answering question:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const sampleQuestions1 =async (req,res) => {
  let sample = [
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      correctAnswer: "Paris",
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Venus", "Jupiter"],
      correctAnswer: "Mars",
    },
    {
      question: "What is the largest mammal in the world?",
      options: ["Giraffe", "Elephant", "Blue Whale", "Hippopotamus"],
      correctAnswer: "Blue Whale",
    },
    {
      question: "Who painted the Mona Lisa?",
      options: [
        "Leonardo da Vinci",
        "Pablo Picasso",
        "Vincent van Gogh",
        "Michelangelo",
      ],
      correctAnswer: "Leonardo da Vinci",
    },
    {
      question: "Which gas do plants absorb from the atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      correctAnswer: "Carbon Dioxide",
    },
    
  ];

  res.send({ status: true, error: false, data: sample });
};

module.exports = {
  handleGameplay,
  answerQuestion,
  sampleQuestions1,
};
