// Api key for NPS api

var apiKey = "ybHBduA57s39icEEjF2qadz3AtlfLgn9sn6AjddB";

// Mapquest api used to initilize the map,
// 'Map' refers to a <div> element with the ID map

function loadMap(lat, lon) {
  L.mapquest.key = "0tfYPkeZd3BGwgIqYGALw5AGWEC1jlLf";
  var container = L.DomUtil.get("map");
  if (container != null) {
    container._leaflet_id = null;
  }
  var baseLayer = L.mapquest.tileLayer("map");
  var map = L.mapquest.map("map", {
    center: [lat, lon],
    layers: baseLayer,
    zoom: 10,
  });

  L.control
    .layers({
      Map: baseLayer,
      Hybrid: L.mapquest.tileLayer("hybrid"),
      Satellite: L.mapquest.tileLayer("satellite"),
      Light: L.mapquest.tileLayer("light"),
      Dark: L.mapquest.tileLayer("dark"),
    })
    .addTo(map);
}

// Function pickState calls the api,
// Contains a click event for park buttons generated in the api response,
// Saves park info to local storage

function pickState(state) {
  var queryURL =
    "https://developer.nps.gov/api/v1/parks?stateCode=" +
    state +
    "&api_key=" +
    apiKey;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    $("#state-list").empty();
    console.log(response);
    for (i = 0; i < response.data.length; i++) {
      statebutton = $("<button>");
      statebutton.attr("data-state", i);
      statebutton.attr("class", "park-list btn");
      statebutton.text(response.data[i].fullName);

      $("#state-list").append(statebutton);
    }

    // Funtion that generates park buttons that can be clicked,
    // Generate park description, page link, images, activities, directions, directions link,

    function loadstateInfo(stateInfo) {
      $("#state-activities").empty();
      $("#state-link").empty();
      $("#state-pics").empty();
      $("#directions").empty();
      $("#park-description").text(response.data[stateInfo].description);

      // Loads park images into a carousel,
      // Known issue that if a park has no pictures, previous park pictures display

      let statePics = response.data[stateInfo].images;
      // Initialize carousel
      var slider = $("#park-carousel");
      slider.carousel();

      // If images available
      if (statePics.length > 0) {
        $("#park-carousel").empty();
        // Remove placeholder img
        $("#pic1").remove();
        // Loop through available pics
        for (i = 0; i < statePics.length; i++) {
          // Add a new pic
          slider.append(
            '<a class="carousel-item" href="#' +
              i +
              '!"><img src="' +
              statePics[i].url +
              '"></a>'
          );
        }
      } else {
        $("#park-carousel").empty();
        $("#park-carousel").append(
          '<a class="carousel-item" href="#one!" id="pic1"><img src=""></a>',
          "<p>No available pictures for display, please visit Park page for more information.</p>"
        );
      }

      // Remove the 'initialized' class which prevents slider from initializing itself again when it's not needed
      if (slider.hasClass("initialized")) {
        slider.removeClass("initialized");
      }
      // Reinitialize the carousel
      slider.carousel();

      // State activity information generated
      // If no activities available notifies user to visit the park page for more information

      let stateActivities = response.data[stateInfo].activities;
      if (stateActivities.length == 0) {
        $("#state-activities").text(
          "No activities available for this park, please visit their page for more information."
        );
      } else if (stateActivities.length > 0) {
        for (i = 0; i < stateActivities.length; i++) {
          let activityButton =
            "<div class='col activity-list'>" +
            response.data[stateInfo].activities[i].name +
            "</div>";
          $("#state-activities").append(activityButton);
        }
      }

      // Park Link generated

      let parkLink = $("<a>");
      parkLink.attr("class", "btn");
      parkLink.attr("href", response.data[stateInfo].url);
      parkLink.text("Visit Park Page");
      $("#state-link").append(parkLink);

      // Conditional for directions, if there is none it redirects user to visit park page,
      // Else it loads directions, and a link to their directions page

      if (response.data[stateInfo].directionsInfo == false) {
        let dirText = $("<p>");
        dirText.text("Contact park for directions.");
        let dirLink = $("<a>");
        dirLink.attr("class", "btn");
        dirLink.attr("href", response.data[stateInfo].url);
        dirLink.text("Visit Park Page");
        $("#directions").append(dirText, dirLink);
      } else {
        let dirText = $("<p>");
        dirText.text(response.data[stateInfo].directionsInfo);
        let dirLink = $("<a>");
        dirLink.attr("class", "btn");
        dirLink.attr("href", response.data[stateInfo].directionsUrl);
        dirLink.text("Get Directions");
        $("#directions").append(dirText, dirLink);
      }
    }

    // Click event that captures the index of the park selected from the state,
    // Also captures latitude and longitude to be used with mapquest map,
    // Sets information into local storage so if page is refreshed last park visited is displayed,
    // If intial visit it will display a random park in the state of Florida

    $(document).on("click", ".park-list", function () {
      let stateInfo = $(this).attr("data-state");
      loadstateInfo(stateInfo);
      let lat = response.data[stateInfo].latitude;
      let lon = response.data[stateInfo].longitude;
      loadMap(lat, lon);

      let latlon = {
        lat: lat,
        lon: lon,
      };
      localStorage.setItem("savedLatLon", JSON.stringify(latlon));
      localStorage.setItem("saveStateInfo", JSON.stringify(stateInfo));
    });

    if (localStorage.getItem("saveStateInfo") !== null) {
      let newStateInfo = JSON.parse(localStorage.getItem("saveStateInfo"));
      let newLatLon = JSON.parse(localStorage.getItem("savedLatLon"));
      loadstateInfo(newStateInfo);
      loadMap(newLatLon.lat, newLatLon.lon);
    } else {
      let newStateInfo = [Math.floor(Math.random() * response.data.length)];
      let lat = response.data[newStateInfo].latitude;
      let lon = response.data[newStateInfo].longitude;
      loadstateInfo(newStateInfo);
      loadMap(lat, lon);
    }
  });
}

// Loads last state selected from local storage,
// If initial visit, displays the state of Florida park buttons

function loadsavedState() {
  if (localStorage.getItem("savedState") !== null) {
    let state = JSON.parse(localStorage.getItem("savedState"));
    pickState(state);
  } else {
    let state = "fl";
    pickState(state);
  }
}
loadsavedState();

// Materialize intialization

M.AutoInit();

// Modal initialization

$(document).ready(function () {
  $(".modal").modal();
});

// Change event that captures the selected state from the list on the modal,
// Saves the state selected into local storage

$("#state").on("change", function () {
  let state = $(this).val();

  pickState(state);
  localStorage.setItem("savedState", JSON.stringify(state));
});
