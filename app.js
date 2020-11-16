const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "wmz6bsjtgafd",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "ZERoHXEiu7NnsqJyKMfRjS0VHeBw6zLcW3RpOY7IM4M"
  });


//variables  
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsSuit = document.querySelector('.products-suits');


//cart
let cart = [];

let buttonsDOM = [];

//getting the products
class Products {
    async getProducts() {
        try {
            
            let contentful = await client.getEntries({
                content_type: 'zonacollectionsproducts'
            });
            
            

           // .then((response) => console.log(response.items))
           // .catch(console.error)

            //let result = await fetch("products.json");
            //let data = await result.json();

            let products = contentful.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image};
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }

}

//display products
class UI {
    displayProducts(products){
        let result = '';
       products.forEach(product => {
        result += `
        <!--product space-->
        <article class="product">
            <div class="img-container">
                <img src=${product.image} alt="product" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>UGX${product.price}</h4>
        </article>
        
        `
       });
       productsSuit.innerHTML = result;
    }

    getBagButtons(){
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
                button.addEventListener("click", (event) => {
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;
                    //get product from products
                    let cartItem = {...storage.getProduct(id), amount: 1 };
                    //add item to cart
                    cart = [...cart, cartItem];
                    //save cart in local storage
                    storage.saveCart(cart);
                    //set cart values
                    this.setCartValue (cart);
                    //display cart item
                    this.displayItem(cartItem)
                    //show the cart
                    this.showCart();
                });
            
        });
    }
    setCartValue(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    displayItem(item){
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
        <img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>UGX${item.price}k</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-plus" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-minus" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    setupAPP() {
        cart = storage.getCart();
        this.setCartValue(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart){
        cart.forEach(item => this.displayItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    cartLogic() {
        clearCartBtn.addEventListener("click",() => {
            this.clearCart();
        });

        cartContent.addEventListener('click', event=>{
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if (event.target.classList.contains('fa-plus')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item=> item.id === id);
                tempItem.amount = tempItem.amount + 1;
                storage.saveCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }else if (event.target.classList.contains('fa-minus')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    storage.saveCart(cart);
                    this.setCartValue(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    

    clearCart() {
       let cartItems = cart.map(item => item.id);
       cartItems.forEach(id => this.removeItem(id));
       while(cartContent.children.length > 0){
           cartContent.removeChild(cartContent.children[0]);
       }
       this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !==id);
        this.setCartValue(cart);
        storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

//local storage
class storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart(){
       return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();
    //setup app
    ui.setupAPP();
    //get all products
    products.getProducts().then(products =>{ 
        ui.displayProducts(products); 
        storage.saveProducts(products);
    }).then(() => {
     ui.getBagButtons();
     ui.cartLogic();
    });
});


