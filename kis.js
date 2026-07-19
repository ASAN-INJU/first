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
// =======================================
// KIS 현재가 + 거래량 조회
// =======================================

require("dotenv").config();

let accessToken = null;


// 토큰 발급
async function getToken(){

    const url = `${process.env.KIS_BASE_URL}/oauth2/tokenP`;

    const body = {
        grant_type:"client_credentials",
        appkey:process.env.APP_KEY,
        appsecret:process.env.APP_SECRET
    };

    const res = await axios.post(url, body);

    accessToken = res.data.access_token;

    return accessToken;
}


// 현재가 + 거래량 조회
async function getStockInfo(code){

    if(!accessToken){
        await getToken();
    }


    const url =
    `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price`;


    const res = await axios.get(url,{
        headers:{
            "content-type":"application/json",
            authorization:`Bearer ${accessToken}`,
            appkey:process.env.APP_KEY,
            appsecret:process.env.APP_SECRET,
            tr_id:"FHKST01010100"
        },
        params:{
            FID_COND_MRKT_DIV_CODE:"J",
            FID_INPUT_ISCD:code
        }
    });


    const data=res.data.output;


    return {

        code:code,

        price:Number(data.stck_prpr),

        volume:Number(data.acml_vol),

        change:Number(data.prdy_ctrt)

    };

}


module.exports={
    getStockInfo
};
