import { createConnect } from 'react-redux/lib/connect/connect';
import connectAdvanced from './connectAdvanced';

export default createConnect({
  connectHOC: connectAdvanced,
});
