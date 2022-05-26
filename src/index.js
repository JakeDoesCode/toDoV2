import { addDays, format, isEqual, isWithinInterval } from 'date-fns';
import parseISO from 'date-fns/parseISO';

let lastSelected;

// creates empty array for "Project" Objects

let defaultProjectList = [];
let projectList = localStorage.getItem('myProjectList');
projectList = JSON.parse(projectList || JSON.stringify(defaultProjectList));
//Assigns ID and saves to local storage
let defaultId = 0;
let id = Number(localStorage.getItem('currentId')) || defaultId;

function saveToLocalStorage() {
  localStorage.setItem('myProjectList', JSON.stringify(projectList));
  localStorage.setItem('currentId', id.toString());
}

//clears list
function clearContent() {
  const ul = document.querySelector('ul');
  ul.textContent = '';
}

function createHome() {
  let homeSection = document.getElementById('homeSection');
  let titleBar = document.createElement('h2');
  titleBar.textContent = 'Home';
  homeSection.appendChild(titleBar);
  let allTask = document.createElement('div');
  allTask.classList.add('home');
  allTask.classList.add('item');
  let allTaskImg = document.createElement('img');
  allTaskImg.classList.add('icon');
  allTaskImg.setAttribute('src', '/dist/assets/completed-task.png');
  allTask.appendChild(allTaskImg);
  let allTaskName = document.createElement('span');
  allTaskName.textContent = 'All Tasks';
  allTask.appendChild(allTaskName);
  homeSection.appendChild(allTask);
  allTask.addEventListener('click', (e) => {
    selectHomeTile(e.target.closest('div'));
    clearContent();
    projectList.forEach((project) => {
      project.taskList.forEach((task) => {
        newTaskCard(
          task.id,
          task.title,
          task.details,
          task.date,
          task.completed,
          task.important
        );
      });
    });
  });

  let today = document.createElement('div');
  today.classList.add('home');
  today.classList.add('item');
  let todayImg = document.createElement('img');
  todayImg.classList.add('icon');
  todayImg.setAttribute('src', '/dist/assets/clock.png');
  today.appendChild(todayImg);
  let todayName = document.createElement('span');
  todayName.textContent = 'Today';
  today.appendChild(todayName);
  homeSection.appendChild(today);
  today.addEventListener('click', (e) => {
    selectHomeTile(e.target.closest('div'));
    clearContent();
    let today = Date.parse(format(new Date(), 'yyyy-MM-dd'));
    projectList.forEach((project) => {
      project.taskList.forEach((task) => {
        let date = Date.parse(task.date);
        if (isEqual(date, today)) {
          newTaskCard(
            task.id,
            task.title,
            task.details,
            task.date,
            task.completed,
            task.important
          );
        } else {
          return;
        }
      });
    });
  });

  let important = document.createElement('div');
  important.classList.add('home');
  important.classList.add('item');
  let importantImg = document.createElement('img');
  importantImg.classList.add('icon');
  importantImg.setAttribute('src', '/dist/assets/warning.png');
  important.appendChild(importantImg);
  let importantName = document.createElement('span');
  importantName.textContent = 'Important';
  important.appendChild(importantName);
  homeSection.appendChild(important);
  important.addEventListener('click', (e) => {
    selectHomeTile(e.target.closest('div'));
    clearContent();
    projectList.forEach((project) => {
      project.taskList.forEach((task) => {
        if (task.important) {
          newTaskCard(
            task.id,
            task.title,
            task.details,
            task.date,
            task.completed,
            task.important
          );
        } else {
          return;
        }
      });
    });
  });
}

createHome();
// creates a Project Object with an id number, name, and a sub array of TaskList (which will contain tasks)
const CreateProject = (dataProject, name) => {
  const taskList = [];
  return {
    dataProject,
    name,
    taskList,
  };
};

// creates DOM element
function newProjectCard(dataProject, projectName) {
  let projectCard = document.createElement('div');
  projectCard.classList.add('projectCard');
  projectCard.classList.add('item');
  projectCard.setAttribute('data-project', `${dataProject}`);
  let leftSide = document.getElementById('leftSide');
  leftSide.appendChild(projectCard);
  projectCard.classList.add('title');
  projectCard.textContent = projectName;
  projectCard.addEventListener('click', (event) => {
    selectTile(event.target);
  });
  //Need to add array interactions with buttons
  let projectBtns = document.createElement('div');
  projectBtns.classList.add('projectBtns');
  projectCard.appendChild(projectBtns);
  let renameBtn = document.createElement('button');
  renameBtn.classList.add('projectRenameBtn');
  projectBtns.appendChild(renameBtn);
  renameBtn.textContent = 'Rename';
  //make a required input box
  renameBtn.addEventListener('click', (e) => {
    let newName = prompt('Please enter new project name:');

    if (newName !== '') {
      projectCard.textContent = ' ';
      projectCard.textContent = newName;
      projectList[dataProject].name = newName;
      projectCard.appendChild(projectBtns);
    } else if (newName === ' ') {
      projectCard.textContent = projectName;
    }
    e.preventDefault();
    saveToLocalStorage();
  });

  let deleteProjectBtn = document.createElement('button');
  deleteProjectBtn.textContent = 'Delete';
  deleteProjectBtn.classList.add('deleteProjectBtn');
  projectBtns.appendChild(deleteProjectBtn);
  deleteProjectBtn.addEventListener('click', () => {
    console.log(dataProject);
    projectCard.remove();
    sortArray();
    projectList.splice(dataProject, 1);
    saveToLocalStorage();
    location.reload();
    console.log(projectList);
  });
}

//Iterates through all Project Objects within the project list array and creates a card for them
const displayProject = (array) => {
  array.forEach((project) => {
    newProjectCard(project.dataProject, project.name);
  });
};

//Add Project interactions
const addProjectBtn = document.getElementById('addProjectBtn');
addProjectBtn.addEventListener('click', () => {
  let projectRenameForm = document.getElementById('projectForm');
  projectRenameForm.reset();
  projectRenameForm.classList.toggle('hidden');
});
const cancelAddProject = document.querySelector('.projectCancel');
cancelAddProject.addEventListener('click', () => {
  let projectRenameForm = document.getElementById('projectForm');
  projectRenameForm.reset();
  projectRenameForm.classList.toggle('hidden');
});

// When user clicks "Add". new project is created in the array, and within the dom
let renameForm = document.querySelector('.projectAddBtn');
renameForm.addEventListener('click', (e) => {
  let projectName = document.getElementById('projectInput').value;
  let dataProject = nextDataNumber();
  const newProject = CreateProject(dataProject, projectName);
  newProjectCard(dataProject, projectName);
  e.preventDefault();
  projectList.push(newProject);
  saveToLocalStorage();
  let projectRenameForm = document.getElementById('projectForm');
  projectRenameForm.reset();
  projectRenameForm.classList.toggle('hidden');

  console.log(projectList);
});

const nextDataNumber = () => {
  const allprojects = document.querySelectorAll('[data-project]');
  return allprojects.length;
};

console.log(projectList);

function sortArray() {
  let i = 0;
  //reorder the dataset in node and change dataProject accordingly
  const tiles = document.querySelectorAll('.projectCard');
  tiles.forEach((tile) => {
    let dataNum = tile.dataset.project;
    tile.dataset.project = i;
    projectList[dataNum].dataProject = i;
    i++;
  });
  //reorder projects according to their dataProject nunmber
  projectList.sort((a, b) => a.dataProject - b.dataProject);
  saveToLocalStorage();
}

//Create a "Project" Object with name, data project number to match index, and taskList

//make task list an array of task objects
//each task object with with completed, date due, details, id, important, and name

const CreateTask = (
  dataProject,
  id,
  title,
  details,
  completed,
  important,
  date
) => {
  return {
    dataProject,
    id,
    title,
    details,
    completed: completed,
    important: important,
    date: date,
  };
};

// creates new task in Dom
function newTaskCard(listId, title, notes, date, completed, important) {
  const toDoList = document.getElementById('toDoList');
  const taskCard = document.createElement('li');
  taskCard.classList.add('taskCard');
  taskCard.id = listId;
  taskCard.important = important;
  taskCard.completed = completed;
  toDoList.appendChild(taskCard);

  const taskComplete = document.createElement('div');
  if (completed) {
    taskComplete.classList.add('active');
  } else {
    taskComplete.classList.remove('active');
  }
  taskComplete.classList.add('taskComplete');
  taskComplete.addEventListener('click', (e) => {
    let listId = e.target.closest('li').id;
    let selectedTask = findSelectedTask(listId);
    selectedTask.completed = !selectedTask.completed;
    saveToLocalStorage();
    refreshDisplay(selectedTask.dataProject);
  });
  taskCard.appendChild(taskComplete);

  const info = document.createElement('div');
  info.classList.add('info');
  taskCard.appendChild(info);

  const taskName = document.createElement('div');
  taskName.classList.add('taskName');
  taskName.textContent = title;
  info.appendChild(taskName);

  const details = document.createElement('div');
  details.classList.add('details');
  details.textContent = notes;
  info.appendChild(details);

  const dueDate = document.createElement('div');
  dueDate.classList.add('dueDate');
  dueDate.textContent = date;
  taskCard.appendChild(dueDate);

  const importantBtn = document.createElement('img');
  importantBtn.setAttribute('id', 'important');
  importantBtn.classList.add('icon');
  importantBtn.setAttribute('src', '/dist/assets/warning.png');
  importantBtn.addEventListener('click', (e) => {
    let listId = e.target.closest('li').id;
    let selectedTask = findSelectedTask(listId);
    selectedTask.important = !selectedTask.important;
    saveToLocalStorage();
    refreshDisplay(selectedTask.dataProject);
    console.table(projectList);
  });
  taskCard.appendChild(importantBtn);

  const options = document.createElement('div');
  options.setAttribute('class', 'options');
  taskCard.appendChild(options);

  const editBtn = document.createElement('button');
  editBtn.setAttribute('id', 'submitEdit');
  editBtn.textContent = 'Edit';
  editBtn.classList.add('taskMenuBtn');
  options.appendChild(editBtn);
  editBtn.addEventListener('click', (e) => {
    let task = e.target.closest('li');
    populateForm(e);
    task.classList.add('hidden');
    let taskEditForm = document.querySelector('.editForm');
    taskEditForm.classList.toggle('hidden');
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('id', 'taskDelete');
  deleteBtn.textContent = 'Delete';
  deleteBtn.classList.add('taskMenuBtn');
  options.appendChild(deleteBtn);
  deleteBtn.addEventListener('click', (e) => {
    let listNode = e.target.closest('li');
    let id = listNode.id;
    let selectedTask = findSelectedTask(id);
    let dataProject = selectedTask.dataProject;
    projectList[dataProject].taskList = projectList[
      dataProject
    ].taskList.filter((task) => task != selectedTask);
    saveToLocalStorage();
    listNode.remove();
  });
}

// find the task via id
function findSelectedTask(listId) {
  let selectedTask = projectList.reduce((acc, project) => {
    let currentTask = project.taskList.find((task) => task.id == listId);
    if (currentTask != null) {
      acc = currentTask;
    }
    return acc;
  }, {});
  return selectedTask;
}

function processDateData(date) {
  let formattedDate;
  if (!date) {
    formattedDate = 'No Due Date';
  } else {
    formattedDate = date;
  }
  return formattedDate;
}
//finds the dataProject number of selected project
function findCurrentDataProject() {
  const selected = document.querySelector('.selected');
  return selected.dataset.project;
}
// submits in information in add task form, creating a new task within the project
function processListInput(e) {
  let title = document.querySelector('.taskNameInput').value;
  let details = document.querySelector('.taskNotes').value;
  let dateInput = document.querySelector('.taskDate').value;
  const taskForm = document.getElementById('taskForm');
  let dataProject = findCurrentDataProject();
  let date = processDateData(dateInput);
  let listId = id;

  const newTask = CreateTask(
    dataProject,
    listId,
    title,
    details,
    false,
    false,
    date
  );
  projectList[dataProject].taskList.push(newTask);
  id++;
  saveToLocalStorage();
  taskForm.classList.toggle('hidden');
  newTaskCard(listId, title, details, date);
  let inputForm = document.querySelector('.inputForm');
  inputForm.reset();
  e.preventDefault();
}
//erases task lists from dom before replacing task cards
function displayTask(dataProject) {
  const ul = document.querySelector('ul');
  ul.textContent = '';
  projectList[dataProject].taskList.forEach((task) => {
    newTaskCard(
      task.id,
      task.title,
      task.details,
      task.date,
      task.completed,
      task.important
    );
  });
}
let showAddTask = document.querySelector('.addTaskBtn');
showAddTask.addEventListener('click', () => {
  const taskForm = document.getElementById('taskForm');
  taskForm.classList.toggle('hidden');
  showAddTask.classList.add('hidden');
});
let addTaskBtn = document.querySelector('.submitTaskBtn');
addTaskBtn.addEventListener('click', (e) => {
  processListInput(e);
  showAddTask.classList.remove('hidden');
});
let cancelTaskBtn = document.querySelector('.taskCancel');
cancelTaskBtn.addEventListener('click', () => {
  const taskForm = document.getElementById('taskForm');
  taskForm.classList.toggle('hidden');
  showAddTask.classList.remove('hidden');
});

const selectTile = (event) => {
  if (lastSelected) {
    lastSelected.classList.remove('selected');
  }
  lastSelected = event;
  if (event.classList.contains('selected')) {
    event.classList.remove('selected');
  } else {
    event.classList.add('selected');
    displayTask(findCurrentDataProject());
    showAddTask.classList.remove('hidden');
  }
};

const selectHomeTile = (event) => {
  if (lastSelected) {
    lastSelected.classList.remove('selected');
  }
  lastSelected = event;
  if (event.classList.contains('selected')) {
    event.classList.remove('selected');
  } else {
    event.classList.add('selected');
    showAddTask.classList.add('hidden')
  }
};
displayProject(projectList);
function showHiddenTask() {
  const hiddenTask = document.querySelector('li.hidden');
  hiddenTask.classList.remove('hidden');
}
function findHiddenTask() {
  const hiddenTask = document.querySelector('li.hidden');
  return hiddenTask;
}
function createEditTask() {
  const main = document.getElementById('toDo');
  let editForm = document.createElement('form');
  editForm.classList.add('editForm');
  editForm.classList.add('hidden');
  main.appendChild(editForm);
  let editInputs = document.createElement('editInputs');
  editForm.appendChild(editInputs);
  let titleLabel = document.createElement('label');
  editInputs.appendChild(titleLabel);
  titleLabel.textContent = 'Title:';
  let editTaskName = document.createElement('input');
  editTaskName.setAttribute('type', 'text');
  editTaskName.setAttribute('id', 'editTaskName');
  editForm.appendChild(editTaskName);
  let detailLabel = document.createElement('label');
  detailLabel.textContent = 'Details:';
  editForm.appendChild(detailLabel);
  let detail = document.createElement('textarea');
  detail.setAttribute('id', 'editTaskDetails');
  detail.setAttribute('type', 'text');
  editForm.appendChild(detail);
  let dateLabel = document.createElement('label');
  dateLabel.textContent = 'Date:';
  editForm.appendChild(dateLabel);
  let date = document.createElement('input');
  date.setAttribute('type', 'date');
  date.setAttribute('id', 'editDate');
  editForm.appendChild(date);
  let buttons = document.createElement('div');
  buttons.classList.add('formBtn');
  editForm.appendChild(buttons);
  let submitEdit = document.createElement('input');
  submitEdit.setAttribute('id', 'editFormSubmit');
  submitEdit.setAttribute('type', 'submit');
  submitEdit.setAttribute('value', 'Edit');
  buttons.appendChild(submitEdit);

  //process the input from the edit task form
  submitEdit.addEventListener('click', (e) => {
    let title = document.querySelector('#editTaskName').value;
    let details = document.querySelector('#editTaskDetails').value;
    let dateInput = document.querySelector('#editDate').value;
    let taskId = findHiddenTask().id;
    let selectedTask = findSelectedTask(taskId);

    selectedTask.title = title;
    selectedTask.details = details;
    selectedTask.date = processDateData(dateInput);
    saveToLocalStorage();

    let taskEditForm = document.querySelector('.editForm');
    taskEditForm.classList.toggle('hidden');

    e.preventDefault();
    editForm.reset();
    showHiddenTask();
    refreshDisplay(selectedTask.dataProject);
  });

  let cancelEdit = document.createElement('input');
  cancelEdit.setAttribute('type', 'button');
  cancelEdit.setAttribute('id', 'editFormCancel');
  cancelEdit.setAttribute('value', 'Cancel');
  buttons.appendChild(cancelEdit);
  cancelEdit.addEventListener('click', () => {
    editForm.classList.toggle('hidden');
    showHiddenTask();
    editForm.reset();
  });
}
createEditTask();

function populateForm(e) {
  console.log(e.target.closest('li'));
  let listNode = e.target.closest('li');
  const editForm = document.querySelector('.editForm');
  const taskTitle = listNode.querySelector('.taskName').textContent;
  const taskDetails = listNode.querySelector('.details').textContent;
  const taskDate = listNode.querySelector('.dueDate').textContent;

  const titleInput = editForm.querySelector('#editTaskName');
  const detailInput = editForm.querySelector('#editTaskDetails');
  const dateInput = editForm.querySelector('#editDate');
  titleInput.value = taskTitle;
  detailInput.value = taskDetails;
  dateInput.value = taskDate;
}

function refreshDisplay(dataProject) {
  const selectedTile = document.querySelector('.selected');
  if (selectedTile.closest('.projectCard') != null) {
    displayTask(dataProject);
  }
}
// mode select

function modeSelect() {
  const toggleSwitch = document.querySelector('.mode input[type="checkbox"]');

  function switchTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme', 'light');
    }
  }
  toggleSwitch.addEventListener('change', switchTheme, false);
}
const sidebarHide = document.querySelector('.hideSidebar');
const leftSide = document.getElementById('leftSide');
sidebarHide.addEventListener('click', () => {
  leftSide.classList.toggle('hidden');
});

modeSelect();
//all task
