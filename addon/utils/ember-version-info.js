import Ember from 'ember';
import semver from 'semver';

const emberVersionInfo = () => {
  const [major, minor] = Ember.VERSION.split('.');
  // const isGlimmer = major > 2 || (major == 2 && minor >= 10); // >= 2.10
  const isGlimmer = semver.gte(Ember.VERSION, '2.10');
  return { major, minor, isGlimmer };
};

export default emberVersionInfo;
