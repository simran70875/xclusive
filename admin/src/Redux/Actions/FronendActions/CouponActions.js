export const editCoupon = (couponId) => {
    return {
        type: "EDIT_COUPON",
        payload: {
            data: couponId
        }
    }
}