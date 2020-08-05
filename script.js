var apiKey = "ybHBduA57s39icEEjF2qadz3AtlfLgn9sn6AjddB";

// 'Map' refers to a <div> element with the ID map.
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

    for (i = 0; i < response.data.length; i++) {
      statebutton = $("<button>");
      statebutton.attr("data-state", i);
      statebutton.attr("class", "park-list btn");
      statebutton.text(response.data[i].fullName);

      $("#state-list").append(statebutton);
    }

    // Loads park images to a carousel 
    // Also  loads activities, park buttons, park description, park link, directions, and directions link
    function loadstateInfo(stateInfo) {
      $("#state-activities").empty();
      $("#state-link").empty();
      $("#state-pics").empty();
      $("#directions").empty();

      $("#park-description").text(response.data[stateInfo].description);

      let statePics = response.data[stateInfo].images;
      
     // Initialize carousel
    var slider = $('#park-carousel');
    slider.carousel();
    // If images available	
    if (statePics.length > 1) {
      // Remove placeholder img
      $('#pic1').remove()
      // Loop through available pics
      if(statePics.length == 0){
        $("#park-carousel").text("No available pictures for this park, please visit their page for more info.")
      } else if (statePics.length > 0){
      for (i = 0; i < statePics.length; i++) {
      // Add a new pic
        slider.append('<a class="carousel-item" href="#' + i + '!"><img src="' + statePics[i].url + '"></a>');
      } 
    }
    }
    // Remove the 'initialized' class which prevents slider from initializing itself again when it's not needed
    if (slider.hasClass('initialized')){
      slider.removeClass('initialized')
    }
    // Reinitialize the carousel
    slider.carousel();

    // Code for activities, park buttons, park description, park link, directions, and directions link
    let stateActivities = response.data[stateInfo].activities;
    if (stateActivities.length == 0){
      $("#state-activities").text("No available activities for this park, please visit their page for more info.")
    } else if (stateActivities.length > 0){
    for (i = 0; i < stateActivities.length; i++) {

      let activityButton = "<div class='col activity-list'>" + response.data[stateInfo].activities[i].name + "</div>"
      $("#state-activities").append(activityButton);
      }
    }
      let parkLink = $("<a>");
      parkLink.attr("class", "btn");
      parkLink.attr("href", response.data[stateInfo].url);
      parkLink.text("Visit Park Page");
      $("#state-link").append(parkLink);

      let dirText = $("<p>");
      dirText.text(response.data[stateInfo].directionsInfo);
      let dirLink = $("<a>");
      dirLink.attr("class", "btn");
      dirLink.attr("href", response.data[stateInfo].directionsUrl);
      dirLink.text("Get Directions");

      $("#directions").append(dirText, dirLink);
    }

// Click event that generates the park information, and also uses local storage to load the last searched state & park
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
      
    }
  });
  }

// Local storage to load the state last chosen
function loadsavedState() {
  if (localStorage.getItem("savedState") !== null) {
    let state = JSON.parse(localStorage.getItem("savedState"));
    pickState(state);
  }
}
loadsavedState();

// Materialize initialization
M.AutoInit();

// Modal initialization
$(document).ready(function () {
  $(".modal").modal();
});

// Event listener on change, to capture the state info
$("#state").on("change", function () {
  let state = $(this).val();

  pickState(state);
  localStorage.setItem("savedState", JSON.stringify(state));
})
