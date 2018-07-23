const DEFAULT_STATE = {
  todos: [
    {
      title: 'Add more todo items',
      isCompleted: false,
    },
  ],
};

const reducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'TODO_ADD':
      return {
        ...state,
        todos: [...state.todos, payload],
      };

    default:
      return state;
  }
};

export default reducer;
