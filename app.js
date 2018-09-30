//Margin Convention
const margin = {top: 20, right: 10, bottom: 20, left: 50}
const height = 400 - margin.left - margin.right
const width = 800 - margin.top - margin.bottom
 
//Scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);
 
const bisectDate = d3.bisector(function(d) { return d.year; }).left;
const parseTime = d3.timeParse("%Y-%m-%d");
const format = d3.timeFormat("%b %d, %Y");
 
//Margin Convention
const svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
const API_KEY = 'NSUNV8LPVSSN0247'
const ticker = 'INX'
const url = 'https://www.alphavantage.co/query?' +
            'function=TIME_SERIES_DAILY' + 
            '&symbol=' + ticker +
            '&apikey=' + API_KEY +
            '&outputsize=full'
             
 //data
d3.json(url, function(error, marketData) {
  if (error) throw error;
  const sp500 = d3.entries(marketData["Time Series (Daily)"]);
  let data = []
  sp500.forEach(function(d) {
    let value = +d.value["4. close"];
    let year = parseTime(d.key);
    data.push({year, value});
  })    

  data = data.filter(
    function(d, i) {
      return d.value !== 0
    });

  data.sort(function(a, b) {
    return a.year - b.year;
  });
 
  const threeMonth = data.filter(function(d, i) {
                      return i > data.length - 30
                    });

  const xScale = x.domain([threeMonth[0].year, threeMonth[threeMonth.length - 1].year])
  const yScale = y.domain(d3.extent(threeMonth, d => d.value))

  //d3 line
  const line = d3.line()
    .x(function(d, i) { 
        return xScale(d.year) 
        }) 
    .y(d => yScale(d.value))
     
  //SVG
  svg    
    .append("path")
    .datum(threeMonth)
    .attr("d", line)
    .attr("class", "line")
 
  svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));  
   
  svg.append("g")
    .attr("class", "yAxis")
    .call(d3.axisLeft(y));
   
  tooltips(data);
     
  onDataChange(data);
});

//event handlers
function onDataChange(data) {
  d3.select("#btn1")
    .on("click", function() {
      const oneMonth = data.filter(function(date, i) {
        return i > data.length - 30
      })
      changeGraph(oneMonth)
    });
  
  d3.select("#btn2")
    .on("click", function() {
      const threeMonth = data.filter(function(date, i) {
        return i > data.length - 90
      })
      changeGraph(threeMonth)
    });
  
  d3.select("#btn3")
    .on("click", function() {
      const twelveMonth = data.filter(function(date, i) {
        return i > data.length - 365
      })
      changeGraph(twelveMonth)
    });
  
  d3.select("#btn4")
  .on("click", function() {
      const fiveYear = data.filter(function(date, i) {
        return i > data.length - 1825
      })
      changeGraph(fiveYear)
    })
      
  d3.select("#btn5")
  .on("click", function() {
      const tenYear = data.filter(function(date, i) {
        return i > data.length - 3000
      })
      changeGraph(tenYear)
    })
    
  d3.select("#btn6")
  .on("click", function() {
      const twentyYear = data.filter(function(date, i) {
        return i > data.length - 4561
      })
      changeGraph(twentyYear)
  })
}

function changeGraph(data) {
  const xScale = x.domain([data[0].year, data[data.length - 1].year])
  const yScale = y.domain(d3.extent(data, d => d.value))

  //d3 line
  const line = d3.line()
    .x(function(d, i) { 
        return xScale(d.year) 
        }) 
    .y(d => yScale(d.value))
  
  const update = svg.select("path")    
    .datum(data)

  update
    .enter()
    .append("path")
    .merge(update)
    .attr("d", line)
    .attr("class", "line")

  update
    .exit()
    .remove()

  const xUpdate = svg.select(".xAxis") 
    .datum(data)

  xUpdate
    .enter()
    .append("g")
    .merge(xUpdate)
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  xUpdate
    .exit()
    .remove()

  const yUpdate = svg.select(".yAxis")   
    .datum(data)

  yUpdate
    .enter()
    .append("g")
    .merge(yUpdate)
    .call(d3.axisLeft(y))

  yUpdate
    .exit()
    .remove()

  tooltips(data);
}

function mousemove(data, focus) {
  return function() {
    const x0 = x.invert(d3.mouse(this)[0])
    const i = bisectDate(data, x0, 1)
    const d0 = data[i - 1]
    const d1 = data[i]
    d = x0 - d0.year > d1.year - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
    focus.select("text").text(function() { return d.value.toFixed(1) + " - " + format(d.year); }).attr("font-weight", "bold")
    focus.select(".y-hover-line").attr("x2", width + width);
  } 
}

function tooltips(data) {
  //Tooltips 
  const focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("line")
    .attr("class", "x-hover-line hover_line")
    .attr("y1", 0)
    .attr("y2", height);

  focus.append("line")
    .attr("class", "y-hover-line hover_line")
    .attr("x1", width)
    .attr("x2", width);

  focus.append("circle")
    .attr("r", 7.5);
 
  focus.append("rect")
    .attr("height", 30)
    .attr("width", 149)
    .attr("fill", "#EFEFEF")
    .classed("textBox", true)
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("x", 12)
    .attr("y", -15);

  focus.append("text")
    .attr("x", 15)
    .attr("dy", ".31em");

  svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    .on("mousemove", mousemove(data, focus));  
}
