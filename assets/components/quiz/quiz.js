document.addEventListener("DOMContentLoaded", function() {
  /* 
  --------------------------------------------------------
   1) QUIZ DATA 
  --------------------------------------------------------
  */
  const quizOptions = {
    quizTitle: "Find Your Ideal SlimFix Formula",
    quizSubtitle: `Answer these quick questions to craft a powerful, customized solution—perfectly aligned with your body, goals, and lifestyle. Get ready for results you’ll see and feel!`,
    
    questions: [
      // QUESTION 1 – Gender
      {
        type: "singleButtons",
        question: "What is your gender?",
        answers: [
          { label: "Female", value: "female" },
          { label: "Male", value: "male" }
        ]
      },
      // QUESTION 2 – Age
      {
        type: "singleButtons",
        question: "What is your age?",
        answers: [
          { label: "Under 30", value: "under30" },
          { label: "Between 30 and 44", value: "30to44" },
          { label: "Between 45 and 59", value: "45to59" },
          { label: "60 or older", value: "60plus" }
        ]
      },
      // QUESTION 3 – Current Weight (lbs)
      {
        type: "singleNumber",
        question: "What is your current weight? (in lbs)",
        answers: []
      },
      // QUESTION 4 – Desired Weight (slider)
      {
        type: "singleSlider",
        question: "What would you like your weight to be? (in lbs)",
        min: 0,
        max: 400,
        answers: []
      },
      // QUESTION 5 – Multi: Desired benefits
      {
        type: "multi",
        question: "What benefits would you like to see from weight loss? (Select all that apply.)",
        answers: [
          { label: "More Energy", value: "energy" },
          { label: "Increased Confidence", value: "confidence" },
          { label: "Improved Heart Health", value: "heartHealth" },
          { label: "Better Sleep", value: "betterSleep" },
          { label: "Better Digestion and Less Bloating", value: "betterDigestion" },
          { label: "Lower Inflammation", value: "lowerInflammation" },
          { label: "Mobility Improvement", value: "mobilityImprovement" },
          { label: "Increased Libido", value: "increasedLibido" },
          { label: "Reduced Stress", value: "reducedStress" },
          { label: "I don't want any specific benefits", value: "noSpecificBenefits" }
        ]
      },
      // QUESTION 6 – Multi: Methods tried
      {
        type: "multi",
        question: "Have you struggled to achieve your weight loss goals with any of these methods? (Select all that apply.)",
        answers: [
          { label: "Dieting", value: "dieting" },
          { label: "Calorie Counting", value: "calorieCounting" },
          { label: "Exercise", value: "exercise" },
          { label: "Better Sleep", value: "betterSleepQ7" },
          { label: "Personal Trainer", value: "personalTrainer" },
          { label: "Meal Plans", value: "mealPlans" },
          { label: "Fasting", value: "fasting" },
          { label: "Medication", value: "medication" },
          { label: "Bariatric Surgery", value: "bariatricSurgery" },
          { label: "None of the options", value: "noneOfTheOptions" }
        ]
      }
    ],

    // Progress screen text
    progressText: {
      headline: `Please wait just a few moments while we calculate the ideal nutrient ratio for your body. We’ll fine-tune every ingredient to ensure you get the results you’ve been craving—starting from Day One!`,
      steps: [
        "Analyzing body characteristics…",
        "Calculating BMI and lean mass…",
        "Reviewing ideal nutrient ratios…",
        "Formulating your personalized blend…"
      ],
      countdownSeconds: 15
    },

    // Result screen text
    resultText: {
      headline: "Congratulations!",
      body: `Your personalized SlimFix formula is ready—and it’s tailored to help you reach your weight and wellness goals faster than ever!\n
Even better, you’ve unlocked an exclusive discount valid only here and now: you can get 3 bottles for FREE when you choose our recommended 6-month program.\n
This longer treatment ensures your gut has time to fully balance out, giving you sustained results—no more yo-yo dieting, no more wasted effort!\n
Ready to start?`,
      buttonText: "Unlock my discount and personalized formula!"
    },

    // Result image
    resultImage: "./img/happy-woman.webp"
  };

  /*
  --------------------------------------------------------
   2) QUIZ STATE
  --------------------------------------------------------
  */
  let currentQuestionIndex = 0;
  let userAnswers = {}; // { questionIndex: [values] }
  let progressCount = 0;
  let timeRemaining = quizOptions.progressText.countdownSeconds;
  let progressInterval = null;

  const quizBox = document.getElementById('quiz-box');
  if (!quizBox) {
    console.error('quiz-vbl.js: No element found with id="quiz-box".');
    return;
  }

  /*
  --------------------------------------------------------
   3) HELPER FUNCTIONS
  --------------------------------------------------------
  */

  function handleSingleButtonsAnswer(questionIndex, answerValue) {
    userAnswers[questionIndex] = [answerValue];
    currentQuestionIndex++;
    renderQuiz();
  }

  function handleMultiAnswerToggle(questionIndex, answerValue) {
    const existing = userAnswers[questionIndex] || [];
    if (existing.includes(answerValue)) {
      userAnswers[questionIndex] = existing.filter(val => val !== answerValue);
    } else {
      userAnswers[questionIndex] = [...existing, answerValue];
    }
  }

  function handleInputChange(questionIndex, newValue) {
    userAnswers[questionIndex] = [newValue];
  }

  function handleNextQuestion() {
    currentQuestionIndex++;
    renderQuiz();
  }

  function handlePrevQuestion() {
    currentQuestionIndex--;
    renderQuiz();
  }

  function startProgressTimer() {
    progressCount = 0;
    timeRemaining = quizOptions.progressText.countdownSeconds;

    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(function() {
      progressCount++;
      timeRemaining--;
      renderQuiz(); 

      if (timeRemaining <= 0) {
        clearInterval(progressInterval);
        currentQuestionIndex++;
        renderQuiz();
      }
    }, 1000);
  }

  function unlockDiscount() {
    const afterQuizDiv = document.querySelector('.after-quiz');
    if (afterQuizDiv) {
      quizBox.style.display = 'none';
      afterQuizDiv.style.display = 'block';
    }
    document.dispatchEvent(new Event('quizUnlockDiscount'));
  }

  /*
  --------------------------------------------------------
   4) MAIN RENDER FUNCTION
  --------------------------------------------------------
  */
  function renderQuiz() {
    const totalQuestions = quizOptions.questions.length;
    const isProgressScreen = (currentQuestionIndex === totalQuestions);
    const isResultScreen = (currentQuestionIndex === totalQuestions + 1);

    quizBox.innerHTML = '';

    // 1) Show question screens
    if (!isProgressScreen && !isResultScreen && currentQuestionIndex < totalQuestions) {
      const qData = quizOptions.questions[currentQuestionIndex];
      const qType = qData.type;
      const qQuestion = qData.question || '';
      const answers = qData.answers || [];
      const storedValue = (userAnswers[currentQuestionIndex] || [])[0];

      // If storedValue is undefined, we fallback to qData.min for singleSlider
      let currentValue = storedValue;
      if (qType === 'singleSlider' && typeof storedValue === 'undefined') {
        currentValue = qData.min || 0;
      }

      const minVal = qData.min || 0;
      const maxVal = qData.max || 10;

      let html = `
        <section id="quiz">
          <div class="container p-4 rounded-4 text-center" style="max-width:900px;">
            <h2 class="text-center text-warning">${quizOptions.quizTitle}</h2>
            <small class="text-center quiz-subtitle d-none d-md-block">${quizOptions.quizSubtitle}</small>
            <p class="quiz-subtitle text-center d-md-none">${quizOptions.quizSubtitle}</p>

            <div class="mt-3 question active">
              <h4>${qQuestion}</h4>
      `;

      // singleButtons
      if (qType === 'singleButtons') {
        html += `<div class="mx-auto" style="max-width:320px;">`;
        answers.forEach((ans, idx) => {
          html += `
            <button
              data-idx="${idx}"
              data-value="${ans.value}"
              class="d-block w-100 mb-3 btn px-4 option single-buttons-answer" style="background: linear-gradient(180deg, #FFD700 0%, #e6b800 100%); color: #1A2E1C; font-weight: 700; border: none; box-shadow: 0 3px 0 #c49b00;"
            >
              ${ans.label}
            </button>
          `;
        });
        html += `</div>`;
      }

      // multi
      if (qType === 'multi') {
        html += `
          <div class="mx-auto" style="max-width:600px; font-size:0.9rem;">
            <hr />
            <div class="row row-cols-1 row-cols-md-2 gx-5 mx-auto">
        `;
        answers.forEach((ans, idx) => {
          const checked = (userAnswers[currentQuestionIndex] || []).includes(ans.value);
          const checkId = "q" + currentQuestionIndex + "-ans" + idx;
          html += `
            <div class="col">
              <div class="form-check text-start mb-2 w-100">
                <input
                  class="form-check-input multi-check"
                  type="checkbox"
                  id="${checkId}"
                  data-value="${ans.value}"
                  ${checked ? 'checked' : ''}
                />
                <label class="form-check-label" for="${checkId}">${ans.label}</label>
              </div>
            </div>
          `;
        });
        html += `
            </div>
            <hr class="my-0" />
            <button class="btn next-btn mt-3 next-button mx-auto w-50 d-block" style="background: linear-gradient(180deg, #FFD700 0%, #e6b800 100%); color: #1A2E1C; font-weight: 700; border: none; box-shadow: 0 3px 0 #c49b00;">
              ${currentQuestionIndex === totalQuestions - 1 ? 'Calculate' : 'Next >'}
            </button>
          </div>
        `;
      }

      // singleText
      if (qType === 'singleText') {
        html += `
          <div class="mx-auto" style="max-width:320px;">
            <input
              type="text"
              class="form-control mb-3 single-text-input"
              placeholder="Your Name"
              value="${currentValue || ''}"
            />
            <button class="btn next-btn w-50 d-block mx-auto" style="background: linear-gradient(180deg, #FFD700 0%, #e6b800 100%); color: #1A2E1C; font-weight: 700; border: none; box-shadow: 0 3px 0 #c49b00;">
              Next &gt;
            </button>
          </div>
        `;
      }

      // singleNumber
      if (qType === 'singleNumber') {
        html += `
          <div class="mx-auto" style="max-width:320px;">
            <input
              type="number"
              class="form-control mb-3 single-number-input"
              step="1"
              placeholder="lbs (e.g., 150)"
              value="${currentValue || ''}"
            />
            <button class="btn next-btn w-50 d-block mx-auto" style="background: linear-gradient(180deg, #FFD700 0%, #e6b800 100%); color: #1A2E1C; font-weight: 700; border: none; box-shadow: 0 3px 0 #c49b00;">Next &gt;</button>
          </div>
        `;
      }

      // singleSlider
      if (qType === 'singleSlider') {
        // The main fix is this "currentValString" logic to properly display `0`:
        const currentValString = (currentValue !== undefined) ? currentValue : minVal;

        html += `
          <div class="mx-auto" style="max-width:320px;">
            <input
              type="range"
              class="form-range mb-3 single-slider-input"
              step="1"
              min="${minVal}"
              max="${maxVal}"
              value="${currentValString}"
            />
            <div class="mb-3">Current Value: <span class="slider-display">${currentValString}</span></div>
            <button class="btn next-btn w-50 d-block mx-auto" style="background: linear-gradient(180deg, #FFD700 0%, #e6b800 100%); color: #1A2E1C; font-weight: 700; border: none; box-shadow: 0 3px 0 #c49b00;">
              Next &gt;
            </button>
          </div>
        `;
      }

      // If not the first question, show "Previous" button
      if (currentQuestionIndex > 0) {
        html += `
          <button
            class="btn prev-btn mt-3 back-button mx-auto px-4"
            style="display:block; max-width: fit-content; background: transparent; color: #ffffffcc; font-weight: 600; border: 1px solid #ffffff55; border-radius: 0.5rem; font-size: 0.9rem;"
          >
            Back
          </button>
        `;
      }

      html += `
            </div> <!-- .question.active -->
          </div> <!-- .container -->
        </section>
      `;

      quizBox.innerHTML = html;

      // Handlers
      if (qType === 'singleButtons') {
        quizBox.querySelectorAll('.single-buttons-answer').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const val = e.currentTarget.getAttribute('data-value');
            handleSingleButtonsAnswer(currentQuestionIndex, val);
          });
        });
      }

      if (qType === 'multi') {
        const nextBtn = quizBox.querySelector('.next-button');
        if (nextBtn) {
          nextBtn.addEventListener('click', handleNextQuestion);
        }
        quizBox.querySelectorAll('.multi-check').forEach(chk => {
          chk.addEventListener('change', (e) => {
            const val = e.target.getAttribute('data-value');
            handleMultiAnswerToggle(currentQuestionIndex, val);
          });
        });
      }

      if (qType === 'singleText') {
        const inputEl = quizBox.querySelector('.single-text-input');
        const nextBtn = quizBox.querySelector('.next-btn');
        if (inputEl && nextBtn) {
          nextBtn.addEventListener('click', () => {
            handleInputChange(currentQuestionIndex, inputEl.value.trim());
            handleNextQuestion();
          });
        }
      }

      if (qType === 'singleNumber') {
        const inputEl = quizBox.querySelector('.single-number-input');
        const nextBtn = quizBox.querySelector('.next-btn');
        if (inputEl && nextBtn) {
          nextBtn.addEventListener('click', () => {
            handleInputChange(currentQuestionIndex, inputEl.value);
            handleNextQuestion();
          });
        }
      }

      if (qType === 'singleSlider') {
        const sliderEl = quizBox.querySelector('.single-slider-input');
        const nextBtn = quizBox.querySelector('.next-btn');
        const displaySpan = quizBox.querySelector('.slider-display');
        if (sliderEl && nextBtn && displaySpan) {
          sliderEl.addEventListener('input', (e) => {
            handleInputChange(currentQuestionIndex, e.target.value);
            displaySpan.textContent = e.target.value;
          });
          nextBtn.addEventListener('click', handleNextQuestion);
        }
      }

      const prevBtn = quizBox.querySelector('.prev-btn');
      if (prevBtn) {
        prevBtn.addEventListener('click', handlePrevQuestion);
      }

    }
    // 2) Progress screen
    else if (isProgressScreen) {
      const percent = (progressCount / quizOptions.progressText.countdownSeconds) * 100;
      const steps = quizOptions.progressText.steps || [];
      const totalTime = quizOptions.progressText.countdownSeconds;
      const stepCount = steps.length;
      const stepIndex = Math.min(stepCount - 1, Math.floor((progressCount / totalTime) * stepCount));
      const stepText = steps[stepIndex] || '';

      const html = `
        <section id="progress">
          <div class="container p-3 p-md-3 rounded-4 text-center" style="max-width:900px;">
            <p class="fs-6 mt-3"><b>${quizOptions.progressText.headline}</b></p>
            <div
              id="progress-bar"
              class="rounded-pill mx-auto w-100 overflow-hidden"
              style="background-color:#e2e2e2; max-width:400px; height:14px; box-shadow:0 1px 0 rgba(0,0,0,0.14) inset;"
            >
              <div
                id="fill"
                class="rounded-pill h-100"
                style="
                  background-image: linear-gradient(to left, #FFD700, #e6b800);
                  width:${percent}%;
                  transition: width 0.5s;
                "
              ></div>
            </div>
            <p class="mt-3" style="font-size:14px;">
              Time remaining: <b>${timeRemaining}</b> seconds
            </p>
            <div id="progress-steps">
              <div class="step-txt">${stepText}</div>
            </div>
          </div>
        </section>
      `;
      quizBox.innerHTML = html;

      if (!progressInterval) {
        startProgressTimer();
      }
    }
    // 3) Result screen
    else if (isResultScreen) {
      const html = `
        <section id="result">
          <div class="container p-3 p-md-4 rounded-4 text-center" style="max-width:900px;">
            <div class="row">
              <div class="col-md-6 d-flex" style="z-index:9;">
                <div class="result-text text-start">
                  <h2 class="text-warning mb-3"><b>${quizOptions.resultText.headline}</b></h2>
                  <p style="white-space:pre-line;">${quizOptions.resultText.body}</p>
                  <button
                    class="btn mb-3 mb-md-0"
                    style="padding:12px; font-weight:800; color:#1A2E1C; font-size:18px; line-height:20px; z-index:10; background: linear-gradient(180deg, #FFD700 0%, #e6b800 100%); border: none; box-shadow: 0 3px 0 #c49b00;"
                    id="unlock-discount"
                  >
                    ${quizOptions.resultText.buttonText}
                  </button>
                </div>
              </div>
              <div class="col-md-6 d-flex justify-content-center align-items-center" style="z-index:2;">
                <img
                  src="${quizOptions.resultImage}"
                  alt="Result Image"
                  class="img-fluid rounded-2"
                  style="max-width:100%; height:auto; z-index:2;"
                />
              </div>
            </div>
          </div>
        </section>
      `;
      quizBox.innerHTML = html;

      const unlockBtn = quizBox.querySelector('#unlock-discount');
      if (unlockBtn) {
        unlockBtn.addEventListener('click', unlockDiscount);
      }
    }
    else {
      quizBox.innerHTML = '<p>Thank you!</p>';
    }
  }

  /*
  --------------------------------------------------------
   5) INITIALIZE
  --------------------------------------------------------
  */
  renderQuiz();
});
