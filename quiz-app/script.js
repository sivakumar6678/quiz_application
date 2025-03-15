let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 10;
let timer;
let hintsUsed = 0;

const homePage = document.getElementById("home-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const nextButton = document.getElementById("next-btn");
const progressElement = document.getElementById("progress");
const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const badgesElement = document.getElementById("badges");
const reviewElement = document.getElementById("review");

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
    answer: q.correct_answer
  }));

  homePage.classList.add("d-none");
  quizPage.classList.remove("d-none");
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
}

function checkAnswer(selectedOption) {
  const currentQuestion = quizQuestions[currentQuestionIndex];
  optionsElement.querySelectorAll("button").forEach(button => {
    button.disabled = true; // Disable all buttons after selection
    if (button.textContent === currentQuestion.answer) {
      button.classList.add("btn-success");
    } else if (button.textContent === selectedOption) {
      button.classList.add("btn-danger");
    }
  });

  if (selectedOption === currentQuestion.answer) {
    score++;
    correctSound.play();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } else {
    wrongSound.play();
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
    }
  }, 1000);
}

function showResult() {
  quizPage.classList.add("d-none");
  resultPage.classList.remove("d-none");
  scoreElement.textContent = `Your Score: ${score} out of ${quizQuestions.length}`;
  awardBadges();
  showReview();
}

function awardBadges() {
  if (score === quizQuestions.length) {
    badgesElement.innerHTML = `<span class="badge bg-success">Perfect Score!</span>`;
  } else if (score >= quizQuestions.length * 0.8) {
    badgesElement.innerHTML = `<span class="badge bg-warning">Great Job!</span>`;
  }
}

function showReview() {
  quizQuestions.forEach((q, index) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>Q${index + 1}:</strong> ${q.question} - <span class="text-success">${q.answer}</span>`;
    reviewElement.appendChild(div);
  });
}

function useHint() {
  if (hintsUsed < 1) {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const wrongOptions = currentQuestion.options.filter(opt => opt !== currentQuestion.answer);
    const randomWrongOptions = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
    optionsElement.querySelectorAll("button").forEach(button => {
      if (randomWrongOptions.includes(button.textContent)) {
        button.disabled = true;
      }
    });
    hintsUsed++;
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function shareResults() {
  const shareText = `I scored ${score} out of ${quizQuestions.length} on this quiz! Can you beat it?`;
  alert(shareText); // Replace with actual sharing logic
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  hintsUsed = 0;
  resultPage.classList.add("d-none");
  homePage.classList.remove("d-none");
  badgesElement.innerHTML = "";
  reviewElement.innerHTML = "";
}