var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderxAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Initial Params
var chosenYAxis = "healthcare";

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating yAxis var upon click on axis label
function renderyAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel;
  if (chosenXAxis === "poverty") {
    xlabel = "Poverty: ";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age: ";
  }
  else {xlabel = "Income: " };
    
  var ylabel;
  if (chosenYAxis === "obesity") {
    ylabel = "Obesity: ";
  }
  else if (chosenYAxis === "smokes") {
    ylabel = "Smokes: ";
  }
  else { ylabel = "Healthcare: "};

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}% <br>${ylabel} ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
// onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.income = +data.income;
    data.age = +data.age;
    data.obesity = +data.obesity;
  });

// xLinearScale function above csv import
var xLinearScale = xScale(healthData, chosenXAxis);

// Create y scale function
var yLinearScale = yScale(healthData, chosenYAxis);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);


 // append initial circles
 var circlesGroup = chartGroup.selectAll("circle")
 .data(healthData)
 .enter()
 .append("circle")
 .attr("cx", d => xLinearScale(d[chosenXAxis]))
 .attr("cy", d => yLinearScale(d[chosenYAxis]))
 .attr("r", 15)
 .attr("fill", "#9cc9dd")
 .attr("stroke", "white");
 
 var circleLabels = chartGroup.selectAll(null).data(healthData).enter().append("text");

 circleLabels
   .attr("x", function(d) { return xLinearScale(d.poverty); })
   .attr("y", function(d) { return yLinearScale(d.healthcare); })
   .text(function(d) { return d.abbr; })
   .attr("font-family", "sans-serif")
   .attr("font-size", "10px")
   .attr("font-weight", "bold")
   .attr("text-anchor", "middle")
   .attr("fill", "white");


// Create group for two x-axis labels
var xlabelsGroup = chartGroup.append("g")
 .attr("transform", `translate(${width / 2}, ${height + 20})`);
 var ylabelsGroup = chartGroup.append("g");

var povertyLengthLabel = xlabelsGroup.append("text")
 .attr("x", 0)
 .attr("y", 20)
 .attr("value", "poverty") // value to grab for event listener
 .classed("active", true)
 .text("In Poverty (%)");

 var ageLabel = xlabelsGroup.append("text")
 .attr("x", 0)
 .attr("y", 40)
 .attr("value", "age") // value to grab for event listener
 .classed("inactive", true)
 .text("Age (Median)");

 var incomeLabel = xlabelsGroup.append("text")
 .attr("x", 0)
 .attr("y", 60)
 .attr("value", "income") // value to grab for event listener
 .classed("inactive", true)
 .text("Household Income (Median)");

// append y axis
var obeseLabel = ylabelsGroup.append("text")
 .attr("transform", "rotate(-90)")
 .attr("y", 0 - margin.left)
 .attr("x", 0 - (height / 2))
 .attr("dy", "1em")
 .attr("value", "obesity")
 .classed("inactive", true)
 .text("Obese (%)"); 

 var smokesLabel = ylabelsGroup.append("text")
 .attr("transform", "rotate(-90)")
 .attr("y", 0 - margin.left)
 .attr("x", 0 - (height / 2))
 .attr("dy", "2.5em")
 .attr("value", "smokes")
 .classed("inactive", true)
 .text("Smokes (%)"); 

var healthcareLabel = ylabelsGroup.append("text")
 .attr("transform", "rotate(-90)")
 .attr("y", 0 - margin.left)
 .attr("x", 0 - (height / 2))
 .attr("dy", "4em")
 .attr("value", "healthcare")
 .classed("active", true)
 .text("Lacks of Healthcare (%)"); 

 // updateToolTip function above csv import
 var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

 // x axis labels event listener
 xlabelsGroup.selectAll("text")
   .on("click", function() {
     // get value of selection
     var value = d3.select(this).attr("value");
     if (value !== chosenXAxis) {

       // replaces chosenXAxis with value
       chosenXAxis = value;

       // console.log(chosenXAxis)

       // functions here found above csv import
       // updates x scale for new data
       xLinearScale = xScale(healthData, chosenXAxis);

       // updates x axis with transition
       xAxis = renderAxes(xLinearScale, xAxis);

       // updates circles with new x values
       circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

       // updates tooltips with new info
       circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

       // changes classes to change bold text
       if (chosenXAxis === "poverty") {
           povertyLengthLabel
           .classed("active", true)
           .classed("inactive", false);
           ageLabel
           .classed("active", false)
           .classed("inactive", true);
           incomeLabel
           .classed("active", false)
           .classed("inactive", true);
       }
       else if (chosenXAxis === "age") {
        povertyLengthLabel
        .classed("active", false)
        .classed("inactive", true);
        ageLabel
        .classed("active", true)
        .classed("inactive", false);
        incomeLabel
        .classed("active", false)
        .classed("inactive", true);
       }
       else {
        povertyLengthLabel
        .classed("active", false)
        .classed("inactive", true);
        ageLabel
        .classed("active", false)
        .classed("inactive", true);
        incomeLabel
        .classed("active", true)
        .classed("inactive", false);
       }
       };

       ylabelsGroup.selectAll("text")
   .on("click", function() {
     // get value of selection
     var value = d3.select(this).attr("value");
     if (value !== chosenYAxis) {

       // replaces chosenXAxis with value
       chosenYAxis = value;
       if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;
 
        // console.log(chosenXAxis)
 
        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);
 
        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);
 
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
 
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

       if (chosenYAxis === "healthcare") {
        healthcareLabel
        .classed("active", true)
        .classed("inactive", false);
        smokesLabel
        .classed("active", false)
        .classed("inactive", true);
        obeseLabel
        .classed("active", false)
        .classed("inactive", true);
       }
       else if (chosenYAxis === "obesity") {
       healthcareLabel
       .classed("active", false)
       .classed("inactive", true);
       obeseLabel
       .classed("active", true)
       .classed("inactive", false);
       smokesLabel
       .classed("active", false)
       .classed("inactive", true);
       }
       else {
       healthcareLabel
       .classed("active", false)
       .classed("inactive", true);
       obeseLabel
       .classed("active", false)
       .classed("inactive", true);
       smokesLabel
       .classed("active", true)
       .classed("inactive", false);
    }  }
     }
   });
}).catch(function(error) {
 console.log(error);
});
