
import React, { useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

function App() {
  const [initializationMethod, setInitializationMethod] = useState('Random');
  const [data, setData] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const [labels, setLabels] = useState([]);
  const [converged, setConverged] = useState(false);
  const [numberOfCentroids, setNumberOfCentroids] = useState(3); // User-defined number of centroids

  // Function to generate a new random dataset
  const handleGenerateData = async () => {
    try {
      const response = await axios.get('/initialize-data');
      setData(response.data);
      // Reset centroids and labels when new data is generated
      setCentroids([]);
      setLabels([]);
      setConverged(false);
    } catch (error) {
      console.error('Error generating data:', error);
    }
  };

  // Function to initialize centroids
  const handleInitializeCentroids = async () => {
    if (data.length === 0) {
      alert('Please generate data first.');
      return;
    }

    if (initializationMethod === 'Manual') {
      // For manual initialization, reset centroids and labels
      setCentroids([]);
      setLabels([]);
      setConverged(false);
      alert('Please select centroids by clicking on the plot.');
      return;
    }

    try {
      const response = await axios.post('/initialize-centroids', {
        method: initializationMethod,
        data: data,
        number_of_centroids: numberOfCentroids,
      });
      setCentroids(response.data.centroids);
      setLabels(response.data.labels);
      setConverged(false);
    } catch (error) {
      console.error('Error initializing centroids:', error);
    }
  };

  // Function to perform one step of KMeans
  const handleStepKMeans = async () => {
    if (centroids.length === 0) {
      alert('Please initialize centroids first.');
      return;
    }
    if (
      initializationMethod === 'Manual' &&
      centroids.length < numberOfCentroids
    ) {
      alert(
        `Please select ${numberOfCentroids} centroids. You have selected ${centroids.length}.`
      );
      return;
    }
    try {
      const response = await axios.post('/step-kmeans', {
        data: data,
        centroids: centroids,
        labels: labels,
      });

      if (response.data.converged) {
        setConverged(true);
        alert('Algorithm has converged.');
      } else {
        setCentroids(response.data.centroids);
        setLabels(response.data.labels);
      }
    } catch (error) {
      console.error('Error stepping KMeans:', error);
    }
  };

  // Function to jump to convergence
  const handleJumpToConvergence = async () => {
    if (centroids.length === 0) {
      alert('Please initialize centroids first.');
      return;
    }
    if (
      initializationMethod === 'Manual' &&
      centroids.length < numberOfCentroids
    ) {
      alert(
        `Please select ${numberOfCentroids} centroids. You have selected ${centroids.length}.`
      );
      return;
    }
    try {
      const response = await axios.post('/jump-to-convergence', {
        data: data,
        centroids: centroids,
        labels: labels,
      });

      setCentroids(response.data.centroids);
      setLabels(response.data.labels);
      setConverged(true);
      alert('Algorithm has converged.');
    } catch (error) {
      console.error('Error jumping to convergence:', error);
    }
  };

  // Function to reset the algorithm
  const handleReset = () => {
    setCentroids([]);
    setLabels([]);
    setConverged(false);
  };

  // Function to handle click on the plot for manual centroid selection
  const handlePlotClick = (event) => {
    if (initializationMethod !== 'Manual') {
      return;
    }

    if (event.points.length > 0) {
      // Get the click coordinates
      const x = event.points[0].x;
      const y = event.points[0].y;

      // Add the centroid
      const newCentroid = [x, y];
      setCentroids((prevCentroids) => {
        const updatedCentroids = [...prevCentroids, newCentroid];

        // If we have enough centroids, initialize labels
        if (updatedCentroids.length === numberOfCentroids) {
          initializeLabelsManual(updatedCentroids);
        }

        return updatedCentroids;
      });
    }
  };

  const initializeLabelsManual = async (manualCentroids) => {
    try {
      const response = await axios.post('/initialize-centroids', {
        method: 'Manual',
        data: data,
        centroids: manualCentroids,
      });
      setCentroids(response.data.centroids);
      setLabels(response.data.labels);
      setConverged(false);
    } catch (error) {
      console.error('Error initializing labels for manual centroids:', error);
    }
  };

  // Prepare data for Plotly
  const plotData = [];

  if (data.length > 0) {
    const xData = data.map((point) => point[0]);
    const yData = data.map((point) => point[1]);

    if (labels.length > 0) {
      // Color the data points according to labels
      plotData.push({
        x: xData,
        y: yData,
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: labels,
          colorscale: 'Viridis',
          showscale: false, // Remove the color bar
        },
        name: 'Data Points',
      });
    } else {
      // Plot data points without labels
      plotData.push({
        x: xData,
        y: yData,
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: 'grey',
        },
        name: 'Data Points',
      });
    }
  }

  if (centroids.length > 0) {
    const xCentroids = centroids.map((point) => point[0]);
    const yCentroids = centroids.map((point) => point[1]);

    plotData.push({
      x: xCentroids,
      y: yCentroids,
      mode: 'markers',
      type: 'scatter',
      marker: {
        symbol: 'x',
        size: 12,
        color: 'red',
      },
      name: 'Centroids',
    });
  }
  const plotLayout = {
    width: 700,
    height: 500,
    title: 'KMeans Clustering',
    xaxis: { title: 'X' },
    yaxis: { title: 'Y' },
    margin: { t: 50, l: 50, r: 50, b: 50 },
    showlegend: false,
    
  };
  // Handle number of centroids input change
  const handleNumberOfCentroidsChange = (e) => {
    const value = e.target.value;
    // Allow empty string to enable deleting the value
    if (value === '') {
      setNumberOfCentroids('');
    } else {
      const number = Number(value);
      if (!isNaN(number) && number > 0) {
        setNumberOfCentroids(number);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>KMeans Clustering Visualizer</h1>

      {/* Controls Section */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Initialization Method Selection */}
        <div style={{ marginRight: '20px' }}>
          <label htmlFor="initializationMethod">Initialization Method: </label>
          <select
            id="initializationMethod"
            value={initializationMethod}
            onChange={(e) => setInitializationMethod(e.target.value)}
          >
            <option value="Random">Random</option>
            <option value="Farthest First">Farthest First</option>
            <option value="KMeans++">KMeans++</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        {/* Number of Centroids */}
        <div style={{ marginRight: '20px' }}>
          <label htmlFor="numberOfCentroids">Number of Centroids: </label>
          <input
            type="number"
            id="numberOfCentroids"
            value={numberOfCentroids}
            min="1"
            onChange={handleNumberOfCentroidsChange}
            style={{ width: '50px' }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <button onClick={handleGenerateData} style={{ marginRight: '10px', marginTop: '5px' }}>
            Generate New Dataset
          </button>
          <button onClick={handleInitializeCentroids} style={{ marginRight: '10px', marginTop: '5px' }}>
            Initialize Centroids
          </button>
          <button onClick={handleStepKMeans} style={{ marginRight: '10px', marginTop: '5px' }}>
            Step KMeans
          </button>
          <button onClick={handleJumpToConvergence} style={{ marginRight: '10px', marginTop: '5px' }}>
            Jump to Convergence
          </button>
          <button onClick={handleReset} style={{ marginTop: '5px' }}>
            Reset Algorithm
          </button>
        </div>
      </div>

      {/* Plot */}
      <div style={{ marginTop: '20px' }}>
        <Plot
          data={plotData}
          layout={plotLayout}
          onClick={handlePlotClick}
        />
      </div>

      {/* Status Display */}
      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-around',
          borderTop: '1px solid #ccc',
          paddingTop: '10px',
        }}
      >
        <div>
          <strong>Data Points:</strong> {data.length}
        </div>
        <div>
          <strong>Centroids Initialized:</strong> {centroids.length > 0 ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Algorithm Converged:</strong> {converged ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
}

export default App;