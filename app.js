/* global d3 */




 // Margin Convention
    var margin = {top: 20, right: 10, bottom: 20, left: 50}
    var height = 400 - margin.left - margin.right
    var width = 800 - margin.top - margin.bottom
    
   //Scales
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    
   
    var bisectDate = d3.bisector(function(d) { return d.year; }).left;
     var parseTime = d3.timeParse("%Y-%m-%d")
     var format = d3.timeFormat("%b %d, %Y");
    

    // Margin Convention
    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
   .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
    
    //data
d3.json('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=INX&apikey=NSUNV8LPVSSN0247&outputsize=full', function(error, marketData) {
    if (error) throw error;
    
    var sp500 = d3.entries(marketData["Time Series (Daily)"])
   
    
    var data = []
    sp500.forEach(function(d) {
        var value = +d.value["4. close"];
        var year = parseTime(d.key)
        data.push({year, value})
    })    

   data = data.filter(function(d, i) {
               return d.value !== 0
           })

     data.sort(function(a, b) {
    return a.year - b.year;
    });
    
    var threeMonth = data.filter(function(d, i) {
                    return i > data.length - 30
                    })
                    
 
    var xScale = x.domain([threeMonth[0].year, threeMonth[threeMonth.length - 1].year])
    var yScale = y.domain(d3.extent(threeMonth, d => d.value))
        
 
  
    var line = d3.line()
    .x(function(d, i) { 
        return xScale(d.year) 
       }) 
    .y(d => yScale(d.value))
           
   
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
      
      //Tooltips
      
     var focus = svg.append("g")
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
        .on("mousemove", mousemove);   	 
    
    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(threeMonth, x0, 1),
          d0 = threeMonth[i - 1],
          d1 = threeMonth[i],
          d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
      focus.select("text").text(function() { return d.value.toFixed(1) + " - " + format(d.year); }).attr("font-weight", "bold")
      focus.select(".y-hover-line").attr("x2", width + width);
    } 
    
    d3.select("#btn1")
       .on("click", function() {
           var oneMonth = data.filter(function(date, i) {
                return i > data.length - 30
           })
           changeGraph(oneMonth)
        })
        
    d3.select("#btn2")
        .on("click", function() {
           var threeMonth = data.filter(function(date, i) {
                return i > data.length - 90
           })
           changeGraph(threeMonth)
        })
        
           d3.select("#btn3")
        .on("click", function() {
           var twelveMonth = data.filter(function(date, i) {
                return i > data.length - 365
           })
           changeGraph(twelveMonth)
        })
        
           d3.select("#btn4")
        .on("click", function() {
           var fiveYear = data.filter(function(date, i) {
                return i > data.length - 1825
           })
           changeGraph(fiveYear)
           })
           
           d3.select("#btn5")
        .on("click", function() {
           var tenYear = data.filter(function(date, i) {
                return i > data.length - 3000
           })
           changeGraph(tenYear)
          })
          
           d3.select("#btn6")
        .on("click", function() {
           var twentyYear = data.filter(function(date, i) {
                return i > data.length - 4561
               })
           changeGraph(twentyYear)
        })
        
      function changeGraph(data) {
        var xScale = x.domain([data[0].year, data[data.length - 1].year])
        var yScale = y.domain(d3.extent(data, d => d.value))
        
        var update = svg.select("path")    
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
      
      
      var xUpdate = svg.select(".xAxis") 
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
      
       var yUpdate = svg.select(".yAxis")   
       .datum(data)
       
       yUpdate
       .enter()
       .append("g")
       .merge(yUpdate)
       .call(d3.axisLeft(y))
      
      yUpdate
      .exit()
      .remove()
      
            //Tooltips
      
     var focus = svg.append("g")
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
        .attr("width", 151)
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
        .on("mousemove", mousemove);   	 
    
    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
      focus.select("text").text(function() { return d.value.toFixed(1) + " - " + format(d.year); }).attr("font-weight", "bold")
      focus.select(".x-hover-line").attr("y2", height - y(d.value));
      focus.select(".y-hover-line").attr("x2", width + width);
    }

}  
});