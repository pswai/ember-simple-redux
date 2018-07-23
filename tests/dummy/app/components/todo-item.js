import Component from '@ember/component';
import layout from '../templates/components/todo-item';

export default Component.extend({
  layout,

  tagName: 'li',

  actions: {
    toggleComplete() {
      this.simpleReduxStore.dispatch({
        type: 'TODO_TOGGLE_COMPLETE',
        payload: {
          todoId: this.get('todo.id'),
        },
      });
    },
  },
});
