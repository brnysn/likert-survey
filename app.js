let surveyLanguage = "en"; // Default language is "en"

document
    .getElementsByClassName("survey-intro")[0]
    .addEventListener("change", function () {
        var university = document.getElementById("university").value;
        var specialisedField =
            document.getElementById("specialisedField").value;
        var email = document.getElementById("email").value;
        var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        var occupation = document.querySelector(
            'input[name="occupation"]:checked'
        );
        var country = document.getElementById("country").value;

        if (
            university &&
            specialisedField &&
            isValidEmail &&
            occupation &&
            country
        ) {
            document.getElementById("startButton").disabled = false;
        } else {
            document.getElementById("startButton").disabled = true;
        }
    });

let survey_intro = document.getElementsByClassName("survey-intro")[0];
let survey_start = document.getElementsByClassName("survey-start")[0];
let startButton = document.getElementById("startButton");

startButton.addEventListener("click", function (event) {
    event.preventDefault();

    surveyLanguage = document.getElementById("country").value;

    survey_intro.style.display = "none";
    survey_start.style.display = "block";
});

const getData = async () => {
    try {
        let response = await fetch("./data.json");
        let data = await response.json();
        return data;
    } catch (error) {
        return [];
    }
};

const displayForm = async () => {
    let data = await getData();

    let groupedData = [];
    function combineQuestionsByCategory(data) {
        return data.forEach(function (item) {
            var foundLanguage = groupedData.find(function (group) {
                return group.language === item.language;
            });

            if (!foundLanguage) {
                foundLanguage = {
                    language: item.language,
                    categories: []
                };
                groupedData.push(foundLanguage);
            }

            var foundCategory = foundLanguage.categories.find(function (
                category
            ) {
                return category.category === item.category;
            });

            if (!foundCategory) {
                foundCategory = {
                    category: item.category,
                    items: []
                };
                foundLanguage.categories.push(foundCategory);
            }
            foundCategory.items.push(item);
        });
    }
    data = combineQuestionsByCategory(data);
    data = groupedData.find(
        (item) => item.language === surveyLanguage
    ).categories;

    const formContainer = document.querySelector(".likert-survey");
    let currentPage = 0;
    const inputReferences = [];

    function showPage(pageIndex) {
        formContainer.innerHTML = "";

        const page = document.createElement("div");
        page.classList.add("page");

        const category = data[pageIndex];

        category.items.forEach((question, key) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("statement-custom-radios");

            questionDiv.innerHTML = `
            <label class="statement">${question.question}</label>
                <div class="custom-radios d-grid-6">
                        <div>
                        <input type="radio" id=${pageIndex}-${key}-0 class="color-1" name=mark-${pageIndex}-${key} value="0" />
                        <label for=${pageIndex}-${key}-1 >
                            <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>Not applicable</p>
                        </label>
                    </div>                       
                
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-1 class="color-1" name=mark-${pageIndex}-${key} value="5" />
                        <label for=${pageIndex}-${key}-1 >
                            <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>Strongly agree 
                            </p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-2  class="color-2" name=mark-${pageIndex}-${key} value="4" />
                        <label for=${pageIndex}-${key}-2 >
                               <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>Agree</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-3  class="color-3" name=mark-${pageIndex}-${key} value="3" />
                        <label for=${pageIndex}-${key}-3 >
                               <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>Slightly agree
 
                            </p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-4 class="color-4" name=mark-${pageIndex}-${key} value="2" />
                        <label for=${pageIndex}-${key}-4>
                               <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>Disagree</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-5 class="color-5" name=mark-${pageIndex}-${key} value="1" />
                        <label for=${pageIndex}-${key}-5>
                               <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>Strongly disagree (we don’t do that)
                            </p>
                        </label>
                    </div>
                </div>
        `;

            page.appendChild(questionDiv);

            // add created input references to the inputReferences array
            inputReferences.push(
                questionDiv.querySelectorAll('input[type="radio"]')
            );
        });

        formContainer.appendChild(page);

        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.disabled = true; // Disable the nextButton initially

        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit";
        submitButton.style.display = "none";
        submitButton.disabled = true; // Disable the nextButton initially

        // Check if all questions are answered before enabling the nextButton
        function checkAllQuestionsAnswered() {
            const allQuestionsAnswered = inputReferences.every((inputArray) => {
                return Array.from(inputArray).some((input) => input.checked);
            });
            nextButton.disabled = !allQuestionsAnswered;
            submitButton.disabled = !allQuestionsAnswered;
        }

        inputReferences.forEach((inputArray) => {
            Array.from(inputArray).forEach((input) => {
                input.addEventListener("change", checkAllQuestionsAnswered);
            });
        });

        nextButton.addEventListener("click", () => {
            currentPage++;
            showPage(currentPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        formContainer.appendChild(nextButton);

        submitButton.addEventListener("click", async (e) => {
            e.preventDefault();

            const selectedValues = [];

            inputReferences.forEach((inputArray, questionIndex) => {
                inputArray.forEach((input, optionIndex) => {
                    if (input.checked) {
                        const value = input.value;

                        if (!selectedValues[questionIndex]) {
                            selectedValues[questionIndex] = null;
                        }
                        selectedValues[questionIndex] = value;
                    }
                });
            });
            window.localStorage.setItem(
                "survey-answer",
                JSON.stringify(selectedValues)
            );
            window.location.href = "chart.html";
            // try {
            //     const response = await fetch("api-endpoint", {
            //         method: "POST",
            //         headers: {
            //             "Content-Type": "application/json"
            //         },
            //         body: JSON.stringify(selectedValues)
            //     });
            //     const responseData = await response.json();

            // } catch (error) {
            //     console.error(error);
            // }
        });
        formContainer.appendChild(submitButton);

        if (currentPage === data.length - 1) {
            submitButton.style.display = "block";
            nextButton.style.display = "none";
        } else {
            submitButton.style.display = "none";
            nextButton.style.display = "block";
        }
    }

    showPage(currentPage);
};

displayForm();
