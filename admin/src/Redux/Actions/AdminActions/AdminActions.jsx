export const editSubAdmin = (adminId) => {
    return {
        type: "EDIT_SUB_ADMIN",
        payload: {
            data: adminId
        }
    }
}
