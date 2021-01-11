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
                document.getElementById("my-dataviz").innerHTML = "";
                updateFreqWords(inputElement.files[0]);
            }
        });

        dropAreaElement.addEventListener("dragover", e => {
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
                document.getElementById("my-dataviz").innerHTML = "";
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

            const FREQ_NBR = 100;

            let freqUsedWordsArr = [];

            sortWordsByCountArr.forEach((value,index) => {
                if (index < FREQ_NBR) {
                    freqUsedWordsArr.push(value);
                }
            });

            generateChart(freqUsedWordsArr);
        }

        fr.readAsText(file);
    }

    function generateChart(data) {
        // set the dimensions and margins of the graph
        let margin = {top: 20, right: 30, bottom: 40, left: 90},
            width = 460 - margin.left - margin.right,
            height = 5000 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        let svg = d3.select("#my-dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        let x = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return d[1] })])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0) rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        let y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function (d) { return d[0]; }))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y));

        // create a tooltip
        let Tooltip = d3.select("#my-dataviz")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        // Three function that change the tooltip when user hover / move / leave a cell
        let mouseover = function(d) {
            Tooltip
                .style("opacity", 1);
        };
        let mousemove = function(d) {
            Tooltip
                .html("Word Count: " + d[1])
                .style("left", (d3.mouse(this)[0]+ 340) + "px")
                .style("top", (d3.mouse(this)[1]) + "px");
        };
        let mouseleave = function(d) {
            Tooltip
                .style("opacity", 0);
        };

        //Bars
        svg.selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0) )
            .attr("y", function(d) { return y(d[0]); })
            .attr("width", function(d) { return x(d[1]); })
            .attr("height", y.bandwidth() )
            .attr("fill", "#69b3a2")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    }
});