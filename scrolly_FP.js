//grab our canvas 
let svg = d3.select("#canvas");

//set the width and height
svg.attr('width', 500)
    .attr('height', 500)



let grid = () => {
    let rects = svg
        .selectAll('rect')
        .data(data)
        .join('rect')
        .transition()
        .delay((d, i) => 10 * i)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("x", (d, i) => i % column * spacing)
        .attr("y", (d, i) => Math.floor(i / column) % rows * spacing)
        .style("fill", function (d, i) {
            if (i >=30) {
                return "black"
            } 
        })
        .attr("height", 15)
        .attr("width", 15)
        .duration(400)
}

let grid2 = () => {
    let rects = svg
        .selectAll('rect')
        .data(data)
        .join('rect')
        .transition()
        .delay((d, i) => 10 * i)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("x", (d, i) => i % column * spacing)
        .attr("y", (d, i) => Math.floor(i / column) % rows * spacing)
        .style("fill", function (d, i) {
            if (i > 12) {
                return "#99582a"
            }
            if (i < 13) {
                return "lightgrey"
            }
        })
        .attr("height", 15)
        .attr("width", 15)
        .duration(400)
}

//Scrolling: We are using the Waypoints library.
//To use the waypoints library, you need to access the waypoint constructor.
//The following boilerplate code will pass an HTML element and two functions to the constructor:
// === Scrollytelling boilerplate === //
function scroll(n, offset, func1, func2) {
    const el = document.getElementById(n)
    return new Waypoint({
        element: document.getElementById(n),
        handler: function (direction) {
            direction == 'down' ? func1() : func2();
        },
        //start 75% from the top of the div
        offset: offset
    });
};

//triger these functions on page scroll
new scroll('div2', '75%', grid2, grid);  //create a grid for div2