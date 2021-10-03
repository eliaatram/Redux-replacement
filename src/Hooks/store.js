import { useState, useEffect } from 'react';

/**
 * custom redux like store implementation
 * we have some variables that are not global, not registered on the window object, 
 * but which do exist in this file, and they only exist once in our application lifetime, 
 * so they're shared in the entire application, every other file which imports from this file will use 
 * the same values which are stored here.
 * then in the same file we create our own custom hook (keep in mind that the variables are
 *  defined outside of the hook, and that's an important thing because 
 * if they were defined inside of the hook, then every component that uses this hook will use its own vlaues,
 *  since they're defined outside of the hook every component that uses the custom hook uses the same values, 
 * so now we're not just sharing the hook logic, but also some shared data,we absolutely do want this because this allows us to globally manage some state,
 *  some actions and listeners, which are interested in state changes, which in return are triggered by actions in our use store hook)
 */

let globalState = {};
let listeners = [];
let actions = {};

export const useStore = (shouldListen = true) => {
    const setState = useState(globalState)[1];

    // the 'dispatch' function makes sure that whenever we call dispatch, 
    // we update our global state and we call our listeners
    // where our listeners are in the end just said state calls where we abuse
    const dispatch = (actionIdentifier, payload) => {
        const newState = actions[actionIdentifier](globalState, payload);
        globalState = { ...globalState, ...newState };

        // updates react state with new global state, hence react will
        // re render the component that is using the custom hook
        for (const listener of listeners) {
            listener(globalState);
        }
    };

    // here we register 1 listener per component with the help
    // of useEffect and unregister it when that component is destroyed
    useEffect(() => {
        if (shouldListen) {
            listeners.push(setState);

            return () => {
                listeners = listeners.filter(listener => listener !== setState);
            }
        }
    }, [setState, shouldListen]);

    return [globalState, dispatch]; // similar to useReducer that returns a state and a dispatch function
};

// here we have a way of initializing out store, which we can
// call multiple time because we're not replacing our global state
// or replacing our actions, instead we're always taking the current
// global state and the current actions map to merge in new data
// we're doing this so that we can create concrete store slices, just as
// we were doing it with redux with multiple reducers
// this function will get some action defined by the developer
// and an initial state
export const initStore = (userActions, initialState) => {
    if (initialState) {
        globalState = { ...globalState, ...initialState };
    }

    actions = { ...actions, ...userActions };
}