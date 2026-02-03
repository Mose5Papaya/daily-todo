let todoM = JSON.parse(localStorage.getItem("todoM")) || [];

displayTasks();
addNewTaskButton();


function displayTasks() {
    const container = document.getElementById('taskContainer');
    container.innerHTML = "";

    todoM.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('task');
        const taskHTML = `
                    <div class="mainTask">
                        <input type="checkbox" class="todo-checkbox" id="main-input-${index}" ${item.checked ? "checked" : ""}>
                        <label class="todo-label" for="main-input-${index}"></label>
                        <div class="not-label">
                            <div class="taskTextContainer">
                                <div class="taskText${item.checked ? " completed" : ""}">${escapeHtml(item.text)}</div>
                                ${item.locked ? `<div class="locked-icon"><i class="fa-solid fa-lock fa-lg"></i></div>` : ""}
                                <div class="progressText">${item.subtasks.length > 0 ? ` (${item.completedsubtasks}/${item.subtasks.length})` : ""}</div>
                            </div>
                            <div class="tools">
                                <button class="edit"><i class="fa-solid fa-pen"></i></button>
                                <button class="lock"><i class="fa-solid fa-lock"></i></button>
                                <button class="expand"><i class="fa-solid fa-plus"></i></button>
                                <button class="move"><i class="fa-solid fa-arrows-up-down-left-right"></i></button>
                                <button class="delete"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                    <div class="subtasks"></div>
                    <div class="newSubtask">
                        <input type="text" class="newSubTaskInput hidden">
                    </div>`;
        div.innerHTML = taskHTML;
        
        const mainTaskContainer = div.querySelector(".mainTask");

        //checkbox
        const mainCheckbox = mainTaskContainer.querySelector(".todo-checkbox");
        mainCheckbox.addEventListener('click', async (e) => {
            if (item.subtasks.length > 0) {
                e.preventDefault();
                displayNotice("Finish all subtasks to check off this box!");
            }
        });
        mainCheckbox.addEventListener('change', () => {
            item.checked = !item.checked;
            saveToLocalStorage();
            displayTasks();
        });

        if (item.subtasks.length > 0) {
            const mainLabel = mainTaskContainer.querySelector(".todo-label");
            mainLabel.classList.add("disabled");

            if (!item.checked) {                
                const percentage = Math.floor((100 / item.subtasks.length) * item.completedsubtasks);
                
                mainLabel.style.background = `conic-gradient(var(--td-green) 0% ${percentage}%, var(--td-white) ${percentage}% 100%)`;
            };
            
        }

        //edit button
        const editBtn = mainTaskContainer.querySelector(".edit");
        editBtn.addEventListener("click", () => {
            editTask(mainTaskContainer, item);
        })

        //lock button 
        const lckBtn = mainTaskContainer.querySelector(".lock");
        lckBtn.addEventListener("click", () => {
            item.locked = !item.locked;
            saveToLocalStorage();
            displayTasks();
        });

        //new subtask button
        const xpndBtn = mainTaskContainer.querySelector(".expand");
        const input = div.querySelector(".newSubTaskInput");
        xpndBtn.addEventListener("click", () => {
            
            input.classList.remove("hidden");
            input.focus();
        });
        
        input.addEventListener("blur", function() {
            saveNewTask();
        })

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                saveNewTask();
            }
            if (e.key === "Escape") {
                cancelNewTask();
            }
        });

        function saveNewTask() {
            const inputText = input.value.trim();
            if (inputText) {
                item.subtasks.push({
                    text: inputText,
                    checked: false
                });
                item.checked = false;
                input.value = "";
                saveToLocalStorage();
                displayTasks();
            } else {
                cancelNewTask();
            }
        }

        function cancelNewTask() {
            input.value = "";
            input.classList.add("hidden");
        }

        //move button
        const mvBtn = mainTaskContainer.querySelector(".move");
        mvBtn.addEventListener("click", () => {
            enableMoveMode(div, container, todoM, index);
        });

        //delete button
        const dltBtn = mainTaskContainer.querySelector(".delete");
        dltBtn.addEventListener('click', () => {
            deleteItem(todoM, index);
        });

        //subtasks
        const divsubtasks = div.querySelector(".subtasks");

        item.subtasks.forEach((sitem, sindex) => {
            const divsubtask = document.createElement("div");
            divsubtask.classList.add("subtask");

            const subtaskHTML =` 
                    <input type="checkbox" class="todo-checkbox" id="sub-input-${index}-${sindex}" ${sitem.checked ? "checked" : ""}>
                    <label class="todo-label" for="sub-input-${index}-${sindex}"></label>
                    <div class="not-label">
                        <div class="taskTextContainer">
                            <div class="taskText${sitem.checked ? " completed" : ""}">${escapeHtml(sitem.text)}</div>
                        </div>
                        <div class="tools">
                            <button class="edit"><i class="fa-solid fa-pen"></i></button>
                            <button class="move"><i class="fa-solid fa-arrows-up-down-left-right"></i></button>
                            <button class="delete"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>`;
            divsubtask.innerHTML = subtaskHTML;

            //checkbox
            const subCheckbox = divsubtask.querySelector(".todo-checkbox");
            subCheckbox.addEventListener("change", () => {
                sitem.checked = !sitem.checked;
                refreshTaskProgress(item);
                saveToLocalStorage();
                displayTasks();
            });

            //edit button
            const subeditBtn = divsubtask.querySelector(".edit");
            subeditBtn.addEventListener("click", function() {
                editTask(divsubtask, sitem);
            });

            //move button
            const submvBtn = divsubtask.querySelector(".move");
            submvBtn.addEventListener("click", function() {
                enableMoveMode(divsubtask, divsubtasks, item.subtasks, sindex);
            });

            //delete button
            const subdltBtn = divsubtask.querySelector(".delete");
            subdltBtn.addEventListener('click', () => {
                deleteItem(item.subtasks, sindex, item);
            });

            divsubtasks.appendChild( createMoveIndicator(sindex, false) );
            divsubtasks.appendChild(divsubtask);
        });
        divsubtasks.appendChild( createMoveIndicator(item.subtasks.length, false) );

        container.appendChild( createMoveIndicator(index) );
        container.appendChild(div);
        });
    container.appendChild( createMoveIndicator(todoM.length) );
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function createMoveIndicator(index, large=true) {
    const div = document.createElement("div");
    div.classList.add("moveIndicator");
    div.dataset.id = index;
    if (large) div.innerHTML = `<i class="fa-solid fa-arrow-right fa-lg"></i>`;
    else div.innerHTML = `<i class="fa-solid fa-arrow-right fa-sm"></i>`;
    return div;
}

function editTask(container, task) {
    const divtxt = container.querySelector(".taskText");
    const divclone = divtxt.cloneNode(true);
    const existingText = task.text;
    const inputElement = document.createElement("input");

    inputElement.value = existingText;
    divtxt.replaceWith(inputElement);
    inputElement.focus();

    inputElement.addEventListener("blur", function () {
        save();
    });
    inputElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            save();
        }
        if (e.key === "Escape") {
            inputElement.replaceWith(divclone);
        }
    });

    function save() {
        const updatedText = inputElement.value.trim();
        if (updatedText) {
            task.text = updatedText;
            saveToLocalStorage();
            divclone.innerText = updatedText;
        }
        inputElement.replaceWith(divclone);
    }
}


function enableMoveMode(itemDiv, container, dataArray, currentIndex) {
    //Toggle: If already highlighted, user clicked move again to cancel
    if (itemDiv.classList.contains("highlighted")) {
        itemDiv.classList.remove("highlighted");
        container.querySelectorAll(':scope > .moveIndicator i').forEach(a => a.classList.remove("active"));
        return;
    }

    document.querySelectorAll(".highlighted").forEach(el => el.classList.remove("highlighted"));
    document.querySelectorAll(".moveIndicator i.active").forEach(el => el.classList.remove("active"));

    itemDiv.classList.add("highlighted");
    const arrows = container.querySelectorAll(':scope > .moveIndicator i');

    arrows.forEach((arrow, targetIndex) => {
        arrow.classList.add("active");
        arrow.addEventListener("click", function() {
            let newPosition = targetIndex;
            if (newPosition > currentIndex) newPosition--;
            const [movedItem] = dataArray.splice(currentIndex, 1);
            dataArray.splice(newPosition, 0, movedItem);
            saveToLocalStorage(); 
            displayTasks();       
        }, { once: true });
    });
}

function deleteItem(array, index, parentItem = null) {
    const message = parentItem ? "Delete this subtask?" : "Delete this task and all its subtasks?";
    
    if (confirm(message)) {
        array.splice(index, 1);
        if (parentItem) {
            refreshTaskProgress(parentItem);
        };
        saveToLocalStorage();
        displayTasks();
    }
}

function refreshTaskProgress(parentItem) {
    if (parentItem.subtasks.length > 0) {
        parentItem.completedsubtasks = parentItem.subtasks.filter(s => s.checked).length;
        parentItem.checked = (parentItem.completedsubtasks === parentItem.subtasks.length);
    } else {
        parentItem.completedsubtasks = 0;
    }
}

//uncheckall button
const unchckAllBtn = document.getElementById("uncheckAllButton");
unchckAllBtn.addEventListener("click", function() {
    todoM.forEach((task) => {
        if (!task.locked) {
            task.checked = false;
            task.completedsubtasks = 0;
            task.subtasks.forEach( (subtask) => {
                subtask.checked = false;
            });
        };
    });
    saveToLocalStorage();
    displayTasks();
});


function addNewTaskButton() {
    const input = document.getElementById('addNewTaskInput');
    document.getElementById('addNewTaskButton').addEventListener('click', function() {
        save();
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            save();
        }
    });

    function save() {
        const taskValue = input.value.trim(); 

        if (taskValue !== "") {
            const newTask = {
                text: taskValue,
                checked: false,
                locked: false,
                subtasks: [],
                completedsubtasks: 0
            };
            todoM.push(newTask);
            saveToLocalStorage();
            displayTasks();
            
            input.value = "";
        }
    }
}

function saveToLocalStorage() {
    localStorage.setItem("todoM", JSON.stringify(todoM));
};


function waitForAnimation(element) { 
    return new Promise(resolve => {
        element.addEventListener('animationend', resolve, { once: true });
    });
}

async function displayNotice(txt) {
    const oldNotice = document.getElementById('notice');
    if (oldNotice) oldNotice.remove();

    const notice = document.createElement('div');
    notice.id = 'notice';
    notice.innerText = txt;
    document.body.appendChild(notice);

    await waitForAnimation(notice);
    notice.remove();
}