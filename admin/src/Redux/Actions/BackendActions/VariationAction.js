export const editVariation = (variationId) => {
    return {
        type: "EDIT_VARIATION",
        payload: {
            data: variationId
        }
    }
}

export const showVariation = (variationId) => {
    return {
        type: "SHOW_VARIATION",
        payload: {
            datas: variationId
        }
    }
}

export const showVariationSize = (sizeId) => {
    return {
        type: "SHOW_VARIATION_SIZE",
        payload: {
            sizedata: sizeId
        }
    }
}