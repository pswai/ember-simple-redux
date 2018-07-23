import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/list-board';

// This component is purposely kept out of Redux
export default Component.extend({
  layout,

  classNames: ['list-board'],

  listDisplayConfigs: computed(() => [
    {
      id: 0,
      showCompleted: true,
    },
    {
      id: 1,
      showCompleted: false,
    },
  ]),
});
