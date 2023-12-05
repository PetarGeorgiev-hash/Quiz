interface IFormData {
  [key: string]: string | undefined;
}
type Question = {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

const quiz = {
  wrapper: document.getElementById("layout"),
  isCustomAdded: false,
  triviaState: {
    questionNumber: 0,
    correctAnswer:
      Number(localStorage.getItem("true")) > 0
        ? Number(localStorage.getItem("true"))
        : 0,
    falseAnswers:
      Number(localStorage.getItem("false")) > 0
        ? Number(localStorage.getItem("false"))
        : 0,
  },
  init() {
    //if there is cached or undone quiz load it
    const questionData = localStorage.getItem("questions");

    if (questionData !== null && questionData !== "undefined") {
      //if its cached but done load the button and the score
      if (
        questionData == "[]" &&
        (this.triviaState.questionNumber > 0 ||
          this.triviaState.falseAnswers > 0)
      ) {
        this.addScoreBtn();
      } else {
        const parsedData = JSON.parse(questionData);
        this.triviaState.questionNumber = parsedData.length;
        this.renderQuestions(parsedData);
      }
    }
    // if its the first load or a new quiz load it

    this.loadCachedFormData(); //check if there is a cache form

    this.fetchApiData("https://catfact.ninja/fact"); //generate cat fact
    this.loadForm();
    this.addQuestion();
  },
  loadForm(): void {
    const genBtn: HTMLElement | null = document.getElementById("generateQuiz");
    if (genBtn !== null) {
      genBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const ul = document.querySelector("ul");
        const button = document.getElementById("scoreBtn");
        if (ul !== null) {
          ul.remove();
        }
        if (button !== null) {
          button.remove();
        }

        this.clearStorageAndState();
        this.getFormData();
      });
    }
  },
  addQuestion(): void {
    // create the form for adding the custom question and append the event listener when clicked to render the question
    const addQuestion = document.getElementById(
      "addQuestion"
    ) as HTMLButtonElement | null;
    if (addQuestion) {
      addQuestion.addEventListener("click", (e) => {
        e.preventDefault();
        if (addQuestion.parentElement) {
          addQuestion.parentElement.innerHTML += `
          <label>Question</label>
          <input id="questionInput" type='text' placeholder="Write a question"/>
          <label>Answers</label>
          <input class="answer" type='text' placeholder="add CORRECT answer"/>
          <input class="answer" type='text' placeholder="add FALSE answer"/>
          <input class="answer" type='text' placeholder="add FALSE answer"/>
          <input class="answer" type='text' placeholder="add FAlSE answer"/>
          <button id='add'>Add</button>`;
        }

        const answerInputs = document.querySelectorAll(
          ".answer"
        ) as NodeListOf<HTMLInputElement> | null;
        const addBtn = document.getElementById(
          "add"
        ) as HTMLButtonElement | null;
        if (addBtn) {
          addBtn.addEventListener("click", (event) => {
            const questionText = document.getElementById(
              "questionInput"
            ) as HTMLInputElement | null;
            if (answerInputs) {
              const falseAnswer1 = answerInputs[1]?.value || "";
              const falseAnswer2 = answerInputs[2]?.value || "";
              const falseAnswer3 = answerInputs[3]?.value || "";
              event.preventDefault();
              debugger;
              (this.triviaState.questionNumber =
                Number(this.triviaState.questionNumber) + 1),
                (this.isCustomAdded = true);
              this.renderQuestions([
                {
                  correct_answer: answerInputs[0]?.value,
                  incorrect_answers: [falseAnswer1, falseAnswer2, falseAnswer3],
                  question: questionText ? questionText.value : "",
                },
              ]);
            }
          });
        }
      });
    }
  },
  loadCachedFormData(): void {
    const cachedFormData = this.getStoredFormData() as IFormData;
    if (cachedFormData !== null) {
      for (const key in cachedFormData) {
        const inputEl = document.getElementById(
          `${key}`
        ) as HTMLInputElement | null;
        if (inputEl) {
          inputEl.value = cachedFormData[key] || "";
        }
      }
    }
  },
  getFormData(): void {
    //get the form and construct the query then fetch

    const numberOfQuestions = document.querySelector("input")?.value;
    this.triviaState.questionNumber = Number(numberOfQuestions);
    const selectedOptions = document.querySelectorAll("select");

    const formData: IFormData = {
      numberOfQuestions: numberOfQuestions,
    };

    let endpointUrl = "https://opentdb.com/api.php?amount=" + numberOfQuestions;
    selectedOptions.forEach((section) => {
      const sectionAnswer = section.selectedOptions[0].value;
      if (sectionAnswer !== "") {
        formData[section.id] = sectionAnswer;
        endpointUrl += `&${section.id}=${sectionAnswer}`;
      }
    });
    this.cacheFormData(formData);
    this.fetchApiData(endpointUrl);
  },
  fetchApiData(url: string): void {
    //fetch and render the questions
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.results) {
          this.renderQuestions(data.results);
        } else {
          this.renderCatFact(data.fact);
        }
      });
  },
  renderCatFact(fact: string): void {
    const p = document.createElement("p");
    p.innerHTML = fact;
    this.wrapper?.appendChild(p);
  },
  getStoredFormData(): object {
    return JSON.parse(localStorage.getItem("form") || "{}");
  },
  cacheFormData(storeObj: object) {
    localStorage.setItem("form", JSON.stringify(storeObj));
  },
  clearStorageAndState(): void {
    //clear the storage for a new quiz
    localStorage.removeItem("true");
    localStorage.removeItem("false");
    localStorage.removeItem("questions");

    this.triviaState.correctAnswer = 0;
    this.triviaState.falseAnswers = 0;
  },
  cahcheQuestions(questionArr: Question[]): void {
    localStorage.setItem("questions", JSON.stringify(questionArr));
  },
  getStoredQuestions(): Question[] {
    return JSON.parse(localStorage.getItem("questions") || "{}");
  },
  renderQuestions(questionArr: Question[]): void {
    const questions = this.getStoredQuestions();
    if (this.isCustomAdded && questions !== null) {
      const newQuestions = [...questions, ...questionArr];
      this.cahcheQuestions(newQuestions);
      this.isCustomAdded = false;
    } else {
      this.cahcheQuestions(questionArr);
    }

    const list = document.createElement("ul");

    questionArr.forEach((question: Question) => {
      const correctAnswer = question.correct_answer;
      const wrongAnswer = question.incorrect_answers;

      const listItem = document.createElement("li");
      const textHolder = document.createElement("div");

      const answeHolder = this.createQuestion(
        question.question,
        correctAnswer,
        wrongAnswer
      );

      textHolder.innerHTML = question.question;

      listItem.appendChild(textHolder);
      listItem.appendChild(answeHolder);

      list.appendChild(listItem);
    });

    this.wrapper?.appendChild(list);
  },

  createQuestion(
    questionText: string,
    correctOne: string,
    wrongAnswrs: string[]
  ): HTMLElement {
    /*
        Recieves the question text the correct and wrong answers then mixes them up.
        Adds event listener for click. When clicked checks is it wrong or correct then uppdates the state of the quiz.
        When there is no questions left render a View Score button
        */
    const answers = [...wrongAnswrs, correctOne];
    const holder = document.createElement("div");
    holder.classList.add("answerHolder");

    answers
      .sort()
      .reverse()
      .forEach((answer: string) => {
        const option = document.createElement("button");
        option.addEventListener("click", (e) => {
          this.triviaState.questionNumber--;
          const data = this.getStoredQuestions();
          const filterdQuestion = data.filter(
            (question) => question.question !== questionText
          );
          localStorage.setItem("questions", JSON.stringify(filterdQuestion));
          if (this.triviaState.questionNumber >= 0 && answer === correctOne) {
            console.log("correct");
            this.triviaState.correctAnswer++;
            localStorage.setItem(
              "true",
              this.triviaState.correctAnswer.toString()
            );
          } else if (
            this.triviaState.questionNumber >= 0 &&
            answer !== correctOne
          ) {
            console.log("false");
            this.triviaState.falseAnswers++;
            localStorage.setItem(
              "false",
              this.triviaState.falseAnswers.toString()
            );
          }

          const listItem = option.parentElement?.parentElement as HTMLElement;
          listItem?.classList.add("disappear");
          if (this.triviaState.questionNumber === 0) {
            if (listItem.parentElement) {
              listItem.parentElement.style.display = "none";
              this.addScoreBtn();
            }
          }
        });
        option.innerHTML = answer;
        holder.appendChild(option);
      });
    return holder;
  },
  addScoreBtn(): void {
    /*
        On click creates a worker which has a zip library 
        Recievs a zip file and download it to the client
        */
    const button = document.createElement("button");
    button.id = "scoreBtn";
    button.innerHTML = "View Score";
    button.addEventListener("click", () => {
      const trueAnswers = localStorage.getItem("true");
      const falseAnswers = localStorage.getItem("false");
      const worker = new Worker("worker.js", { type: "module" });
      worker.onmessage = (e) => {
        const downloadLink = document.body.appendChild(
          Object?.assign(document.createElement("a"), {
            download: "QuizScore.zip",
            href: URL.createObjectURL(e.data),
            textContent: "Download zip file",
          })
        );
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      worker.postMessage({ trueAnswers, falseAnswers });
    });
    this.wrapper?.appendChild(button);
  },
};
quiz.init();
