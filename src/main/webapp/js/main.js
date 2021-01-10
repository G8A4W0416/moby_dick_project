document.querySelectorAll(".drop-area-input").forEach(inputElement => {
    const dropAreaElement = inputElement.closest(".drop-area");

    dropAreaElement.addEventListener("click", e => {
        inputElement.click();
    });

    inputElement.addEventListener("change", e => {
       if (inputElement.files.length) {
           updateThumbnail(dropAreaElement, inputElement.files[0]);


       }
    });

    dropAreaElement.addEventListener("dragover", e => {
        e.preventDefault();
        dropAreaElement.classList.add("drop-area-over");
    });

    // dragend runs whenever you cancel the drag action, for example, pressing the escape key to cancel the drag
    ["dragleave", "dragend"].forEach(type => {
        dropAreaElement.addEventListener(type, e => {
            dropAreaElement.classList.remove("drop-area-over");
        });
    });

    dropAreaElement.addEventListener("drop", e => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropAreaElement, e.dataTransfer.files[0]);
        }

        dropAreaElement.classList.remove("drop-area-over");
    });
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropAreaElement
 * @param {File} file
 */
function updateThumbnail(dropAreaElement, file) {
    let fr = new FileReader();
    fr.onload = (e) => {
        const regexpWords = /\b\w+\b/g;
        let wordArray = e.target.result.match(regexpWords).map(function(value) {
            return value.toLowerCase();
        }).sort();

        let current = null;
        let wordCount = 0;
        let wordCountArr = [];
        wordArray.forEach(function (i) {
           if (i != current) {
               if (wordCount > 0) {
                  let wordCountObj = {};
                  wordCountObj.word = current;
                  wordCountObj.count = wordCount;
                  wordCountArr.push(wordCountObj);
               }
               current = i;
               wordCount = 1;
           } else {
               wordCount++;
           }
        });
        console.log(wordCountArr);

        wordCountArr.sort((a,b) => b.count - a.count);

        let wordArrayLength = wordArray.length;
        console.log(wordCountArr);

        const freqUsedWordsNbr = 5;
        let freqUsedWordsStr = "<strong>" + escape(file.name) + "</strong> \n\n";

        wordCountArr.forEach((e,index) => {
            if (index < freqUsedWordsNbr) {
                freqUsedWordsStr += e.word + ": " + e.count + "\n";
            }

        });
        document.getElementById('output').innerHTML = freqUsedWordsStr;
    }

    fr.readAsText(file);



}