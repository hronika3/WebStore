document.querySelector('.close-navigation').onclick = closeNavigation;
document.querySelector('.show-navigation').onclick = showNavigation;

function closeNavigation() {
    document.querySelector('.site-navigation').style.left = '-300px';
}

function showNavigation() {
    document.querySelector('.site-navigation').style.left = '0';
}

// AJAX
function getCategoryList() {
    fetch('/get-category-list', {
        method: 'POST'
    }).then(function (response) {
        return response.text();
    }).then(function (body) {
        showCategoryList(JSON.parse(body));
    })

}

function showCategoryList(data) {
    let out = '<ul class="category-list"><li><a href="/">Главная страница</a></li>';
    for (let i = 0; i < data.length; i++){
        out +=`<li><a href="/cat?id=${data[i]['id']}">${data[i]['category']}</a></li>`;
    }
    out +='</ul>';
    document.querySelector('#category-list').innerHTML = out;
}

getCategoryList();