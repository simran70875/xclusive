export const editData = (dataId) => {
    return {
        type: "EDIT_DATA",
        payload: {
            data: dataId
        }
    }
}