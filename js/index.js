// Hello.
//
// This is JSHint, a tool that helps to detect errors and potential
// problems in your JavaScript code.
//
// To start, simply enter some JavaScript anywhere on this page. Your
// report will appear on the right side.
//
// Additionally, you can toggle specific options in the Configure
// menu.

const config = {
  apiKey: "AIzaSyBMPeMEVfDAzgSTaZ9SkkyuEg0XsuoZ8us",
  authDomain: "trello-8ef4e.firebaseapp.com",
  databaseURL: "https://trello-8ef4e.firebaseio.com",
  projectId: "trello-8ef4e",
  storageBucket: "gs://trello-8ef4e.appspot.com/",
  messagingSenderId: "990307772876"
};

Vue.use(Vuefire.default);
var firebaseApp = firebase.initializeApp(config);
var db = firebaseApp.firestore();
var storage = firebase.storage();
var imageRef = storage.ref();

var app = new Vue({
  el: '#app',
  data() {
    return {
      projects: [],
      lists: [],
      cards: [],
      users: [],
      getCardsN: [],
      categories: [],
      dragging: false,
      labels: [{name:'important', color: 'red'}, {name: 'todo', color: 'blue'},
               {name: 'discussion', color: 'green'}, {name: 'interesting', color: 'yellow'},
               {name: 'enhancement', color: 'pink'}],
      page: 'home',
      viewProject: null,
      selectedList: null,
      selectedCard: null,
      loggedIn: false,
      currentUser: null,
      imageUploaded: false,
      imagePath: '',
    };
  },
  firestore: {
    users: db.collection('users'),
    projects: db.collection('projects'),
    lists: db.collection('lists'),
    cards: db.collection('cards'),
    categories: db.collection('categories'),
  },
  computed: {
    getLists() {
      let lists = [];
      if (this.projects[this.viewProject].lists.length !== 0) {
      lists = this.lists.reduce((res, list) => {
        this.projects[this.viewProject].lists.forEach((id) => {
          if (id == list.id) {
            res.push(list);
          }
        });
        return res;
      }, []);
    }
      return lists;
    },
    getCards() {
      let cards = [];
      cards = this.lists.reduce((res, list) => {
        this.projects[this.viewProject].lists.forEach((id) => {
          if (id == list.id) {
            list.cards.forEach(cardId => {
              this.cards.forEach(card => {
                if (card.id == cardId) {
                  res.push(card);
                }
              });
            });
          }
        });
        return res;
      }, []);
      this.getCardsN = cards;
      return cards;
    },
    currentCard() {
      let cards = [];
      if (this.selectedCard !== null) {
        cards = this.getCards[this.selectedCard];
      }
      return cards;
    },
    getCardCategories() {
      let cards = this.getCards;
      let categories = cards.reduce((cats, card) => {
        card.categories.forEach(category => {
            this.categories.forEach(c => {
              if (c.name == category) {
                cats.push(c);
              }
            });
        });
        return cats;
      }, []);
      // remove duplicates
      let res = [...new Set(categories)];
      return res;
    }
  },
  methods: {
    draggableMove: function(event) {
      // test draggable interaction
      console.log('move', event.target);
    },
    // switch view to project based on index
    viewUsersTab: function(event) {
      // change page state
      this.page='users';
      let user = $('.ui.menu a.item')['1'];
      // toggle navbar active status
      event ?
      $(event.target)
        .addClass('active')
        .siblings()
        .removeClass('active') :
      $(user)
        .addClass('active')
        .siblings()
        .removeClass('active');
    },
    viewProjectsTab: function(event) {
      // change page state
      this.page = 'home';
      let home = $('.ui.menu a.item')['0'];
      // toggle navbar active status
      event ?
      $(event.target)
        .addClass('active')
        .siblings()
        .removeClass('active') :
      $(home)
        .addClass('active')
        .siblings()
        .removeClass('active');
    },
    viewproject: function(event) {
      // get project index
      let index = $(event.target).parents('.segment')[0].getAttribute('value');
      this.page = 'project';
      this.viewProject = index;
      setTimeout(() => $('.list-menu').dropdown(), 500); // window doesnt load semantic js because of vue observer interfering
    },
    createUser: async function(event) {
      event.preventDefault();
      console.log('create user');
      let username = $('input[name=username]')[0].value;
      let email = $('input[name=email]')[0].value;
      let user = {};
      this.users.map(user => user.email).includes(email) ? alert('This user already exists, pick another username and email.') : null;
      if (username) user.username = username;
      if (email) user.email = email;
      let file = $('input[name=pic]')[0].files[0];
      // upload image to storageBucket
      if (file) {
        await imageRef.child(file.name).put(file).then(function(snapshot) {
          user.image = snapshot.downloadURL;
          // save user to firestore
          app.$firestoreRefs.users.add(user);

        });
        // log user in
        app.currentUser = user;
        app.loggedIn = true;
        // redirect to home
        app.viewProjectsTab();
      } else {
        // save user to firestore
        await app.$firestoreRefs.users.add(user);
        // log user in
        app.currentUser = user;
        app.loggedIn = true;
        // redirect to home
        app.viewProjectsTab();
      }
    },
    updateUser: async function(event) {
      event.preventDefault();
      if (this.loggedIn) {
        // get user info
        let username = $('input[name=edit-username]')[0].value;
        let email = $('input[name=edit-email]')[0].value;
        let user = {...this.currentUser};
        let id = this.users.filter(u => u.username == user.username)[0].id;
        if (username) user.username = username;
        if (email) user.email = email;
        let file = $('input[name=edit-pic]')[0].files[0];
        // upload image to storageBucket
        if (file) {
          await imageRef.child(file.name).put(file).then(function(snapshot) {
            user.image = snapshot.downloadURL;
            // update current user
            app.currentUser = user;
            app.$firestoreRefs.users.doc(id).update(user);
          });
        } else {
          // update current user
          this.currentUser = user;
          this.$firestoreRefs.users.doc(id).update(user);
        }
      }
    },
    login: function(event) {
      event.preventDefault();
      // get user email
      let email = $('input[name=login-email]')[0].value;
      // check if email exists
      if (this.users.map(user => user.email).includes(email)) {
        this.loggedIn = true
        this.currentUser = this.users.filter(user => user.email == email)[0];
        this.viewProjectsTab()
      } else {
        alert('Wrong email. Please enter the right email or create a new user')
      }
    },
    logout: function(event) {
      // redirect to home
      this.viewProjectsTab();
      // log user out from state
      this.loggedIn = false;
    },
    addProject: function(event) {
      event.preventDefault();
      // show modal
      $('.add-project-modal').modal('show');
    },
    editProject: function(event) {
      event.preventDefault();
      // get project index
      let index =  $(event.target).parents('.segment')[0].getAttribute('value');
      this.viewProject = index
      let currentProject = this.projects[this.viewProject]
      // populate current data into input fields
      $('input[name=edit-name]')[0].value = currentProject.name;
      $('textarea[name=edit-description]')[0].value = currentProject.description;
      $('select[name=edit-color]')[0].value = currentProject.color;
      $('input[name=starred]')[0].checked = currentProject.starred ? 'checked' : '';
      $('input[name=closed]')[0].checked = currentProject.closed ? 'checked' : '';
      $('.edit-project-modal').modal('show');
    },
    updateProject: function(event) {
      event.preventDefault();
      // hide modal
      $('#edit-project-modal').modal('hide');
      // get project info
      let name = $('input[name=edit-name]')[0].value
      let description = $('textarea[name=edit-description]')[0].value;
      let color = $('select[name=edit-color]')[0].value;
      let starred = $('input[name=starred]')[0].checked;
      let closed = $('input[name=closed]')[0].checked;
      // get current date
      const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
      let lists = this.getLists
      let currentDate = new Date();
      let date = currentDate.getDate();
      let month = currentDate.getMonth();
      let year = currentDate.getFullYear();
      let dateString =  MONTH_NAMES[month] + " " + date + ", " + year;

      let newProject = {...this.projects[this.viewProject]}
      // populate
      if (name) newProject.name = name
      if (description) newProject.description = description
      if (color) newProject.color = color
      starred ? newProject.starred = true : newProject.starred = false
      closed ? newProject.closed = true : newProject.closed = false
      newProject.lastUpdated = dateString
      // update project
      if (event.target.innerHTML === 'Update') {
        this.$firestoreRefs.projects.doc(this.projects[this.viewProject].id).update(newProject)
      }
    },
    deleteProject: function(event) {
      event.preventDefault();
      // get project id
      let index = $(event.target).parents('.segment')[0].getAttribute('value');
      // remove project from array
      this.$firestoreRefs.projects.doc(this.projects[index].id).delete()
    },
    closeProject: function(event) {
      event.preventDefault();
      // hide modal
      $('#add-project-modal').modal('hide');
      // get project info
      let color = $('select[name=color]')[0].value;
      let name = $('input[name=name]')[0].value;
      let description = $('textarea[name=description]')[0].value;
      // get current date
      let currentDate = new Date();
      let date = currentDate.getDate();
      let month = currentDate.getMonth();
      let year = currentDate.getFullYear();
      let dateString = date + "-" +(month + 1) + "-" + year;
      // add new project
      if (event.target.innerHTML === 'Add') {
        this.$firestoreRefs.projects.add({
          name: name,
          description: description,
          createdBy: 'Jack',
          createdAt: currentDate.getTime(),
          lastUpdated: dateString,
          color: color,
          categories: [],
          lists: [],
          starred: false,
          closed: false,
          status: 'open'})
      }
    },
    addList: function(event) {
      event.preventDefault();
      // hide modal
      $('#add-list-modal').modal('show');
    },
    closeList: function(event) {
      event.preventDefault();
      // hide modal
      $('#add-list-modal').modal('hide');
      // get list info
      let name = $('input[name=list-name]')[0].value;
      // get current date
      let currentDate = new Date();
      let date = currentDate.getDate();
      let month = currentDate.getMonth();
      let year = currentDate.getFullYear();
      let dateString = date + "-" +(month + 1) + "-" + year;
      // add new list
      if (event.target.innerHTML === 'Add') {
        this.$firestoreRefs.lists.add({
           name: name,
           createdBy: 'Jack',
           createdAt: currentDate.getTime(),
           hide: false,
           cards: [],
           status: 'open'}).then((docRef) => {
             this.$firestoreRefs.projects.doc(this.projects[this.viewProject].id).update({
               lists: [...this.projects[this.viewProject].lists, docRef.id]
             })
           })
           setTimeout(() => $('.list-menu').dropdown(), 500) // window doesnt load semantic js...
      }
    },
    editList: function(event) {
      event.preventDefault();
      // get list index
      let index = $(event.target).parents('.column')[0].getAttribute('value');
      this.selectedList = index
      let lists = this.getLists
      let currentList = lists[this.selectedList]
      // populate current data into input fields
      $('input[name=edit-list-name]')[0].value = currentList.name;
      // console.log(index)
      $('#edit-list-modal').modal('show');
    },
    updateList: function(event) {
      event.preventDefault();
      // hide modal
      $('#edit-list-modal').modal('hide');
      // get list info
      let name = $('input[name=edit-list-name]')[0].value;
      // get current date
      const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
      let lists = this.getLists
      let currentDate = new Date();
      let date = currentDate.getDate();
      let month = currentDate.getMonth();
      let year = currentDate.getFullYear();
      let dateString =  MONTH_NAMES[month] + " " + date + ", " + year;
      // clone old list
      let newList = {...lists[this.selectedList]}
      // populate new info
      if (name) newList.name = name
      newList.updatedAt = dateString
      // update list
      if (event.target.innerHTML === 'Update') {
        this.$firestoreRefs.lists.doc(lists[this.selectedList].id).update(newList)
      }
    },
    deleteList: function(event) {
      event.preventDefault();
      // get list index
      let index = $(event.target).parents('.column')[0].getAttribute('value');
      this.selectedList = index
      let lists = this.getLists
      // remove from lists
      this.$firestoreRefs.lists.doc(lists[this.selectedList].id).delete()
      // remove id from projects
      this.$firestoreRefs.projects.doc(this.projects[this.viewProject].id).update({
        lists: this.projects[this.viewProject].lists.filter(id => id != lists[this.selectedList].id)
      })
    },
    toggleList: function(event) {
      event.preventDefault();
      // get list index
      let index = $(event.target).parents('.column')[0].getAttribute('value');
      this.selectedList = index
      // toggle true / false
      let lists = this.getLists
      let state = lists[this.selectedList].hide
      lists[this.selectedList].hide = !state
    },
    addCard: function(event) {
      event.preventDefault();
      // get list index
      let index = $(event.target).parents('.column')[0].getAttribute('value');
      // set list index to state
      this.selectedList = index
      // open card modal
      $('#add-card-modal').modal('show');
      // set calendar
      $('#calendar-add').calendar({type: 'date'});
    },
    closeCard: async function(event) {
      event.preventDefault();
      // hide modal
      $('#add-card-modal').modal('hide');
      // get card info
      let name = $('input[name=card-name]')[0].value;
      let description = $('textarea[name=card-description]')[0].value;
      let deadline = $('input[name=card-deadline]')[0].value;
      let content = $('textarea[name=card-content]')[0].value;
      let categories = []
      $('#add-category').children('.label').map(function() {
        return categories.push($(this).data('value'))
      })
      let newCategoryName = $('input[name=new-category-name]')[0].value;
      let newCategoryColor = $('select[name=new-category-color]')[0].value;
      // add new category to categories
      if (newCategoryName) categories.push(newCategoryName)
      // get current date
      const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
      let currentDate = new Date();
      let date = currentDate.getDate();
      let month = currentDate.getMonth();
      let year = currentDate.getFullYear();
      let dateString =  MONTH_NAMES[month] + " " + date + ", " + year;
      // populate info into card
      let card = {
           name: name,
           description: description,
           content: content,
           created_by: 'Jack',
           categories: categories,
           images: [],
           assigned: [],
           deadline: deadline,
           createdAt: dateString,
           status: 'open'
          }
      // add new card
      if (event.target.innerHTML === 'Add') {
        let lists = this.getLists
        // console.log(`adding card to ${lists[this.selectedList].name}`)
        await this.$firestoreRefs.cards.add(card).then(async (docRef) => {
             await this.$firestoreRefs.lists.doc(lists[this.selectedList].id).update({
               cards: [...lists[this.selectedList].cards, docRef.id]
             })
             // add new category
             if (newCategoryName && newCategoryColor) await this.$firestoreRefs.categories.add({name: newCategoryName, color: newCategoryColor})
           })
      }
      // clear form fields
      $('form').form('clear')
    },
    deleteCard: function(event) {
      event.preventDefault();
      // get list index
      let listIndex = $(event.target).parents('.column')[0].getAttribute('value');
      this.selectedList = listIndex
      // get card index
      let index = $(event.target).parents('.card')[0].getAttribute('value');
      this.selectedCard = index
      // get cards / lists belonging to project
      let cards = this.getCards
      let lists = this.getLists
      // remove card
      this.$firestoreRefs.cards.doc(cards[this.selectedCard].id).delete()
      // remove id from lists
      this.$firestoreRefs.lists.doc(lists[this.selectedList].id).update({
        lists: lists[this.selectedList].cards.filter(id => id != cards[this.selectedCard].id)
      })
    },
    editCard: function(event) {
      event.preventDefault();
      // get list index
      let index = $(event.target).parents('.column')[0].getAttribute('value');
      this.selectedList = index
      // get card index
      this.selectedCard = $(event.target).parents('.card')[0].getAttribute('value');
      let cards = this.getCards
      let lists = this.getLists
      let currentCard = cards[this.selectedCard]
      // populate current data into input fields
      $('input[name=edit-card-name]')[0].value = currentCard.name;
      $('textarea[name=edit-card-description]')[0].value = currentCard.description;
      $('input[name=edit-card-deadline]')[0].value = currentCard.deadline;
      $('textarea[name=edit-card-content]')[0].value = currentCard.content;
      // show modal
      $('#edit-card-modal').modal('show');
      // set calendar
      $('#calendar-edit').calendar({type: 'date'});
    },
    updateCard: function(event) {
      event.preventDefault();
      // hide modal
      $('#edit-card-modal').modal('hide');
      // get card info
      let name = $('input[name=edit-card-name]')[0].value;
      let description = $('textarea[name=edit-card-description]')[0].value;
      let deadline = $('input[name=edit-card-deadline]')[0].value;
      let content = $('textarea[name=edit-card-content]')[0].value;
      let categories = []
      let assigned = []
      // console.log('edit', $('#edit-category'))
      $('#edit-category').children('.label').map(function() {
        return categories.push($(this).data('value'))
      })
      $('#edit-assigned').children('.label').map(function() {
        // console.log($(this).data('value'))
        return assigned.push($(this).data('value'))
      })

      // get current date
      const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
      let currentDate = new Date();
      let date = currentDate.getDate();
      let month = currentDate.getMonth();
      let year = currentDate.getFullYear();
      let dateString =  MONTH_NAMES[month] + " " + date + ", " + year;
      //get card
      let cards = this.getCards
      let newCard = {...cards[this.selectedCard]}
      // set fields to update
      if (name) newCard.name = name
      if (description) newCard.description = description
      if (deadline) newCard.deadline = deadline
      if (categories) newCard.categories = categories
      if (assigned) newCard.assigned = assigned
      console.log(`assigned: ${assigned}`)
      console.log(`newCard.assigned: ${newCard.assigned}`)
      if (content) newCard.content = content
      newCard.updatedAt = dateString
      // update card
      event.target.innerHTML === 'Update' ? this.$firestoreRefs.cards.doc(cards[this.selectedCard].id).update(newCard) : null;
    },
    filterCards: function(event) {
      // filter cards using card.status
      let category = event.target.getAttribute('data-value');
      let cards = this.getCards;
      let newC = cards.filter(card => card.categories.filter(cat => cat == category).length > 0);
      newC.forEach(c => {
        this.$firestoreRefs.cards.doc(c.id).update({status:'closed'});
      })
    },
    unfilterCards: function(event) {
      // reset card.status
      let cards = this.getCards;
      if ($(event.target).hasClass('delete')) {
        cards.forEach(c => {
          this.$firestoreRefs.cards.doc(c.id).update({status:'open'});
        })
      }
    }
  }
})

$(document).ready(() => {
  // dropdown
  $('.ui.dropdown')
  .dropdown();
  // $('#list-menu').dropdown();
  // menu
  $('.ui.menu .filter-menu a.item').on('click', function() {
    $(this)
      .addClass('active')
      .siblings()
      .removeClass('active');
  })
  // form validation
  $('.ui.form')
  .form({
    fields: {
      name: 'empty',
      description: 'empty',
      color: 'empty'
    }
  });

  // calendar
  $('#calendar').calendar({
    type: 'date'
  });

  // tags
  $('.ui.dropdown').dropdown({
    allowAdditions: true,
  });

})
