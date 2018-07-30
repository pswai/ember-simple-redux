import chai from 'chai';
import sinonChai from 'sinon-chai';
import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';

chai.use(sinonChai);

setApplication(Application.create(config.APP));
