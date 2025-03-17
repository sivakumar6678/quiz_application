let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 10;
let timer;
let hintsUsed = 0;
let userAnswers = [];
let categoryScore = {};
let soundEnabled = true; // Sound toggle feature

const homePage = document.getElementById("home-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const leaderboardPage = document.getElementById("leaderboard-page");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const nextButton = document.getElementById("next-btn");
const progressElement = document.getElementById("progress");
const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const leaderboardElement = document.getElementById("leaderboard");
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const badgesElement = document.getElementById("badges");
const reviewElement = document.getElementById("review");
const hintButton = document.getElementById("hint-btn");
const soundToggle = document.getElementById("sound-toggle");

async function startQuiz() {
  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;
  const quizLength = parseInt(document.getElementById("quiz-length").value);

  const apiUrl = `https://opentdb.com/api.php?amount=${quizLength}&category=${category}&difficulty=${difficulty}&type=multiple`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  quizQuestions = data.results.map(q => ({
    question: q.question,
    options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
    answer: q.correct_answer,
    difficulty: q.difficulty // Store difficulty for better hints
  }));

  homePage.classList.add("d-none");
  quizPage.classList.remove("d-none");
  userAnswers = [];
  hintsUsed = 0;
  currentQuestionIndex = 0;
  score = 0;
  
  if (!categoryScore[category]) categoryScore[category] = 0;
  
  loadQuestion();
  startTimer();
}

function loadQuestion() {
  const currentQuestion = quizQuestions[currentQuestionIndex];
  questionElement.innerHTML = currentQuestion.question;
  optionsElement.innerHTML = "";
  
  currentQuestion.options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("btn", "btn-outline-primary");
    button.onclick = () => checkAnswer(option);
    optionsElement.appendChild(button);
  });

  progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
  hintButton.disabled = hintsUsed >= 1;
}

function checkAnswer(selectedOption) {
  const currentQuestion = quizQuestions[currentQuestionIndex];
  userAnswers[currentQuestionIndex] = selectedOption;

  optionsElement.querySelectorAll("button").forEach(button => {
    button.disabled = true;
    if (button.textContent === currentQuestion.answer) {
      button.classList.add("btn-success");
    } else if (button.textContent === selectedOption) {
      button.classList.add("btn-danger");
    }
  });

  if (selectedOption === currentQuestion.answer) {
    score++;
    categoryScore[document.getElementById("category").value]++;

    if (soundEnabled) correctSound.play();
  } else {
    if (soundEnabled) wrongSound.play();
    timeLeft -= 3; // Timer penalty for wrong answer
    if (timeLeft < 1) timeLeft = 1;
  }

  nextButton.classList.remove("d-none");
  clearInterval(timer);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizQuestions.length) {
    loadQuestion();
    startTimer();
    nextButton.classList.add("d-none");
  } else {
    showResult();
  }
}

function startTimer() {
  timeLeft = 10;
  timerElement.textContent = `Time Left: ${timeLeft}s`;
  
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Time Left: ${timeLeft}s`;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      checkAnswer(null);
      setTimeout(() => nextQuestion(), 2000);
    }
  }, 1000);
}

function showResult() {
  quizPage.classList.add("d-none");
  resultPage.classList.remove("d-none");

  scoreElement.textContent = `Your Score: ${score} out of ${quizQuestions.length}`;
  saveHighScore();
  awardBadges();
  showReview();
}

function saveHighScore() {
  let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  
  const category = document.getElementById("category").value;
  highScores.push({ category, score, date: new Date().toLocaleString() });

  highScores = highScores.sort((a, b) => b.score - a.score).slice(0, 5); // Keep top 5 scores

  localStorage.setItem("highScores", JSON.stringify(highScores));
  displayLeaderboard();
}

function displayLeaderboard() {
  let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  leaderboardElement.innerHTML = highScores.map(score => `
    <li>${score.category}: ${score.score} points on ${score.date}</li>
  `).join("");
}

function awardBadges() {
  badgesElement.innerHTML = score === quizQuestions.length
    ? `<span class="badge bg-success">Perfect Score!</span>`
    : score >= quizQuestions.length * 0.8
    ? `<span class="badge bg-warning">Great Job!</span>`
    : "";
}

function showReview() {
  reviewElement.innerHTML = quizQuestions.map((q, index) => `
    <div>
      <strong>Q${index + 1}:</strong> ${q.question} <br> 
      <span class="${userAnswers[index] === q.answer ? "text-success" : "text-danger"}">
        Your Answer: ${userAnswers[index] || "No answer"}
      </span><br>
      <span class="text-success">Correct Answer: ${q.answer}</span>
    </div>
  `).join("");
}

function useHint() {
  if (hintsUsed < 1) {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    let hintMessage = "Think carefully!";

    if (currentQuestion.difficulty === "easy") {
      hintMessage = "Remember the basics!";
    } else if (currentQuestion.difficulty === "medium") {
      hintMessage = "Try eliminating wrong answers.";
    } else if (currentQuestion.difficulty === "hard") {
      hintMessage = "It's tricky! Focus on keywords.";
    }

    alert(hintMessage);
    hintsUsed++;
    hintButton.disabled = true;
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "Sound: ON" : "Sound: OFF";
}

function restartQuiz() {
  resultPage.classList.add("d-none");
  homePage.classList.remove("d-none");
  badgesElement.innerHTML = "";
  reviewElement.innerHTML = "";
}
