const form = document.getElementById("search");
const background = document.getElementById("backgroundImage");
let photoList = {};
let save = document.getElementById("savedPhotos");
let photoBox = document.getElementById("photoBox");
let photoLoad = document.getElementById("offScreenLoad");
let viewHeight = 0;
let viewWidth = 0;
let onTop = false;
date = checkorient();
let defaultURL = `https://api.unsplash.com/photos/random?client_id=tAgPS7M_28hnjiGBdDrP9yG21GPvbk5GWFDyP9zIGCk&orientation=${orient}&count=21`;
let PhotoURL = false;

function clear() {
  save.innerHTML = "";
}

function checkorient() {
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;
  if (
    (viewHeight / viewWidth >= 0.75 && viewHeight / viewWidth <= 1.25) ||
    (viewWidth / viewHeight >= 0.75 && viewWidth / viewHeight <= 1.25)
  ) {
    //if window size is almost square
    orient = `squarish`;
  } else if (viewHeight < viewWidth) {
    orient = `landscape`;
  } else {
    orient = `portrait`;
  }
}

async function getImages(url, isRandom) {
  const image_list = await fetch(url);
  let json = await image_list.json();
  checkorient();

  if (!isRandom) {
    json = json.results;
  }

  json.forEach(async function (img) {
    let photo = document.createElement(`img`);
    photo.src = `${img.urls.full}&w=${viewWidth}&h=${viewHeight}&auto=format&fit=crop`;
    photo.alt = img.alt_description;
    photoLoad.appendChild(photo.cloneNode());
    photo.tabIndex = 0;
    photo.src = `${img.urls.full}&w=${viewWidth / 5}&h=${
      viewHeight / 5
    }&auto=format&fit=crop`;
    if (onTop) {
      photoBox.insertBefore(photo, photoBox.firstChild);
    } else {
      photoBox.appendChild(photo);
    }
    photo.addEventListener("click", function (event) {
      background.src = `${img.urls.full}&w=${viewWidth}&h=${viewHeight}&auto=format&fit=crop`;
      //   document.body.style.backgroundImage = `url(${img.urls.full}&w=${viewWidth}&h=${viewHeight}&auto=format&fit=crop)`;
    });
  });
}
console.log(form);
form.addEventListener("submit", function (event) {
  event.preventDefault();
  input = event.target.submit.value;
  photoBox.innerHTML = "";
  searchImages(input);
});

// creates more images when the user has scrolled far enough
let timer = 0;
photoBox.addEventListener("scroll", function () {
  if (Date.now() - timer >= 1000) {
    onTop = false;
    timer = Date.now();
    if (
      1.3 * photoBox.scrollTop >=
      photoBox.scrollHeight - photoBox.offsetHeight
    ) {
      if (PhotoURL) {
        getImages(PhotoURL, false);
      } else {
        getImages(defaultURL, true);
      }
      if (photoBox.childElementCount > 50) {
        while (photoBox.childElementCount > 50) {
          photoBox.removeChild(photoBox.firstChild); //remove top 10 images
          photoLoad.removeChild(photoLoad.firstChild); //remove top 10 images
        }
      }
    } else if (0.7 * photoBox.scrollTop <= photoBox.offsetHeight) {
      onTop = true;
      if (PhotoURL) {
        getImages(PhotoURL, false);
      } else {
        getImages(defaultURL, true);
      }
      if (photoBox.childElementCount > 50) {
        while (photoBox.childElementCount > 50) {
          photoBox.removeChild(photoBox.lastChild); //remove top 10 images
          photoLoad.removeChild(photoLoad.lastChild); //remove top 10 images
        }
      }
    }
  }
});

function savePhoto() {
  let img = document.createElement("img");
  img.src = background.src;
  img.tabIndex = 0;
  img.addEventListener("click", function () {
    background.src = img.src;
  });
  save.appendChild(img);
}

function toggleSavedPhotos() {
  if (save.style.display == "none") {
    save.style.display = "flex";
  } else {
    save.style.display = "none";
  }
}

function searchImages(userInput) {
  PhotoURL = `https://api.unsplash.com/search/photos?query=${userInput}&client_id=tAgPS7M_28hnjiGBdDrP9yG21GPvbk5GWFDyP9zIGCk&count=25`;
  photoBox.innerHTML = "";
  getImages(PhotoURL, false);
}

function checkScreen() {
  let currentOrient = orient;
  checkorient();
  // if orient has changed and isn't the same as the photos orientation
  if (currentOrient != orient && orient != prevOrient) {
    document.getElementById(`orientWarning`).style.display = "block";
    prevOrient = currentOrient; //set variable to be used to see if user changes their screensize back to normal
  }
}

let prevOrient = false;
setInterval(function () {
  localStorage.setItem("savedPhotos", photoList);
  let currentOrient = orient;
  checkorient();
  // if orient has changed and isn't the same as the photos orientation
  if (currentOrient != orient && orient != prevOrient) {
    document.getElementById(`orientWarning`).style.display = "block";
    prevOrient = currentOrient; //set variable to be used to see if user changes their screensize back to normal
  }
}, 500);

getImages(defaultURL, true);
