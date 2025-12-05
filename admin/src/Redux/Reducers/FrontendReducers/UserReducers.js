const initialState = {
    payload: []
}


const UserDataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_USER":
            const { data } = action.payload
            return {
                payload: data
            }

        default:
            return state
    }
}

export default UserDataChange