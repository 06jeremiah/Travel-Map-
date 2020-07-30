var apiKey = "ybHBduA57s39icEEjF2qadz3AtlfLgn9sn6AjddB";
var queryURL =
  "https://developer.nps.gov/api/v1/parks?stateCode=fl&api_key=" + apiKey;


// 'Map' refers to a <div> element with the ID map
function loadMap(lat, lon){
L.mapquest.key = "0tfYPkeZd3BGwgIqYGALw5AGWEC1jlLf";
var container = L.DomUtil.get('map'); if(container != null){ container._leaflet_id = null; }
var baseLayer = L.mapquest.tileLayer("map");
var map = L.mapquest.map("map", {
  center: [lat, lon],
  layers: baseLayer,
  zoom: 12,
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

$.ajax({
  url: queryURL,
  method: "GET",
}).then(function (response) {
  console.log(response);

  for (i = 0; i < response.data.length; i++) {
    statebutton = $("<button>");
    statebutton.attr("data-state", i);
    statebutton.attr("class", "park-list btn");
    statebutton.text(response.data[i].fullName);

    $("#state-list").append(statebutton);
  }

  function loadstateInfo(stateInfo) {
    $("#state-activities").empty();
    $("#state-link").empty();
    $("#state-pics").empty();
    $("#directions").empty();

    $("#park-description").text(response.data[stateInfo].description);

    let statePics = response.data[stateInfo].images;
    for (i = 0; i < statePics.length; i++) {
      let carouselPic = $("<a>").attr("class", "carousel-item");
      let carouselImg = $("<img>").attr(
        "src",
        response.data[stateInfo].images[i].url
      );

      carouselPic.append(carouselImg);
      $("#state-pics").append(carouselPic);
    }
    let stateActivities = response.data[stateInfo].activities;
    console.log(response.data[stateInfo].activities);
    for (i = 0; i < stateActivities.length; i++) {
      let stateLi = $("<li>");
      stateLi.text(response.data[stateInfo].activities[i].name);

      $("#state-activities").append(stateLi);
    }

    let parkLink = $("<a>");
    parkLink.attr("class", "btn")
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

  $(document).on("click", ".park-list", function () {
    let stateInfo = $(this).attr("data-state");
    loadstateInfo(stateInfo);
    let lat = response.data[stateInfo].latitude;
    let lon = response.data[stateInfo].longitude;
    loadMap(lat, lon);
  });
});


M.AutoInit();

// $(document).ready(function(){
//   $('.carousel').carousel();
// });
