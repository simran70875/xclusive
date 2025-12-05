export const editProduct = (productId) => {
    return {
        type: "EDIT_PRODUCT",
        payload: {
            data: productId
        }
    }
}