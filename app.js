let surveyLanguage = "en"; // Default language is "en"
const translations = {
    "en": {
        "next": "Next",
        "submit": "Submit",
        "notApplicable": "Not applicable",
        "stronglyAgree": "Strongly agree",
        "agree": "Agree",
        "slightlyAgree": "Slightly agree",
        "disagree": "Disagree",
        "stronglyDisagree": "Strongly disagree"
    },
    "it": {
        "next": "Avanti",
        "submit": "Invia",
        "notApplicable": "Non applicabile",
        "stronglyAgree": "Concordo fortemente",
        "agree": "Concordo",
        "slightlyAgree": "Concordo parzialmente",
        "disagree": "Non concordo",
        "stronglyDisagree": "Non concordo affatto"
    },
    "pt": {
        "next": "Próximo",
        "submit": "Enviar",
        "notApplicable": "Não aplicável",
        "stronglyAgree": "Concordo plenamente",
        "agree": "Concordo",
        "slightlyAgree": "Concordo parcialmente",
        "disagree": "Discordo",
        "stronglyDisagree": "Discordo totalmente"
    },
    "sl": {
        "next": "Naprej",
        "submit": "Pošlji",
        "notApplicable": "Ni veljavno",
        "stronglyAgree": "Močno se strinjam",
        "agree": "Se strinjam",
        "slightlyAgree": "Delno se strinjam",
        "disagree": "Se ne strinjam",
        "stronglyDisagree": "Se sploh ne strinjam"
    },
    "es": {
        "next": "Siguiente",
        "submit": "Enviar",
        "notApplicable": "No aplicable",
        "stronglyAgree": "Totalmente de acuerdo",
        "agree": "De acuerdo",
        "slightlyAgree": "Parcialmente de acuerdo",
        "disagree": "En desacuerdo",
        "stronglyDisagree": "Totalmente en desacuerdo"
    },
    "tr": {
        "next": "İleri",
        "submit": "Kaydet",
        "notApplicable": "Uygulanamaz",
        "stronglyAgree": "Kesinlikle katılıyorum",
        "agree": "Katılıyorum",
        "slightlyAgree": "Kısmen katılıyorum",
        "disagree": "Katılmıyorum",
        "stronglyDisagree": "Kesinlikle katılmıyorum"
    }
};

document.getElementById("error").style.display = "none";
document.getElementsByClassName("survey-intro")[0].addEventListener("change", function () {
    var university = document.getElementById("university").value;
    var field = document.getElementById("field").value;
    var email = document.getElementById("email").value;
    var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    var occupation = document.querySelector(
        'input[name="occupation"]:checked'
    );
    var country = document.getElementById("country").value;

    if (!isValidEmail) {
        document.getElementById("error").style.display = "block";
    } else {
        document.getElementById("error").style.display = "none";
    }

    if (university && field && isValidEmail && occupation && country) {
        document.getElementById("startButton").disabled = false;
    } else {
        document.getElementById("startButton").disabled = true;
    }
});

// add changed event listener to radio buttons: input[name='occupation']
// add value to local storage for later use
document.querySelectorAll('input[name="occupation"]').forEach((input) => {
    input.addEventListener("change", function () {
        window.localStorage.setItem("hei_teachers_occupation", input.value);
    });
});

let survey_intro = document.getElementsByClassName("survey-intro")[0];
let survey_start = document.getElementsByClassName("survey-start")[0];
let startButton = document.getElementById("startButton");

startButton.addEventListener("click", function (event) {
    event.preventDefault();
    surveyLanguage = document.getElementById("country").value;

    displayForm();

    survey_intro.style.display = "none";
    survey_start.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
});

const getData = async () => {
    const data_name = window.localStorage.getItem("hei_teachers_occupation") ?? "teacher";
    try {
        let response = await fetch(`./${data_name}.json`);
        let data = await response.json();
        return data;
    } catch (error) {
        return [];
    }
};

const displayForm = async () => {
    let rawData = await getData();

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

            var foundCategory = foundLanguage.categories.find(function (category) {
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
    combineQuestionsByCategory(rawData);

    let data = groupedData.find(
        (item) => item.language === surveyLanguage
    ).categories;

    const formContainer = document.querySelector(".survey-start");
    let currentPage = 0;
    const inputReferences = [];

    function showPage(pageIndex) {
        let translationsForLanguage = translations[surveyLanguage];
        if (!translationsForLanguage) {
            translationsForLanguage = translations["en"];
        }

        const category = data[pageIndex];
        formContainer.innerHTML = `<div class="survey-options d-grid-2">
                                        <div><h2>${category.category}</h2></div>
                                        <div class="d-grid-5 d-none d-md-flex">
                                            <div><h4>${translationsForLanguage.notApplicable}</h4></div>
                                            <div><h4>${translationsForLanguage.stronglyAgree}</h4></div>
                                            <div><h4>${translationsForLanguage.agree}</h4></div>
                                            <div><h4>${translationsForLanguage.slightlyAgree}</h4></div>
                                            <div><h4>${translationsForLanguage.disagree}</h4></div>
                                            <div><h4>${translationsForLanguage.stronglyDisagree}</h4></div>
                                        </div>
                                    </div>`;

        const page = document.createElement("div");
        page.classList.add("page");

        category.items.forEach((question, key) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("statement-custom-radios");

            questionDiv.innerHTML = `
            <label class="statement">${question.question}</label>
                <div class="custom-radios d-grid-6">
                        <div>
                        <input type="radio" id=${pageIndex}-${key}-0 class="color-0" name=mark-${pageIndex}-${key} value="0" />
                        <label for=${pageIndex}-${key}-0 >
                            <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>${translationsForLanguage.notApplicable}</p>
                        </label>
                    </div>                       
                
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-1 class="color-1" name=mark-${pageIndex}-${key} value="5" />
                        <label for=${pageIndex}-${key}-1 >
                            <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>${translationsForLanguage.stronglyAgree}</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-2  class="color-2" name=mark-${pageIndex}-${key} value="4" />
                        <label for=${pageIndex}-${key}-2 >
                               <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>${translationsForLanguage.agree}</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-3  class="color-3" name=mark-${pageIndex}-${key} value="3" />
                        <label for=${pageIndex}-${key}-3 >
                               <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>${translationsForLanguage.slightlyAgree}</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-4 class="color-4" name=mark-${pageIndex}-${key} value="2" />
                        <label for=${pageIndex}-${key}-4>
                               <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>${translationsForLanguage.disagree}</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-5 class="color-5" name=mark-${pageIndex}-${key} value="1" />
                        <label for=${pageIndex}-${key}-5>
                               <span><img src="check.svg" alt="Checked Icon" /></span>
                            <p>${translationsForLanguage.stronglyDisagree}</p>
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
        nextButton.textContent = translationsForLanguage.next;
        nextButton.disabled = true; // Disable the nextButton initially

        const submitButton = document.createElement("button");
        submitButton.textContent = translationsForLanguage.submit;
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
            window.localStorage.setItem("hei_teachers_survey_answer", JSON.stringify(selectedValues));
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
