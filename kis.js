// =======================================
// V12 Ultimate KIS API 연결 모듈
// 현재가 + 일봉 + 이동평균 계산
// =======================================

require("dotenv").config();

const axios = require("axios");


let accessToken = null;
let tokenTime = 0;


// =======================================
// Access Token
// =======================================

async function getAccessToken(){

    if(
        accessToken &&
        Date.now() - tokenTime < 23 * 60 * 60 * 1000
    ){
        return accessToken;
    }


    const url =
    `${process.env.KIS_BASE_URL}/oauth2/tokenP`;


    const response =
    await axios.post(
        url,
        {
            grant_type:"client_credentials",
            appkey:process.env.APP_KEY,
            appsecret:process.env.APP_SECRET
        },
        {
            headers:{
                "content-type":"application/json"
            }
        }
    );


    accessToken =
    response.data.access_token;


    tokenTime = Date.now();


    console.log("KIS TOKEN 발급 성공");


    return accessToken;

}



// =======================================
// 현재가 조회
// =======================================

async function getCurrentPrice(code){

    const token =
    await getAccessToken();


    const url =
    `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price`;


    const response =
    await axios.get(
        url,
        {
            headers:{

                authorization:
                `Bearer ${token}`,

                appkey:
                process.env.APP_KEY,

                appsecret:
                process.env.APP_SECRET,

                tr_id:
                "FHKST01010100"

            },

            params:{

                FID_COND_MRKT_DIV_CODE:"J",

                FID_INPUT_ISCD:code

            }
        }
    );


    const data =
    response.data.output;


    return {

        code:code,

        price:Number(data.stck_prpr),

        change:Number(data.prdy_ctrt),

        volume:Number(data.acml_vol)

    };

}



// =======================================
// 일봉 데이터 조회
// =======================================

async function getDailyPrice(code){


    const token =
    await getAccessToken();



    const url =
    `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice`;



    const response =
    await axios.get(
        url,
        {

        headers:{

            authorization:
            `Bearer ${token}`,

            appkey:
            process.env.APP_KEY,

            appsecret:
            process.env.APP_SECRET,

            tr_id:
            "FHKST03010100"

        },


        params:{


            FID_COND_MRKT_DIV_CODE:"J",

            FID_INPUT_ISCD:code,

            FID_PERIOD_DIV_CODE:"D",

            FID_ORG_ADJ_PRC:"1"

        }

    });



    return response.data.output2 || [];

}



// =======================================
// 이동평균 계산
// =======================================

function average(arr){

    if(arr.length===0)
        return 0;


    return Math.round(
        arr.reduce((a,b)=>a+b,0)
        /
        arr.length
    );

}



async function getMovingAverage(code){


    const candles =
    await getDailyPrice(code);



    const prices =
    candles
    .slice(0,60)
    .map(
        item =>
        Number(item.stck_clpr)
    );



    return {

        ma5:
        average(prices.slice(0,5)),


        ma20:
        average(prices.slice(0,20)),


        ma60:
        average(prices.slice(0,60))

    };

}




module.exports = {

    getCurrentPrice,

    getMovingAverage

};
