// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {
  var svgArea = d3.select("body").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

// Step 1: Set up our chart
//= ================================
var svgWidth = 900;
var svgHeight = 800;

var margin = { top: 60, right: 20, bottom: 100, left: 70 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//  Step 2: Create an SVG wrapper,
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Step 3:
// Import data from the Jones.csv file
// =================================
d3.csv("assets/data/data.csv").then(function(healthData) {
// console.log(healthData);
// Step 4: Parse the data
healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    // console.log(data.poverty);
    data.healthcare = +data.healthcare;
    // console.log(data.healthcare);
      });

// Step 5: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain(d3.extent(healthData, d => d.poverty))
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain(d3.extent(healthData, d => d.healthcare))
      .range([height, 0]);

// Step 6: Create axis functions
// ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

// Step 7: Append the axes to the chartGroup - ADD STYLING
  // ==============================================
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  
  chartGroup.append("g")
    .call(leftAxis);

// Step 8: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("Circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthData))
    .attr("r", "10")
    .attr("fill", "#c3dce7");

    // Add state labels to the points
    var circleLabels = chartGroup.selectAll(null).data(healthData).enter().append("text");

    circleLabels
      .attr("x", function(d) { return xLinearScale(d.poverty); })
      .attr("y", function(d) { return yLinearScale(d.healthcare); })
      .text(function(d) { return d.abbr; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("font-weight","bold")
      .attr("text-anchor", "middle")
      .attr("fill", "white");

// Step 9: Add color coded titles to the x-axis
    // ==============================

  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 5})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("fill", "black")
    .attr("font-weight","bold")
    .text("In Poverty (%)");

  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left+10)
    .attr("x", 1 - (0.65*height))
    .attr("dy", ".5em")
    .attr("font-size", "16px")
    .attr("fill", "black")
    .attr("font-weight","bold")
    .text("Lacks Healthcare (%)");

}).catch(function(error) {
  console.log(error);   
});
}  
// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
