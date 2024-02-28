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

    function combineQuestionsByCategory(data) {
        return data.reduce((combinedArray, currentItem) => {
            const foundCategoryIndex = combinedArray.findIndex(
                (item) =>
                    item.category === currentItem.category &&
                    "en" === currentItem.language
            );
            if (foundCategoryIndex !== -1) {
                combinedArray[foundCategoryIndex].questions.push({
                    language: currentItem.language,
                    factor: currentItem.factor,
                    question: currentItem.question,
                    unit_name: currentItem.unit_name,
                    unit_link: currentItem.unit_link
                });
            } else {
                combinedArray.push({
                    category: currentItem.category,
                    questions: [
                        {
                            language: currentItem.language,
                            factor: currentItem.factor,
                            question: currentItem.question,
                            unit_name: currentItem.unit_name,
                            unit_link: currentItem.unit_link
                        }
                    ]
                });
            }
            return combinedArray;
        }, []);
    }
    data = combineQuestionsByCategory(data);

    const formContainer = document.querySelector(".likert-survey");
    let currentPage = 0;
    const inputReferences = [];

    function showPage(pageIndex) {
        formContainer.innerHTML = "";

        const page = document.createElement("div");
        page.classList.add("page");

        const category = data[pageIndex];

        category.questions.forEach((question, key) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("statement-custom-radios");

            questionDiv.innerHTML = `
            <label class="statement">${question.question}</label>
                <div class="custom-radios d-grid-5">
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-1 class="color-1" name=mark-${pageIndex}-${key} value="5" />
                        <label for=${pageIndex}-${key}-1 >
                            <span><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/check-icn.svg" alt="Checked Icon" /></span>
                            <p>Very Satisfied</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-2  class="color-2" name=mark-${pageIndex}-${key} value="4" />
                        <label for=${pageIndex}-${key}-2 >
                            <span><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/check-icn.svg" alt="Checked Icon" /></span>
                            <p>Satisfied</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-3  class="color-3" name=mark-${pageIndex}-${key} value="3" />
                        <label for=${pageIndex}-${key}-3 >
                            <span><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/check-icn.svg" alt="Checked Icon" /></span>
                            <p>Neutral</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-4 class="color-4" name=mark-${pageIndex}-${key} value="2" />
                        <label for=${pageIndex}-${key}-4>
                            <span><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/check-icn.svg" alt="Checked Icon" /></span>
                            <p>Unsatisfied</p>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id=${pageIndex}-${key}-5 class="color-5" name=mark-${pageIndex}-${key} value="1" />
                        <label for=${pageIndex}-${key}-5>
                            <span><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/check-icn.svg" alt="Checked Icon" /></span>
                            <p>Very Unsatisfied</p>
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
            console.log("Checking if all questions are answered");
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
        });
        formContainer.appendChild(nextButton);

        submitButton.addEventListener("click", async (e) => {
            e.preventDefault();
            console.log("Form submitted");

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
