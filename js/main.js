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
const modalBody = document.querySelector('.modal-body');
const modalPricetag = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('delivery');

const cart = [];

const loadCart = () => {
  if(localStorage.getItem(login)) {
    JSON.parse(localStorage.getItem(login)).forEach(function(item) {
      cart.push(item);
    });
  }
};

//or

// const loadCart = () => {
//   if(localStorage.getItem(login)) {
//       cart.push(...JSON.parse(localStorage.getItem(login)));
//   }
// };

const saveCart = () => localStorage.setItem(login, JSON.stringify(cart));
const getData = async (url) => {
  const response = await fetch(url);

  if(!response.ok) {
    throw new Error(`Ошибочка получилась по адресочку ${url} :( Статус ошибочки ${response.status}`);
  }
  return await response.json();
};

const valid = str => {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};

const toggleModal = () => modalCart.classList.toggle('is-open'); //changed modal to modalCart

const toggleModalAuth = () => {
  loginInput.style.borderColor = '';
  modalAuth.classList.toggle('is-open');
};

const returnMain = () => {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
};

const authorized = () => {
  const logOut = () => {
    login = null;
    cart.length = 0;
    localStorage.removeItem('delivery');
    localStorage.removeItem('cart');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  };
  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
  loadCart();
};

const notAuthorized = () => {  
  const logIn = event => {
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
  };
  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
};

const checkAuth = () => login ? authorized() : notAuthorized();

const createCardRestaurant = restaurant => {
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
};

const createCardGood = ({ description, id, image, name, price }) => {
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
        <button class="button button-primary button-add-cart" id="${id}">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price card-price-bold">${price} ₽</strong>
      </div>
    </div>`
  );  
  cardsMenu.insertAdjacentElement('beforeend', card);
};

const openGoods = event => {
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
};

const addToCart = event => {
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart');
  
  if(buttonAddToCart) {
    const card = target.closest('.card');  
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;
    const food = cart.find(item => item.id === id);
    food ? food.count += 1 : cart.push({id, title, cost, count: 1});
    // localStorage.setItem('cart', JSON.stringify(cart));
  }
  saveCart();
};

const renderCart = () => {
  modalBody.textContent = '';
  cart.forEach(({ id, title, cost, count }) => {
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id="${id}">-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id="${id}">+</button>
        </div>
      </div>
    `;
    modalBody.insertAdjacentHTML('afterbegin', itemCart);
  });
  const totalPrice = cart.reduce((result, item) => result + (parseFloat(item.cost) * item.count), 0);
  
  //full version

  // const totalPrice = cart.reduce(function(result, item) {
  //   return result + (parseFloat(item.cost) * item.count);
  // }, 0);
  modalPricetag.textContent = totalPrice + ' ₽';
};

const changeCount = event => {
  const target = event.target;

  if(target.classList.contains('counter-button')) {
    const food = cart.find(item => item.id === target.dataset.id);

    if(target.classList.contains('counter-minus')) {    
      food.count--;
      
      if(food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    } 
    
    if(target.classList.contains('counter-plus')) {
      food.count++;
    }
    renderCart();
  }
  saveCart();
};

function init() {
  getData('./db/partners.json').then(data => data.forEach(createCardRestaurant));
  
  cartButton.addEventListener('click', () => {
    renderCart();
    toggleModal();
  });

  buttonClearCart.addEventListener('click', () => {
    cart.length = 0;
    renderCart();
  });

  modalBody.addEventListener('click', changeCount);
  close.addEventListener('click', toggleModal);
  cardsRestaurants.addEventListener('click', openGoods);
  logo.addEventListener('click', returnMain);
  cardsMenu.addEventListener('click', addToCart);
  checkAuth();
  inputSearch.addEventListener('keydown', event => {
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
        .then(data => {
          const products = data.map(item => item.products);
        products.forEach(product => {
          getData(`./db/${product}`)
            .then(data => {
              goods.push(...data);
              const searchGoods = goods.filter(item => item.name.toLowerCase().includes(value));
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
            .then(data => data.forEach(createCardGood));
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