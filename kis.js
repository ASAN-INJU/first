require("dotenv").config();

const axios = require("axios");

let accessToken = null;


// ================================
// 한국투자증권 Access Token 발급
// ================================
async function getAccessToken() {

    if (accessToken) {
        return accessToken;
    }

    try {

        const response = await axios.post(
            `${process.env.KIS_BASE_URL}/oauth2/tokenP`,
            {
                grant_type: "client_credentials",
                appkey: process.env.APP_KEY,
                appsecret: process.env.APP_SECRET
            },
            {
                headers: {
                    "content-type": "application/json"
                }
            }
        );


        accessToken = response.data.access_token;

        console.log("KIS TOKEN OK");

        return accessToken;


    } catch (error) {

        console.log(
            "KIS TOKEN ERROR",
            error.response?.data || error.message
        );

        throw error;
    }

}


// ================================
// 현재가 조회
// ================================
async function getCurrentPrice(code) {

    const token = await getAccessToken();


    try {

        const response = await axios.get(

            `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price`,

            {
                headers: {

                    "authorization": `Bearer ${token}`,

                    "appkey": process.env.APP_KEY,

                    "appsecret": process.env.APP_SECRET,

                    "tr_id": "FHKST01010100"

                },

                params: {

                    "fid_cond_mrkt_div_code": "J",

                    "fid_input_iscd": code

                }

            }

        );


        return response.data;


    } catch(error) {

        console.log(
            "PRICE ERROR",
            error.response?.data || error.message
        );

        throw error;

    }

}


module.exports = {

    getAccessToken,

    getCurrentPrice

};
