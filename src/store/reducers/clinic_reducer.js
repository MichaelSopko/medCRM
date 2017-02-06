const defaultState = {
  id: undefined
};

export default function(state = defaultState, action) {
  switch (action.type) {
    case 'SET_CLINIC':
      return {
        ...state,
        ...action.clinic
      };

    default:
      return state;
  }
}