// Initialize base layers: street map and topographic map
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  });
  
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
  });
  
  // Create a layer group for earthquake markers
  let earthquakeMarkers = L.layerGroup();
  
  // Function to calculate marker size based on earthquake magnitude
  function markerSize(magnitude) {
    return Math.sqrt(magnitude) * 1000;  // Adjust marker size based on magnitude
  }
  
  // Fetch the earthquake data using the `fetch()` API
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();  // Parse JSON from the response
    })
    .then(data => {
      data.features.forEach(earthquake => {
        const coords = earthquake.geometry.coordinates;  // [longitude, latitude, depth]
        const lat = coords[1];
        const lon = coords[0];
        const depth = coords[2];
        const magnitude = earthquake.properties.mag;
        const place = earthquake.properties.place;
  
        // Create a circle marker for each earthquake
        let marker = L.circle([lat, lon], {
          radius: markerSize(magnitude),  // Adjust size based on magnitude
          color: getColorByDepth(depth),  // Set color based on depth
          fillOpacity: 0.75
        }).bindPopup(`
          <h1>Location: ${place}</h1>
          <hr>
          <h3>Magnitude: ${magnitude}</h3>
          <h3>Depth: ${depth} km</h3>
        `);
  
        // Add marker to earthquakeMarkers layer group
        earthquakeMarkers.addLayer(marker);
      });
    })
    .catch(error => {
      console.error('Error fetching earthquake data:', error);
    });
  
  // Helper function to determine marker color based on earthquake depth
  function getColorByDepth(depth) {
    if (depth > 90) {
      return '#d73027';  // Red
    } else if (depth > 70) {
      return '#fc8d59';  // Orange-Red
    } else if (depth > 50) {
      return '#fee08b';  // Yellow-Orange
    } else if (depth > 30) {
      return '#d9ef8b';  // Yellow-Green
    } else if (depth > 10) {
      return '#91cf60';  // Light Green
    } else {
      return '#1a9850';  // Green for depths <= 10, including negatives
    }
  }

  // Create a legend control
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
  let div = L.DomUtil.create('div', 'info legend'),
      depths = [-10, 10, 30, 50, 70, 90],
      labels = [];
  
  // Add title to the legend
  div.innerHTML += '<strong>Depth (km)</strong><br>';

  // Loop through the depth intervals and generate a label with a colored square for each interval
  for (let i = 0; i < depths.length; i++) {
    div.innerHTML +=
      '<i style="background-color:' + getColorByDepth(depths[i] + 1) + 
      '; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i> ' +
      depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
  }

  return div;
};
  
  // Define baseMaps object to hold the base layers
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };
  
  // Define overlay object to hold the earthquake layer
  let overlayMaps = {
    "Earthquakes": earthquakeMarkers
  };
  
  // Create the map object, initialize with the street map and earthquake markers
  let myMap = L.map("map", {
    center: [0, 0],  // World map view
    zoom: 2,
    layers: [street, earthquakeMarkers]  // Default layers
  });
  
  // Add layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false  // Keep the layer control expanded
  }).addTo(myMap);

  legend.addTo(myMap);