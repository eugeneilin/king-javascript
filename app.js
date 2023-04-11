// Elements
const productsGallery = document.querySelector('.products-gallery');
const cartBtn = document.querySelector('.cart-btn');
const cartOverlay = document.querySelector('.cart-overlay');
const cart = document.querySelector('.cart');
const closeCartBtn = document.querySelector('.fa-xmark');
const cartContent = document.querySelector('.cart-content');
const cartTotalItems = document.querySelector('.cart-total-items');
const total = document.querySelector('.total');
const clearCartBtn = document.querySelector('.clear-cart-btn');

// Real Time cart
let currentCart = [];

// All addBtns
let addBtnsDOM = [];

// Fetch products
async function getProducts() {
  try {
    let result = await fetch('products.json');
    let data = await result.json();
    let products = data.products;
    products = products.map((product) => {
      return product;
    });
    return products;
  } catch (err) {
    console.log(err);
  }
}

// Display products
class Display {
  displayProducts(products) {
    let result = '';
    products.forEach((product) => {
      result += `
        <article class="product">
          <div class="product-img" style="background: url('${product.image}') no-repeat center / cover;">
            <div class="product-overlay">
              <h3 class="product-name">${product.name}</h3>
              <button class="btn add-btn" data-id="${product.id}">
                <i class="fa-solid fa-cart-shopping"></i>
                Add to Cart
              </button>
            </div>
          </div>
          <p class="price">$${product.price}</p>
        </article>
      `;
    });
    productsGallery.innerHTML = result;
  }
  setAddBtnActions() {
    const addBtns = [...document.querySelectorAll('.add-btn')];
    addBtnsDOM = addBtns;
    addBtns.forEach((addBtn) => {
      let addBtnId = addBtn.dataset.id;
      let inCartItemId = currentCart.find((itemInCart) => itemInCart.id === addBtnId);
      if (inCartItemId) {
        addBtn.innerText = 'Added';
        addBtn.disabled = true;
        addBtn.classList.add('disabled');
      }
      // AddBtn Actions
      addBtn.addEventListener('click', (e) => {
        // Disable add button
        e.target.innerText = 'Added';
        e.target.disabled = true;
        addBtn.classList.add('disabled');

        // Get that particular product from storage
        let newCartItem = { ...Storage.getProductsFromStorage(addBtnId), amount: 1 };

        // Add newCartItem to currentCart
        currentCart = [...currentCart, newCartItem];
        console.log(currentCart);

        // Save currentCart to storage
        Storage.saveCurrentCartToStorage(currentCart);

        // Update totals
        this.setCartTotals(currentCart);

        // Display cart items
        this.displayCartItem(newCartItem);

        // Show cart
        this.showCart();
      });
    });
  }
  setCartTotals() {
    let cartTotalPrice = 0;
    let cartTotalItemsCalculation = 0;
    currentCart.map((cartItemToCalculate) => {
      cartTotalPrice += cartItemToCalculate.price * cartItemToCalculate.amount;
      cartTotalItemsCalculation += cartItemToCalculate.amount;
    });
    total.innerText = parseFloat(cartTotalPrice.toFixed(2));
    cartTotalItems.innerText = cartTotalItemsCalculation;
  }
  displayCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <div class="cart-item-img" style="background: url('${item.image}') no-repeat center / cover;
      "></div>
      <div class="cart-item-desc">
        <h3>${item.name}</h3>
        <h4>$${item.price}</h4>
        <i class="fa-solid fa-trash" data-id=${item.id}></i>
      </div>
      <div class="cart-item-quantity">
        <i class="fa-solid fa-angle-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fa-solid fa-angle-down" data-id=${item.id}></i>
      </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('showOverlay');
    cart.classList.add('showCart');
  }
  setupApp() {
    currentCart = Storage.getCart();
    console.log(currentCart);
    this.setCartTotals();
    this.populateCart();
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
    cartOverlay.addEventListener('click', (e) => {
      let click = cart.contains(e.target);
      if (!click) {
        this.hideCart();
      }
    });
  }
  populateCart() {
    currentCart.forEach((cartItem) => {
      this.displayCartItem(cartItem);
    });
  }
  hideCart() {
    cartOverlay.classList.remove('showOverlay');
    cart.classList.remove('showCart');
  }
  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    cartContent.addEventListener('click', (e) => {
      if (e.target.classList[1].includes('trash')) {
        let deleteBtn = e.target;
        let id = deleteBtn.dataset.id;
        cartContent.removeChild(deleteBtn.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList[1].includes('up')) {
        let upArrowBtn = e.target;
        let id = upArrowBtn.dataset.id;
        let quantity = currentCart.find((item) => item.id === id);
        quantity.amount++;
        Storage.saveCurrentCartToStorage(currentCart);
        this.setCartTotals(currentCart);
        upArrowBtn.nextElementSibling.innerText = quantity.amount;
      } else if (e.target.classList[1].includes('down')) {
        let downArrowBtn = e.target;
        let id = downArrowBtn.dataset.id;
        let quantity = currentCart.find((item) => item.id === id);
        quantity.amount--;
        if (quantity.amount > 0) {
          Storage.saveCurrentCartToStorage(currentCart);
          this.setCartTotals(currentCart);
          downArrowBtn.previousElementSibling.innerText = quantity.amount;
        } else {
          cartContent.removeChild(downArrowBtn.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItemIdToDelete = currentCart.map((item) => item.id);
    cartItemIdToDelete.forEach((id) => {
      this.removeItem(id);
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    console.log(currentCart);
    this.hideCart();
  }
  removeItem(id) {
    currentCart = currentCart.filter((item) => item.id !== id);
    this.setCartTotals(cart);
    Storage.saveCurrentCartToStorage(currentCart);
    let addBtnToReset = this.getSingleBtn(id);
    addBtnToReset.disabled = false;
    addBtnToReset.classList.remove('disabled');
    addBtnToReset.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>
    Add to Cart`;
  }
  getSingleBtn(id) {
    return addBtnsDOM.find((button) => button.dataset.id === id);
  }
}

// Local Storage
class Storage {
  static saveProductsToStorage(productsInStorage) {
    localStorage.setItem('products', JSON.stringify(productsInStorage));
  }
  static getProductsFromStorage(id) {
    let productsFromStorage = JSON.parse(localStorage.getItem('products'));
    return productsFromStorage.find((product) => product.id === id);
  }
  static saveCurrentCartToStorage(currentCart) {
    localStorage.setItem('cart', JSON.stringify(currentCart));
  }
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

// App setup
document.addEventListener('DOMContentLoaded', () => {
  const display = new Display();

  // Set up app
  display.setupApp();

  // Get Products
  getProducts()
    .then((products) => {
      display.displayProducts(products);
      Storage.saveProductsToStorage(products);
    })
    .then(() => {
      display.setAddBtnActions();
      display.cartLogic();
    });
});
