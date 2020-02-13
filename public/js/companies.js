const chartSize = { width: 800, height: 600 };
const margin = { left: 100, right: 10, top: 20, bottom: 150 };

const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const drawCompanies = function(companies) {
  const y = d3
    .scaleLinear()
    .domain([0, _.maxBy(companies, "CMP").CMP])
    .range([height, 0]);

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .padding(0.3);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const container = d3.select("#chart-area svg");
  const svg = container
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("Companies");

  g.append("text")
    .attr("class", "y axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60)
    .text("CMP");

  const rectangles = g.selectAll("rect").data(companies, c => c.Name);
  const newRects = rectangles.enter().append("rect");
  newRects
    .attr("y", c => y(c.CMP))
    .attr("x", c => x(c.Name))
    .attr("width", x.bandwidth)
    .attr("height", c => y(0) - y(c.CMP))
    .attr("fill", c => colorScale(c.Name));

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(d => d + " Rs")
    .ticks(5);
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
};

const percentageFormat = d => `${d}%`;
const kCroresFormat = d => `${d / 1000}k Cr ₹`;

const formats = {
  MarketCap: kCroresFormat,
  DivYld: percentageFormat,
  ROCE: percentageFormat,
  QNetProfit: kCroresFormat,
  QSales: kCroresFormat
};

const updateCompanies = function(companies, fieldName) {
  const svg = d3.select("#chart-area svg");
  svg.select(".y.axis-label").text(fieldName);
  const y = d3
    .scaleLinear()
    .domain([0, _.get(_.maxBy(companies, fieldName), fieldName, 0)])
    .range([height, 0]);

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(formats[fieldName])
    .ticks(10);

  svg.select(".y-axis").call(yAxis);

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(_.map(companies, "Name"))
    .padding(0.3);

  const xAxis = d3.axisBottom(x);

  svg.select(".x-axis").call(xAxis);

  svg
    .selectAll("rect")
    .data(companies, c => c.Name)
    .exit()
    .remove();

  svg
    .selectAll("rect")
    .data(companies, c => c.Name)
    .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .attr("y", c => y(c[fieldName]))
    .attr("x", c => x(c.Name))
    .attr("height", c => y(0) - y(c[fieldName]))
    .attr("width", x.bandwidth);
};

const parseCompany = function({ Name, ...numrics }) {
  _.forEach(numrics, (v, k) => (numrics[k] = +v));
  return { Name, ...numrics };
};

const main = () => {
  d3.csv("data/companies.csv", parseCompany).then(companies => {
    drawCompanies(companies);
    const fields = "CMP,PE,MarketCap,DivYld,QNetProfit,QSales,ROCE".split(",");
    let step = 1;
    setInterval(
      () => updateCompanies(companies, fields[step++ % fields.length]),
      2000
    );
    setInterval(() => companies.shift(), 5000);
  });
};
window.onload = main;
