export const editMemberShip = (shipId) => {
    return {
        type: "EDIT_MEMBERSHIP",
        payload: {
            data: shipId
        }
    }
}