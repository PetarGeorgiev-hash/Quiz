const quiz = {
    wrapper: document.getElementById('layout'),
    triviaState: {
        questionNumber: 0,
        correctAnswer: Number(localStorage.getItem('true')) > 0 ? Number(localStorage.getItem('true')) : 0,
        falseAnswers: Number(localStorage.getItem('false')) > 0 ? Number(localStorage.getItem('false')) : 0,
    },
    init() {
        const questionData = localStorage.getItem('questions')
        if (questionData !== null && questionData !== "undefined") {
            if (questionData == '[]' && (this.triviaState.questionNumber > 0 || this.triviaState.falseAnswers > 0)) {
                this.addScoreBtn()
            }
            const parsedData = JSON.parse(questionData)
            this.triviaState.questionNumber = parsedData.length
            this.renderQuestions(parsedData)
        } else {
            localStorage.removeItem('true');
            localStorage.removeItem('false');
            localStorage.removeItem('questions')
        }
        document.getElementById("generateQuiz").addEventListener('click', (e) => {
            e.preventDefault()
            const ul = document.querySelector('ul');
            const button = document.getElementById('scoreBtn')
            if (ul !== null) {
                ul.remove()
            }
            if (button !== null) {
                button.remove()
            }
            localStorage.removeItem('true');
            localStorage.removeItem('false');
            localStorage.removeItem('questions')
            this.triviaState.correctAnswer = 0;
            this.triviaState.falseAnswers = 0;
            this.getFormData()
        })
    },
    getFormData() {
        const numberOfQuestions = document.querySelector('input').value;
        this.triviaState.questionNumber = numberOfQuestions;
        const selectedOptions = document.querySelectorAll('select');

        let endpointUrl = 'https://opentdb.com/api.php?amount=' + numberOfQuestions;
        selectedOptions.forEach(section => {
            const sectionAnswer = section.selectedOptions[0].value
            if (sectionAnswer !== '') {
                endpointUrl += `&${section.id}=${sectionAnswer}`
            }
        })
        this.fetchApiData(endpointUrl)
    },
    fetchApiData(url) {
        fetch(url).then(response => response.json()).then(({ results }) => this.renderQuestions(results))
    },
    cahcheQuestion(questionArr) {
        localStorage.setItem('questions', JSON.stringify(questionArr))
    },
    renderQuestions(questionArr) {
        this.cahcheQuestion(questionArr)
        debugger
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
        const answers = [...wrongAnswrs, correctOne]
        const holder = document.createElement('div')
        holder.classList.add('answerHolder')
        answers.sort().reverse().forEach(answer => {
            const option = document.createElement('button')
            option.addEventListener('click', (e) => {
                this.triviaState.questionNumber--;
                const data = JSON.parse(localStorage.getItem('questions'))
                const filterdQuestion = data.filter(question => question.question !== questionText)
                localStorage.setItem('questions', JSON.stringify(filterdQuestion))
                console.log(data);
                if (this.triviaState.questionNumber >= 0 && answer === correctOne) {
                    this.triviaState.correctAnswer++
                    localStorage.setItem('true', this.triviaState.correctAnswer.toString())
                } else if (this.triviaState.questionNumber >= 0 && answer !== correctOne) {
                    this.triviaState.falseAnswers++
                    localStorage.setItem('false', this.triviaState.falseAnswers.toString())
                }

                const listItem = option.parentElement.parentElement;
                listItem.classList.add('disappear')
                debugger
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
        const button = document.createElement('button')
        button.id = "scoreBtn"
        button.innerHTML = "View Score"
        button.addEventListener('click', () => {
            console.log('clicked');
            console.log(localStorage.getItem('true'));
            console.log(localStorage.getItem('false'));
        })
        this.wrapper.appendChild(button)
    }
}
quiz.init()