import { rest } from 'msw';

export const handlers = [
  // Mock tRPC API endpoints
  rest.post('/api/trpc/*', (req, res, ctx) => {
    return res(
      ctx.json({
        result: {
          data: {
            success: true,
          },
        },
      })
    );
  }),

  // Mock Clerk webhooks
  rest.post('/api/webhooks/clerk', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),

  // Mock Supabase API
  rest.post('*/rest/v1/*', (req, res, ctx) => {
    return res(ctx.json({ data: [] }));
  }),

  // Mock Google AI API
  rest.post('*/v1beta/models/*:generateContent', (req, res, ctx) => {
    return res(
      ctx.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    positionName: 'Software Developer',
                    categories: [
                      {
                        name: 'Programming',
                        numId: 1,
                        skills: [
                          {
                            name: 'JavaScript',
                            numId: 1,
                            competencies: [
                              { name: 'DOM Manipulation', numId: 1, selected: true },
                            ],
                          },
                        ],
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      })
    );
  }),
];