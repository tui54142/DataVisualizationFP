//grab our canvas
let svg = d3.select("#canvas");

//set the width and height
var width = 400,
    height = 400;

Promise.all([
    d3.json("./Planning_Districts.json"),
    d3.csv("./Philadelphia_Obesity.csv"),
    d3.csv("./Obesity_to_Low_Access.csv"),
]).then((data) => {
    //give our data sensible names
    const philadelphia_districts = data[0];
    const philadelphia_obesity = data[1];
    const philadelphia_food_access = data[2];
    //read in our json file
    //I renamed the topojson file
    const districtDictionary = new Map();
    philadelphia_obesity.forEach((obesityData) => {
        districtDictionary.set(obesityData.District, +obesityData.Obesity);
    });
    var blues = d3
        .scaleSequential()
        .domain(d3.extent(districtDictionary.values()))
        .range(["white", "steelblue"]);

    var geoData_Obesity = topojson.feature(philadelphia_districts, {
        type: "GeometryCollection",
        geometries: philadelphia_districts.objects.Planning_Districts.geometries,
    });

    var projection = d3.geoIdentity().reflectY(true).fitSize([width, height], geoData_Obesity);

    /*let filler = () => { svg.selectAll("*").remove();};*/
    let grid = () => {
        svg.selectAll("*").remove();
        var path = d3.geoPath().projection(projection);
        svg
            .append("g")
            .selectAll(".district")
            .data(geoData_Obesity.features)
            .enter()
            .append("path")
            .classed(".district", true)
            .attr("fill", function (d) {
                let districtName = d.properties.DIST_NAME;
                let districtObesity = districtDictionary.get(districtName);
                return blues(districtObesity);
            })
            .attr("stroke", "black")
            .attr("d", path)

            //TRYING TOO TIPS HOVER FUNCTION

            .on("mouseover", (event, d) => {
                //when mouse is over point
                console.log("mouseover SUCCESS");
                d3.select(event.currentTarget)
                    .style("stroke", "red")
                    .style("stroke-width", "4");

                d3
                    .select("#tooltip_Map")
                    .style("display", "block")
                    .html(`
                       <h1 class="tooltip-title">${d.properties.DIST_NAME
                        }</h1>          
                       <div>Percentage of Population that is Obese: ${districtDictionary.get(
                            d.properties.DIST_NAME
                        )}%</div>
                    `);
            })

            .on("mouseleave", (event) => {
                console.log("mouseleave SUCCESS");
                d3.select("#tooltip_Map").style("display", "none"); // hide tooltip
                d3.select(event.currentTarget) //remove the stroke from point
                    .style("stroke", "black")
                    .style("stroke-width", "1");
            });

        var linear = d3.scaleLinear().domain([0, 40]).range(["white", "steelblue"]);

        svg
            .append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(20,20)");

        var legendLinear = d3
            .legendColor()
            .shapeWidth(45)
            .cells(5)
            .orient("horizontal")
            .scale(linear);

        svg.select(".legendLinear").call(legendLinear);
    };

    let grid2 = () => {
        svg.selectAll("*").remove();
        const chart = svg.append("g").attr("transform", `translate(50, 50)`);

        chart
            .append("text") //x-axis
            .attr("class", "axis-title") //Optional: change font size and font weight
            .attr("y", height - 15) //add to the bottom of graph (-25 to add it above axis)
            .attr("x", width - 60) //add to the end of X-axis (-60 offsets the width of text)
            .text("Obesity Level"); //actual text to display

        chart
            .append("text") //y-axis
            .attr("class", "axis-title") //Optional: change font size and font weight
            .attr("x", 10) //add some x padding to clear the y axis
            .attr("y", 25) //add some y padding to align the end of the axis with the text
            .text("# of Low Access Neighborhoods"); //actual text to display
        //Creating an colorscale for nominal (categorical data)

        //create linear scales to map your data
        //x and y become functions that can be called later (functions are 1st class citizens in JS)
        var x = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(philadelphia_food_access, (d) => {
                    return +d.Obesity;
                }),
            ])
            .range([0, width]);

        var y = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(philadelphia_food_access, (d) => {
                    return +d.LowAccess;
                }),
            ])
            .range([height, 0]);

        //add axes
        chart
            .append("g")
            .attr("transform", "translate(0," + height + ")") //put our axis on the bottom
            .call(
                d3
                    .axisBottom(x)
                    .ticks(10)
                    .tickSize(-height - 10) //ticks + tickSize adds grids
            )
            .call((g) => g.select(".domain").remove()); //Optional: remove the axis endpoints
        chart
            .append("g")
            .call(
                d3
                    .axisLeft(y)
                    .ticks(10)
                    .tickSize(-width - 10)
            )
            .call((g) => g.select(".domain").remove()); //Optional: remove the axis endpoints

        // Add marks (points/circles)
        let points = chart
            .append("g")
            .selectAll("circle")
            .data(philadelphia_food_access)
            .enter()
            .append("circle") //map data attributes to channels
            .attr("cx", function (d) {
                return x(+d.Obesity);
            })
            .attr("cy", function (d) {
                return y(+d.LowAccess);
            })
            .attr("fill", "red")
            .attr("r", 15)
            .attr("opacity", 0.25);

        points
            .on("mouseover", (event, d) => {
                //when mouse is over point
                d3.select(event.currentTarget) //add a stroke to highlighted point
                    .style("stroke", "black");

                d3
                    .select("#tooltip-scatter") // add text inside the tooltip div
                    .style("visibility", "visible") //make it visible
                    .html(` <h1 class="tooltip-title">${d.District}</h1>          
                  <div>Obesity (% Obese): ${d.Obesity}</div>
               `);
            })
            .on("mouseleave", (event) => {
                //when mouse isn’t over point
                d3.select("#tooltip-scatter").style("visibility", "hidden"); // hide tooltip
                d3.select(event.currentTarget) //remove the stroke from point
                    .style("stroke", "none");
            });
    };

    let grid3 = () => {
        svg.selectAll("*").remove();
    };

    //Scrolling: We are using the Waypoints library.
    //To use the waypoints library, you need to access the waypoint constructor.
    //The following boilerplate code will pass an HTML element and two functions to the constructor:
    // === Scrollytelling boilerplate === //
    function scroll(n, offset, func1, func2) {
        const el = document.getElementById(n);
        return new Waypoint({
            element: document.getElementById(n),
            handler: function (direction) {
                direction == "down" ? func1() : func2();
            },
            //start 75% from the top of the div
            offset: offset,
        });
    }

    //triger these functions on page scroll
    new scroll("div2_Scatter", "75%", grid2, grid); //create a grid for div3
    new scroll("removeall", "75%", grid3, grid2);

    /*title();*/
    grid();
});
