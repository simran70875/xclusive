export const editUser = (userId) => {
    return {
        type: "EDIT_USER",
        payload: {
            data: userId
        }
    }
}