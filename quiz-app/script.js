const questions = [
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      answer: "Paris"
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      answer: "Mars"
    },
    {
      question: "What is the largest mammal?",
      options: ["Elephant", "Blue Whale", "Giraffe", "Shark"],
      answer: "Blue Whale"
    }
  ];
  
  let currentQuestionIndex = 0;
  let score = 0;
  let timeLeft = 10;
  let timer;
  
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
  
  function startQuiz() {
    homePage.classList.add("d-none");
    quizPage.classList.remove("d-none");
    loadQuestion();
    startTimer();
  }
  
  function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;
    optionsElement.innerHTML = "";
    currentQuestion.options.forEach(option => {
      const button = document.createElement("button");
      button.textContent = option;
      button.classList.add("btn", "btn-outline-primary");
      button.onclick = () => checkAnswer(option);
      optionsElement.appendChild(button);
    });
    progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  }
  
  function checkAnswer(selectedOption) {
    const currentQuestion = questions[currentQuestionIndex];
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
    if (currentQuestionIndex < questions.length) {
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
    scoreElement.textContent = `Your Score: ${score} out of ${questions.length}`;
  }
  
  function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    resultPage.classList.add("d-none");
    homePage.classList.remove("d-none");
  }