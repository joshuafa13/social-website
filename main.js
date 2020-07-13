const randomUsers = document.querySelector('.random-users');
const data = [];
const favoriteData = [];
const INDEX_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users';
const search = document.querySelector('#search');
const searchInput = document.querySelector('#search-input');
const pagination = document.getElementById('pagination');
const ITEM_PER_PAGE = 20;
let paginationData = [];
let currentPage = 1;
const filterButtons = document.querySelector('.filter-buttons');
const gridView = 1;
const favoriteView = -1;
let currentView = 1;
const icons = document.querySelector('.icons');

// request API and print all user info
axios
  .get(INDEX_URL)
  .then((res) => {
    data.push(...res.data.results);
    console.log(data);
    getTotalPages(data);
    getPageData(currentPage, data);
  })
  .then((error) => console.log(error));

//function to write html user info
function getUserData(data) {
  if (currentView === gridView) {
    randomUsers.innerHTML = data
      .map((el, index) => {
        return `
				<div class='user-info'>
					<h5 class='name'>${el.name}</h5>
					<img class='avatar' data-toggle="modal" data-target="#exampleModal" data-id="${el.id}" src="${el.avatar}" alt="">
					<i class="fa fa-heart heart" data-id="${el.id}" aria-hidden="true"></i>
				</div>
			`;
      })
      .join('');
  } else if (currentView === favoriteView) {
    randomUsers.innerHTML = data
      .map((el, index) => {
        return `
				<div class='user-info'>
					<h5 class='name'>${el.name}</h5>
					<img class='avatar' data-toggle="modal" data-target="#exampleModal" data-id="${el.id}" src="${el.avatar}" alt="">
					<i class="fa fa-ban" style="color:red" data-id="${el.id}" aria-hidden="true"></i>
				</div>
			`;
      })
      .join('');
  }
}

// add Event Listener to .random-users, invoke showInfo to print corresponding user info in modal
randomUsers.addEventListener('click', (event) => {
  if (event.target.matches('.avatar')) {
    showInfo(event.target.dataset.id);
    // console.log(event.target)
  } else if (event.target.matches('.heart')) {
    console.log(event.target);
    event.target.classList.add('favoriteAdded');
    addFavoriteUser(event.target.dataset.id);
  } else if (event.target.matches('.fa-ban')) {
    removeFavoriteUser(event.target.dataset.id);
  }
});

//function for modal info
function showInfo(id) {
  //assign const name for html element by id name
  const modalTitle = document.querySelector('#show-name');
  const textInfo = document.querySelector('.text-information');
  const modalAvatar = document.querySelector('#show-avatar');
  //corresponding ueser url
  const url = `${INDEX_URL}/${id}`;
  //axios request
  modalTitle.innerText = '';
  textInfo.innerHTML = '';
  modalAvatar.src = '';
  axios
    .get(url)
    .then((res) => {
      console.log(res.data);
      //change modal html with the corresponding info
      modalTitle.innerText = `${res.data.name} ${res.data.surname}`;
      textInfo.innerHTML = `
			<p id="show-birthday">Birthday: ${res.data.birthday}</p>
			<p id="show-gender">Gender: ${res.data.gender}</p>
			<p id="show-email">Email: ${res.data.email}</p>
		`;
      modalAvatar.src = `${res.data.avatar}`;
    })
    .catch((error) => console.log(error));
}

//search監聽器
search.addEventListener('submit', (event) => {
  event.preventDefault();
  let results = [];
  const regex = new RegExp(searchInput.value, 'i');
  results = data.filter(
    (user) => user.name.match(regex) || user.surname.match(regex)
  );
  getTotalPages(results);
  currentPage = 1;
  getPageData(currentPage, results);
});

//根據資料總數, 每頁12個user輸出需要用到的頁數
function getTotalPages(data) {
  let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1;
  let pageItemContent = '';
  for (let i = 0; i < totalPages; i++) {
    pageItemContent += `
<li class="page-item">
<a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
</li>
`;
  }
  pagination.innerHTML = pageItemContent;
}

// 分頁按鈕加監聽器
pagination.addEventListener('click', (event) => {
  console.log(event.target.dataset.page);
  if (event.target.tagName === 'A') {
    //將點擊的頁面數據存到currentPage
    currentPage = event.target.dataset.page;
    getPageData(currentPage);
  }
});

//抓取對應頁數印出對應的電影函式
function getPageData(pageNum, data) {
  paginationData = data || paginationData;
  let offset = (pageNum - 1) * ITEM_PER_PAGE;
  let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE);
  getUserData(pageData);
}

//filter出男女函式
function filterUsers(filter) {
  let results = [];
  results = data.filter((user) => user.gender === filter);
  console.log(results);
  getTotalPages(results);
  currentPage = 1;
  getPageData(currentPage, results);
}

//男女和All按鈕監聽器
filterButtons.addEventListener('click', (event) => {
  if (event.target.matches('.male')) {
    currentView = gridView;
    filterUsers('male');
  } else if (event.target.matches('.female')) {
    currentView = gridView;
    filterUsers('female');
  } else if (event.target.matches('.all')) {
    currentView = gridView;
    getTotalPages(data);
    getPageData(currentPage, data);
  }
});
const list = JSON.parse(localStorage.getItem('favoriteUsers')) || [];
//增加最愛到local storage
function addFavoriteUser(id) {
  const user = data.find((item) => item.id === Number(id));

  if (list.some((item) => item.id === Number(id))) {
    alert(`${user.name} ${user.surname} is already in your favorite list.`);
  } else {
    list.push(user);
    alert(`${user.name} ${user.surname} added to your favorite!`);
  }
  localStorage.setItem('favoriteUsers', JSON.stringify(list));
}

function removeFavoriteUser(id) {
  const index = list.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    return;
  }
  list.splice(index, 1);
  localStorage.setItem('favoriteFriends', JSON.stringify(list));
  getTotalPages(list);
  getPageData(1, list);
}

//grid & favorite view增加監聽器
icons.addEventListener('click', (event) => {
  if (event.target.matches('#grid')) {
    console.log(event.target);
    currentView = gridView;
    getTotalPages(data);
    getPageData(currentPage, data);
  } else if (event.target.matches('#fav')) {
    console.log(event.target);
    currentView = favoriteView;
    getTotalPages(list);
    getPageData(1, list);
  }
});
