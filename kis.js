// =======================================
// V12 Ultimate KIS API 연결 모듈
// 현재가 + 일봉 + 이동평균 계산
// API 호출 제한 대응 안정화 버전
// =======================================

require("dotenv").config();

const axios = require("axios");


// =======================================
// Access Token
// =======================================

let accessToken = null;
let tokenTime = 0;


// =======================================
// 일봉 데이터 캐시
// =======================================

let dailyCache = {};
let dailyCacheTime = {};

const CACHE_TIME =
    5 * 60 * 1000;


// =======================================
// API 호출 간격 제한
// =======================================

let lastDailyRequestTime = 0;

const DAILY_REQUEST_INTERVAL =
    2000;


// =======================================
// 잠시 기다리기
// =======================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );

}


// =======================================
// Access Token 발급
// =======================================

async function getAccessToken() {

    if (
        accessToken &&
        Date.now() - tokenTime <
        23 * 60 * 60 * 1000
    ) {

        return accessToken;

    }


    const url =
        `${process.env.KIS_BASE_URL}/oauth2/tokenP`;


    try {

        const response =
            await axios.post(
                url,
                {
                    grant_type:
                        "client_credentials",

                    appkey:
                        process.env.APP_KEY,

                    appsecret:
                        process.env.APP_SECRET
                },
                {
                    headers: {
                        "content-type":
                            "application/json"
                    }
                }
            );


        accessToken =
            response.data.access_token;


        tokenTime =
            Date.now();


        console.log(
            "KIS TOKEN 발급 성공"
        );


        return accessToken;


    }

    catch (error) {

        console.log(
            "TOKEN ERROR",
            error.response?.data ||
            error.message
        );


        throw error;

    }

}


// =======================================
// 현재가 조회
// =======================================

async function getCurrentPrice(code) {

    const token =
        await getAccessToken();


    const url =
        `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price`;


    try {

        const response =
            await axios.get(
                url,
                {

                    headers: {

                        authorization:
                            `Bearer ${token}`,

                        appkey:
                            process.env.APP_KEY,

                        appsecret:
                            process.env.APP_SECRET,

                        tr_id:
                            "FHKST01010100"

                    },

                    params: {

                        FID_COND_MRKT_DIV_CODE:
                            "J",

                        FID_INPUT_ISCD:
                            code

                    }

                }
            );


        const data =
            response.data.output;


        console.log(
            "CURRENT PRICE",
            code,
            data?.stck_prpr
        );


        return {

            code,

            price:
                Number(
                    data?.stck_prpr || 0
                ),

            change:
                Number(
                    data?.prdy_ctrt || 0
                ),

            volume:
                Number(
                    data?.acml_vol || 0
                )

        };


    }

    catch (error) {

        console.log(
            "PRICE ERROR",
            error.response?.data ||
            error.message
        );


        throw error;

    }

}


// =======================================
// 일봉 데이터 조회
// API 호출 제한 대응
// =======================================

async function getDailyPrice(code) {

    // -----------------------------------
    // 1. 캐시 확인
    // -----------------------------------

    if (
        dailyCache[code] &&
        dailyCache[code].length > 0 &&
        Date.now() -
        dailyCacheTime[code] <
        CACHE_TIME
    ) {

        console.log(
            "DAILY CACHE 사용",
            code
        );


        return dailyCache[code];

    }


    // -----------------------------------
    // 2. API 호출 간격 조절
    // -----------------------------------

    const now =
        Date.now();


    const elapsed =
        now -
        lastDailyRequestTime;


    if (
        elapsed <
        DAILY_REQUEST_INTERVAL
    ) {

        const waitTime =
            DAILY_REQUEST_INTERVAL -
            elapsed;


        console.log(
            "DAILY API 대기",
            waitTime,
            "ms"
        );


        await sleep(
            waitTime
        );

    }


    lastDailyRequestTime =
        Date.now();


    // -----------------------------------
    // 3. Access Token
    // -----------------------------------

    const token =
        await getAccessToken();


    // -----------------------------------
    // 4. 날짜
    // -----------------------------------

    const today =
        new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");


    // -----------------------------------
    // 5. KIS 일봉 API
    // -----------------------------------

    const url =
        `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice`;


    try {

        const response =
            await axios.get(
                url,
                {

                    headers: {

                        authorization:
                            `Bearer ${token}`,

                        appkey:
                            process.env.APP_KEY,

                        appsecret:
                            process.env.APP_SECRET,

                        tr_id:
                            "FHKST03010100"

                    },

                    params: {

                        FID_COND_MRKT_DIV_CODE:
                            "J",

                        FID_INPUT_ISCD:
                            code,

                        FID_INPUT_DATE_1:
                            "20240101",

                        FID_INPUT_DATE_2:
                            today,

                        FID_PERIOD_DIV_CODE:
                            "D",

                        FID_ORG_ADJ_PRC:
                            "1"

                    }

                }
            );


        const candles =
            response.data.output2 || [];


        console.log(
            "DAILY LENGTH",
            candles.length
        );


        // -----------------------------------
        // 6. 데이터 확인
        // -----------------------------------

        if (
            candles.length > 0
        ) {

            console.log(
                "DAILY FIRST",
                candles[0]
            );

        }


        // -----------------------------------
        // 7. 성공한 데이터만 캐시
        // -----------------------------------

        if (
            candles.length > 0
        ) {

            dailyCache[code] =
                candles;


            dailyCacheTime[code] =
                Date.now();

        }


        return candles;


    }

    catch (error) {

        console.log(
            "DAILY ERROR",
            error.response?.data ||
            error.message
        );


        // -----------------------------------
        // API 호출 제한
        // -----------------------------------

        if (
            error.response?.data?.msg_cd ===
            "EGW00201"
        ) {

            console.log(
                "KIS API 호출 제한 발생"
            );

        }


        return [];

    }

}


// =======================================
// 평균 계산
// =======================================

function average(arr) {

    if (
        !arr ||
        arr.length === 0
    ) {

        return 0;

    }


    return Math.round(

        arr.reduce(
            (sum, value) =>
                sum + value,
            0
        )
        /
        arr.length

    );

}


// =======================================
// 이동평균 계산
// =======================================

async function getMovingAverage(code) {

    const candles =
        await getDailyPrice(code);


    console.log(
        "CANDLES LENGTH",
        candles.length
    );


    if (
        candles.length === 0
    ) {

        return {

            ma5: 0,

            ma20: 0,

            ma60: 0

        };

    }


    // -----------------------------------
    // 종가 추출
    // -----------------------------------

    const prices =

        candles

        .map(
            item =>
                Number(
                    item.stck_clpr
                )
        )

        .filter(
            price =>
                price > 0
        );


    console.log(
        "PRICE COUNT",
        prices.length
    );


    if (
        prices.length === 0
    ) {

        return {

            ma5: 0,

            ma20: 0,

            ma60: 0

        };

    }


    // -----------------------------------
    // 이동평균 계산
    // -----------------------------------

    const ma5 =
        average(
            prices.slice(0, 5)
        );


    const ma20 =
        average(
            prices.slice(0, 20)
        );


    const ma60 =
        average(
            prices.slice(0, 60)
        );


    console.log(
        "MOVING AVERAGE",
        {
            ma5,
            ma20,
            ma60
        }
    );


    return {

        ma5,

        ma20,

        ma60

    };

}


// =======================================
// Export
// =======================================

module.exports = {

    getCurrentPrice,

    getDailyPrice,

    getMovingAverage

};
