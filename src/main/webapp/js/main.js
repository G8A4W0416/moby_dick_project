async function loadStopWords() {
    const response = await fetch('stop-words.txt');
    return (await response.text()).split('\n\n');
}

document.addEventListener("DOMContentLoaded", async () => {
    let stopWords = [];

    try {
        stopWords = await loadStopWords();
    } catch (e) {
        console.log("Error!");
        console.log(e);
    }

    document.querySelectorAll(".drop-area-input").forEach(inputElement => {
        const dropAreaElement = inputElement.closest(".drop-area");

        dropAreaElement.addEventListener("click", () => {
            inputElement.click();
        });

        inputElement.addEventListener("change", () => {
            if (inputElement.files.length) {
                updateFreqWords(inputElement.files[0]);
            }
        });

        dropAreaElement.addEventListener("dragover", () => {
            e.preventDefault();
            dropAreaElement.classList.add("drop-area-over");
        });

        // dragend runs whenever you cancel the drag action, for example, pressing the escape key to cancel the drag
        ["dragleave", "dragend"].forEach(type => {
            dropAreaElement.addEventListener(type, () => {
                dropAreaElement.classList.remove("drop-area-over");
            });
        });

        dropAreaElement.addEventListener("drop", e => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateFreqWords(e.dataTransfer.files[0]);
            }

            dropAreaElement.classList.remove("drop-area-over");
        });
    });

    /**
     * Updates frequently used words after dropping file
     *
     * @param {File} file
     */
    function updateFreqWords(file) {
        let fr = new FileReader();
        fr.onload = (e) => {
            const regexpWords = /\b\w+\b/g;

            let wordArray = e.target.result.match(regexpWords).map(function(value) {
                return value.toLowerCase();
            }).filter(function(word) { return !stopWords.includes(word)}).sort();

            let wordCountObj = {};

            wordArray.forEach(function (value) {
                wordCountObj[value] = (wordCountObj[value] || 0) + 1;
            });

            let sortWordsByCountArr = []
            for (let word in wordCountObj) {
                sortWordsByCountArr.push([word, wordCountObj[word]]);
            }

            sortWordsByCountArr.sort(function(a, b) {
                return b[1] - a[1];
            });

            // TODO: Total word length may be used in generating graphic for frequently used words
            let wordArrayLength = wordArray.length;

            const FREQ_NBR = 100;
            let freqUsedWordsStr = "<strong>" + escape(file.name) + "</strong> \n\n";

            sortWordsByCountArr.forEach((e,index) => {
                if (index < FREQ_NBR) {
                    freqUsedWordsStr += e[0] + ": " + e[1] + "\n";
                }

            });
            document.getElementById('output').innerHTML = freqUsedWordsStr;
        }

        fr.readAsText(file);
    }
});