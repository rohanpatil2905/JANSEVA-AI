/**
 * JanSeva AI - GIS Spatial Intelligence & Hotspot Heatmap Engine
 * Powered by Leaflet.js with custom urgency layers and cluster circles
 */

const GisMapEngine = {
  map: null,
  markersLayer: null,
  clusterCirclesLayer: null,
  currentCity: "all",

  initMap() {
    if (this.map) return; // already initialized
    const mapContainer = document.getElementById("gisMapLeaflet");
    if (!mapContainer) return;

    // Center map over India (Delhi-Mumbai-Bengaluru overview)
    this.map = L.map("gisMapLeaflet", {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true
    });

    // Dark styled basemap for command center aesthetic
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Digital India GIS',
      maxZoom: 18
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.clusterCirclesLayer = L.layerGroup().addTo(this.map);

    this.renderMarkers();
  },

  renderMarkers(filterDept = "all") {
    if (!this.map) return;
    this.markersLayer.clearLayers();
    this.clusterCirclesLayer.clearLayers();

    JanSevaData.tickets.forEach(ticket => {
      if (filterDept !== "all" && !ticket.department.toLowerCase().includes(filterDept.toLowerCase())) {
        return;
      }

      const [lat, lng] = ticket.coordinates;
      const isCrit = ticket.severity === "Critical";
      const isHigh = ticket.severity === "High";
      const color = isCrit ? "#ef4444" : isHigh ? "#f97316" : "#eab308";

      // Draw cluster radius circle if it's a master cluster
      if (ticket.isMasterCluster) {
        const circle = L.circle([lat, lng], {
          color: "#8b5cf6",
          fillColor: "#c4b5fd",
          fillOpacity: 0.35,
          radius: 1200,
          weight: 2
        });
        circle.bindTooltip(`🔥 Semantic Cluster: ${ticket.clusterCount} Linked Complaints (${ticket.ward})`, {
          permanent: false,
          direction: "top"
        });
        this.clusterCirclesLayer.addLayer(circle);
      }

      // Custom pulsing SVG icon marker
      const customIcon = L.divIcon({
        className: "custom-gis-pin",
        html: `
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: ${color};
            border: 3px solid #ffffff;
            box-shadow: 0 0 12px ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            cursor: pointer;
          ">
            ${ticket.isMasterCluster ? '★' : '•'}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family:'Inter',sans-serif; min-width:220px; padding:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-family:monospace; font-weight:700; font-size:11px; color:#091e3a;">${ticket.id}</span>
            <span style="font-size:10px; font-weight:700; background:${isCrit ? '#fee2e2' : '#ffedd5'}; color:${isCrit ? '#b91c1c' : '#c2410c'}; padding:2px 6px; border-radius:10px;">
              ${ticket.severity} (${ticket.urgencyScore}/10)
            </span>
          </div>
          <h4 style="font-size:12px; font-weight:700; margin:4px 0; color:#0f172a; line-height:1.3;">${ticket.title}</h4>
          <div style="font-size:11px; color:#64748b; margin-bottom:6px;">📍 ${ticket.ward}</div>
          <div style="font-size:11px; color:#475569; margin-bottom:8px;"><strong>Dept:</strong> ${ticket.department}</div>
          ${ticket.isMasterCluster ? `<div style="font-size:10px; color:#6d28d9; font-weight:700; margin-bottom:6px;">🔥 Cluster: ${ticket.clusterCount} duplicates merged</div>` : ''}
          <button onclick="App.openTicketDrawer('${ticket.id}')" style="width:100%; background:#091e3a; color:#fff; border:none; padding:5px 8px; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer;">
            Inspect XAI Details & Route
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      this.markersLayer.addLayer(marker);
    });
  },

  flyToCity(cityKey) {
    if (!this.map) return;
    const cityCoords = {
      all: { center: [20.5937, 78.9629], zoom: 5 },
      delhi: { center: [28.6139, 77.2090], zoom: 12 },
      mumbai: { center: [19.0760, 72.8777], zoom: 12 },
      bengaluru: { center: [12.9716, 77.5946], zoom: 12 },
      chennai: { center: [13.0827, 80.2707], zoom: 12 },
      kolkata: { center: [22.5726, 88.3639], zoom: 12 }
    };

    const target = cityCoords[cityKey] || cityCoords.all;
    this.map.flyTo(target.center, target.zoom, { duration: 1.2 });
  }
};
