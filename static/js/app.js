// define json 
const json = d3.json('https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json');

// Function to run on page load
function init() {
  json.then( data => {
    // Loop through the list of sample names data.names using foreach
    data.names.forEach(
      // append a new option for each sample name inside #selDataset
      id => d3.select('#selDataset').append('option').attr('value',id).html(id));
    // Get the first sample from the list
    let id = d3.select('#selDataset').property("value");
    // Build charts and metadata panel with the first sample
    buildCharts(id);
    buildMetadata(id);
  });
}

// Build the metadata panel
function buildMetadata(id) {
  json.then( data => {
    // get the metadata field
    // Filter the metadata for the object with the desired sample number
    let metadata = data.metadata.filter(row => row.id==id)[0];
    console.log(metadata);
    // Use d3 to select the panel with id of `#sample-metadata`
    d3.select("#sample-metadata").html('');
    Object.entries(metadata).forEach( 
      ([key,value]) => d3.select("#sample-metadata").append('p').html(`${key.toUpperCase()}: ${value}`));
  });
}

// function to build both charts
function buildCharts(id) {
  json.then( data => {

    // Filter the samples for the object with the desired sample number
    let sampleData = data.samples.filter(row => row.id==id)[0];
    // console.log(sampleData);

   // Build a Bubble Chart
    var traceBubble = {
      x: sampleData.otu_ids,
      y: sampleData.sample_values,
      text: sampleData.otu_labels,
      mode: 'markers',
      marker: {
        color: sampleData.otu_ids,
        size: sampleData.sample_values
      }
    };
    var dataBubble = [traceBubble];
    var layoutBubble = {
      title: 'Bacteria Cultures Per Sample',
      showlegend: false,
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
    // Apply a title to the layout
    let layout = {
      title: "Top 10 Bacteria Cultures Found",
      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100
      }
    };
    // Render the Bar Chart
    Plotly.newPlot("bar", dataBar, layout);
  });
}

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
