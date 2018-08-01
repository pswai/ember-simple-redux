export const addTodo = (listId, title) => ({
  type: 'TODO_ADD',
  payload: {
    title,
    listId,
  },
});

export const toggleTodoComplete = todoId => ({
  type: 'TODO_TOGGLE_COMPLETE',
  payload: {
    todoId,
  },
});
