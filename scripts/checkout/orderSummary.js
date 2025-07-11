import { cart, removeFromCart, getCartQuantity, updateQuantity, updateDeliveryOption } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { formatCurrency } from "../utils/money.js";
import { deliveryOptions, getDeliveryOption } from "../../data/deliveryOptions.js"
import { renderPaymetSummary } from "./paymentSummary.js"; 

import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js"


function formatDate(days) {
  const today = dayjs();
  const deliveryDate = today.add(days, 'days');
  return deliveryDate.format('dddd, MMMM D');
}


export function renderOrderSummary() {

  let cartSummaryHTML = '';
  updateCartQuantity();

  if (cart.length == 0){
      cartSummaryHTML = `
      <div data-testid="empty-cart-message">
        Your cart is empty.
      </div>
      <a class="button-primary view-products-link" href="../amazon.html" data-testid="view-products-link">
        View products
      </a>
      `;
    }
  cart.forEach((cartItem) => {

    const productId = cartItem.productId;

    const matchingProduct = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;

    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const dateString = formatDate(deliveryOption.deliveryDays);

    cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image"
          src="${matchingProduct.image}">

        <div class="cart-item-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            $${formatCurrency(matchingProduct.priceCents)}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
            </span>
            <input type="number" min="0" max="99" class="quantity-input js-quantity-input-${matchingProduct.id}" data-product-id="${matchingProduct.id}">
            <span class="save-quantity-link link-primary js-save-quantity-link" data-product-id="${matchingProduct.id}">
            Save
            </span>
            <span class="update-quantity-link link-primary js-update-quantity-link" data-product-id="${matchingProduct.id}">
              Update
            </span>
            <span class="delete-quantity-link link-primary js-delete-quantity-link" data-product-id="${matchingProduct.id}">
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryOptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    </div>
    `;
  });

  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = ``;

    deliveryOptions.forEach((deliveryOption) => {

      const dateString = formatDate(deliveryOption.deliveryDays);
      const priceString = deliveryOption.priceCents === 0 
      ? 'FREE'
      : `$${formatCurrency(deliveryOption.priceCents)} -`;

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

    html += `    
    <div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}" data-delivery-option-id="${deliveryOption.id}">
      <input type="radio" ${isChecked ? 'checked' : ''}
        class="delivery-option-input"
        name="delivery-option-${matchingProduct.id}">
      <div>
        <div class="delivery-option-date">
          ${dateString}
        </div>
        <div class="delivery-option-price">
          ${priceString} Shipping
        </div>
      </div>
    </div>`
    });

    return html;
  }

 
  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

  document.querySelectorAll('.js-delete-quantity-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);

      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      
      container.remove();
      updateCartQuantity();
      renderOrderSummary();
    });
  });

  function updateCartQuantity() {
    document.querySelector('.js-cart-quantity').innerHTML = `${getCartQuantity()} items`;
  }

  document.querySelectorAll('.js-update-quantity-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      
      document.querySelector(`.js-cart-item-container-${productId}`).classList.add('is-editing-quantity');

      document.querySelector(`.js-quantity-input-${productId}`).value = document.querySelector(`.js-quantity-label-${productId}`).innerHTML;
      
    });
  });

  document.querySelectorAll('.js-save-quantity-link').forEach((link) => {
    const productId = link.dataset.productId;
    link.addEventListener('click', () => {
      handleUpdateQuantity(productId);  
    });

  });

  document.querySelectorAll('.quantity-input').forEach((input) => {
    const productId = input.dataset.productId;

    input.addEventListener('keydown', (event)=> {
      console.log(event);
      if (event.key === 'Enter') {
        handleUpdateQuantity(productId);
      }
    });

  });

  function handleUpdateQuantity(productId){
      document.querySelector(`.js-cart-item-container-${productId}`).classList.remove('is-editing-quantity');

      const inputQuantityValue = Number(document.querySelector(`.js-quantity-input-${productId}`).value);

      if (inputQuantityValue < 0 || inputQuantityValue > 100) {
        alert('Quantity must be at least 0 and less than 99');
        return;
      }

      updateQuantity(productId,inputQuantityValue);
      
      updateCartQuantity();

      document.querySelector(`.js-quantity-label-${productId}`).innerHTML = inputQuantityValue;

      renderOrderSummary();
    };

  document.querySelectorAll('.js-delivery-option').forEach((element) => {
    element.addEventListener('click', () => {
      const {productId, deliveryOptionId} = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
    })
  });

  renderPaymetSummary();
}

