import Component from '@ember/component';
import layout from '../templates/components/todo-list';
import connect from 'ember-simple-redux/connect';

const TodoList = Component.extend({
  layout,

  tagName: 'ul',

  newTodoTitle: '',

  actions: {
    addNewTodo() {
      this.simpleReduxStore.dispatch({
        type: 'TODO_ADD',
        payload: {
          title: this.get('newTodoTitle'),
        },
      });
      this.set('newTodoTitle', '');
    },
  },
});

const mapStateToProps = state => {
  return {
    todos: state.todos,
  };
};

export default connect(mapStateToProps)(TodoList);
