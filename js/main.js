'use strict';

const cartButton = document.querySelector("#cart-button");
const modalCart = document.querySelector(".modal-cart"); //changed modal to modalCart
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.getElementById('logInForm');
const loginInput = document.getElementById('login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const sectionHeading = document.querySelector('.menu__section-heading');
const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const minPrice = document.querySelector('.price');
const category = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');

let login = localStorage.getItem('delivery');

const getData = async function(url) {
  const response = await fetch(url);

  if(!response.ok) {
    throw new Error(`Ошибочка получилась по адресочку ${url} :( Статус ошибочки ${response.status}`);
  }
  return await response.json();
};

const valid = function(str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};

function toggleModal() {
  modalCart.classList.toggle('is-open'); //changed modal to modalCart
}

function toggleModalAuth() {
  loginInput.style.borderColor = '';
  modalAuth.classList.toggle('is-open');
}

function returnMain() {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
}

function authorized() {
  function logOut() {
    login = null;
    localStorage.removeItem('delivery');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  }
  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'block';
  buttonOut.addEventListener('click', logOut);
}

function notAuthorized() {  
  function logIn(event) {
    event.preventDefault();

    if(valid(loginInput.value.trim())) {
      login = loginInput.value;
      localStorage.setItem('delivery', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = 'tomato';
    }
  }
  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

function checkAuth() {
  if(login) {
    authorized();
  } else {
    notAuthorized();
  }
}

function createCardRestaurant(restaurant) {
  const { image, kitchen, name, price, products, stars, time_of_delivery: timeOfDelivery } = restaurant;
  const card = document.createElement('a');
  card.classList.add('card');
  card.classList.add('card-restaurant');
  card.products = products;
  card.info = [kitchen, name, price, stars];
  card.insertAdjacentHTML('beforeend', `
    <img src="${image}" alt="${name}" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery}</span>
      </div>
      <div class="card-info">
        <div class="rating">${stars}</div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
    </div>
  `);
  cardsRestaurants.insertAdjacentElement('beforeend', card);  
}

function renderHeading() {
  getData(`../db/partners.json`).then(function(data) {
    data.forEach(createCardGood);
  });
}

function createCardGood({ description, id, image, name, price }) {
  const card = document.createElement('div');
  card.className = 'card';
  card.insertAdjacentHTML('beforeend', `
    <img src="${image}" alt="${name}" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">${description}
        </div>
      </div>
      <div class="card-buttons">
        <button class="button button-primary button-add-cart">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price-bold">${price} ₽</strong>
      </div>
    </div>`
  );  
  cardsMenu.insertAdjacentElement('beforeend', card);
}

function openGoods(event) {
  const target = event.target;
  const restaurant = target.closest('.card-restaurant');

  if(restaurant) {
    if(login) {
      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');
      const [ kitchen, name, price, stars ] = restaurant.info;
      restaurantTitle.textContent = name;
      rating.textContent = stars; 
      minPrice.textContent = `От ${price} ₽`;
      category.textContent = kitchen; 
      getData(`./db/${restaurant.products}`).then(function(data) {
        data.forEach(createCardGood);
      });
    } else {
      toggleModalAuth();
    }  
  }
}

function init() {
  getData('./db/partners.json').then(function(data) {
    data.forEach(createCardRestaurant);
  });
  
  cartButton.addEventListener('click', toggleModal);
  close.addEventListener('click', toggleModal);
  cardsRestaurants.addEventListener('click', openGoods);
  logo.addEventListener('click', returnMain);
  checkAuth();
  inputSearch.addEventListener('keydown', function(event) {

    if(event.keyCode === 13) {
      const target = event.target;
      const value = target.value.toLowerCase().trim();
      target.value = '';

      if(!value || value.length < 3) {
        target.style.backgroundColor = 'tomato';
        setTimeout(function() {
          target.style.backgroundColor = '';
        }, 2000);
        return;
      }
      const goods = [];
      getData('./db/partners.json')
        .then(function(data) {
          const products = data.map(function(item) {
            return item.products;
          });
        products.forEach(function(product) {
          getData(`./db/${product}`)
            .then(function(data) {
              goods.push(...data);
              const searchGoods = goods.filter(function(item) {
                return item.name.toLowerCase().includes(value);
              });
              cardsMenu.textContent = '';
              containerPromo.classList.add('hide');
              restaurants.classList.add('hide');
              menu.classList.remove('hide');
              restaurantTitle.textContent = 'Результат поиска';
              rating.textContent = ''; 
              minPrice.textContent = '';
              category.textContent = ''; 
              return searchGoods;
            })
            .then(function(data) {
              data.forEach(createCardGood);
            });
        });
      });        
    }
  });

  new Swiper('.swiper-container', {
    loop: true,
    autoplay: true
  });
}

init();
