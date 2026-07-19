// =======================================
// V12 Ultimate KIS API
// 현재가 + 거래량 조회
// =======================================

require("dotenv").config();

const axios = require("axios");

let accessToken = null;


// =======================================
// Access Token 발급
// =======================================

async function getToken(){

    const url =
    `${process.env.KIS_BASE_URL}/oauth2/tokenP`;


    const body = {

        grant_type: "client_credentials",

        appkey: process.env.APP_KEY,

        appsecret: process.env.APP_SECRET

    };


    const response = await axios.post(
        url,
        body,
        {
            headers:{
                "content-type":"application/json"
            }
        }
    );


    accessToken = response.data.access_token;


    return accessToken;

}



// =======================================
// 현재가 + 거래량 조회
// =======================================

async function getStockInfo(code){


    if(!accessToken){

        await getToken();

    }



    const url =
    `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price`;



    const response = await axios.get(

        url,

        {

            headers:{

                "content-type":"application/json",

                "authorization":
                `Bearer ${accessToken}`,

                "appkey":
                process.env.APP_KEY,

                "appsecret":
                process.env.APP_SECRET,

                "tr_id":
                "FHKST01010100"

            },


            params:{

                FID_COND_MRKT_DIV_CODE:"J",

                FID_INPUT_ISCD:code

            }

        }

    );



    const data = response.data.output;



    return {


        code:code,


        price:Number(data.stck_prpr),


        volume:Number(data.acml_vol),


        change:Number(data.prdy_ctrt)


    };


}



// =======================================
// Export
// =======================================

module.exports = {

    getStockInfo

};
