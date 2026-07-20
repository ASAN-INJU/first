// =======================================
// V12 Ultimate KIS API 연결 모듈
// =======================================

require("dotenv").config();

const axios = require("axios");

let accessToken = null;
let tokenTime = 0;


// =======================================
// Access Token 발급
// =======================================

async function getAccessToken(){

    // 기존 토큰 24시간 사용
    if(accessToken && Date.now() - tokenTime < 23 * 60 * 60 * 1000){
        return accessToken;
    }


    try{

        const url =
        `${process.env.KIS_BASE_URL}/oauth2/tokenP`;


        const body = {
            grant_type:"client_credentials",
            appkey:process.env.APP_KEY,
            appsecret:process.env.APP_SECRET
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


        if(response.data.access_token){

            accessToken =
            response.data.access_token;

            tokenTime = Date.now();

            console.log("KIS TOKEN 발급 성공");

            return accessToken;

        }else{

            console.log(
                "TOKEN ERROR",
                response.data
            );

            throw new Error(
                "토큰 발급 실패"
            );
        }


    }catch(error){

        console.log(
            "토큰 발급 실패:",
            error.response?.data || error.message
        );

        throw error;
    }

}



// =======================================
// 현재가 조회
// =======================================

async function getCurrentPrice(code){

    try{

        const token = await getAccessToken();


        const url =
        `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price`;


        const response =
        await axios.get(
            url,
            {
                headers:{

                    "authorization":
                    `Bearer ${token}`,

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


        const data =
        response.data.output;


        return {

            code:code,

            price:Number(
                data.stck_prpr
            ),

            change:Number(
                data.prdy_ctrt
            ),

            volume:Number(
                data.acml_vol
            )

        };


    }catch(error){

        console.log(
            "주가 조회 실패:",
            error.response?.data || error.message
        );


        return {

            error:
            "주가 조회 실패"

        };

    }

}



module.exports = {

    getCurrentPrice

};
