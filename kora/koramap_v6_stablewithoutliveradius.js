console.log("🟡 Map script started — waiting for all CMS items..");

// --- Force-clear search field on refresh ---
window.addEventListener("pageshow", () => {
  const input = document.getElementById("searchmap");
  if (input) {
    input.value = "";
    console.log("🧹 Cleared search field on refresh");
  }
});

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

    // --- Webflow-styled popup ---
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

  // --- Cluster styling ---
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

// --- CMS + loader control ---
function waitForAllCMSItems() {
  const loadingEl = document.querySelector(".map_loading_screen");
  if (loadingEl) loadingEl.style.display = "flex";
  let attempts = 0, maxAttempts = 5;

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

// --- CMS → Marker focus ---
function bindCMSMarkerClicks() {
  const links = document.querySelectorAll(".map-icon-border[id]");
  if (!links.length || !markers.length) return setTimeout(bindCMSMarkerClicks, 1000);
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const slug = link.id;
      const itemEl = document.querySelector(`[data-slug="${slug}"] .map-loc-item`);
      if (!itemEl) return;
      const lat = parseFloat(itemEl.dataset.lat);
      const lng = parseFloat(itemEl.dataset.lng);
      const targetMarker = markers.find(
        (m) => Math.abs(m.position.lat() - lat) < 0.0001 && Math.abs(m.position.lng() - lng) < 0.0001
      );
      if (!targetMarker) return;
      google.maps.event.trigger(targetMarker, "click");
      map.panTo(targetMarker.getPosition());
      map.setZoom(13);
    });
  });
  console.log("✅ CMS → Marker click binding complete");
}

// --- Rebind logic ---
function rebindOnCMSLoad(keepWatching = true) {
  if (mapFullyInitialized && !keepWatching) {
    bindCMSMarkerClicks();
    const loadingEl = document.querySelector(".map_loading_screen");
    if (loadingEl) loadingEl.style.display = "none";
    return;
  }
  const tryBind = () => {
    const links = document.querySelectorAll(".map-icon-border[id]");
    if (links.length && markers.length) bindCMSMarkerClicks();
    else setTimeout(tryBind, 1000);
  };
  if (window.fsAttributes?.cms && keepWatching)
    window.fsAttributes.cms.on("load", tryBind);
  tryBind();
}

// --- Initialize ---
window.addEventListener("load", () => {
  if (window.google?.maps) initMap();
  else {
    const interval = setInterval(() => {
      if (window.google?.maps) {
        clearInterval(interval);
        initMap();
      }
    }, 500);
  }
});

/* ============================================================
   📍 Location Search + 50 km Radius Filter
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
  
    // --- Handle both precise and regional results ---
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport); // Fit to the full region (e.g., city)
    } else if (place.geometry.location) {
      map.setCenter(place.geometry.location);
      map.setZoom(11); // Default zoom if no viewport available
    }
  
    // --- Always trigger your radius filter after focusing ---
    const center = place.geometry.location || map.getCenter();
    filterByRadius(center, 50);
  
    // --- Show reset button ---
    const resetBtn = document.getElementById("resetfilter");
    if (resetBtn) resetBtn.style.display = "flex";
  });
  
  input.addEventListener("input", () => {
    if (input.value.trim() === "") resetRadiusFilter();
  });
  console.log("✅ Location search initialized");
}

// --- Filter by radius with auto-expand + empty-state logic ---
function filterByRadius(center, radiusKm = 50) {
  if (!markers.length) return;
  if (infoWindows.length) infoWindows.forEach((iw) => iw.close());
  infoWindows = [];

  const radiusM = radiusKm * 1000;
  const bounds = new google.maps.LatLngBounds();
  const visibleItems = [];
  const emptyState = document.querySelector(".empty-state-7.w-dyn-empty");

  // Build quick lookup table for markers by lat+lng
  const markerMap = new Map();
  markers.forEach((m) => {
    const key = `${m.getPosition().lat().toFixed(5)},${m.getPosition().lng().toFixed(5)}`;
    markerMap.set(key, m);
  });

  document.querySelectorAll(".map-loc-item[data-lat][data-lng]").forEach((el) => {
    const lat = parseFloat(el.dataset.lat);
    const lng = parseFloat(el.dataset.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    const marker = markerMap.get(key);

    const cmsItem = el.closest(".w-dyn-item") || el.closest("[role='listitem']");
    if (!cmsItem || !marker) return;

    const pos = new google.maps.LatLng(lat, lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(center, pos);
    const distanceKm = (distance / 1000).toFixed(1);

    // ✅ Add / update distance paragraph
    let distEl = cmsItem.querySelector(".distance-display");
    if (!distEl) {
      distEl = document.createElement("p");
      distEl.classList.add("distance-display");
      cmsItem.querySelector(".retailer-name_wrap")?.appendChild(distEl);
    }
    distEl.textContent = distanceKm + " km";
    distEl.style.display = "block";

    // ✅ Show / hide item + marker based on distance
    if (distance <= radiusM) {
      cmsItem.style.display = "block";
      marker.setMap(map);
      bounds.extend(pos);
      visibleItems.push({ el: cmsItem, distance });
    } else {
      cmsItem.style.display = "none";
      marker.setMap(null);
    }
  });

  // ✅ Auto-expand search radius stepwise up to 200 km
if (visibleItems.length === 0) {
  if (radiusKm < 100) {
    console.warn(`⚠️ No items found within ${radiusKm} km — expanding to 100 km...`);
    return filterByRadius(center, 100);
  } else if (radiusKm < 150) {
    console.warn(`⚠️ Still empty — expanding to 150 km...`);
    return filterByRadius(center, 150);
  } else if (radiusKm < 200) {
    console.warn(`⚠️ Still empty — expanding to 200 km...`);
    return filterByRadius(center, 200);
  } else {
    console.warn("🚫 No items found within 200 km radius — showing empty state");
    if (emptyState) emptyState.style.display = "block";
  }
} else {
  if (emptyState) emptyState.style.display = "none";
}


  // ✅ Sort visible items by distance
  visibleItems.sort((a, b) => a.distance - b.distance);
  const listParent = visibleItems[0]?.el.parentElement;
  if (listParent) visibleItems.forEach((item) => listParent.appendChild(item.el));

  // ✅ Fit bounds + lock zoom between 0–100 km
  if (visibleItems.length > 0 && !bounds.isEmpty()) {
    map.fitBounds(bounds);
    setTimeout(() => {
      const currentZoom = map.getZoom();
      const minZoom = 8;  // ≈100 km (max zoom-out)
      const maxZoom = 15; // ≈0.8 km (street level)
      map.setOptions({ minZoom, maxZoom });
      if (currentZoom < minZoom) map.setZoom(minZoom);
      if (currentZoom > maxZoom) map.setZoom(maxZoom);
    }, 600);
  }

  console.log(`🧭 Showing ${visibleItems.length} CMS items within ${radiusKm} km radius`);


  // ✅ Update filter status UI
const statusBox = document.querySelector(".filter_status");
const statusText = document.querySelector(".filterstatus_text");
if (statusBox && statusText) {
  statusText.textContent = `Ergebnisse im Umkreis von ${radiusKm} km anzeigen`;
  statusBox.style.display = "block";
}


}

// --- Reset map ---
function resetRadiusFilter() {
  document.querySelectorAll(".w-dyn-item").forEach((el) => {
    el.style.display = "block";
    const distEl = el.querySelector(".distance-display");
    if (distEl) {
      distEl.textContent = "";
      distEl.style.display = "none";
    }
  });

  // ✅ Hide empty state again on reset (moved outside the loop)
  const emptyState = document.querySelector(".empty-state-7.w-dyn-empty");
  if (emptyState) emptyState.style.display = "none";

  // ✅ Hide filter status again on reset
const statusBox = document.querySelector(".filter_status");
if (statusBox) statusBox.style.display = "none";


  if (infoWindows.length) infoWindows.forEach((iw) => iw.close());
  infoWindows = [];
  markers.forEach((m) => m.setMap(map));

  if (clusterer) clusterer.clearMarkers();
  clusterer = new markerClusterer.MarkerClusterer({
    map,
    markers,
    renderer: {
      render: ({ count, position }) => {
        const color = "#fc0";
        const size = 40 + Math.log(count) * 8;
        const svg = window.btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="${color}" stroke="#b38b00" stroke-width="3"/>
          <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
            fill="#000" font-family="sans-serif" font-size="18">${count}</text></svg>`);
        return new google.maps.Marker({
          position,
          icon: { url: `data:image/svg+xml;base64,${svg}`, scaledSize: new google.maps.Size(size, size) },
        });
      },
    },
  });

  const bounds = new google.maps.LatLngBounds();
  markers.forEach((m) => { if (m.getMap()) bounds.extend(m.getPosition()); });
  if (!bounds.isEmpty()) map.fitBounds(bounds);
  else { map.setCenter({ lat: 51.1, lng: 13.7 }); map.setZoom(7); }
  map.setOptions({
  minZoom: null,
  maxZoom: null
});
console.log("🆓 Zoom limits removed — full zoom freedom restored");
console.log("🔁 Radius filter reset + distances cleared + clusters restored");
}

/* ============================================================
   ⌨️ Enter Key → Select Highlighted or First Autocomplete Suggestion (Fixed)
============================================================ */
function enableAutocompleteEnterSelect() {
  const input = document.getElementById("searchmap");
  if (!input) return;

  google.maps.event.addDomListener(input, "keydown", function (e) {
    if (e.key === "Enter") {
      const pacSelected = document.querySelector(".pac-item-selected");
      const pacItems = document.querySelectorAll(".pac-item");

      // ✅ Only force select the first suggestion if none is highlighted
      if (!pacSelected && pacItems.length > 0) {
        e.preventDefault();
        const simulatedDownArrow = new KeyboardEvent("keydown", { keyCode: 40 });
        input.dispatchEvent(simulatedDownArrow);
        console.log("↩️ Enter pressed — no selection, auto-picking first suggestion");
      } else {
        console.log("↩️ Enter pressed — existing highlighted suggestion selected normally");
      }
    }
  });
}


/* ============================================================
   🎨 Highlight First Autocomplete Suggestion
============================================================ */
function highlightFirstAutocompleteOption() {
  const pacObserver = new MutationObserver(() => {
    const pacItems = document.querySelectorAll(".pac-item");
    if (pacItems.length > 0) {
      // Remove highlight from all
      pacItems.forEach((item) => item.style.backgroundColor = "");
      // Highlight the first suggestion
      pacItems[0].style.backgroundColor = "#fff6d6"; // light yellow
    }
  });

  // Observe DOM changes (Google injects .pac-container dynamically)
  pacObserver.observe(document.body, { childList: true, subtree: true });
  console.log("🎨 Autocomplete highlight observer active");
}

// --- Initialize search once map ready ---
const readyCheck = setInterval(() => {
  if (mapFullyInitialized && markers.length > 0 && window.google?.maps?.places) {
    clearInterval(readyCheck);
    initLocationSearch();
    enableAutocompleteEnterSelect();
    highlightFirstAutocompleteOption(); 
  }
}, 1000);

/* ============================================================
   🧭 LIVE CMS FILTER — Map Pan / Zoom Bound Sync (Final)
============================================================ */
/* ============================================================
   🧭 LIVE CMS FILTER — Map Pan / Zoom Bound Sync (with Empty State)
============================================================ */
function initLiveCMSFilterOnMapMove() {
  if (!map || !markers.length) {
    console.warn("⏳ Waiting for map and markers to be ready for live filter...");
    return setTimeout(initLiveCMSFilterOnMapMove, 800);
  }

  console.log("🧭 Live CMS filtering bound to map movement...");

  const emptyState = document.querySelector(".empty-state-7.w-dyn-empty");

  // === Helper: safely get map bounds ===
  function safeBounds() {
    const b = map.getBounds();
    if (!b) {
      console.warn("⚠️ Bounds not ready — skipping filter this frame");
      return null;
    }
    return b;
  }

  // === Core logic: show only CMS items within current view ===
  function filterCMSByVisibleMapArea() {
    const input = document.getElementById("searchmap");

    // 🚫 Skip when user currently has a radius search active
    if (input && input.value.trim() !== "") return;

    const bounds = safeBounds();
    if (!bounds) return;

    let visibleCount = 0;
    const cmsItems = document.querySelectorAll(".map-loc-item[data-lat][data-lng]");

    cmsItems.forEach((el) => {
      const lat = parseFloat(el.dataset.lat);
      const lng = parseFloat(el.dataset.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const pos = new google.maps.LatLng(lat, lng);
      const cmsWrapper = el.closest(".w-dyn-item") || el.closest("[role='listitem']");
      if (!cmsWrapper) return;

      if (bounds.contains(pos)) {
        cmsWrapper.style.display = "block";
        visibleCount++;
      } else {
        cmsWrapper.style.display = "none";
      }
    });

    // ✅ Show or hide empty state depending on visibility
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.style.display = "block";
      } else {
        emptyState.style.display = "none";
      }
    }

    console.log(`📍 Live map filter → ${visibleCount} CMS items in view`);
  }

  // === Event hook with safe debounce ===
  let moveTimer;
  map.addListener("idle", () => {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      filterCMSByVisibleMapArea();
    }, 400); // short delay ensures clusters finished drawing
  });

  console.log("✅ Live CMS map-bounds filtering initialized successfully");
}

// --- Activate once map & markers are fully initialized ---
const cmsMapFilterReady = setInterval(() => {
  if (mapFullyInitialized && map && markers.length > 0) {
    clearInterval(cmsMapFilterReady);
    initLiveCMSFilterOnMapMove();
  }
}, 800);

/* ============================================================
   🔁 Reset Filter Button Logic
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchmap");
  const resetBtn = document.getElementById("resetfilter");

  if (!input || !resetBtn) return;

  // --- Initialize hidden ---
  resetBtn.style.display = "none";

  // --- Show button when user types or selects a search ---
  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      resetBtn.style.display = "flex";
    } else {
      resetBtn.style.display = "none";
    }
  });

  // --- Click to reset everything ---
  resetBtn.addEventListener("click", () => {
    console.log("🔁 Reset button clicked — restoring default map and live filter");

    // 1️⃣ Clear input
    input.value = "";

    // 2️⃣ Hide reset icon
    resetBtn.style.display = "none";

    // 3️⃣ Reset map view + show all items
    resetRadiusFilter();

    // 4️⃣ Restart live CMS bound filtering
    if (typeof initLiveCMSFilterOnMapMove === "function") {
      initLiveCMSFilterOnMapMove();
    }
  });
});
