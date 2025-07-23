const initialState = {
    queue: [], // [{ id, message, type }]
};

export default function toastReducer(state = initialState, action) {
    switch (action.type) {
        case 'SHOW_TOAST':
            return {
                ...state,
                queue: [...state.queue, { id: Date.now(), ...action.payload }],
            };
        case 'REMOVE_TOAST':
            return {
                ...state,
                queue: state.queue.slice(1),
            };
        default:
            return state;
    }
}
