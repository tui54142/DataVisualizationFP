//grab our canvas 
let svg = d3.select("#canvas");

//set the width and height
let title = () =>{

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
        .attr("fill", function(d){
            let districtName = d.properties.DIST_NAME;
            console.log(districtName);
            let districtObesity = districtDictionary.get(districtName);
            console.log(districtObesity);
            return blues(districtObesity);
        })
        .attr("stroke", "black")
        .attr("d", path);

        var linear = d3.scaleLinear()
        .domain([0,0.2])
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
    console.log("Hello");
    svg.selectAll('*').remove();
}
let grid3 = () =>{
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
new scroll('title', '75%', grid, title);  //create a grid for div2
new scroll("div1_Map", "75%", grid2, grid); //create a grid for div3
new scroll("div3_WrapUp", "75%", grid3, grid2);

title();