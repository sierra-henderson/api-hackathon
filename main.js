// $.ajax({
//   method: "GET",
//   url: 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=paris&inputtype=textquery&fields=name,photos,place_id&key=AIzaSyC9rR2OpfbMIvdGDuyVKeJO0dWX8xSmey0',
//   success: searchSuccess,
//   fail: searchFail
// })

var header;
var landingPage = document.querySelector('.landing-page');
var cityPage = document.querySelector('.city-page')


function searchQuery(query) {
  header = document.querySelector('.city-page-hero h1');
  var request = {
    query: query,
    fields: ['name', 'place_id']
  }
  var service = new google.maps.places.PlacesService(header);
  service.findPlaceFromQuery(request, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      searchSuccess(results[0].place_id);
    }
  })
}

document.getElementById('searchButton').addEventListener('click', recordQuery);

function recordQuery() {
  var searchTerm = document.getElementById('searchBar').value;
  searchQuery(searchTerm);
}

function searchSuccess(data) {
  var request = {
    placeId: data,
    fields: ['formatted_address']
  }
  var service = new google.maps.places.PlacesService(header);
  service.getDetails(request, callback)
  function callback(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      landingPage.classList.add('hidden');
      cityPage.classList.remove('hidden')
      header.textContent = place.formatted_address;
      createImage(place.formatted_address);
    }
  }
}


function searchFail(err) {
  console.log(err);
}

function idSuccess(details) {
  var h1 = document.querySelector('.city-page h1')
  h1.textContent = details.result.formatted_address;

}

function idFail(err) {
  console.log(err);
}

function createImage(place) {
  $.ajax({
    method: "GET",
    headers: {
      Authorization: "Client-ID wJINoYlAErEt2iN9vdlMlVRA0hQS4N4hSz0mYyt0SRA",
      'Accept-Version': 'v1'
    },
    url: `https://api.unsplash.com/search/photos?query=${place}&orientation=landscape&client_id=wJINoYlAErEt2iN9vdlMlVRA0hQS4N4hSz0mYyt0SRA`,
    success: photoSuccess,
    fail: photoFail
  })
}

function photoSuccess(photo) {
  document.querySelector('.city-page-hero').style.backgroundImage = `url(${photo.results[0].urls.full})`
}

function photoFail(err) {
  console.log(err);
}

document.getElementById('restaurants').addEventListener('click', function() {

})
document.getElementById('toursAndTastings').addEventListener('click', function() {

})
document.getElementById('cookingClasses').addEventListener('click', function() {

})
