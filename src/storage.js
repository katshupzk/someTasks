class TaskStorage {
    static STORAGE_KEY = 'tasks';

    static getTasks() {
        const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        return tasks.map(task => ({
            id: task.id,
            name: task.name,
            description: task.description,
            status: task.status,
            dueDate: task.dueDate || new Date().toISOString().split('T')[0],
            stars: task.stars || 1
        }));
    }

    static saveTasks(tasks) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    }
}