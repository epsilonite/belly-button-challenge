// Define json 
const json = d3.json('https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json');

// Function to run on page load
function init() {
  json.then( data => {
    data.names.forEach( // Loop through data.names (list of sample names)
      id => d3.select('#selDataset').append('option').attr('value',id).html(id));
    // append a new option for each sample name inside #selDataset
    let sample = d3.select('#selDataset').property("value"); // Get the first sample from the list
    // Build charts and metadata panel with the first sample
    buildCharts(sample,data);
    buildMetadata(sample,data);
  });
}

// Build the metadata panel
function buildMetadata(id,data) {
  let metadata = data.metadata.filter(row => row.id==id)[0]; // filter data.metadata for given sample number
  // Use d3 to select `#sample-metadata` and reset the html
  d3.select("#sample-metadata").html(''); // clear values 
  Object.entries(metadata).forEach( // Loop through metadata (dictionary)
    ([key,value]) => d3.select("#sample-metadata").append('p').html(`${key.toUpperCase()}: ${value}`));
  // Use d3 to select `#sample-metadata` and append `key: value`s
}

// Function to build both charts
function buildCharts(id,data) {
    // Filter the samples for the object with the desired sample number
    let sampleData = data.samples.filter(row => row.id==id)[0];
    // console.log(sampleData);

   // Build a Bubble Chart
    var traceBubble = {
      x: sampleData.otu_ids,
      y: sampleData.sample_values,
      text: sampleData.otu_labels,
      mode: 'markers',
      marker: {color: sampleData.otu_ids, size: sampleData.sample_values}
    };
    var dataBubble = [traceBubble];
    var layoutBubble = {
      title: 'Bacteria Cultures Per Sample',
      showlegend: false,
      xaxis.title.text: 'OTU ID',
      yaxis.title.text: 'Number of Bacteria'
    };
    // Render the Bubble Chart
    Plotly.newPlot('bubble', dataBubble, layoutBubble);

    // Build a Bar Chart
    let barData = buildBarData(sampleData);
    let traceBar = {
      x: barData.map(row => row.sample_values),
      y: barData.map(row => `OTU ${row.otu_ids}`),
      text: barData.map(row => row.otu_labels),
      name: "Bacteria Cultures",
      type: "bar",
      orientation: "h"
    };
    // Data array
    let dataBar = [traceBar];
    let layoutBar = {
      title: "Top 10 Bacteria Cultures Found",
      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100
      }
    };
    // Render the Bar Chart
    Plotly.newPlot('bar', dataBar, layoutBar);
}

// Function to slice sample data for bar chart
function buildBarData(sampleData) {
  let sampleDict = [];
  sampleData.otu_ids.forEach(id => {
    let i = sampleData.otu_ids.indexOf(id);
    let dict = {
      otu_ids: id,
      otu_labels: sampleData.otu_labels[i],
      sample_values: sampleData.sample_values[i]
    };
    sampleDict.push(dict);
  });
  let slice = sampleDict.sort((x1,x2) => x2.sample_values-x1.sample_values).slice(0,10).reverse();
  return slice;
}

// Function for event listener
function optionChanged(newSample) {
  json.then( data => {
    // Build charts and metadata panel each time a new sample is selected
    let newData = data.samples.filter(row => row.id==newSample)[0];
    console.log(newData);
    // Redraw Bubble Chart
    Plotly.restyle("bubble", 'x', [newData.otu_ids]);
    Plotly.restyle("bubble", 'y', [newData.sample_values]);
    Plotly.restyle("bubble", 'text', [newData.otu_labels]);
    Plotly.restyle("bubble", 'marker', [{color: newData.otu_ids, size: newData.sample_values}]);
    // Redraw Bar Chart
    let barData = buildBarData(newData);
    Plotly.restyle("bar", "x", [barData.map(row => row.sample_values)]);
    Plotly.restyle("bar", "y", [barData.map(row => `OTU ${row.otu_ids}`)]);
    Plotly.restyle("bar", "text", [barData.map(row => row.otu_labels)]);
    //Update metadata
    buildMetadata(newSample);
  });
}

// Initialize the dashboard
init();
