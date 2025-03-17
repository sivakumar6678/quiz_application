let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 10;
let timer;
let hintsUsed = 0;
let userAnswers = []; // Store user's answers for review

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
const hintButton = document.getElementById("hint-btn");

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
  userAnswers = []; // Reset user answers
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
  hintButton.disabled = hintsUsed >= 1; // Disable hint if already used
}

function checkAnswer(selectedOption) {
  const currentQuestion = quizQuestions[currentQuestionIndex];
  userAnswers[currentQuestionIndex] = selectedOption; // Store user's answer

  optionsElement.querySelectorAll("button").forEach(button => {
    button.disabled = true; // Disable all buttons after selection
    if (button.textContent === currentQuestion.answer) {
      button.classList.add("btn-success"); // Correct answer in green
    } else if (button.textContent === selectedOption) {
      button.classList.add("btn-danger"); // Selected wrong answer in red
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
      checkAnswer(null); // Automatically check answer when time runs out
      setTimeout(() => nextQuestion(), 2000); // Move to next question after 2 seconds
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
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === q.answer;
    div.innerHTML = `
      <strong>Q${index + 1}:</strong> ${q.question} 
      <br> 
      <span class="${isCorrect ? "text-success" : "text-danger"}">Your Answer: ${userAnswer || "No answer"}</span>
      <br>
      <span class="text-success">Correct Answer: ${q.answer}</span>
    `;
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
    hintButton.disabled = true; // Disable hint button after use
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