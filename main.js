var header;
var landingPage = document.querySelector('.landing-page');
var cityPage = document.querySelector('.city-page')
var results = document.querySelector('.results')
var searchTerm;

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
  searchTerm = document.getElementById('searchBar').value;
  searchQuery(searchTerm);
}

var city;

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
      cityPage.classList.remove('hidden');
      city = place.formatted_address;
      header.textContent = place.formatted_address;
      createImage(place.formatted_address);
      yelpQuery(['restaurants'])
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
  document.querySelector('.city-page-hero').style.backgroundImage = `url(${photo.results[0].urls.full})`
}

function photoFail(err) {
  console.log(err);
}

document.getElementById('restaurants').addEventListener('click', function() {
  yelpQuery(['restaurants']);
})
document.getElementById('toursAndTastings').addEventListener('click', function() {
  yelpQuery(['foodtours', 'winetastingroom', 'cheesetastingclasses'])
})
document.getElementById('cookingClasses').addEventListener('click', function() {
  yelpQuery(['cookingclasses']);
})

document.getElementById('closeModalButton').addEventListener('click', closeModal)

function closeModal() {
  document.querySelector('.modal-overlay').classList.add('hidden');
}

function yelpQuery(arr) {
  var categories = document.querySelector('.categories')
  for (var i = 0; i < categories.children.length; i++) {
    categories.children[i].classList.remove('active')
  }
  if (arr.indexOf('restaurants') > -1) {
    document.getElementById('restaurants').classList.add('active');
  } else if (arr.indexOf('foodtours') > -1) {
    document.getElementById('toursAndTastings').classList.add('active');
  } else if (arr.indexOf('cookingclasses') > -1) {
    document.getElementById('cookingClasses').classList.add('active');
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
  console.log(document.querySelector('.results-header'));
  console.log(null);
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
      popModal(el)
    })
    button.textContent = 'More Info'
    cardTextDiv.append(h3, button);
    var cardDiv = document.createElement('div')
    cardDiv.className = 'card'
    cardDiv.append(cardImageDiv, cardTextDiv);
    results.append(cardDiv);
  })
}

// Queries for modal
var modalImage = document.querySelector('.modal-image')
var businessName = document.getElementById('name')
var starsContainer = document.querySelector('.stars')
var price = document.getElementById('price')
var category = document.getElementById('category')
var address = document.querySelector('.address')

function popModal(data) {
  console.log(data)
  document.querySelector('.modal-overlay').classList.remove('hidden');
  modalImage.style.backgroundImage = `url("${data.image_url}")`;
  businessName.textContent = data.name;
  var fullStars = Math.floor(data.rating);
  console.log(fullStars)
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
  console.log(data.price)
  price.textContent = data.price;
  var categories = "";
  data.categories.forEach(el => {
    console.log(el.title);
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
  var likeButton = document.createElement('i');
  likeButton.className = "fas fa-heart fa-lg"
  document.querySelector('.likeButton').append(likeButton);
  likeButton.addEventListener('click', function() {
    addToLikes(data);
  });
}

function addToLikes() {
  console.log("Here's a like")
}

function filterModal() {
  console.log('hello')
}
