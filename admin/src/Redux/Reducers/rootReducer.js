import { combineReducers } from 'redux'
import CategoryDataChange from './BackendReducers/CategoryReducer'
import BannerDataChange from './BackendReducers/BannerReducer'
import DataChange from './BackendReducers/DataReducer'
import { VariationSizeDataChange, VariationDataChange } from './BackendReducers/VariationReducer'
import ProductDataChange from './BackendReducers/ProductReducer'
import UserDataChange from './FrontendReducers/UserReducers'
import CouponDataChange from './FrontendReducers/CopuponReducers'
import OrderDataChange from './FrontendReducers/OrderReducer'
import ProductBannerDataChange from './BackendReducers/ProductBannerReducer'
import AdminDataChange from './AdminReducers/AdminReducer'




const rootReducer = combineReducers({
    CategoryDataChange,
    BannerDataChange,
    DataChange,
    ProductDataChange,
    VariationDataChange,
    VariationSizeDataChange,
    UserDataChange,
    CouponDataChange,
    OrderDataChange,
    ProductBannerDataChange,
    AdminDataChange
})

export default rootReducer

