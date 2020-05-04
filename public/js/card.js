let cart = {};
document.querySelectorAll('.add-to-cart').forEach(function (element) {
   element.onclick = addToCart;
});

if (localStorage.getItem('cart')){
    cart = JSON.parse(localStorage.getItem('cart'));
    ajaxGetGoodsInfo();
}

function addToCart() {
    let goodsId = this.dataset.goods_id;
    if(cart[goodsId]){
        cart[goodsId]++;
    }
    else {
        cart[goodsId] = 1;
    }
    console.log(cart);
    ajaxGetGoodsInfo();
}

function ajaxGetGoodsInfo() {
    updateLocalStorageCart();
    fetch('/get-goods-info', {   // ссылка, куда посылаю запрос
        method: 'POST',
        body: JSON.stringify({key: Object.keys(cart)}),   //body- "запаковываем" данные в POST и отправляем на сервер
        headers: {      // header - уведомляет сервер, в каком формате прийдут данные
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        }
    }).then(function (response) {
        return response.text();
    }).then(function (body) {
        console.log(body);
        showCart(JSON.parse(body));
    })
}

function showCart(data) {
    let out = '<table class="table table-striped table-cart"><tbody>';
    let total = 0;
    for (let key in cart){
        out += `<tr><td colspan="4"><a class="finish-cart" href="/goods?id=${key}" >${data[key]["name"]}</a></tr>`;
        out += `<tr><td><i class="far fa-minus-square cart-minus" data-goods_id="${key}"</i></td>`;
        out += `<td>${cart[key]}</td>`;       // количество
        out += `<td><i class="far fa-plus-square cart-plus" data-goods_id="${key}"></i></td>`;
        out +=`<td>${formatPrice(data[key]['cost']*cart[key])} p </td></tr>`;   // стоимость
        total += data[key]['cost']*cart[key];
    }
    out += `<tr><td colspan="3">К оплате: </td><td>${formatPrice(total)} p </td></tr>`;
    out += '</tbody></table>';
    document.querySelector('#cart-navigation').innerHTML = out;   // нарисовал корзину
    document.querySelectorAll('.cart-minus').forEach(function (element) {
        element.onclick = cartMinus;
    });
    document.querySelectorAll('.cart-plus').forEach(function (element) {
        element.onclick = cartPlus;
    });
}

function cartPlus() {
    let goodsId = this.dataset.goods_id;
    cart[goodsId]++;
    ajaxGetGoodsInfo();
}

function cartMinus() {
    let goodsId = this.dataset.goods_id;
    if(cart[goodsId] - 1 > 0){
    cart[goodsId]--;
    }
    else{
        delete cart[goodsId];
    }
    ajaxGetGoodsInfo();
}

function updateLocalStorageCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function formatPrice(price) {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&');
}