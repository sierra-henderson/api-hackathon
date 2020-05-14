var city;
var map;
var service;
var searchTerm;
var likesArr = []
var latlang;
var currentSelectedRestaurant = [];
var header = document.querySelector('.city-page-hero h1');
var landingPage = document.querySelector('.landing-page');
var cityPage = document.querySelector('.city-page')
var results = document.querySelector('.results')
var searchBar = document.getElementById('searchBar');
var searchButton = document.getElementById('searchButton');
var cityPageHero = document.querySelector('.city-page-hero');
var modalOverlay = document.querySelector('.modal-overlay');
var landingPageHero = document.querySelector('.hero');
var restaurantsButton = document.getElementById('restaurants');
var toursAndTastingsButton = document.getElementById('toursAndTastings');
var cookingClassesButton = document.getElementById('cookingClasses');
var likesBar = document.getElementById('likesBar');
var likesCityHeader = document.getElementById('likesCityHeader')
var categories = document.querySelector('.categories')
var cityPageHeader = document.querySelector('.city-page-hero h1');
var likesPage = document.querySelector('.likes-page');
var mapContainer = document.getElementById('map');
var likesList = document.querySelector('.likesList');
var backToCityButton = document.getElementById('backToCity');

// Queries for modal
var modalImage = document.querySelector('.modal-image')
var businessName = document.getElementById('name')
var starsContainer = document.querySelector('.stars')
var price = document.getElementById('price')
var category = document.getElementById('category')
var address = document.querySelector('.address')
var likeButton = document.getElementById('likeButton')
var closeModalButton = document.getElementById('closeModalButton')

searchButton.addEventListener('click', recordQuery);

restaurantsButton.addEventListener('click', function () {
  yelpQuery(['restaurants']);
})

toursAndTastingsButton.addEventListener('click', function () {
  yelpQuery(['foodtours', 'winetastingroom', 'cheesetastingclasses'])
})

cookingClassesButton.addEventListener('click', function () {
  yelpQuery(['cookingclasses']);
})

closeModalButton.addEventListener('click', closeModal)

likesBar.addEventListener('click', loadLikesPage);

likeButton.addEventListener('click', addToLikes);

backToCityButton.addEventListener('click', goBackToCityPage);

function searchQuery(query) {
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

function recordQuery() {
  searchTerm = searchBar.value;
  searchQuery(searchTerm);
}

function searchSuccess(data) {
  var request = {
    placeId: data,
    fields: ['formatted_address', 'geometry']
  }
  var service = new google.maps.places.PlacesService(header);
  service.getDetails(request, callback)
  function callback(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      city = place.formatted_address;
      $.ajax({
        method: 'GET',
        url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=${city}`,
        headers: {
          Authorization: 'Bearer st9BoGopP7a1xK-3J4PC9Wb22d1k5D-vQty1k2niJ_3QISDKtj-9MkhOAg6rk4NChhX2pMsdd9aZk7MaXBpguqKrRnYgFYDAGWNRMQlIQOag-LVi7E0xcgJ54rS5XnYx'
        },
        success: function() {
          landingPage.classList.add('hidden');
          cityPage.classList.remove('hidden');
          header.textContent = place.formatted_address;
          latlang = place.geometry;
          createImage(place.formatted_address);
          yelpQuery(['restaurants'])
        },
        error: function (err) {
          var div = document.createElement('div');
          div.className = 'error-modal'
          div.textContent = 'Sorry! This city is not supported by food.ie at this time.'
          landingPageHero.append(div);
        }
      })

    }
  }
}

function createImage(place) {
  $.ajax({
    method: "GET",
    headers: {
      Authorization: "Client-ID wJINoYlAErEt2iN9vdlMlVRA0hQS4N4hSz0mYyt0SRA",
      'Accept-Version': 'v1'
    },
    url: `https://api.unsplash.com/search/photos?query=${searchTerm}&orientation=landscape&client_id=wJINoYlAErEt2iN9vdlMlVRA0hQS4N4hSz0mYyt0SRA`,
    success: photoSuccess,
    fail: photoFail
  })
}

function photoSuccess(photo) {
  cityPageHero.style.backgroundImage = `url(${photo.results[0].urls.full})`
}

function photoFail(err) {
  console.log(err);
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

function yelpQuery(arr) {
  for (var i = 0; i < categories.children.length; i++) {
    categories.children[i].classList.remove('active')
  }
  if (arr.indexOf('restaurants') > -1) {
    restaurantsButton.classList.add('active');
  } else if (arr.indexOf('foodtours') > -1) {
    toursAndTastingsButton.classList.add('active');
  } else if (arr.indexOf('cookingclasses') > -1) {
    cookingClassesButton.classList.add('active');
  }
  var resultsChildren = results.children;
  while (resultsChildren.length > 0) {
    results.removeChild(resultsChildren[0]);
  }
  arr.forEach(category => {
    if (category === 'restaurants') {
      $.ajax({
        method: 'GET',
        url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=off the beaten path&categories=${category}&location=${city}`,
        headers: {
          Authorization: 'Bearer st9BoGopP7a1xK-3J4PC9Wb22d1k5D-vQty1k2niJ_3QISDKtj-9MkhOAg6rk4NChhX2pMsdd9aZk7MaXBpguqKrRnYgFYDAGWNRMQlIQOag-LVi7E0xcgJ54rS5XnYx'
        },
        success: function (result) {
          if (result.businesses.length > 0) {
            makeCards(category, result.businesses);
          }
        },
        error: function (err) {
          console.log("ErRoR:", err)
        }
      })
    } else {
      $.ajax({
        method: 'GET',
        url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?categories=${category}&location=${city}&limit=50`,
        headers: {
          Authorization: 'Bearer st9BoGopP7a1xK-3J4PC9Wb22d1k5D-vQty1k2niJ_3QISDKtj-9MkhOAg6rk4NChhX2pMsdd9aZk7MaXBpguqKrRnYgFYDAGWNRMQlIQOag-LVi7E0xcgJ54rS5XnYx'
        },
        success: function (result) {
          if (result.businesses.length > 0) {
            makeCards(category, result.businesses);
          }
        },
        error: function (err) {
          console.log("ErRoR:", err)
        }
      })
    }
  })
}

function makeCards(type, data) {
  var h2 = document.createElement('h2');
  var title = type;
  var titles = {
    foodtours: 'Food Tours',
    winetastingroom: 'Wine Tasting',
    cheesetastingclasses: 'Cheese Tasting',
    cookingclasses: 'Cooking Classes',
    restaurants: 'Restaurants'
  }
  if(titles[type]) {
    title = titles[type]
  }
  h2.textContent = title;
  var resultsHeader = document.createElement('div');
  resultsHeader.className = 'results-header'
  results.append(resultsHeader)
  resultsHeader.append(h2)
  if (title === 'Restaurants') {
    var filterButton = document.createElement('button');
    filterButton.textContent = 'Filter'
    resultsHeader.append(filterButton);
    filterButton.addEventListener('click', filterModal);
  }
  results.append(resultsHeader)
  data.forEach(el => {
    var cardImageDiv = document.createElement('div')
    cardImageDiv.className = 'card-image';
    cardImageDiv.style.backgroundImage = `url(${el.image_url})`
    var cardTextDiv = document.createElement('div')
    cardTextDiv.className = 'card-text'
    var h3 = document.createElement('h3')
    h3.textContent = el.name;
    var button = document.createElement('button')
    button.addEventListener('click', function() {
      popModal(el, title)
    })
    button.textContent = 'More Info'
    cardTextDiv.append(h3, button);
    var cardDiv = document.createElement('div')
    cardDiv.className = 'card'
    cardDiv.append(cardImageDiv, cardTextDiv);
    results.append(cardDiv);
  })
}

function popModal(data, title) {
  modalOverlay.classList.remove('hidden');
  modalImage.style.backgroundImage = `url("${data.image_url}")`;
  businessName.textContent = data.name;
  var fullStars = Math.floor(data.rating);
  if (starsContainer.children.length > 0) {
    while (starsContainer.children.length > 0) {
      starsContainer.removeChild(starsContainer.children[0]);
    }
  }
  for (var i = 0; i < fullStars; i++) {
    var star = document.createElement('i');
    star.className = 'fas fa-star'
    starsContainer.append(star);
  }
  if (data.rating - fullStars === 0.5) {
    var halfStar = document.createElement('i');
    halfStar.className = 'fas fa-star-half'
    starsContainer.append(halfStar);
  }
  price.textContent = data.price;
  var categories = "";
  data.categories.forEach(el => {
    categories += " " + el.title + ","
  })
  var newCategories = categories.replace(/,$/, "");
  category.textContent = newCategories
  if (address.children.length > 0) {
    while (address.children.length > 0) {
      address.removeChild(address.children[0]);
    }
  }
  data.location.display_address.forEach(line => {
    var p = document.createElement('p')
    p.textContent = line;
    address.append(p)
  })
  currentSelectedRestaurant = [data, title]
}

function addToLikes() {
  var data = currentSelectedRestaurant[0];
  var title = currentSelectedRestaurant[1];
  var fullAddress = data.location.display_address.join(" ");
  var likeObj = {
    address: fullAddress,
    name: data.name,
    rating: data.rating,
    price: data.price,
    categories: data.categories,
    mainCategory: title,
    image: data.image_url,
    coordinates: data.coordinates,
    city: cityPageHeader.textContent,
    north: (latlang.viewport.Ya.i + latlang.viewport.Ya.j) / 2,
    east: (latlang.viewport.Ua.i + latlang.viewport.Ua.j) / 2,
    id: data.id
  }
  if (!likesArr.some(el => data.id === el.id)) {
    likesArr.push(likeObj);
  }
}

function loadLikesPage() {
  likesCityHeader.textContent = likesArr[0].city;
  cityPage.classList.add('hidden');
  likesPage.classList.remove('hidden');
  if (likesList.children.length > 1) {
    while (likesList.children.length > 1) {
      likesList.removeChild(likesList.children[1]);
    }
  }
  likesArr.forEach(el => {
    var likesPhoto = document.createElement('div');
    likesPhoto.className = 'likes-photo';
    likesPhoto.style.backgroundImage = `url(${el.image})`;
    var firstRow = document.createElement('div');
    firstRow.className = 'row';
    var placeName = document.createElement('h3')
    placeName.textContent = el.name;
    var starDiv = document.createElement('div');
    starDiv.className = 'stars';
    var fullStars = Math.floor(el.rating);
    for (var i = 0; i < fullStars; i++) {
      var star = document.createElement('i');
      star.className = 'fas fa-star'
      starDiv.append(star);
    }
    if (el.rating - fullStars === 0.5) {
      var halfStar = document.createElement('i');
      halfStar.className = 'fas fa-star-half'
      starDiv.append(halfStar);
    }
    firstRow.append(placeName, starDiv)
    var secondRow = document.createElement('div');
    secondRow.className = 'row'
    var price = document.createElement('p');
    price.setAttribute("id", "likePrice");
    price.textContent = el.price;
    var categories = document.createElement('p');
    categories.setAttribute("id", "likeCategory");
    var categoryStr = "";
    el.categories.forEach(cat => {
      categoryStr += " " + cat.title + ","
    })
    var newCategoryStr = categoryStr.replace(/,$/, "");
    categories.textContent = newCategoryStr;
    secondRow.append(price, categories);
    var likesText = document.createElement('div');
    likesText.className = 'likes-text';
    likesText.append(firstRow, secondRow)
    var likeContainer = document.createElement('div');
    likeContainer.className = 'like-container';
    likeContainer.append(likesPhoto, likesText);
    likesList.append(likeContainer);
  })
  console.log(likesArr);
  initMap(likesArr)
}

function initMap(arr) {
  var place = new google.maps.LatLng(arr[0].north, arr[0].east);

  map = new google.maps.Map(
    mapContainer, { center: place, zoom: 15 });

  arr.forEach(el => {
    var request = {
      query: el.address,
      fields: ['name', 'geometry'],
    };
    var infowindow = new google.maps.InfoWindow({
      content: el.name
    });
    var service = new google.maps.places.PlacesService(map);

    service.findPlaceFromQuery(request, function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
          createMarker(results[0], infowindow);
        map.setCenter(results[0].geometry.location);
      }
    });
  })
}

// function initMap() {
//   var sydney = new google.maps.LatLng(-33.867, 151.195);

//   infowindow = new google.maps.InfoWindow();

//   map = new google.maps.Map(
//     mapContainer, { center: sydney, zoom: 15 });

//   var request = {
//     query: 'Museum of Contemporary Art Australia',
//     fields: ['name', 'geometry'],
//   };

//   var service = new google.maps.places.PlacesService(map);

//   service.findPlaceFromQuery(request, function (results, status) {
//     if (status === google.maps.places.PlacesServiceStatus.OK) {
//       for (var i = 0; i < results.length; i++) {
//         createMarker(results[i]);
//       }
//       map.setCenter(results[0].geometry.location);
//     }
//   });
// }

function createMarker(place, infowindow) {
  var marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map
  });
  marker.addListener('click', function () {
    infowindow.open(map, marker);
  });
}

function goBackToCityPage() {
  likesPage.classList.add('hidden');
  cityPage.classList.remove('hidden');
}



function filterModal() {
  console.log('hello')
}
