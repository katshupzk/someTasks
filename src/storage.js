class TaskStorage {
    static getTasks() {
        const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        return tasks.map(task => ({
            ...task,
            dueDate: task.dueDate || new Date().toISOString().split('T')[0]
        }));
    }

    static saveTasks(tasks) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    }
}