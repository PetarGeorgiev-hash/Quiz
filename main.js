var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var quiz = {
    wrapper: document.getElementById("layout"),
    isCustomAdded: false,
    triviaState: {
        questionNumber: 0,
        correctAnswer: Number(localStorage.getItem("true")) > 0
            ? Number(localStorage.getItem("true"))
            : 0,
        falseAnswers: Number(localStorage.getItem("false")) > 0
            ? Number(localStorage.getItem("false"))
            : 0,
    },
    init: function () {
        //if there is cached or undone quiz load it
        var questionData = localStorage.getItem("questions");
        if (questionData !== null && questionData !== "undefined") {
            //if its cached but done load the button and the score
            if (questionData == "[]" &&
                (this.triviaState.questionNumber > 0 ||
                    this.triviaState.falseAnswers > 0)) {
                this.addScoreBtn();
            }
            else {
                var parsedData = JSON.parse(questionData);
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
    loadForm: function () {
        var _this = this;
        var genBtn = document.getElementById("generateQuiz");
        if (genBtn !== null) {
            genBtn.addEventListener("click", function (e) {
                e.preventDefault();
                var ul = document.querySelector("ul");
                var button = document.getElementById("scoreBtn");
                if (ul !== null) {
                    ul.remove();
                }
                if (button !== null) {
                    button.remove();
                }
                _this.clearStorageAndState();
                _this.getFormData();
            });
        }
    },
    addQuestion: function () {
        var _this = this;
        // create the form for adding the custom question and append the event listener when clicked to render the question
        var addQuestion = document.getElementById("addQuestion");
        if (addQuestion) {
            addQuestion.addEventListener("click", function (e) {
                e.preventDefault();
                if (addQuestion.parentElement) {
                    addQuestion.parentElement.innerHTML += "\n          <label>Question</label>\n          <input id=\"questionInput\" type='text' placeholder=\"Write a question\"/>\n          <label>Answers</label>\n          <input class=\"answer\" type='text' placeholder=\"add CORRECT answer\"/>\n          <input class=\"answer\" type='text' placeholder=\"add FALSE answer\"/>\n          <input class=\"answer\" type='text' placeholder=\"add FALSE answer\"/>\n          <input class=\"answer\" type='text' placeholder=\"add FAlSE answer\"/>\n          <button id='add'>Add</button>";
                }
                var answerInputs = document.querySelectorAll(".answer");
                var addBtn = document.getElementById("add");
                if (addBtn) {
                    addBtn.addEventListener("click", function (event) {
                        var _a, _b, _c, _d;
                        var questionText = document.getElementById("questionInput");
                        if (answerInputs) {
                            var falseAnswer1 = ((_a = answerInputs[1]) === null || _a === void 0 ? void 0 : _a.value) || "";
                            var falseAnswer2 = ((_b = answerInputs[2]) === null || _b === void 0 ? void 0 : _b.value) || "";
                            var falseAnswer3 = ((_c = answerInputs[3]) === null || _c === void 0 ? void 0 : _c.value) || "";
                            event.preventDefault();
                            debugger;
                            (_this.triviaState.questionNumber =
                                Number(_this.triviaState.questionNumber) + 1),
                                (_this.isCustomAdded = true);
                            _this.renderQuestions([
                                {
                                    correct_answer: (_d = answerInputs[0]) === null || _d === void 0 ? void 0 : _d.value,
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
    loadCachedFormData: function () {
        var cachedFormData = this.getStoredFormData();
        if (cachedFormData !== null) {
            for (var key in cachedFormData) {
                var inputEl = document.getElementById("".concat(key));
                if (inputEl) {
                    inputEl.value = cachedFormData[key] || "";
                }
            }
        }
    },
    getFormData: function () {
        //get the form and construct the query then fetch
        var _a;
        var numberOfQuestions = (_a = document.querySelector("input")) === null || _a === void 0 ? void 0 : _a.value;
        this.triviaState.questionNumber = Number(numberOfQuestions);
        var selectedOptions = document.querySelectorAll("select");
        var formData = {
            numberOfQuestions: numberOfQuestions,
        };
        var endpointUrl = "https://opentdb.com/api.php?amount=" + numberOfQuestions;
        selectedOptions.forEach(function (section) {
            var sectionAnswer = section.selectedOptions[0].value;
            if (sectionAnswer !== "") {
                formData[section.id] = sectionAnswer;
                endpointUrl += "&".concat(section.id, "=").concat(sectionAnswer);
            }
        });
        this.cacheFormData(formData);
        this.fetchApiData(endpointUrl);
    },
    fetchApiData: function (url) {
        var _this = this;
        //fetch and render the questions
        fetch(url)
            .then(function (response) { return response.json(); })
            .then(function (data) {
            if (data.results) {
                _this.renderQuestions(data.results);
            }
            else {
                _this.renderCatFact(data.fact);
            }
        });
    },
    renderCatFact: function (fact) {
        var _a;
        var p = document.createElement("p");
        p.innerHTML = fact;
        (_a = this.wrapper) === null || _a === void 0 ? void 0 : _a.appendChild(p);
    },
    getStoredFormData: function () {
        return JSON.parse(localStorage.getItem("form") || "{}");
    },
    cacheFormData: function (storeObj) {
        localStorage.setItem("form", JSON.stringify(storeObj));
    },
    clearStorageAndState: function () {
        //clear the storage for a new quiz
        localStorage.removeItem("true");
        localStorage.removeItem("false");
        localStorage.removeItem("questions");
        this.triviaState.correctAnswer = 0;
        this.triviaState.falseAnswers = 0;
    },
    cahcheQuestions: function (questionArr) {
        localStorage.setItem("questions", JSON.stringify(questionArr));
    },
    getStoredQuestions: function () {
        return JSON.parse(localStorage.getItem("questions") || "{}");
    },
    renderQuestions: function (questionArr) {
        var _this = this;
        var _a;
        var questions = this.getStoredQuestions();
        if (this.isCustomAdded && questions !== null) {
            var newQuestions = __spreadArray(__spreadArray([], questions, true), questionArr, true);
            this.cahcheQuestions(newQuestions);
            this.isCustomAdded = false;
        }
        else {
            this.cahcheQuestions(questionArr);
        }
        var list = document.createElement("ul");
        questionArr.forEach(function (question) {
            var correctAnswer = question.correct_answer;
            var wrongAnswer = question.incorrect_answers;
            var listItem = document.createElement("li");
            var textHolder = document.createElement("div");
            var answeHolder = _this.createQuestion(question.question, correctAnswer, wrongAnswer);
            textHolder.innerHTML = question.question;
            listItem.appendChild(textHolder);
            listItem.appendChild(answeHolder);
            list.appendChild(listItem);
        });
        (_a = this.wrapper) === null || _a === void 0 ? void 0 : _a.appendChild(list);
    },
    createQuestion: function (questionText, correctOne, wrongAnswrs) {
        var _this = this;
        /*
            Recieves the question text the correct and wrong answers then mixes them up.
            Adds event listener for click. When clicked checks is it wrong or correct then uppdates the state of the quiz.
            When there is no questions left render a View Score button
            */
        var answers = __spreadArray(__spreadArray([], wrongAnswrs, true), [correctOne], false);
        var holder = document.createElement("div");
        holder.classList.add("answerHolder");
        answers
            .sort()
            .reverse()
            .forEach(function (answer) {
            var option = document.createElement("button");
            option.addEventListener("click", function (e) {
                var _a;
                _this.triviaState.questionNumber--;
                var data = _this.getStoredQuestions();
                var filterdQuestion = data.filter(function (question) { return question.question !== questionText; });
                localStorage.setItem("questions", JSON.stringify(filterdQuestion));
                if (_this.triviaState.questionNumber >= 0 && answer === correctOne) {
                    console.log("correct");
                    _this.triviaState.correctAnswer++;
                    localStorage.setItem("true", _this.triviaState.correctAnswer.toString());
                }
                else if (_this.triviaState.questionNumber >= 0 &&
                    answer !== correctOne) {
                    console.log("false");
                    _this.triviaState.falseAnswers++;
                    localStorage.setItem("false", _this.triviaState.falseAnswers.toString());
                }
                var listItem = (_a = option.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
                listItem === null || listItem === void 0 ? void 0 : listItem.classList.add("disappear");
                if (_this.triviaState.questionNumber === 0) {
                    if (listItem.parentElement) {
                        listItem.parentElement.style.display = "none";
                        _this.addScoreBtn();
                    }
                }
            });
            option.innerHTML = answer;
            holder.appendChild(option);
        });
        return holder;
    },
    addScoreBtn: function () {
        var _a;
        /*
            On click creates a worker which has a zip library
            Recievs a zip file and download it to the client
            */
        var button = document.createElement("button");
        button.id = "scoreBtn";
        button.innerHTML = "View Score";
        button.addEventListener("click", function () {
            var trueAnswers = localStorage.getItem("true");
            var falseAnswers = localStorage.getItem("false");
            var worker = new Worker("worker.js", { type: "module" });
            worker.onmessage = function (e) {
                var downloadLink = document.body.appendChild(Object === null || Object === void 0 ? void 0 : Object.assign(document.createElement("a"), {
                    download: "QuizScore.zip",
                    href: URL.createObjectURL(e.data),
                    textContent: "Download zip file",
                }));
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };
            worker.postMessage({ trueAnswers: trueAnswers, falseAnswers: falseAnswers });
        });
        (_a = this.wrapper) === null || _a === void 0 ? void 0 : _a.appendChild(button);
    },
};
quiz.init();
