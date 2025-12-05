const initialState = {
    payload: []
}


const MemberShipDataChange = (state = initialState, action) => {
    switch (action.type) {
        case "EDIT_MEMBERSHIP":
            const { data } = action.payload
            return {
                payload: data
            }

        default:
            return state
    }
}

export default MemberShipDataChange