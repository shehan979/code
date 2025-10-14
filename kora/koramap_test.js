console.log("🟡 Map script started — waiting for all CMS items..");

let map, clusterer;
let markers = [];
let infoWindows = [];
let mapReady = false;
let mapFullyInitialized = false;

// --- Initialize Google Map ---
function initMap() {
  console.log("🧩 Google Maps API ready — initializing map");
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

// --- Build markers from CMS items ---
function loadMapMarkers() {
  if (!mapReady) return;
  const items = document.querySelectorAll(".map-loc-item[data-lat][data-lng]");
  console.log("✅ Found " + items.length + " .map-loc-item elements");

  if (!items.length) {
    console.warn("⚠️ No CMS map items yet — retrying...");
    setTimeout(loadMapMarkers, 1000);
    return;
  }

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
    const address = el.dataset.location || "";
    const zip = el.dataset.zip || "";
    const phone = el.dataset.phone || "";
    const email = el.dataset.email || "";
    const website = el.dataset.websitelink || "";
    const logo = el.dataset.logo || "";
    const slug = el.closest("[data-slug]") ? el.closest("[data-slug]").dataset.slug : "";
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

    const infoHTML =
      '<div class="location-popup no-border">' +
      '<div class="top-div">' +
      '<div class="name-box">' +
      '<a id="' + slug + '" href="#" class="map-icon-border w-inline-block">' +
      (logo
        ? '<img src="' + logo + '" loading="lazy" alt="' + name + '" class="home-icon">'
        : '<img src="https://cdn.prod.website-files.com/68638096a024554ba98ce8f3/68638096a024554ba98ce9cc_2%20PT.svg" loading="lazy" alt="' + name + '" class="home-icon w-condition-invisible">') +
      "</a></div>" +
      '<div class="share-wrap"><div class="w-embed">' +
      '<a href="https://www.google.com/maps/?q=' + lat + ',' + lng + '" target="_blank" class="map-icon-border circle w-inline-block">' +
      '<img src="https://cdn.prod.website-files.com/666d832bd0a2e3aee5032c0c/67b303e181a0730606c79b91_g216.svg" loading="lazy" alt="" class="home-icon _2">' +
      "</a></div></div></div>" +
      '<div class="location-details border">' +
      '<div class="retailer-name_wrap">' +
      '<p class="loc-name bold">' + name + "</p>" +
      '<p class="distance-display" style="display:none;"></p>' +
      "</div>" +
      '<p class="loc-location">' + address + "</p>" +
      '<p class="loc-location _2">' + zip + "</p>" +
      (phone ? '<a href="tel:' + phone + '" class="loc-phone">' + phone + "</a>" : "") +
      (email ? '<a href="mailto:' + email + '" class="loc-email">' + email + "</a>" : "") +
      (website
        ? '<a href="' + website + '" target="_blank" class="loc-web">' + website.replace(/^https?:\/\//, "") + "</a>"
        : "") +
      "</div></div>";

    const infowindow = new google.maps.InfoWindow({ content: infoHTML });
    marker.addListener("click", function () {
      infoWindows.forEach((iw) => iw.close());
      infowindow.open(map, marker);
      infoWindows.push(infowindow);
      const targetItem = document.getElementById(slug);
      if (targetItem) targetItem.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    markers.push(marker);
    bounds.extend(pos);
  });

  // --- Cluster styling ---
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
  console.log("🟢 Map ready with " + markers.length + " markers");
  mapFullyInitialized = true;
}

/* ============================================================
   📍 Radius Filter with Distance Display
============================================================ */
function filterByRadius(center, radiusKm) {
  if (!markers.length) return;
  const radiusM = (radiusKm || 50) * 1000;
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
    el.dataset.distance = km;
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
  console.log("🧭 Showing " + visible + " CMS items within " + radiusKm + " km radius");
}

/* ============================================================
   🔁 Reset Filter (clears distance text)
============================================================ */
function resetRadiusFilter() {
  document.querySelectorAll(".w-dyn-item").forEach(function (el) {
    el.style.display = "block";
    const d = el.querySelector(".distance-display");
    if (d) {
      d.textContent = "";
      d.style.display = "none";
    }
  });
  if (infoWindows.length) infoWindows.forEach((iw) => iw.close());
  infoWindows = [];
  markers.forEach((m) => m.setMap(map));
  console.log("🔁 Reset done — all items visible");
}