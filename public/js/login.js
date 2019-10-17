function login(){
  fetch('/auth/login/', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'miguelps2',
      password: 'xxx2',
    }),
  }).then(response => {
    console.log(response);
  });
}

function get() {
  fetch('/api/feed/', { credentials: 'include' }).then(response => {
    console.log(response);
  });
}
