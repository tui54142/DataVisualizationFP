//grab our canvas 
let svg = d3.select("#canvas");

//set the width and height
let filler = () => {

}
let grid = () => {
    var width = 400,
        height = 400;
    Promise.all([
        d3.json("./Planning_Districts.json"),
        d3.csv("./Philadelphia_Obesity.csv"),
    ]).then((data) => {
        //give our data sensible names
        const philadelphia_districts = data[0];
        const philadelphia_obesity = data[1];
        //read in our json file
        //I renamed the topojson file
        const districtDictionary = new Map();
        philadelphia_obesity.forEach((obesityData) => {
            districtDictionary.set(obesityData.District, +obesityData.Obesity); //note: I renamed it in file
        });
        var blues = d3
            .scaleSequential()
            .domain(d3.extent(districtDictionary.values()))
            .range(["white", "steelblue"]);

        var geoData = topojson.feature(philadelphia_districts, {
            type: "GeometryCollection",
            geometries:
                philadelphia_districts.objects.Planning_Districts.geometries,
        });

        var projection = d3.geoMercator().fitSize([width, height], geoData);

        var path = d3.geoPath().projection(projection);

        svg
            .append("g")
            .selectAll(".district")
            .data(geoData.features)
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

            .on('mouseover', (event, d) => { //when mouse is over point
                console.log("mouseover SUCCESS");
                d3.select(event.currentTarget) //add a stroke to highlighted point 
                    .style("stroke", "red")
                    .style("stroke-width","4");

                d3.select('#tooltip_Map') // add text inside the tooltip div
                    .style('display', 'block') //make it visible
                    
                    //HTML DATA NEEDS TO BE CHANGED
                    .html
                    (`
                       <h1 class="tooltip-title">${d.properties.DIST_NAME}</h1>          
                       <div>Percentage of Population that is Obese: ${districtDictionary.get(d.properties.DIST_NAME)
                       }%</div>
                    `);
            })

            .on('mouseleave', (event) => {  //when mouse isn�t over point
                console.log("mouseleave SUCCESS");
                d3.select('#tooltip_Map').style('display', 'none'); // hide tooltip
                d3.select(event.currentTarget) //remove the stroke from point
                    .style("stroke", "black")
                    .style("stroke-width", "1");;
            });

        var linear = d3.scaleLinear()
            .domain([0, 40])
            .range(["white", "steelblue"]);

        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(20,20)");

        var legendLinear = d3.legendColor()
            .shapeWidth(30)
            .cells(5)
            .orient('horizontal')
            .scale(linear);

        svg.select(".legendLinear")
            .call(legendLinear);
    });
}
let grid2 = () => {
    var width = 400,
    height = 400;
    Promise.all([
        d3.json("./LNA_HP_Food_Access.geojson")
    ]).then((data) => {
        //give our data sensible names
        const philadelphia_food_access = data[0];

        //console.log(philadelphia_food_access)
        //read in our json file
        //I renamed the topojson file
        console.log(philadelphia_food_access);
        /*
        var geoData = topojson.feature(philadelphia_food_access, {
            type: "GeometryCollection",
            geometries:
                philadelphia_food_access.objects.LNA_HP_Food_Access.geometries,
        });
        */
        var projection = d3.geoMercator();

        var path = d3.geoPath().projection(projection);

        svg.append("path").attr("d", path(philadelphia_food_access)); // draw the features
        /*
        svg
            .append("g")
            .selectAll(".district")
            .data(philadelphia_food_access.features)
            .enter()
            .append("path")
            .classed(".district", true)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("d", path);
            */
});
}
let grid3 = () => {
    svg.selectAll('*').remove();
}

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
new scroll('div1_Map', '25%', grid, filler);  //create a grid for div2
new scroll('div2_Barchart', "25%", grid2, grid); //create a grid for div3
new scroll("div3_WrapUp", "75%", grid3, grid2);

/*title();*/
grid();