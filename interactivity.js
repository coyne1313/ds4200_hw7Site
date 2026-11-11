(function () {
    var chart = document.querySelector("#chart");
    var fallback = document.querySelector("#chart-fallback");
    var note = document.querySelector("#chart-note");
    if (!chart) {
        return;
    }
    if (typeof d3 === "undefined") {
        if (fallback) {
            fallback.hidden = false;
        }
        return;
    }

    var data = [
        { country: "Belgium", days: 64, program: true },
        { country: "Croatia", days: 30, program: true },
        { country: "Spain", days: 7, program: false },
        { country: "Denmark", days: 7, program: false },
        { country: "Netherlands", days: 7, program: false },
        { country: "Italy", days: 7, program: false }
    ];

    data.forEach(function (d, i) {
        d.order = i;
    });

    var defaultNote = "Belgium is the longest stay, at 64 days.";

    function frame() {
        var rendered = Math.round(chart.getBoundingClientRect().width) || 640;
        if (rendered < 520) {
            return {
                width: Math.max(rendered, 300),
                height: 360,
                margin: { top: 8, right: 36, bottom: 42, left: 108 }
            };
        }
        return {
            width: 640,
            height: 340,
            margin: { top: 8, right: 40, bottom: 46, left: 118 }
        };
    }

    function draw(rows) {
        var box = frame();
        var width = box.width;
        var height = box.height;
        var margin = box.margin;
        var svg = d3.select(chart);
        svg.selectAll("*").remove();
        svg.attr("viewBox", "0 0 " + width + " " + height);

        var x = d3.scaleLinear()
            .domain([0, d3.max(rows, function (d) { return d.days; }) * 1.15])
            .range([margin.left, width - margin.right]);

        var y = d3.scaleBand()
            .domain(rows.map(function (d) { return d.country; }))
            .range([margin.top, height - margin.bottom])
            .padding(0.32);

        svg.append("g")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")))
            .call(function (g) {
                g.selectAll("line, .domain").attr("stroke", "#111111");
                g.selectAll("text")
                    .attr("fill", "#111111")
                    .attr("font-family", "Inter, Helvetica, sans-serif")
                    .attr("font-size", 12);
            });

        svg.append("text")
            .attr("x", (margin.left + width - margin.right) / 2)
            .attr("y", height - 6)
            .attr("text-anchor", "middle")
            .attr("fill", "#111111")
            .attr("font-family", "Inter, Helvetica, sans-serif")
            .attr("font-size", 12)
            .text("Days");

        svg.append("g")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(d3.axisLeft(y).tickSize(0))
            .call(function (g) {
                g.select(".domain").remove();
                g.selectAll("text")
                    .attr("fill", "#111111")
                    .attr("font-family", "Inter, Helvetica, sans-serif")
                    .attr("font-size", 13);
            });

        svg.selectAll("rect.bar")
            .data(rows)
            .join("rect")
            .attr("class", "bar")
            .attr("x", margin.left)
            .attr("y", function (d) { return y(d.country); })
            .attr("width", function (d) { return Math.max(0, x(d.days) - margin.left); })
            .attr("height", y.bandwidth())
            .attr("fill", function (d) { return d.program ? "#111111" : "#ffffff"; })
            .attr("stroke", "#111111")
            .attr("stroke-width", 1.5)
            .on("mouseenter", function (event, d) {
                d3.select(this).attr("fill", d.program ? "#000000" : "#e8e8e8");
                if (note) {
                    var kind = d.program ? "Dialogue of Civilizations" : "a week";
                    note.textContent = d.country + ", " + d.days + " days — " + kind + ".";
                }
            })
            .on("mouseleave", function (event, d) {
                d3.select(this).attr("fill", d.program ? "#111111" : "#ffffff");
                if (note) {
                    note.textContent = defaultNote;
                }
            });

        svg.selectAll("text.value")
            .data(rows)
            .join("text")
            .attr("class", "value")
            .attr("x", function (d) { return x(d.days) + 6; })
            .attr("y", function (d) { return y(d.country) + y.bandwidth() / 2; })
            .attr("dominant-baseline", "middle")
            .attr("fill", "#111111")
            .attr("font-family", "Inter, Helvetica, sans-serif")
            .attr("font-size", 12)
            .text(function (d) { return d.days; });
    }

    function setPressed(activeId) {
        ["sort-value", "sort-name"].forEach(function (id) {
            var button = document.getElementById(id);
            if (button) {
                button.setAttribute("aria-pressed", id === activeId ? "true" : "false");
            }
        });
    }

    var order = "days";

    function render() {
        var rows = data.slice().sort(function (a, b) {
            if (order === "name") {
                return a.country.localeCompare(b.country);
            }
            if (b.days !== a.days) {
                return b.days - a.days;
            }
            return a.order - b.order;
        });
        draw(rows);
        setPressed(order === "name" ? "sort-name" : "sort-value");
    }

    render();

    document.getElementById("sort-value").addEventListener("click", function () {
        order = "days";
        render();
    });

    document.getElementById("sort-name").addEventListener("click", function () {
        order = "name";
        render();
    });

    window.addEventListener("resize", render);
})();
