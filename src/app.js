class TaskManager {
    constructor() {
        this.tasks = TaskStorage.getTasks();
        this.initEventListeners();
        this.renderTasks();
        this.initDeleteZone();
    }

    initEventListeners() {
        document.getElementById('newTaskBtn').addEventListener('click', () => this.toggleModal());
        document.querySelector('.close').addEventListener('click', () => this.toggleModal());
        document.querySelector('.close-edit').addEventListener('click', () => this.toggleEditModal());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('editForm').addEventListener('submit', (e) => this.handleEditSubmit(e));
        
        document.querySelectorAll('.tasks').forEach(column => {
            column.addEventListener('dragover', this.handleDragOver);
            column.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    initDeleteZone() {
        const deleteZone = document.getElementById('deleteZone');
        
        document.addEventListener('dragstart', () => {
            deleteZone.classList.add('active');
        });

        document.addEventListener('dragend', () => {
            deleteZone.classList.remove('active');
        });

        deleteZone.addEventListener('dragover', (e) => e.preventDefault());
        
        deleteZone.addEventListener('drop', (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            this.deleteTask(taskId);
            deleteZone.classList.remove('active');
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-card';
        taskEl.draggable = true;
        taskEl.dataset.taskId = task.id;
        
        const [year, month, day] = task.dueDate.split('-');
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        
        taskEl.innerHTML = `
            <button class="edit-btn">✎</button>
            <h3>${task.name}</h3>
            <p>${task.description}</p>
            <small>ID: ${task.id}</small>
            <small class="task-due">${formattedDate}</small>
        `;

        taskEl.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(task.id);
        });

        taskEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
        });

        return taskEl;
    }

    renderTasks() {
        const columns = {
            'pending': document.getElementById('pendingTasks'),
            'in-progress': document.getElementById('inProgressTasks'),
            'completed': document.getElementById('completedTasks')
        };

        Object.values(columns).forEach(column => column.innerHTML = '');
        this.tasks.forEach(task => columns[task.status].appendChild(this.createTaskElement(task)));
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const newTask = {
            id: this.generateId(),
            name: document.getElementById('taskName').value,
            description: document.getElementById('taskDesc').value,
            status: document.getElementById('taskStatus').value,
            dueDate: document.getElementById('taskDueDate').value
        };

        this.tasks.push(newTask);
        TaskStorage.saveTasks(this.tasks);
        this.renderTasks();
        this.toggleModal();
        e.target.reset();
    }

    openEditModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('editTaskName').value = task.name;
        document.getElementById('editTaskDesc').value = task.description;
        document.getElementById('editTaskStatus').value = task.status;
        document.getElementById('editTaskDueDate').value = task.dueDate;
        document.getElementById('editModal').style.display = 'block';
        document.getElementById('editModal').dataset.taskId = taskId;
    }

    handleEditSubmit(e) {
        e.preventDefault();
        const taskId = document.getElementById('editModal').dataset.taskId;
        const updatedTask = {
            name: document.getElementById('editTaskName').value,
            description: document.getElementById('editTaskDesc').value,
            status: document.getElementById('editTaskStatus').value,
            dueDate: document.getElementById('editTaskDueDate').value
        };

        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updatedTask };
            TaskStorage.saveTasks(this.tasks);
            this.renderTasks();
            this.toggleEditModal();
        }
    }

    toggleModal() {
        const modal = document.getElementById('taskModal');
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    }

    toggleEditModal() {
        const modal = document.getElementById('editModal');
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDrop(e) {
        e.preventDefault();
        const deleteZone = document.getElementById('deleteZone');
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = e.target.closest('.column').dataset.status;
        
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            this.tasks[taskIndex].status = newStatus;
            TaskStorage.saveTasks(this.tasks);
            this.renderTasks();
        }
        deleteZone.classList.remove('active');
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        TaskStorage.saveTasks(this.tasks);
        this.renderTasks();
    }
}

document.addEventListener('DOMContentLoaded', () => new TaskManager());