document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const itemNameInput = document.getElementById('itemName');
    const itemDeadlineInput = document.getElementById('itemDeadline');
    const itemPrioritySelect = document.getElementById('itemPriority');
    const addItemBtn = document.getElementById('addItemBtn');

    const todayTasksContainer = document.getElementById('todayTasks');
    const futureTasksContainer = document.getElementById('futureTasks');
    const completedTasksContainer = document.getElementById('completedTasks');

    // --- Utility Functions ---

    /**
     * Loads the todo list array from Local Storage.
     * @returns {Array} The array of todo items, or an empty array if none exists.
     */
    function loadTodoList() {
        const todoJson = localStorage.getItem('todoList');
        return todoJson ? JSON.parse(todoJson) : [];
    }

    /**
     * Saves the todo list array to Local Storage.
     * @param {Array} todoList - The array of todo items to save.
     */
    function saveTodoList(todoList) {
        localStorage.setItem('todoList', JSON.stringify(todoList));
    }

    /**
     * Formats a date string (YYYY-MM-DD) into a more readable format (DD/MM/YYYY).
     * @param {string} dateString - The date in YYYY-MM-DD format.
     * @returns {string} The date in DD/MM/YYYY format.
     */
    function formatTaskDate(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // --- Core Functionality ---

    /**
     * Renders the entire todo list into the appropriate sections.
     */
    function renderTodoList() {
        const todoList = loadTodoList();
        
        // Clear containers
        todayTasksContainer.innerHTML = '';
        futureTasksContainer.innerHTML = '';
        completedTasksContainer.innerHTML = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to midnight

        // Filter and sort tasks
        const todayTasks = [];
        const futureTasks = [];
        const completedTasks = [];

        todoList.forEach((item, index) => {
            const itemDate = item.date ? new Date(item.date) : null;
            if (itemDate) itemDate.setHours(0, 0, 0, 0); // Normalize task date

            if (item.completed) {
                completedTasks.push({ item, index });
            } else if (itemDate && itemDate.getTime() === today.getTime()) {
                todayTasks.push({ item, index });
            } else {
                // Includes future tasks and past uncompleted tasks
                futureTasks.push({ item, index });
            }
        });

        // Sort uncompleted tasks by date (earliest first)
        todayTasks.sort((a, b) => new Date(a.item.date) - new Date(b.item.date));
        futureTasks.sort((a, b) => new Date(a.item.date) - new Date(b.item.date));
        
        // Sort completed tasks by completion date (or date, if no completion field added)
        completedTasks.sort((a, b) => new Date(b.item.date) - new Date(a.item.date)); // Newest completed first

        // Render sections
        [
            { container: todayTasksContainer, list: todayTasks },
            { container: futureTasksContainer, list: futureTasks },
            { container: completedTasksContainer, list: completedTasks, completed: true }
        ].forEach(({ container, list, completed = false }) => {
            if (list.length === 0) {
                container.innerHTML = `<div class="no-tasks">No tasks found in this section.</div>`;
                return;
            }

            list.forEach(({ item, index }) => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${item.completed ? 'completed-task' : ''}`;
                taskElement.setAttribute('data-index', index);

                taskElement.innerHTML = `
                    <div class="task-details">
                        <span class="task-name">${index + 1}. ${item.name}</span>
                        <span class="task-date">${formatTaskDate(item.date)}</span>
                        <span class="priority-tag priority-${item.priority}">${item.priority}</span>
                    </div>
                    <div class="task-actions">
                        ${!completed ? `<button class="action-btn toggle-complete"><i class="fas fa-check"></i></button>` : ''}
                        <button class="action-btn delete-item"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;

                container.appendChild(taskElement);
            });
        });
    }

    /**
     * Adds a new item to the todo list.
     */
    function addItem() {
        const name = itemNameInput.value.trim();
        const date = itemDeadlineInput.value;
        const priority = itemPrioritySelect.value;

        if (!name || !date || !priority) {
            alert('Please fill in all fields (Item Name, Deadline, and Priority).');
            return;
        }

        const todoList = loadTodoList();
        const newItem = {
            name: name,
            date: date, // Stored as YYYY-MM-DD
            priority: priority,
            completed: false
        };

        todoList.push(newItem);
        saveTodoList(todoList);

        // Clear inputs
        itemNameInput.value = '';
        itemDeadlineInput.value = '';
        itemPrioritySelect.value = '';
        
        renderTodoList();
    }

    /**
     * Deletes an item from the todo list by index.
     * @param {number} index - The index of the item to delete.
     */
    function deleteItem(index) {
        const todoList = loadTodoList();
        if (index >= 0 && index < todoList.length) {
            todoList.splice(index, 1);
            saveTodoList(todoList);
            renderTodoList();
        }
    }

    /**
     * Toggles the 'completed' status of an item.
     * @param {number} index - The index of the item to toggle.
     */
    function toggleComplete(index) {
        const todoList = loadTodoList();
        if (index >= 0 && index < todoList.length) {
            todoList[index].completed = !todoList[index].completed;
            saveTodoList(todoList);
            renderTodoList();
        }
    }

    // --- Event Listeners ---

    addItemBtn.addEventListener('click', addItem);
    
    // Use event delegation for delete and complete actions
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.action-btn');
        if (!target) return;

        const taskItem = target.closest('.task-item');
        if (!taskItem) return;

        const index = parseInt(taskItem.getAttribute('data-index'));

        if (target.classList.contains('delete-item')) {
            deleteItem(index);
        } else if (target.classList.contains('toggle-complete')) {
            toggleComplete(index);
        }
    });

    // Initial render when the page loads
    renderTodoList();
});