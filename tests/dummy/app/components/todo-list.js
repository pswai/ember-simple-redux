import Component from '@ember/component';
import layout from '../templates/components/todo-list';
import { connect } from 'ember-simple-redux';

const TodoList = Component.extend({
  layout,

  classNames: ['todo-list'],

  newTodoTitle: '',

  actions: {
    addNewTodo() {
      this.simpleReduxStore.dispatch({
        type: 'TODO_ADD',
        payload: {
          title: this.get('newTodoTitle'),
          listId: this.get('id'),
        },
      });
      this.set('newTodoTitle', '');
    },
  },
});

const mapStateToProps = (state, ownProps) => {
  const { id, showCompleted } = ownProps;
  return {
    todos: state.todos.filter(todo => {
      const isInList = todo.listId === id;
      return showCompleted ? isInList : isInList && !todo.isCompleted;
    }),
  };
};

export default connect(mapStateToProps)(TodoList);
