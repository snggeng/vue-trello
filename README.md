---
permalink: /index.html
---

# Trello Clone made with Vue.js

## Features
* Drag and drop cards or lists to change their positions
* Assign any number of users to a card
* On a separate page, manage multiple projects (all users can see all projects), including
  * "Star" projects as important and order them at the top of the project collection page
  * Close projects as done and order them at the bottom of the project collection page

## JSON Files
* This project uses Firestore and stores data in 5 collections:
  * Users
  * Projects
  * Lists
  * Cards
  * Categories
* These 5 collections were exported from firestore using [`firestore-import-export`](https://github.com/dalenguyen/firestore-import-export)
* You can find these `.json` files inside the `/firestore_json` directory located in the root of this repository

## Collaborators / Resources
* Resources (packages):
  * [Vue](https://vuejs.org/)
  * [jQuery](https://jquery.com/)
  * [Semantic Vue](https://github.com/Semantic-UI-Vue/Semantic-UI-Vue)
  * [Firebase](https://firebase.google.com/)
  * [Firebase (firestore)](https://firebase.google.com/docs/firestore/)
  * [VueFire](https://github.com/vuejs/vuefire/tree/firestore)
  * [Semantic UI](https://semantic-ui.com/)
  * [Semantic Calendar](https://github.com/mdehoog/Semantic-UI-Calendar)
  * [Vue Draggable](https://github.com/SortableJS/Vue.Draggable)
  * [Firestore Import Export](https://github.com/dalenguyen/firestore-import-export)

This project mainly uses `Vue.js` as a frontend framework to create components, `Semantic UI` to style components, and `Firestore` as its data store. `jQuery` was used in various places to grab DOM nodes or create event listeners. It also makes use of some ready-made UI components like `Vue Draggable` and `Vue Calendar`.

## Bugs / Extra Features
* Dragging Cards between Lists does not work
