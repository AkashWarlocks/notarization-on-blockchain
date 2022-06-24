const CONTRACT_EVENTS = {
  setData: [
    {
      contractName: 'notarizaion',
      eventName: 'Notarized',
    },
  ],
};

const CONTRACT_ERRORS = {
  E1: {
    message: 'Document already exists to different user',
    uploadSuccess: false,
  },
  E2: { message: 'Document Doesnot exists' },
};
module.exports = { CONTRACT_EVENTS, CONTRACT_ERRORS };
