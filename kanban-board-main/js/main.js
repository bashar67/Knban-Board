"use strict";

const kanban = document.querySelector(".kanban");
let boxs = document.querySelectorAll(".column");
let buttonsAddTasks = document.querySelectorAll(".btn-add-task");
let tasksList = document.querySelectorAll(".tasks-list");

let arrayOfTasks = [];

// //* check if theres tasks in local storage
if (localStorage.getItem("tasks")) {
  arrayOfTasks = JSON.parse(localStorage.getItem("tasks"));
}

//! trigger get func
getDataFromLocalStorage();

const columns = [{ id: 0 }, { id: 1 }, { id: 2 }];

//! add new task
function addNewElement(name) {
  const html = `
	<li draggable="true" id="draggable-task" class="task">
			<p class="task-description">${name}</p>
			<div  class="icon-container">
       <ion-icon name="trash"  class="delete-icon icon"  draggable="false"></ion-icon>
      <ion-icon name="create"  class="edit-icon icon"    draggable="false"></ion-icon>
			
			</div>
	</li>
		`;
  return html;
}

//! show tasks on dom
columns.forEach((column) => {
  let buttonsAddTasks = document.querySelectorAll(".btn-add-task")[column.id];
  let tasksList = document.querySelectorAll(".tasks-list")[column.id];

  buttonsAddTasks.addEventListener("click", function () {
    tasksList.insertAdjacentHTML("beforeend", addNewElement(name));
    addTaskToArray();
  });
});

//! Delete task
tasksList.forEach((taskList) =>
  taskList.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-icon")) {
      const parentLi = e.target.closest("li");
      parentLi.remove();
    }

    //* updateLocalStorage
    addTaskToArray();
  })
);

//! Edit task
tasksList.forEach((taskList) =>
  taskList.addEventListener("click", function (e) {
    //! click on edit button
    if (!e.target.classList.contains("edit-icon")) return;

    const parentLi = e.target.closest("li");

    const taskName = parentLi.querySelector(".task-description");
    const currentName = taskName.innerText;

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("value", currentName);
    input.classList.add("task-description");
    taskName.replaceWith(input);
    input.focus();
    input.setSelectionRange(currentName.length, currentName.length);

    //! save value when click enter or on window
    function handleEnterOrBlur() {
      const newName = input.value;
      const newNameElement = document.createElement("p");
      newNameElement.classList.add("task-description");
      newNameElement.innerText = newName;
      input.replaceWith(newNameElement);

      if (input.value) {
        //* updat local storage
        addTaskToArray(newName);
      }
    }

    let keyPressed = false;

    //! excut handle func when press enter key
    input.addEventListener("keyup", function (e) {
      if (e.keyCode === 13 || e.key === "Enter") {
        keyPressed = true;
        handleEnterOrBlur();
      }
    });

    //! excut handle func when press on window

    input.addEventListener("blur", function () {
      if (keyPressed) {
        keyPressed = false;

        return;
      }
      handleEnterOrBlur();
    });
  })
);

//* Local storage and save data in culomns arrays

//! Render tasks from local storage
function getDataFromLocalStorage() {
  arrayOfTasks = JSON.parse(localStorage.getItem("tasks")) ?? [];

  const notStartedSection = document.querySelector(".column__not-started ul");
  const inProgressSection = document.querySelector(".column__in-progress ul");
  const completedSection = document.querySelector(".column__completed ul");

  //! Get saved tasks from local storage
  arrayOfTasks.forEach((task) => {
    const li = addNewElement(task.name);

    if (task.column === "not started") {
      notStartedSection.insertAdjacentHTML("beforeend", li);
    } else if (task.column === "in progress") {
      inProgressSection.insertAdjacentHTML("beforeend", li);
    } else if (task.column === "completed") {
      completedSection.insertAdjacentHTML("beforeend", li);
    }
  });
}

//! store data into array then store this data from array to local storage
function addTaskToArray() {
  const noStarted = document.querySelector(
    ".column__not-started .tasks-list"
  ).children;

  const inProgress = document.querySelector(
    ".column__in-progress .tasks-list"
  ).children;

  const completed = document.querySelector(
    ".column__completed .tasks-list"
  ).children;

  //! save all elemnet in not started culomn
  const notStartedArr = [];
  for (let task of noStarted) {
    notStartedArr.push({
      id: Date.now(),
      name: task.querySelector(".task-description").textContent,
      column: "not started",
    });
  }
  //! save all elemnet in in progress culomn
  const inProgressArr = [];
  for (let task of inProgress) {
    inProgressArr.push({
      id: Date.now(),
      name: task.querySelector(".task-description").textContent,
      column: "in progress",
    });
  }

  //! save all elemnet in Completed culomn
  const completedArr = [];
  for (let task of completed) {
    completedArr.push({
      id: Date.now(),
      name: task.querySelector(".task-description").textContent,
      column: "completed",
    });
  }
  //* make all arrays in one big array
  const allTasks = [...notStartedArr, ...inProgressArr, ...completedArr];

  //! add Array to local stoarg
  localStorage.setItem("tasks", JSON.stringify(allTasks));
}

//////////////////////////////////////
//* drag and drob
///////////////////////////////////

let drag = null;

tasksList.forEach((task) => {
  task.addEventListener("dragstart", function (e) {
    if (e.target.id === "draggable-task") {
      e.target.classList.add("drop-zone");
      drag = e.target;
      e.dataTransfer.setData("text/html", drag);
      e.target.style.opacity = "0.5";
    }
  });

  task.addEventListener("dragover", function (e) {
    e.preventDefault();

    const node = e.target;
    if (node !== drag && node.nodeName === "LI") {
      const dragOver = node.getBoundingClientRect();
      const dragOverMiddleY = dragOver.top + dragOver.height / 2;
      const mouseY = e.clientY;
      if (mouseY < dragOverMiddleY) {
        task.insertBefore(drag, node);
        return;
      } else {
        task.insertBefore(drag, node.nextSibling);
        return;
      }
    }
  });

  task.addEventListener("dragend", function (e) {
    e.target.classList.remove("drop-zone");
    e.target.style.opacity = "1";
    drag = null;
  });
});

boxs.forEach((box) => {
  box.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.classList.add("drag-over");
  });

  box.addEventListener("dragleave", function (e) {
    e.preventDefault();
    this.classList.remove("drag-over");
  });

  box.addEventListener("drop", function (e) {
    e.preventDefault();
    this.classList.remove("drag-over");

    const node = this.querySelector(".tasks-list");
    if (node !== drag && node.nodeName === "LI") {
      const dragOver = node.getBoundingClientRect();
      const dragOverMiddleY = dragOver.top + dragOver.height / 2;
      const mouseY = e.clientY;
      if (mouseY < dragOverMiddleY) {
        task.insertBefore(drag, node);
      } else {
        task.insertBefore(drag, node.nextSibling);
      }
    }

    const task = document.querySelector(".drop-zone");
    if (task) {
      const targetColumn = e.target.closest(".column");
      const taskList = targetColumn.querySelector(".tasks-list");
      if (taskList.childElementCount === 0) taskList.append(task);
    }

    //* updateLocalStorage
    addTaskToArray();
  });
});

////////////////////////////////////
//* touch screen
///////////////////////////////////////

let targetColumn;
let touchStartX, touchStartY;

tasksList.forEach((task) => {
  task.addEventListener("touchstart", function (e) {
    if (e.target.nodeName === "INPUT") return;
    if (e.target.classList.contains("icon")) return;

    drag = e.target.closest(".task");

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;

    drag.classList.add("drop-zone");
  });

  task.addEventListener("touchend", function (e) {
    let touch = e.changedTouches[0];

    if (touch.clientY === touchStartY) {
      drag.classList.remove("drop-zone");
      return;
    }

    let minDistance = Infinity;
    for (let i = 0; i < boxs.length; i++) {
      let box = boxs[i];
      let rect = box.getBoundingClientRect();
      let distance = Math.hypot(
        touch.clientX - rect.left - rect.width / 2,
        touch.clientY - rect.top - rect.height / 2
      );
      if (distance < minDistance) {
        minDistance = distance;
        targetColumn = box;
      }
    }

    if (!drag) return;
    drag.classList.remove("drop-zone");
    e.target.closest(".column").classList.remove("drag-over");

    targetColumn.querySelector(".tasks-list").appendChild(drag);

    boxs.forEach((box) => box.classList.remove("drag-over"));
    drag.style.transform = `translate(0, 0)`;

    drag = null;

    //* updateLocalStorage
    addTaskToArray();
  });
});

boxs.forEach((box) => {
  box.addEventListener("touchmove", touchMove);
  box.addEventListener("touchleave", touchLeave);
});

function touchMove(e) {
  e.preventDefault();

  let touch = e.touches[0];
  let endX = touch.pageX;
  let endY = touch.pageY;
  let distanceMoved = Math.hypot(endX - touchStartX, endY - touchStartY);
  if (distanceMoved > 10) {
    let minDistance = Infinity;
    for (let i = 0; i < boxs.length; i++) {
      let box = boxs[i];
      let rect = box.getBoundingClientRect();
      let distanceToColumn = Math.hypot(
        touch.clientX - rect.left - rect.width / 2,
        touch.clientY - rect.top - rect.height / 2
      );
      if (distanceToColumn < minDistance) {
        minDistance = distanceToColumn;
        targetColumn = box;
      }
    }
  }

  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;
  const deltaX = touchX - touchStartX;
  const deltaY = touchY - touchStartY;

  if (!drag) return;

  drag.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

  targetColumn.classList.add("drag-over");
}

function touchLeave(e) {
  e.target.closest(".column").classList.remove("drag-over");
}

let currentLi = null;
let initialPos = null;
let currentPos = null;
let diff = 0;
let isTouchMoving = false;

function handleTouchStart(e) {
  if (e.target.nodeName === "INPUT") return;
  if (e.target.classList.contains("icon")) return;

  currentLi = e.target.closest(".task");
  if (!currentLi) return;

  initialPos = e.touches[0].clientY;
  isTouchMoving = false;
}

function handleTouchMove(e) {
  e.preventDefault();

  if (e.target.nodeName === "INPUT") return;
  if (e.target.classList.contains("icon")) return;

  if (!currentLi) return;

  currentPos = e.touches[0].clientY;
  diff = currentPos - initialPos;

  if (Math.abs(diff) < 10) return;

  isTouchMoving = true;

  currentLi.style.transform = `translateY(${diff}px)`;

  const ul = currentLi.closest(".tasks-list");
  const liArray = [...ul.querySelectorAll(".task")];

  for (const li of liArray) {
    if (li === currentLi) continue;

    const rect = li.getBoundingClientRect();
    const mid = (rect.bottom + rect.top) / 2;
  }
}

function handleTouchEnd() {
  if (Math.abs(diff) < 10 || !isTouchMoving) return;
  if (!currentLi) return;

  currentLi.style.transform = "";

  const ul = currentLi.closest(".tasks-list");
  const liArray = [...ul.querySelectorAll(".task")];
  const newIndex = liArray.indexOf(currentLi);

  let i = 0;
  for (const li of liArray) {
    if (li === currentLi) continue;

    const rect = li.getBoundingClientRect();
    const mid = (rect.bottom + rect.top) / 2;

    if (currentPos > mid && newIndex > i) i++;
    if (currentPos < mid && newIndex < i) i--;
  }

  ul.insertBefore(currentLi, liArray[i]);

  currentLi = null;
  initialPos = null;
  currentPos = null;
  diff = 0;
}

tasksList.forEach((taskList) => {
  taskList.addEventListener("touchstart", handleTouchStart);
  taskList.addEventListener("touchmove", handleTouchMove);
  taskList.addEventListener("touchend", handleTouchEnd);
});
