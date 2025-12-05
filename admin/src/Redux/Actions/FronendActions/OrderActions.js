export const editOrder = (orderId) => {
    return {
        type: "EDIT_ORDER",
        payload: {
            data: orderId
        }
    }
}