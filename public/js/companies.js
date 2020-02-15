const chartSize = { width: 800, height: 600 };
const margin = { left: 100, right: 10, top: 20, bottom: 150 };

const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const percentageFormat = d => `${d}%`;
const kCroresFormat = d => `${d / 1000}k Cr ₹`;

const formats = {
  MarketCap: kCroresFormat,
  DivYld: percentageFormat,
  ROCE: percentageFormat,
  QNetProfit: kCroresFormat,
  QSales: kCroresFormat
};

const fields = "CMP,PE,MarketCap,DivYld,QNetProfit,QSales,ROCE".split(",");

const smooth = () => {
  d3.transition()
    .duration(1000)
    .ease(d3.easeLinear);
};

const initChart = function() {
  const container = d3.select("#chart-area svg");
  const svg = container
    .attr("width", chartSize.width)
    .attr("height", chartSize.height);

  const g = svg
    .append("g")
    .attr("class", "companies")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140);

  g.append("text")
    .attr("class", "y axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -60);

  g.append("g").attr("class", "y-axis");

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  g.selectAll(".x-axis text")
    .attr("x", -5)
    .attr("y", 10)
    .attr("transform", "rotate(-40)");
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

  const rects = svg
    .select(".companies")
    .selectAll("rect")
    .data(companies, c => c.Name);

  rects.exit().remove();

  rects
    .enter()
    .append("rect")
    .attr("fill", c => colorScale(c.Name))
    .attr("y", y(0))
    .attr("x", c => x(c.Name))
    .merge(rects)
    .transition(smooth())
    .attr("x", c => x(c.Name))
    .attr("y", c => y(c[fieldName]))
    .attr("width", x.bandwidth)
    .attr("height", c => y(0) - y(c[fieldName]));
};

const parseCompany = function({ Name, ...numrics }) {
  _.forEach(numrics, (v, k) => (numrics[k] = +v));
  return { Name, ...numrics };
};

const frequentlyMoveCompanies = (src, dest) => {
  setInterval(() => {
    const c = src.shift();
    if (c) dest.push(c);
    else [src, dest] = [dest, src];
  }, 1000);
};

const visualizeCompanies = companies => {
  initChart(companies);
  let step = 0;
  setInterval(
    () => updateCompanies(companies, fields[step++ % fields.length]),
    1000
  );
  frequentlyMoveCompanies(companies, []);
};

const main = () => {
  d3.csv("data/companies.csv", parseCompany).then(companies =>
    visualizeCompanies(companies)
  );
};

window.onload = main;
