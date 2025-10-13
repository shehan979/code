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

/* ============================================================
   📍 Build markers from CMS items
============================================================ */
function loadMapMarkers() {
  if (!mapReady) return;
  const items = document.querySelectorAll(".map-loc-item[data-lat][data-lng]");
  console.log(`✅ Found ${items.length} .map-loc-item elements`);

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
    const slug = el.closest("[data-slug]")?.dataset.slug || "";
    const pos = { lat, lng };

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
      map,
      title: name,
      icon: svgMarker,
    });

    const infoHTML = `
      <div class="location-popup no-border">
        <div class="top-div">
          <div class="name-box">
            <a id="${slug}" href="#" class="map-icon-border w-inline-block">
              ${
                logo
                  ? `<img src="${logo}" loading="lazy" alt="${name}" class="home-icon">`
                  : `<img src="https://cdn.prod.website-files.com/68638096a024554ba98ce8f3/68638096a024554ba98ce9cc_2%20PT.svg" loading="lazy" alt="${name}" class="home-icon w-condition-invisible">`
              }
            </a>
          </div>
          <div class="share-wrap">
            <div class="w-embed">
              <a href="https://www.google.com/maps/?q=${lat},${lng}" target="_blank" class="map-icon-border circle w-inline-block">
                <img src="https://cdn.prod.website-files.com/666d832bd0a2e3aee5032c0c/67b303e181a0730606c79b91_g216.svg" loading="lazy" alt="" class="home-icon _2">
              </a>
            </div>
          </div>
        </div>
        <div class="location-details border">
          <div class="retailer-name_wrap"><p class="loc-name bold">${name}</p></div>
          <p class="loc-location">${address}</p>
          <p class="loc-location _2">${zip}</p>
          ${phone ? `<a href="tel:${phone}" class="loc-phone">${phone}</a>` : ""}
          ${email ? `<a href="mailto:${email}" class="loc-email">${email}</a>` : ""}
          ${website ? `<a href="${website}" target="_blank" class="loc-web">${website.replace(/^https?:\/\//, "")}</a>` : ""}
        </div>
      </div>
    `;

    const infowindow = new google.maps.InfoWindow({ content: infoHTML });

    marker.addListener("click", () => {
      infoWindows.forEach((iw) => iw.close());
      infowindow.open(map, marker);
      infoWindows.push(infowindow);
      const targetItem = document.getElementById(slug);
      if (targetItem) targetItem.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    markers.push(marker);
    bounds.extend(pos);
  });

  if (clusterer) clusterer.clearMarkers();
  clusterer = new markerClusterer.MarkerClusterer({
    map,
    markers,
    renderer: {
      render: ({ count, position }) => {
        const color = "#fc0";
        const size = 40 + Math.log(count) * 10;
        const svg = window.btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="${color}" stroke="#b38b00" stroke-width="3"/>
            <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="#000" font-family="sans-serif" font-size="18">${count}</text>
          </svg>`);
        return new google.maps.Marker({
          position,
          icon: { url: `data:image/svg+xml;base64,${svg}`, scaledSize: new google.maps.Size(size, size) },
        });
      },
    },
  });

  if (!bounds.isEmpty()) map.fitBounds(bounds);
  console.log(`🟢 Map ready with ${markers.length} markers`);
  mapFullyInitialized = true;
}

/* ============================================================
   🧭 Wait for CMS Load
============================================================ */
function waitForAllCMSItems() {
  const loadingEl = document.querySelector(".map_loading_screen");
  if (loadingEl) loadingEl.style.display = "flex";
  let attempts = 0,
    maxAttempts = 10;

  const check = setInterval(() => {
    if (mapFullyInitialized) return clearInterval(check);
    const items = document.querySelectorAll(".map-loc-item[data-lat]");
    const finsweetReady = window.fsAttributes?.cms && window.fsAttributes.cms.listInstances.length > 0;
    console.log(`⏳ CMS check #${++attempts}: found ${items.length} items`);
    if (items.length > 0 && finsweetReady) {
      clearInterval(check);
      loadMapMarkers();
      if (loadingEl) loadingEl.style.display = "none";
      mapFullyInitialized = true;
      rebindOnCMSLoad(false);
    } else if (attempts >= maxAttempts) {
      clearInterval(check);
      loadMapMarkers();
      if (loadingEl) loadingEl.style.display = "none";
      mapFullyInitialized = true;
      rebindOnCMSLoad(false);
    }
  }, 1000);
}

/* ============================================================
   📏 Sort CMS Items by Distance
============================================================ */
function sortCMSItemsByDistance(center) {
  const items = Array.from(document.querySelectorAll(".map-loc-item[data-lat][data-lng]"));
  if (!items.length) return;

  const distances = [];

  items.forEach((el) => {
    const lat = parseFloat(el.dataset.lat);
    const lng = parseFloat(el.dataset.lng);
    const wrapper = el.closest(".w-dyn-item");
    if (!wrapper || isNaN(lat) || isNaN(lng) || wrapper.style.display === "none") return;

    const pos = new google.maps.LatLng(lat, lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(center, pos) / 1000;
    distances.push({ el: wrapper, distance });
  });

  distances.sort((a, b) => a.distance - b.distance);

  const cmsList = document.querySelector('[fs-list-load="all"], [role="list"], .w-dyn-items');
  if (cmsList) {
    distances.forEach(({ el, distance }) => {
      el.querySelector("#distance-filter-value-set")?.textContent = `${distance.toFixed(1)} km`;
      cmsList.appendChild(el);
    });
  }

  console.log(`📏 Sorted ${distances.length} CMS items by nearest distance`);
}

/* ============================================================
   🎯 Filter by Radius
============================================================ */
function filterByRadius(center, radiusKm = 50) {
  if (!markers.length) return;
  infoWindows.forEach((iw) => iw.close());
  infoWindows = [];

  const radiusM = radiusKm * 1000;
  const bounds = new google.maps.LatLngBounds();
  let visibleCount = 0;

  document.querySelectorAll(".map-loc-item[data-lat][data-lng]").forEach((el, i) => {
    const lat = parseFloat(el.dataset.lat);
    const lng = parseFloat(el.dataset.lng);
    const cmsItem = el.closest(".w-dyn-item");
    if (!cmsItem || isNaN(lat) || isNaN(lng)) return;

    const pos = new google.maps.LatLng(lat, lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(center, pos);

    if (distance <= radiusM) {
      cmsItem.style.display = "block";
      markers[i].setMap(map);
      bounds.extend(pos);
      visibleCount++;
    } else {
      cmsItem.style.display = "none";
      markers[i].setMap(null);
    }
  });

  if (visibleCount > 0 && !bounds.isEmpty()) {
    map.fitBounds(bounds);
    sortCMSItemsByDistance(center);
  }

  console.log(`🧭 Showing ${visibleCount} CMS items within ${radiusKm} km radius (sorted)`);
}

/* ============================================================
   🔁 Reset Filter Button
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchmap");
  const resetBtn = document.getElementById("resetfilter");
  if (!input || !resetBtn) return;
  resetBtn.style.display = "none";

  input.addEventListener("input", () => {
    resetBtn.style.display = input.value.trim() !== "" ? "flex" : "none";
  });

  if (window.google?.maps?.places) {
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener("place_changed", () => {
      if (input.value.trim() !== "") resetBtn.style.display = "flex";
    });
  }

  resetBtn.addEventListener("click", () => {
    console.log("🔁 Reset button clicked — restoring default map");
    input.value = "";
    resetBtn.style.display = "none";
    resetRadiusFilter();
    if (typeof initLiveCMSFilterOnMapMove === "function") initLiveCMSFilterOnMapMove();
  });
});
