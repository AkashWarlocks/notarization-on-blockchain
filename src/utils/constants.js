const CONTRACT_EVENTS = {
  setData: [
    {
      contractName: 'notarizaion',
      eventName: 'Notarized',
    },
  ],
};

const CONTRACT_ERRORS = {
  E1: 'Document already exists to different user',
  E2: 'Document Doesnot exists',
};
module.exports = { CONTRACT_EVENTS, CONTRACT_ERRORS };
