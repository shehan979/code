console.log("🟡 Map script started — waiting for all CMS items...");

let map, clusterer;
let markers = [];
let infoWindows = [];
let mapReady = false;
let mapFullyInitialized = false; // ✅ stop all watchers when done

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
  console.log(`✅ Found ${items.length} .map-loc-item elements`);

  if (!items.length) {
    console.warn("⚠️ No CMS map items yet — retrying...");
    setTimeout(loadMapMarkers, 1000);
    return;
  }

  // Clear previous state
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

    // --- Custom yellow drop-pin marker ---
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

    // --- Webflow-styled popup HTML ---
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
          <div class="retailer-name_wrap">
            <p class="loc-name bold">${name}</p>
          </div>
          <p class="loc-location">${address}</p>
          <p class="loc-location _2">${zip}</p>
          ${
            phone ? `<a href="tel:${phone}" class="loc-phone">${phone}</a>` : ""
          }
          ${
            email
              ? `<a href="mailto:${email}" class="loc-email">${email}</a>`
              : ""
          }
          ${
            website
              ? `<a href="${website}" target="_blank" class="loc-web">${website.replace(
                  /^https?:\/\//,
                  ""
                )}</a>`
              : ""
          }
        </div>

        <div class="hidden-map _65">
          <p id="distance-filter-value-set">distance-value</p>
        </div>
      </div>
    `;

    const infowindow = new google.maps.InfoWindow({ content: infoHTML });

    marker.addListener("click", () => {
      infoWindows.forEach((iw) => iw.close());
      infowindow.open(map, marker);
      infoWindows.push(infowindow);

      const targetItem = document.getElementById(slug);
      if (targetItem)
        targetItem.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    markers.push(marker);
    bounds.extend(pos);
  });

  // --- Yellow cluster icons ---
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
          </svg>
        `);
        return new google.maps.Marker({
          position,
          icon: {
            url: `data:image/svg+xml;base64,${svg}`,
            scaledSize: new google.maps.Size(size, size),
          },
        });
      },
    },
  });

  if (!bounds.isEmpty()) map.fitBounds(bounds);
  console.log(`🟢 Map ready with ${markers.length} markers`);
  mapFullyInitialized = true; // ✅ mark ready
}

// --- Wait for CMS + loader control ---
function waitForAllCMSItems() {
  const loadingEl = document.querySelector(".map_loading_screen");
  if (loadingEl) loadingEl.style.display = "flex";

  let attempts = 0;
  const maxAttempts = 10;

  const check = setInterval(() => {
    if (mapFullyInitialized) {
      clearInterval(check);
      console.log("🛑 Map already ready — stop polling");
      return;
    }

    const items = document.querySelectorAll(".map-loc-item[data-lat]");
    const finsweetReady =
      window.fsAttributes?.cms &&
      window.fsAttributes.cms.listInstances.length > 0;
    console.log(`⏳ CMS check #${++attempts}: found ${items.length} items`);

    if (items.length > 0 && finsweetReady) {
      clearInterval(check);
      console.log("✅ CMS fully loaded — building markers");
      loadMapMarkers();
      if (loadingEl) loadingEl.style.display = "none";
      console.log("🟢 Initialization complete — polling stopped");
      mapFullyInitialized = true;
      rebindOnCMSLoad(false); // one-time rebind
    } else if (attempts >= maxAttempts) {
      clearInterval(check);
      console.warn("⚠️ CMS not fully detected — fallback load");
      loadMapMarkers();
      if (loadingEl) loadingEl.style.display = "none";
      mapFullyInitialized = true;
      rebindOnCMSLoad(false);
    }
  }, 1000);
}

// --- CMS → Marker focus ---
function bindCMSMarkerClicks() {
  const links = document.querySelectorAll(".map-icon-border[id]");
  if (!links.length || !markers.length) {
    setTimeout(bindCMSMarkerClicks, 1000);
    return;
  }

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const slug = link.id;
      const itemEl = document.querySelector(
        `[data-slug="${slug}"] .map-loc-item`
      );
      if (!itemEl) return;
      const lat = parseFloat(itemEl.dataset.lat);
      const lng = parseFloat(itemEl.dataset.lng);
      const targetMarker = markers.find(
        (m) =>
          Math.abs(m.position.lat() - lat) < 0.0001 &&
          Math.abs(m.position.lng() - lng) < 0.0001
      );
      if (!targetMarker) return;
      google.maps.event.trigger(targetMarker, "click");
      map.panTo(targetMarker.getPosition());
      map.setZoom(13);
      console.log(`🎯 Focused marker for: ${slug}`);
    });
  });

  console.log("✅ CMS → Marker click binding complete");
}

// --- Rebind logic ---
function rebindOnCMSLoad(keepWatching = true) {
  if (mapFullyInitialized && !keepWatching) {
    console.log("🛑 Stopping CMS rebind watcher (initialization complete)");
    bindCMSMarkerClicks();

    // ✅ Final loader cleanup
    const loadingEl = document.querySelector(".map_loading_screen");
    if (loadingEl) loadingEl.style.display = "none";

    return;
  }

  function tryBind() {
    const links = document.querySelectorAll(".map-icon-border[id]");
    if (links.length && markers.length) bindCMSMarkerClicks();
    else setTimeout(tryBind, 1000);
  }

  if (window.fsAttributes && window.fsAttributes.cms && keepWatching) {
    window.fsAttributes.cms.on("load", () => {
      console.log("🔁 CMS batch loaded — rebinding");
      tryBind();
    });
  }

  tryBind();
}

// --- Initialize ---
window.addEventListener("load", () => {
  if (window.google && google.maps) initMap();
  else {
    const interval = setInterval(() => {
      if (window.google && google.maps) {
        clearInterval(interval);
        initMap();
      }
    }, 500);
  }
});

/* ============================================================
   📍 Location Search + 50 km Radius Filter (after map load)
============================================================ */
function initLocationSearch() {
  const input = document.getElementById("searchmap");
  if (!input || !google.maps.places) return setTimeout(initLocationSearch, 1000);

  const autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ["geometry", "formatted_address"],
    types: ["(regions)"],
    componentRestrictions: { country: "de" },
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    const center = place.geometry.location;
    filterByRadius(center, 50); // default 50 km radius
  });

  input.addEventListener("input", () => {
    if (input.value.trim() === "") resetRadiusFilter();
  });

  console.log("✅ Location search initialized");
}

/* === Popup-close fix added here === */function filterByRadius(center, radiusKm = 50) {
  if (!markers.length) return;

  // 🧹 Close all open InfoWindows before focusing
  if (infoWindows && infoWindows.length) {
    infoWindows.forEach((iw) => {
      try {
        iw.close();
      } catch (e) {
        console.warn("⚠️ InfoWindow close error:", e);
      }
    });
    infoWindows = [];
  }

  const radiusM = radiusKm * 1000;
  const bounds = new google.maps.LatLngBounds();
  let visibleCount = 0;

  // ✅ Loop through all CMS map items
  document.querySelectorAll(".map-loc-item[data-lat][data-lng]").forEach((el, i) => {
    const lat = parseFloat(el.dataset.lat);
    const lng = parseFloat(el.dataset.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    const pos = new google.maps.LatLng(lat, lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(center, pos);

    // ✅ Find parent .w-dyn-item safely (handles nested CMS or Finsweet structures)
    const cmsItem = el.closest(".w-dyn-item") || el.closest("[role='listitem']");
    if (!cmsItem) return;

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

  // ✅ Adjust map to visible markers
  if (visibleCount > 0 && !bounds.isEmpty()) {
    map.fitBounds(bounds);
  }

  console.log(`🧭 Showing ${visibleCount} CMS items within ${radiusKm} km radius`);
}


function resetRadiusFilter() {
  // 1️⃣ Show all CMS items again
  document.querySelectorAll(".w-dyn-item").forEach((el) => (el.style.display = "block"));

  // 2️⃣ Close all open popups
  if (infoWindows && infoWindows.length) {
    infoWindows.forEach((iw) => iw.close());
    infoWindows = [];
  }

  // 3️⃣ Re-add all markers to map
  markers.forEach((m) => m.setMap(map));

  // 4️⃣ Recreate clusterer with custom yellow styling
  if (clusterer) clusterer.clearMarkers();
  clusterer = new markerClusterer.MarkerClusterer({
    map,
    markers,
    renderer: {
      render: ({ count, position }) => {
        const color = "#fc0";
        const size = 40 + Math.log(count) * 8;
        const svg = window.btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="${color}" stroke="#b38b00" stroke-width="3"/>
            <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
              fill="#000" font-family="sans-serif" font-size="18">${count}</text>
          </svg>
        `);
        return new google.maps.Marker({
          position,
          icon: {
            url: `data:image/svg+xml;base64,${svg}`,
            scaledSize: new google.maps.Size(size, size),
          },
          zIndex: google.maps.Marker.MAX_ZINDEX + count,
        });
      },
    },
  });

  // 5️⃣ Recalculate bounds + refit map
  const bounds = new google.maps.LatLngBounds();
  markers.forEach((m) => {
    if (m.getMap()) bounds.extend(m.getPosition());
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds);
  } else {
    map.setCenter({ lat: 51.1, lng: 13.7 }); // fallback
    map.setZoom(7);
  }

  console.log("🔁 Radius filter reset + map refitted + clusters recolored");
}

// --- Delay init of location search until map fully ready ---
const readyCheck = setInterval(() => {
  if (mapFullyInitialized && markers.length > 0 && window.google?.maps?.places) {
    clearInterval(readyCheck);
    initLocationSearch();
  }
}, 1000);