export let cart = JSON.parse(localStorage.getItem('cart'));

if(!cart) {
  cart = [];
}

function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

const timeoutIds = {};
export function addToCart(productId) {

  const quantitySelectValue = document.querySelector(`.js-quantity-selector-${productId}`).value;

  const addedMessage = document.querySelector(`.js-added-to-cart-${productId}`);

  addedMessage.classList.add('added-to-cart-opacity');

  const previousTimeoutId = timeoutIds[productId];
  if (previousTimeoutId) {
    clearTimeout(previousTimeoutId);
  }

  const timeoutId = setTimeout(() => {
    addedMessage.classList.remove('added-to-cart-opacity');
  }, 2000);

  timeoutIds[productId] = timeoutId;

  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });
  
  if (matchingItem) {
    matchingItem.quantity += Number(quantitySelectValue);
  } else {
    cart.push({
      productId: productId,
      quantity: Number(quantitySelectValue),
      deliveryOptionId: '1'
    });
  }

  saveToStorage()
};

export function removeFromCart(productId) {
  const newCart = [];

  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  })

  cart = newCart;

  saveToStorage();
}

export function getCartQuantity() {
  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  })

  return cartQuantity;
}

export function updateQuantity(productId, newQuantity) {
  cart.forEach((cartItem) => {
    if (cartItem.productId === productId) {
      cartItem.quantity = newQuantity;
    }
  });
  
  saveToStorage();
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  matchingItem.deliveryOptionId = deliveryOptionId;

  saveToStorage();
}