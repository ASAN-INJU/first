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


    try{

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


        tokenTime =
        Date.now();


        console.log("KIS TOKEN 발급 성공");


        return accessToken;


    }catch(error){

        console.log(
            "TOKEN ERROR",
            error.response?.data || error.message
        );

        throw error;
    }

}



// =======================================
// 현재가 조회
// =======================================

async function getCurrentPrice(code){


    const token =
    await getAccessToken();



    const url =
    `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price`;



    try{


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

        });



        const data =
        response.data.output;



        return {

            code,

            price:
            Number(data.stck_prpr),

            change:
            Number(data.prdy_ctrt),

            volume:
            Number(data.acml_vol)

        };



    }catch(error){


        console.log(
            "PRICE ERROR",
            error.response?.data || error.message
        );


        return {

            code,

            price:0,

            change:0,

            volume:0

        };

    }

}



// =======================================
// 일봉 데이터 조회
// =======================================

async function getDailyPrice(code){


    const token =
    await getAccessToken();



    const url =
    `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice`;



    try{


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


                FID_INPUT_DATE_1:"20260101",

                FID_INPUT_DATE_2:
                new Date()
                .toISOString()
                .slice(0,10)
                .replace(/-/g,""),


                FID_PERIOD_DIV_CODE:"D",

                FID_ORG_ADJ_PRC:"1"

            }

        });



        console.log(
    "DAILY LENGTH",
    response.data.output2?.length
);

console.log(
    "DAILY SAMPLE",
    response.data.output2?.[0]
);


        return response.data.output2 || [];



    }catch(error){


        console.log(

            "DAILY ERROR",

            error.response?.data || error.message

        );


        return [];

    }

}



// =======================================
// 평균 계산
// =======================================

function average(arr){


    if(!arr || arr.length===0)

        return 0;



    return Math.round(

        arr.reduce(
            (a,b)=>a+b,
            0
        )
        /
        arr.length

    );

}



// =======================================
// 이동평균 계산
// =======================================

async function getMovingAverage(code){


    const candles =
    await getDailyPrice(code);



    if(candles.length===0){


        return {

            ma5:0,

            ma20:0,

            ma60:0

        };

    }



    const prices =

    candles

    .slice(0,60)

    .map(

        item =>
        Number(item.stck_clpr)

    )

    .filter(
        price=>price>0
    );




    return {


        ma5:

        average(
            prices.slice(0,5)
        ),



        ma20:

        average(
            prices.slice(0,20)
        ),



        ma60:

        average(
            prices.slice(0,60)
        )


    };


}



// =======================================

module.exports = {


    getCurrentPrice,


    getDailyPrice,


    getMovingAverage


};
