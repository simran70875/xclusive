export const editCategory = (categoryId) => {
    return {
        type: "EDIT_CATEGORY",
        payload: {
            data: categoryId
        }
    }
}