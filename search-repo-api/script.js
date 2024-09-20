const inputField = document.querySelector('.input__field');
const resultWrapper = document.querySelector('.input__autocomplite');
const collectionWrapper = document.querySelector('.collection__list');
const emptyHint = collectionWrapper.querySelector('.collection__list-empty');

const debounce = (func, debounceTime) => {
  let timer = null;

  return function(...args) {
    if(timer){
      clearTimeout(timer)
    }
      
    timer = setTimeout(() => {
      clearTimeout(timer)
      timer = null;
      func.call(this,...args);
    },debounceTime);
  }
};

async function inputChange(event){
  const input = event.target;
  const value = input.value.trim();

  if(value.length) {
    try {
      let url = 'https://api.github.com/search/repositories?q=' + value;
      let response = await fetch(url);
      let parsedResponse = await response.json();
      
      let repositories = parsedResponse.items.slice(0,5);
      let repositoriesData = repositories.map(item => {
        return {
          name: item.name,
          owner: item.owner.login,
          stars: item.stargazers_count,
        }
      });
      
      clearAutocomplite();
      renderAutocomplite(repositoriesData);
    } catch(err){
      console.log(err)
    }
  }
}

function clearAutocomplite(){
  const autocompliteItems = document.querySelectorAll('.input__autocomplite-li');

  if(autocompliteItems){
    autocompliteItems.forEach(item => {
      item.remove();
    })
  }
};

function clearInput(){
  inputField.value = '';
};

function makeAutocompliteItem(repository){
  const item = document.createElement('li');
  const addBtn = document.createElement('button');

  addBtn.dataset.name = repository.name;
  addBtn.dataset.owner = repository.owner;
  addBtn.dataset.stars = repository.stars;

  addBtn.classList.add('input__autocomplite-btn');
  addBtn.innerText = repository.name;
  item.classList.add('input__autocomplite-li');
  item.appendChild(addBtn);

  addBtn.addEventListener('click',addRepository)

  return item
}

function makeRepoCard(repository){
  const item = document.createElement('li');
  const infoDiv = document.createElement('div');
  const cancelBtn = document.createElement('button');

  for (let key in repository){
    const pTag = document.createElement('p');
    pTag.classList.add('collection__info-text');
    pTag.innerText = `${key}: ${repository[key]}`;

    infoDiv.appendChild(pTag);
  }

  item.classList.add('collection__li');
  infoDiv.classList.add('collection__info');
  cancelBtn.classList.add('btn', 'btn--remove');
  cancelBtn.innerText ='Remove';

  cancelBtn.addEventListener('click',removeRepo);

  item.appendChild(infoDiv);
  item.appendChild(cancelBtn);

  return item
}

function renderAutocomplite(repos){
  if(inputField.value.trim().length){
    repos.forEach(repo => {
      let repoEl = makeAutocompliteItem(repo);
      
      resultWrapper.appendChild(repoEl);
    });
  }
}

function checkRepositoryList(){
  if(collectionWrapper.querySelector('.collection__li')){
    emptyHint.classList.add('hide')
  } else{
    emptyHint.classList.remove('hide')
  }
}

function addRepository(e){
  const addBtn = e.target;
  const repoData = {
    name: addBtn.dataset.name,
    owner: addBtn.dataset.owner,
    stars: addBtn.dataset.stars,
  }

  const card = makeRepoCard(repoData);

  collectionWrapper.appendChild(card);
  clearInput();
  clearAutocomplite();
  checkRepositoryList();
};

function removeRepo(e){
  const card = e.target.closest('.collection__li');

  card.remove();
  checkRepositoryList()
}

inputField.addEventListener('input',debounce(inputChange, 400))