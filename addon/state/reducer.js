const DEFAULT_STATE = {
  nextId: 1,
  todoLists: [
    {
      id: 0,
      name: 'First List',
    },
    {
      id: 1,
      name: 'Second List',
    },
  ],
  todos: [
    {
      id: 0,
      title: 'Add more todo items',
      isCompleted: false,
      listId: 0,
    },
  ],
};

const reducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'TODO_ADD':
      return {
        ...state,
        nextId: state.nextId + 1,
        todos: [
          ...state.todos,
          {
            id: state.nextId,
            title: payload.title,
            isCompleted: false,
            listId: payload.listId,
          },
        ],
      };

    case 'TODO_TOGGLE_COMPLETE':
      return {
        ...state,
        todos: state.todos.map(todo => {
          if (todo.id === payload.todoId) {
            return {
              ...todo,
              isCompleted: !todo.isCompleted,
            };
          }
          return todo;
        }),
      };

    default:
      return state;
  }
};

export default reducer;
