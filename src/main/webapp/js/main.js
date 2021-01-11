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

            generateScatterPlot(freqUsedWordsArr);
        }

        fr.readAsText(file);
    }

    function generateScatterPlot(data) {
        // set the dimensions and margins of the graph
        let margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 1280 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        let svg = d3.select("#my-dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        let x = d3.scalePoint()
            .domain(data.map(function (d) { return d[0]; }))
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        let y = d3.scaleLinear()
            .domain( [0, d3.max(data, function (d) { return d[1] })])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .curve(d3.curveBasis) // Just add that to have a curve instead of segments
                .x(function(d) { return x(d[0]) })
                .y(function(d) { return y(d[1]) })
            );

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
                .style("left", (d3.mouse(this)[0]+70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px");
        };
        let mouseleave = function(d) {
            Tooltip
                .style("opacity", 0);
        };

        // Add the points
        svg
            .append("g")
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "myCircle")
            .attr("cx", function(d) { return x(d[0]) } )
            .attr("cy", function(d) { return y(d[1]) } )
            .attr("r", 8)
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 3)
            .attr("fill", "white")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    }
});