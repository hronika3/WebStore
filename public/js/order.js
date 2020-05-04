document.querySelector('#bastion-order').onsubmit = function (event) {
  event.preventDefault();
  let username = document.querySelector('#username').value.trim();
  let phone = document.querySelector('#phone').value.trim();
  let email = document.querySelector('#email').value.trim();
  let address = document.querySelector('#address').value.trim();

  if(!document.querySelector('#rule').checked){
           // sweet alert
      Swal.fire({
          title: 'Ошибка',
          text: 'Необходимо принять соглашение',
          type: 'info',
          confirmButtonText: 'Ok'
      });
      return false;
  }

  if(username == '' || phone == '' || address == ''){
      Swal.fire({
          title: 'Ошибка',
          text: 'Неккоректно заполнено поле',
          type: 'info',
          confirmButtonText: 'Ok'
      });
      return false;
  }

  fetch('/finish-order',{
      method: 'POST',
      body: JSON.stringify({
          'username': username,
          'phone': phone,
          'email': email,
          'address': address,
          'key': JSON.parse(localStorage.getItem('cart'))
      }),
      headers: {      // header - уведомляет сервер, в каком формате прийдут данные
          'Accept' : 'application/json',
          'Content-Type' : 'application/json'
      }
  }).then(function (response) {
      return response.text();
  }).then(function (body) {
      if (body == 1){
          Swal.fire({
              title: 'Success',
              text: 'Заказ принят',
              type: 'Info',
              confirmButtonText: 'Ok'
          });
      }
      else{
          Swal.fire({
              title: 'Problem with mail',
              text: 'Error',
              type: 'Error',
              confirmButtonText: 'Ok'
          });
      }
  })
};
