const drawBuildings = buildings => {
  const chartSize = { width: 600, height: 400 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };

  const width = chartSize.width - margin.left - margin.right;
  const height = chartSize.height - margin.top - margin.bottom;

  const y = d3
    .scaleLinear()
    .domain([0, _.maxBy(buildings, "height").height])
    .range([height, 0]);

  x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(buildings, "name"))
    .padding(0.3);

  const container = d3.select("#chart-data");
  const svg = container
    .append("svg")
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Tall Buildings");

  g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("Height (m)");

  const rectangles = g.selectAll("rect").data(buildings);
  const newRects = rectangles.enter().append("rect");
  newRects
    .attr("y", b => y(b.height))
    .attr("x", b => x(b.name))
    .attr("width", x.bandwidth)
    .attr("height", b => y(0) - y(b.height));

  const yAxis = d3.axisLeft(y).tickFormat(d => d + "m").ticks(3);
  const xAxis = d3.axisBottom(x);

  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  g.append("g")
    .attr("class", "x-axis")
    .call(xAxis)
    .attr("transform", `translate(0, ${height})`);

  g.selectAll(".x-axis text")
  .attr("x", -5)
  .attr("y", 10)
  .attr("transform", "rotate(-40)");

  const toLine = b => `<strong>${b.name}</strong> <i>${b.height}</i>`;
  document.querySelector("#chart-area").innerHTML = buildings
    .map(toLine)
    .join("<hr/>");
};
const main = () => {
  d3.json("data/buildings.json").then(drawBuildings);
};
window.onload = main;
