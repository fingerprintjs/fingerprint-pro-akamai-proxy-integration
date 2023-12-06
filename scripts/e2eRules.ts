export const e2eRules = {
  name: 'E2E Test',
  children: [
    {
      name: 'Test Worker',
      children: [],
      behaviors: [
        {
          name: 'edgeWorker',
          options: {
            enabled: true,
            edgeWorkerId: process.env.TEST_EDGE_WORKER_ID,
            mPulse: true,
            createEdgeWorker: '',
            mPulseInformation: '',
            resourceTier: '',
          },
        },
      ],
      criteria: [],
      criteriaMustSatisfy: 'all',
      comments: '',
    },
  ],
  behaviors: [],
  criteria: [],
  criteriaMustSatisfy: 'all',
  comments: '',
}
