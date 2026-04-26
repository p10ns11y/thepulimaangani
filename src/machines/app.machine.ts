import { assign, setup } from 'xstate'

import { prosodyLabMachine } from '#/machines/prosodyLab.machine'

export type AppLook = 'real' | 'redpill'

export type AppContext = {
  look: AppLook
}

export type AppEvent = { type: 'app.LOOK.TOGGLE' } | { type: 'app.LOOK.SET'; look: AppLook }

/**
 * App shell: `ui.look` (real / redpill); `prosody` child is the prosody lab domain actor. Legacy `localStorage` is normalized in `applyLook` / `legacyLookStorage`.
 */
export const appMachine = setup({
  types: {
    context: {} as AppContext,
    events: {} as AppEvent,
  },
  actors: {
    prosody: prosodyLabMachine,
  },
}).createMachine({
  id: 'app',
  context: { look: 'real' },
  initial: 'running',
  states: {
    running: {
      type: 'parallel',
      states: {
        ui: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                'app.LOOK.TOGGLE': {
                  actions: assign({
                    look: ({ context }) => (context.look === 'real' ? 'redpill' : 'real'),
                  }),
                },
                'app.LOOK.SET': {
                  actions: assign({
                    look: ({ event }) => {
                      if (event.type !== 'app.LOOK.SET') return 'real' satisfies AppLook
                      return event.look
                    },
                  }),
                },
              },
            },
          },
        },
        prosody: {
          invoke: {
            id: 'prosody',
            src: 'prosody',
          },
        },
      },
    },
  },
})
