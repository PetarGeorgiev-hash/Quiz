const quiz = {
    wrapper: document.getElementById('layout'),
    isCustomAdded: false,
    triviaState: {
        questionNumber: 0,
        correctAnswer: Number(localStorage.getItem('true')) > 0 ? Number(localStorage.getItem('true')) : 0,
        falseAnswers: Number(localStorage.getItem('false')) > 0 ? Number(localStorage.getItem('false')) : 0,
    },
    init() {
        //if there is cached or undone quiz load it
        const questionData = localStorage.getItem('questions')

        if (questionData !== null && questionData !== "undefined") {
            //if its cached but done load the button and the score
            if (questionData == '[]' && (this.triviaState.questionNumber > 0 || this.triviaState.falseAnswers > 0)) {
                this.addScoreBtn();
            } else {
                const parsedData = JSON.parse(questionData);
                this.triviaState.questionNumber = parsedData.length;
                this.renderQuestions(parsedData);
            }

        }
        // if its the first load or a new quiz load it

        this.loadCachedFormData() //check if there is a cache form

        this.fetchApiData('https://catfact.ninja/fact')//generate cat fact
        this.loadForm();
        this.addQuestion()

    },
    loadForm() {
        document.getElementById("generateQuiz").addEventListener('click', (e) => {
            e.preventDefault();
            const ul = document.querySelector('ul');
            const button = document.getElementById('scoreBtn')
            if (ul !== null) {
                ul.remove()
            }
            if (button !== null) {
                button.remove()
            }

            this.clearStorageAndState()
            this.getFormData()
        })
    },
    addQuestion() { // create the form for adding the custom question and append the event listener when clicked to render the question
        const addQuestion = document.getElementById('addQuestion')
        addQuestion.addEventListener('click', (e) => {
            e.preventDefault();
            addQuestion.parentElement.innerHTML += `
          <label>Question</label>
          <input id="questionInput" type='text' placeholder="Write a question"/>
          <label>Answers</label>
          <input class="answer" type='text' placeholder="add CORRECT answer"/>
          <input class="answer" type='text' placeholder="add FALSE answer"/>
          <input class="answer" type='text' placeholder="add FALSE answer"/>
          <input class="answer" type='text' placeholder="add FAlSE answer"/>
          <button id='add'>Add</button>`;
            const answerInputs = document.querySelectorAll('.answer')
            document.getElementById('add').addEventListener('click', (event) => {
                const questionText = document.getElementById('questionInput').value
                const falseAnswer1 = answerInputs[1].value
                const falseAnswer2 = answerInputs[2].value
                const falseAnswer3 = answerInputs[3].value
                event.preventDefault();
                debugger
                this.triviaState.questionNumber = Number(this.triviaState.questionNumber) + 1,
                    this.isCustomAdded = true;
                this.renderQuestions([{
                    correct_answer: answerInputs[0].value, incorrect_answers: [falseAnswer1, falseAnswer2, falseAnswer3], question: questionText
                }])
            })
        })
    },
    loadCachedFormData() {
        const cachedFormData = this.getStoredFormData()
        if (cachedFormData !== null) {
            for (const key in cachedFormData) {
                document.getElementById(`${key}`).value = cachedFormData[key]
            }
        }
    },
    getFormData() {//get the form and construct the query then fetch

        const numberOfQuestions = document.querySelector('input').value;
        this.triviaState.questionNumber = numberOfQuestions;
        const selectedOptions = document.querySelectorAll('select');

        const formData = {
            'numberOfQuestions': numberOfQuestions,
        }

        let endpointUrl = 'https://opentdb.com/api.php?amount=' + numberOfQuestions;
        selectedOptions.forEach(section => {
            const sectionAnswer = section.selectedOptions[0].value
            if (sectionAnswer !== '') {
                formData[section.id] = sectionAnswer
                endpointUrl += `&${section.id}=${sectionAnswer}`
            }
        })
        this.cacheFormData(formData)
        this.fetchApiData(endpointUrl)
    },
    fetchApiData(url) {//fetch and render the questions
        fetch(url).then(response => response.json()).then((data) => {
            if (data.results) {
                this.renderQuestions(data.results)
            } else {
                this.renderCatFact(data.fact)
            }
        })
    },
    renderCatFact(fact) {
        const p = document.createElement('p')
        p.innerHTML = fact;
        this.wrapper.appendChild(p)
    },
    getStoredFormData() {
        return JSON.parse(localStorage.getItem('form'))
    },
    cacheFormData(storeObj) {
        console.log(storeObj);
        localStorage.setItem('form', JSON.stringify(storeObj))
    },
    clearStorageAndState() { //clear the storage for a new quiz
        localStorage.removeItem('true');
        localStorage.removeItem('false');
        localStorage.removeItem('questions')

        this.triviaState.correctAnswer = 0;
        this.triviaState.falseAnswers = 0;
    },
    cahcheQuestions(questionArr) {
        localStorage.setItem('questions', JSON.stringify(questionArr))
    },
    getStoredQuestions() {
        return JSON.parse(localStorage.getItem('questions'))
    },
    renderQuestions(questionArr) {
        const questions = this.getStoredQuestions()
        if (this.isCustomAdded && questions !== null) {
            const newQuestions = [...questions, ...questionArr]
            this.cahcheQuestions(newQuestions)
            this.isCustomAdded = false;
        } else {
            this.cahcheQuestions(questionArr)
        }

        const list = document.createElement('ul')

        questionArr.forEach(question => {

            const correctAnswer = question.correct_answer;
            const wrongAnswer = question.incorrect_answers

            const listItem = document.createElement('li')
            const textHolder = document.createElement('div');

            const answeHolder = this.createQuestion(question.question, correctAnswer, wrongAnswer)

            textHolder.innerHTML = question.question;


            listItem.appendChild(textHolder)
            listItem.appendChild(answeHolder)

            list.appendChild(listItem)
        })

        this.wrapper.appendChild(list)
    },

    createQuestion(questionText, correctOne, wrongAnswrs) {
        /*
        Recieves the question text the correct and wrong answers then mixes them up.
        Adds event listener for click. When clicked checks is it wrong or correct then uppdates the state of the quiz.
        When there is no questions left render a View Score button
        */
        const answers = [...wrongAnswrs, correctOne]
        const holder = document.createElement('div')
        holder.classList.add('answerHolder')

        answers.sort().reverse().forEach(answer => {
            const option = document.createElement('button')
            option.addEventListener('click', (e) => {
                this.triviaState.questionNumber--;
                const data = this.getStoredQuestions()
                const filterdQuestion = data.filter(question => question.question !== questionText)
                localStorage.setItem('questions', JSON.stringify(filterdQuestion))
                if (this.triviaState.questionNumber >= 0 && answer === correctOne) {
                    console.log('correct');
                    this.triviaState.correctAnswer++
                    localStorage.setItem('true', this.triviaState.correctAnswer.toString())
                } else if (this.triviaState.questionNumber >= 0 && answer !== correctOne) {
                    console.log('false');
                    this.triviaState.falseAnswers++
                    localStorage.setItem('false', this.triviaState.falseAnswers.toString())
                }

                const listItem = option.parentElement.parentElement;
                listItem.classList.add('disappear')
                if (this.triviaState.questionNumber === 0) {
                    listItem.parentElement.style.display = 'none'
                    this.addScoreBtn()
                }
            })
            option.innerHTML = answer
            holder.appendChild(option)
        })
        return holder
    },
    addScoreBtn() {
        /*
        On click creates a worker which has a zip library 
        Recievs a zip file and download it to the client
        */
        const button = document.createElement('button')
        button.id = "scoreBtn"
        button.innerHTML = "View Score"
        button.addEventListener('click', () => {
            const trueAnswers = localStorage.getItem('true')
            const falseAnswers = localStorage.getItem('false')
            const worker = new Worker('worker.js', { type: 'module' });
            worker.onmessage = (e) => {
                const downloadLink = document.body.appendChild(Object.assign(document.createElement("a"), {
                    download: "QuizScore.zip",
                    href: URL.createObjectURL(e.data),
                    textContent: "Download zip file",
                }));
                downloadLink.click()
                document.body.removeChild(downloadLink);
            };
            worker.postMessage({ trueAnswers, falseAnswers });
        })
        this.wrapper.appendChild(button)
    }
}
quiz.init()

