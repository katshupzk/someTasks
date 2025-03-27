class TaskManager {
    constructor() {
        this.tasks = TaskStorage.getTasks();
        this.currentFilter = 0;
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

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = parseInt(e.target.dataset.stars);
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderTasks();
            });
        });

        document.querySelectorAll('.tasks').forEach(column => {
            column.addEventListener('dragover', this.handleDragOver);
            column.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    initDeleteZone() {
        const deleteZone = document.getElementById('deleteZone');
        
        document.addEventListener('dragstart', () => deleteZone.classList.add('active'));
        document.addEventListener('dragend', () => deleteZone.classList.remove('active'));
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) taskEl.classList.add('overdue');

        const [year, month, day] = task.dueDate.split('-');
        const stars = '☆'.repeat(task.stars);
        
        taskEl.innerHTML = `
            <button class="edit-btn">✎</button>
            <h3>${task.name}</h3>
            <p>${task.description}</p>
            <div class="stars-container">${stars}</div>
            <small>ID: ${task.id}</small>
            <small class="task-due">${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}</small>
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

        const filteredTasks = this.currentFilter === 0 
            ? this.tasks 
            : this.tasks.filter(task => task.stars === this.currentFilter);

        Object.values(columns).forEach(column => column.innerHTML = '');
        filteredTasks.forEach(task => columns[task.status].appendChild(this.createTaskElement(task)));
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const newTask = {
            id: this.generateId(),
            name: document.getElementById('taskName').value,
            description: document.getElementById('taskDesc').value,
            status: document.getElementById('taskStatus').value,
            dueDate: document.getElementById('taskDueDate').value,
            stars: parseInt(document.getElementById('taskStars').value)
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
        document.getElementById('editTaskStars').value = task.stars;

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
            dueDate: document.getElementById('editTaskDueDate').value,
            stars: parseInt(document.getElementById('editTaskStars').value)
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
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = e.target.closest('.column').dataset.status;
        
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            this.tasks[taskIndex].status = newStatus;
            TaskStorage.saveTasks(this.tasks);
            this.renderTasks();
        }
        document.getElementById('deleteZone').classList.remove('active');
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        TaskStorage.saveTasks(this.tasks);
        this.renderTasks();
    }
}

document.addEventListener('DOMContentLoaded', () => new TaskManager());