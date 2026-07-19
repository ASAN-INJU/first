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

async function getToken() {

    console.log("===== ENV CHECK =====");
    console.log("KIS_BASE_URL:", process.env.KIS_BASE_URL);
    console.log("APP_KEY:", process.env.APP_KEY ? "OK" : "NONE");
    console.log("APP_SECRET:", process.env.APP_SECRET ? "OK" : "NONE");

    const url = `${process.env.KIS_BASE_URL}/oauth2/tokenP`;

    console.log("TOKEN URL:", url);

    const body = {
        grant_type: "client_credentials",
        appkey: process.env.APP_KEY,
        appsecret: process.env.APP_SECRET
    };

    const response = await axios.post(
        url,
        body,
        {
            headers: {
                "content-type": "application/json"
            }
        }
    );

    accessToken = response.data.access_token;

    return accessToken;
}
    const url = `${process.env.KIS_BASE_URL}/oauth2/tokenP`;

    console.log("TOKEN URL:", url);

    ...
}
    
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
