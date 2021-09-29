/* istanbul ignore file */

// declarative file
const states = {
  authorizeUrl: {
    blacklist: true,
    defaultValue: '#',
  },
  userInfos: {
    blacklist: true,
    defaultValue: {
      connected: false,
      userinfos: '',
    },
  },
};

export default states;
