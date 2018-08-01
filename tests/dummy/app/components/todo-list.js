import Component from '@ember/component';
import { connect } from 'ember-simple-redux';
import layout from '../templates/components/todo-list';
import * as actionCreators from '../state/actionCreators';

const TodoList = Component.extend({
  layout,

  classNames: ['todo-list'],

  newTodoTitle: '',

  actions: {
    addNewTodo() {
      this.get('addTodo')(this.get('id'), this.get('newTodoTitle'));
      this.set('newTodoTitle', '');
    },
  },
});

// Depending on your need, you can separate this to another file
// https://redux.js.org/faq/codestructure
const mapStateToProps = (state, ownProps) => {
  const { id, showCompleted } = ownProps;
  return {
    todos: state.todos.filter(todo => {
      const isInList = todo.listId === id;
      return showCompleted ? isInList : isInList && !todo.isCompleted;
    }),
  };
};

const mapDispatchToProps = actionCreators;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList);
