import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertBox from "../../../Components/AlertComp/AlertBox";

let url = process.env.REACT_APP_API_URL

const AddChargesSettings = () => {

    const adminToken = localStorage.getItem('token');
    const Navigate = useNavigate();
    const [existingCharges, setExistingCharges] = useState({});

    useEffect(() => {
        async function getExistingCharges() {
            try {
                const response = await axios.get(`${url}/charges/get`,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    });

                console.log("get charges response ==> ", response)
                setExistingCharges(response?.data?.Charges || {});
            } catch (error) {
                console.error(error);
            }
        }

        getExistingCharges();
    }, [adminToken]);

    useEffect(() => {
        setShipCharge(existingCharges.Normal_Ship_Charge || 0);
        setGoldShipCharge(existingCharges.Gold_Ship_Charge || 0);
        setSilverShipCharge(existingCharges.Silver_Ship_Charge || 0);
        setPpoShipCharge(existingCharges.PPO_Ship_Charge || 0);
        setCouponDiscount(existingCharges.Normal_Coup_Disc || 0);
        setGoldCoupDisc(existingCharges.Gold_Coup_Disc || 0);
        setSilverCoupDisc(existingCharges.Silver_Coup_Disc || 0);
        setPpoCoupDisc(existingCharges.PPO_Coup_Disc || 0);
        setCoins_reward_user(existingCharges.coins_reward_user || 0);
        setCoins_reward_gold(existingCharges.coins_reward_gold || 0);
        setCoins_reward_silver(existingCharges.coins_reward_silver || 0);
        setCoins_reward_ppo(existingCharges.coins_reward_ppo || 0);
        setUsage_limit_reseller(existingCharges.usage_limit_reseller || 0)
        setUsage_limit_user(existingCharges.usage_limit_user || 0)

    }, [existingCharges]);

    const [shipCharge, setShipCharge] = useState(existingCharges.Normal_Ship_Charge || 0);
    const [goldShipCharge, setGoldShipCharge] = useState(existingCharges.Gold_Ship_Charge || 0);
    const [silverShipCharge, setSilverShipCharge] = useState(existingCharges.Silver_Ship_Charge || 0);
    const [ppoShipCharge, setPpoShipCharge] = useState(existingCharges.PPO_Ship_Charge || 0);
    const [couponDiscount, setCouponDiscount] = useState(existingCharges.Normal_Coup_Disc || 0);
    const [goldCoupDisc, setGoldCoupDisc] = useState(existingCharges.Gold_Coup_Disc || 0);
    const [silverCoupDisc, setSilverCoupDisc] = useState(existingCharges.Silver_Coup_Disc || 0);
    const [ppoCoupDisc, setPpoCoupDisc] = useState(existingCharges.PPO_Coup_Disc || 0);
    const [coins_reward_user, setCoins_reward_user] = useState(existingCharges.coins_reward_user || 0)
    const [coins_reward_gold, setCoins_reward_gold] = useState(existingCharges.coins_reward_gold || 0)
    const [coins_reward_silver, setCoins_reward_silver] = useState(existingCharges.coins_reward_silver || 0)
    const [coins_reward_ppo, setCoins_reward_ppo] = useState(existingCharges.coins_reward_ppo || 0)
    const [usage_limit_user, setUsage_limit_user] = useState(existingCharges.usage_limit_user || 0)
    const [usage_limit_reseller, setUsage_limit_reseller] = useState(existingCharges.usage_limit_reseller || 0)


    const [chargesAddStatus, setChargesAddStatus] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const charges = {
            normalShipCharge: shipCharge,
            goldShipCharge: goldShipCharge,
            silverShipCharge: silverShipCharge,
            ppoShipCharge: ppoShipCharge,
            normalcoupdisc: couponDiscount,
            goldcoupdisc: goldCoupDisc,
            silvercoupdisc: silverCoupDisc,
            ppocoupdisc: ppoCoupDisc,
            coins_reward_user: coins_reward_user,
            coins_reward_gold: coins_reward_gold,
            coins_reward_silver: coins_reward_silver,
            coins_reward_ppo: coins_reward_ppo,
            usage_limit_user: usage_limit_user,
            usage_limit_reseller: usage_limit_reseller,
        };

        try {
            const response = await axios.patch(`${url}/charges/update/${existingCharges?._id}`, charges,
            // const response = await axios.post(`${url}/charges/add`, charges,
                {
                    headers: {
                        Authorization: `${adminToken}`,
                    },
                });
            if (response.data.type === 'success') {
                setChargesAddStatus(response.data.type);
                setStatusMessage(response.data.message);
                setTimeout(() => {
                    Navigate('/');
                }, 900);
            } else {
                setChargesAddStatus(response.data.type);
                setStatusMessage(response.data.message);
            }
        } catch (error) {
            console.error(error);
            setChargesAddStatus('error');
            setStatusMessage('Charges not added!');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setChargesAddStatus('');
            setStatusMessage('');
        }, 1500);

        return () => clearTimeout(timer);
    }, [chargesAddStatus, statusMessage]);


    return (
        <>
            <div className="main-content dark">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="page-title-box d-flex align-items-center justify-content-between">
                                    <div className="col-3 table-heading">
                                        Add Charges Settings
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <div className="">
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3 row">

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        Shipping Charge for Normal User :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={shipCharge}
                                                            onChange={(e) => {
                                                                setShipCharge(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        Shipping Charge for Gold Reseller :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={goldShipCharge}
                                                            onChange={(e) => {
                                                                setGoldShipCharge(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        Shipping Charge for Silver Reseller  :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={silverShipCharge}
                                                            onChange={(e) => {
                                                                setSilverShipCharge(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        Shipping Charge for PPO Reseller  :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={ppoShipCharge}
                                                            onChange={(e) => {
                                                                setPpoShipCharge(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        User Coupon Discount :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={couponDiscount}
                                                            onChange={(e) => {
                                                                setCouponDiscount(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        User Coupon Discount (Gold)  :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={goldCoupDisc}
                                                            onChange={(e) => {
                                                                setGoldCoupDisc(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        User Coupon Discount (Silver) :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={silverCoupDisc}
                                                            onChange={(e) => {
                                                                setSilverCoupDisc(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        User Coupon Discount (PPO) :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={ppoCoupDisc}
                                                            onChange={(e) => {
                                                                setPpoCoupDisc(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        User Coin Earnings :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={coins_reward_user}
                                                            onChange={(e) => {
                                                                setCoins_reward_user(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        Gold Reseller Coin Earnings:
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={coins_reward_gold}
                                                            onChange={(e) => {
                                                                setCoins_reward_gold(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        Silver Reseller Coin Earnings :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={coins_reward_silver}
                                                            onChange={(e) => {
                                                                setCoins_reward_silver(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        PPO Reseller Coin Earnings :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={coins_reward_ppo}
                                                            onChange={(e) => {
                                                                setCoins_reward_ppo(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        Usage Limit For Retailer :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={usage_limit_user}
                                                            onChange={(e) => {
                                                                setUsage_limit_user(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3 row">
                                                    <label
                                                        htmlFor="example-text-input"
                                                        className="col-md-2 col-form-label"
                                                    >
                                                        Usage Limit For Resellers :
                                                    </label>
                                                    <div className="col-md-10">
                                                        <input min="0"
                                                            required
                                                            className="form-control"
                                                            type="number"
                                                            id="example-number-input"
                                                            value={usage_limit_reseller}
                                                            onChange={(e) => {
                                                                setUsage_limit_reseller(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="row mb-10">
                                                <div className="col ms-auto">
                                                    <div className="d-flex flex-reverse flex-wrap gap-2">
                                                        <button className="btn btn-danger" onClick={() => Navigate('/showCategory')}>
                                                            {" "}
                                                            <i className="fas fa-window-close"></i> Cancel{" "}
                                                        </button>
                                                        <button className="btn btn-success" type="submit">
                                                            {" "}
                                                            <i className="fas fa-save"></i> Save{" "}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AlertBox status={chargesAddStatus} statusMessage={statusMessage} />
            </div>
        </>
    )
}

export default AddChargesSettings
