# ember-simple-redux

`react-redux`-compatible way to use Redux in Ember applications.

## Installation

```
ember install ember-simple-redux
```

## Usage

`ember-simple-redux` provides a `connect()` function with identical interface
with the one provided by `react-redux`.

Whatever you have learned for `react-redux` can be applied here. This is
especially useful if you are migrating Ember to React since your `connect()`
codes is now framework-agnostic!

Find `react-redux` [documentation here](https://github.com/reduxjs/react-redux)!

### Basic Usage

```javascript
import { connect } from 'ember-simple-redux';
import TodoList from 'my-app/components/todo-list';

const mapStateToProps = state => ({
  todos: state.todos,
});

export default connect(mapStateToProps)(TodoList);
```

## Prior Arts

- [ember-redux](https://github.com/ember-redux/ember-redux)
- [ember-cli-redux](https://github.com/AltSchool/ember-cli-redux)

## Contributing

### Installation

- `git clone <repository-url>`
- `cd ember-simple-redux`
- `yarn install`

### Linting

- `yarn lint:js`
- `yarn lint:js --fix`

### Running tests

- `ember test` – Runs the test suite on the current Ember version
- `ember test --server` – Runs the test suite in "watch mode"
- `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

- `ember serve`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## License

This project is licensed under the [MIT License](LICENSE.md).
