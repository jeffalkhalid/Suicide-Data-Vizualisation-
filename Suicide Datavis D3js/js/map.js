//  width = 960,
//     height = 500,
    const legendCellSize = 20,
    colors = ['#d4eac7', '#c6e3b5', '#b7dda2', '#a9d68f', '#9bcf7d', '#8cc86a', '#7ec157', '#77be4e', '#70ba45', '#65a83e', '#599537', '#4e8230', '#437029', '#385d22', '#2d4a1c', '#223815'];
var annee=2004;
function update(value){
  console.log(value)
  year=value;
  return year;
}
const svgmap = d3.select('body').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "svg")
    .attr("fill",'#000000');

function addLegend(min,max){
  var legend = svgmap.append('g')
    .attr('transform', 'translate(40, 50)');
    legend.selectAll()
    .data(d3.range(colors.length))
    .enter().append('svg:rect')
        .attr('height', legendCellSize + 'px')
        .attr('width', legendCellSize + 'px')
        .attr('x', 5)
        .attr('y', d => d * legendCellSize)
        .style("fill", d => colors[d]);

var legendScale = d3.scaleLinear().domain([min, max])
.range([0, colors.length * legendCellSize]);

legendAxis = legend.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(legendScale));
return legend
}

function addTooltip() {
  var tooltip = svgmap.append("g") // Group for the whole tooltip
      .attr("id", "tooltip")
      .style("display", "none");

  tooltip.append("polyline") // The rectangle containing the text, it is 210px width and 60 height
      .attr("points","0,0 210,0 210,60 0,60 0,0")
      .style("fill", "#222b1d")
      .style("stroke","black")
      .style("opacity","0.9")
      .style("stroke-width","1")
      .style("padding", "1em");

  tooltip.append("line") // A line inserted between country name and score
      .attr("x1", 40)
      .attr("y1", 25)
      .attr("x2", 160)
      .attr("y2", 25)
      .style("stroke","#929292")
      .style("stroke-width","0.5")
      .attr("transform", "translate(0, 5)");

  var text = tooltip.append("text") // Text that will contain all tspan (used for multilines)
      .style("font-size", "13px")
      .style("fill", "#c1d3b8")
      .attr("transform", "translate(0, 20)");

  text.append("tspan") // Country name udpated by its id
      .attr("x", 105) // ie, tooltip width / 2
      .attr("y", 0)
      .attr("id", "tooltip-country")
      .attr("text-anchor", "middle")
      .style("font-weight", "600")
      .style("font-size", "16px");

  text.append("tspan") // Fixed text
      .attr("x", 105) // ie, tooltip width / 2
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("fill", "929292")
      .text("Suicides / 100K : ");

  text.append("tspan") // Score udpated by its id
      .attr("id", "tooltip-score")
      .style("fill","#c1d3b8")
      .style("font-weight", "bold");

  return tooltip;

}

const projection = d3.geoNaturalEarth1()
    .scale(1)
    .translate([0, 0]);

const path = d3.geoPath()
    .pointRadius(2)
    .projection(projection);

// const cGroup = svg.append("g");
d3.json("./dataset/world-countries-no-antartica.json", function(data) {
  topo=data;
  var b  = path.bounds(topo),
        s = .80 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
        .scale(s)
        .translate(t);

    svgmap.append("g").selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", d => ("code" + d.properties.name).replaceAll(" ",""))
        .attr("class", "country");
});
function getNumber(countryName, year,data) {
  var result;
  data.forEach(element => {
    if (element.year == year && element.country == countryName)
      result = element.suicides_100k
  });
  if (result == undefined)
    console.log("undefined country:", countryName)

  return result;
}

function changedata(myresult){
    if (myresult== undefined){
        myvar="Données manquantes";
    }
    else {
        myvar=myresult;
    };
    return myvar

}
d3.dsv(";","./dataset/suicides_agreggate.csv").then(function(data) {
  data.forEach(function(d) {
    d.country = d.country;
    d.suicide_rate = +d.suicides_100k;
    // d["land area"] = +d["land area"];

  });
  scores=data;
  function shortCountryName(country) {
    return country.replace("Démocratique", "Dem.").replace("République", "Rep.");
}

    function getColorIndex(color) {
    for (var i = 0; i < colors.length; i++) {
        if (colors[i] === color) {
            return i;
        }
    }
    return -1;
}
    const min = d3.min(scores, d =>  +d.suicides_100k),
        max = d3.max(scores, d =>  +d.suicides_100k);
        console.log(min)
        console.log(max)
    var quantile = d3.scaleQuantile().domain([min, max])
        .range(colors);
        var legend = addLegend(min, max);
        var tooltip = addTooltip();

    scores.forEach(function(e,i) {
    var countryPath = d3.select(("#code" + e.country).replaceAll(" ",""));


    countryPath
        .attr("scorecolor", quantile(getNumber(e.country, annee,scores)))
        .style("fill", quantile(getNumber(e.country, annee,scores)))
        .on("mouseover", function(d) {
            countryPath.style("fill", "#9966cc");
            tooltip.style("display", null);
            tooltip.select('#tooltip-country')
                .text(shortCountryName(e.country));
            tooltip.select('#tooltip-score')
                .text(changedata(getNumber(e.country, annee,scores)));
            legend.select("#cursor")
                .attr('transform', 'translate(' + (legendCellSize + 5) + ', ' + (getColorIndex(quantile(getNumber(e.country, annee,scores))) * legendCellSize) + ')')
                .style("display", null);
        })
        .on("mouseout", function(d) {
            countryPath.style("fill", quantile(getNumber(e.country, annee,scores)));
            tooltip.style("display", "none");
            //
        })
        .on("mousemove", function(d) {
            var mouse = d3.mouse(this);
            tooltip.attr("transform", "translate(" + mouse[0] + "," + (mouse[1] - 75) + ")");
        });
});


});



function update(year){

    d3.dsv(";","./suicides_agreggate.csv").then(function(data) {
        data.forEach(function(d) {
          d.country = d.country;
          d.suicide_rate = +d.suicides_100k;
          // d["land area"] = +d["land area"];

        });
        scores=data;
        function shortCountryName(country) {
          return country.replace("Démocratique", "Dem.").replace("République", "Rep.");
      }

          function getColorIndex(color) {
          for (var i = 0; i < colors.length; i++) {
              if (colors[i] === color) {
                  return i;
              }
          }
          return -1;
      }
          const min = d3.min(scores, d =>  +d.suicides_100k),
              max = d3.max(scores, d =>  +d.suicides_100k);
              console.log(min)
              console.log(max)
          var quantile = d3.scaleQuantile().domain([min, max])
              .range(colors);
              var legend = addLegend(min, max);
              var tooltip = addTooltip();

          scores.forEach(function(e,i) {
          var countryPath = d3.select(("#code" + e.country).replaceAll(" ",""));


          countryPath
              .attr("scorecolor", quantile(getNumber(e.country, year,scores)))
              .style("fill", quantile(getNumber(e.country, year,scores)))
              .on("mouseover", function(d) {
                  countryPath.style("fill", "#9966cc");
                  tooltip.style("display", null);
                  tooltip.select('#tooltip-country')
                      .text(shortCountryName(e.country));
                  tooltip.select('#tooltip-score')
                      .text(getNumber(e.country, year,scores));
                  legend.select("#cursor")
                      .attr('transform', 'translate(' + (legendCellSize + 5) + ', ' + (getColorIndex(quantile(getNumber(e.country, year,scores))) * legendCellSize) + ')')
                      .style("display", null);
              })
              .on("mouseout", function(d) {
                  countryPath.style("fill", quantile(getNumber(e.country, year,scores)));
                  tooltip.style("display", "none");
                  //
              })
              .on("mousemove", function(d) {
                  var mouse = d3.mouse(this);
                  tooltip.attr("transform", "translate(" + mouse[0] + "," + (mouse[1] - 75) + ")");
              });
      });


      });
}
svgmap.append("text")
    .attr("x", (width / 2))
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("fill", "#68647d")
    .style("font-weight", "300")
    .style("font-size", "32px")
    .text("Taux de suicide par 100k habitant de chaque pays");

    // Le traitement du CSV est réalisé ici
