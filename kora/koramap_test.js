console.log("🟡 Map script started — waiting for all CMS items..");

let map, clusterer;
let markers = [];
let infoWindows = [];
let mapReady = false;
let mapFullyInitialized = false;

/* ============================================================
   🗺️ Initialize Google Map
============================================================ */
function initMap() {
  console.log("🧩 Google Maps API ready — initializing map...");
  const mapEl = document.getElementById("map_canvas");
  if (!mapEl) {
    console.error("❌ Map canvas not found!");
    return;
  }

  map = new google.maps.Map(mapEl, {
    center: { lat: 51.1, lng: 13.7 },
    zoom: 7,
    mapTypeId: "roadmap",
    gestureHandling: "greedy",
    streetViewControl: false,
    fullscreenControl: true,
    mapId: "DEALER_MAP",
  });

  mapReady = true;
  waitForAllCMSItems();
}

/* ============================================================
   ⏳ Wait for CMS items (improved logic)
============================================================ */
function waitForAllCMSItems() {
  console.log("⏳ Checking CMS items + Finsweet Attributes...");
  const loadingEl = document.querySelector(".map_loading_screen");
  if (loadingEl) loadingEl.style.display = "flex";

  let attempts = 0;
  const maxAttempts = 15;

  const check = setInterval(() => {
    attempts++;
    const items = document.querySelectorAll(".map-loc-item[data-lat][data-lng]");
    const fsV1 = window.fsAttributes?.cms && window.fsAttributes.cms.listInstances.length > 0;
    const fsV2 = document.querySelectorAll("[fs-list-element='list']").length > 0;

    console.log(`🔍 CMS check #${attempts}: ${items.length} items | Finsweet v1: ${!!fsV1} | v2: ${!!fsV2}`);

    if (items.length > 0 && (fsV1 || fsV2)) {
      clearInterval(check);
      console.log("✅ CMS fully loaded — initializing markers...");
      if (loadingEl) loadingEl.style.display = "none";
      loadMapMarkers();
      mapFullyInitialized = true;
      bindCMSMarkerClicks();
      initLocationSearch();
    } else if (attempts >= maxAttempts) {
      clearInterval(check);
      console.warn("⚠️ CMS not detected after timeout — forcing map load fallback.");
      if (loadingEl) loadingEl.style.display = "none";
      loadMapMarkers();
      mapFullyInitialized = true;
      bindCMSMarkerClicks();
      initLocationSearch();
    }
  }, 1000);
}

/* ============================================================
   📍 Build Markers
============================================================ */
function loadMapMarkers() {
  if (!mapReady) {
    console.warn("⚠️ Map not ready yet — retrying...");
    return setTimeout(loadMapMarkers, 1000);
  }

  const items = document.querySelectorAll(".map-loc-item[data-lat][data-lng]");
  console.log("✅ Found " + items.length + " CMS location items");

  if (!items.length) {
    console.warn("⚠️ No CMS map items yet — waiting...");
    setTimeout(loadMapMarkers, 1000);
    return;
  }

  // clear
  markers.forEach((m) => m.setMap(null));
  markers = [];
  infoWindows.forEach((i) => i.close());
  infoWindows = [];

  const bounds = new google.maps.LatLngBounds();

  items.forEach((el) => {
    const lat = parseFloat(el.dataset.lat);
    const lng = parseFloat(el.dataset.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    const name = el.dataset.name || "Unnamed";
    const pos = { lat: lat, lng: lng };
    const svgMarker = {
      path: "M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7zm0 9.5c-1.39 0-2.5-1.12-2.5-2.5S10.61 6.5 12 6.5s2.5 1.12 2.5 2.5S13.39 11.5 12 11.5z",
      fillColor: "#fc0",
      fillOpacity: 1,
      strokeColor: "#b38b00",
      strokeWeight: 1.2,
      scale: 1.8,
      anchor: new google.maps.Point(12, 24),
    };

    const marker = new google.maps.Marker({
      position: pos,
      map: map,
      title: name,
      icon: svgMarker,
    });

    markers.push(marker);
    bounds.extend(pos);
  });

  if (clusterer) clusterer.clearMarkers();
  clusterer = new markerClusterer.MarkerClusterer({
    map: map,
    markers: markers,
    renderer: {
      render: ({ count, position }) => {
        const color = "#fc0";
        const size = 40 + Math.log(count) * 10;
        const svg =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">' +
          '<circle cx="30" cy="30" r="26" fill="' + color + '" stroke="#b38b00" stroke-width="3"/>' +
          '<text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="#000" font-family="sans-serif" font-size="18">' +
          count +
          "</text></svg>";
        return new google.maps.Marker({
          position: position,
          icon: {
            url: "data:image/svg+xml;base64," + window.btoa(svg),
            scaledSize: new google.maps.Size(size, size),
          },
        });
      },
    },
  });

  if (!bounds.isEmpty()) map.fitBounds(bounds);
  console.log("🟢 Map initialized with " + markers.length + " markers");
}

/* ============================================================
   🧭 Radius Filter (distance shown)
============================================================ */
function filterByRadius(center, radiusKm = 50) {
  if (!markers.length) return;
  const radiusM = radiusKm * 1000;
  const bounds = new google.maps.LatLngBounds();
  let visible = 0;

  document.querySelectorAll(".map-loc-item[data-lat][data-lng]").forEach(function (el, i) {
    const lat = parseFloat(el.dataset.lat);
    const lng = parseFloat(el.dataset.lng);
    const wrap = el.closest(".w-dyn-item");
    if (!wrap || isNaN(lat) || isNaN(lng)) return;

    const pos = new google.maps.LatLng(lat, lng);
    const dist = google.maps.geometry.spherical.computeDistanceBetween(center, pos);
    const km = (dist / 1000).toFixed(1);

    const p = wrap.querySelector(".distance-display");
    if (p) {
      p.textContent = km + " km";
      p.style.display = "block";
    }

    if (dist <= radiusM) {
      wrap.style.display = "block";
      markers[i].setMap(map);
      bounds.extend(pos);
      visible++;
    } else {
      wrap.style.display = "none";
      markers[i].setMap(null);
    }
  });

  if (visible > 0 && !bounds.isEmpty()) map.fitBounds(bounds);
  console.log("🧭 Showing " + visible + " CMS items within " + radiusKm + " km");
}

/* ============================================================
   🔁 Reset
============================================================ */
function resetRadiusFilter() {
  document.querySelectorAll(".w-dyn-item").forEach((el) => {
    el.style.display = "block";
    const d = el.querySelector(".distance-display");
    if (d) {
      d.textContent = "";
      d.style.display = "none";
    }
  });
  markers.forEach((m) => m.setMap(map));
  console.log("🔁 Reset — all markers visible again");
}

/* ============================================================
   📍 Location Search
============================================================ */
function initLocationSearch() {
  const input = document.getElementById("searchmap");
  if (!input || !google.maps.places) return setTimeout(initLocationSearch, 1000);

  const autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ["geometry", "formatted_address"],
    types: ["(regions)"],
    componentRestrictions: { country: "de" },
  });

  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
    else if (place.geometry.location) {
      map.setCenter(place.geometry.location);
      map.setZoom(11);
    }

    const center = place.geometry.location || map.getCenter();
    filterByRadius(center, 50);

    const resetBtn = document.getElementById("resetfilter");
    if (resetBtn) resetBtn.style.display = "flex";
  });

  input.addEventListener("input", function () {
    if (input.value.trim() === "") resetRadiusFilter();
  });
  console.log("✅ Location search initialized");
}

/* ============================================================
   🪄 Start when API ready
============================================================ */
window.addEventListener("load", function () {
  if (window.google && window.google.maps) {
    initMap();
  } else {
    const checker = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checker);
        initMap();
      }
    }, 500);
  }
});