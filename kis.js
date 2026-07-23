// =======================================
// V12 Ultimate KIS API 연결 모듈
// 현재가 + 일봉 + 이동평균 계산
// API 호출 제한 대응 최종 안정화 버전
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
    10 * 60 * 1000;


// =======================================
// 현재가 캐시
// =======================================

let currentPriceCache = {};
let currentPriceCacheTime = {};

const PRICE_CACHE_TIME =
    30 * 1000;

// =======================================
// 마지막 성공 현재가
// =======================================

let lastSuccessfulPriceCache = {};
// =======================================
// 마지막 성공 일봉 데이터
// =======================================

let lastSuccessfulDailyCache = {};


// =======================================
// 마지막 성공 이동평균
// =======================================

let lastSuccessfulMA = {};


// =======================================
// 일봉 API 동시 호출 방지
// =======================================

let dailyRequestPromise = {};


// =======================================
// 일봉 API 마지막 호출 시간
// =======================================

let lastDailyRequestTime = 0;

const DAILY_REQUEST_INTERVAL =
    3000;


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

    // -----------------------------------
    // 현재가 3초 캐시
    // -----------------------------------

    if (
        currentPriceCache[code] &&
        Date.now() - currentPriceCacheTime[code] <
        PRICE_CACHE_TIME
    ) {

        console.log(
            "CURRENT PRICE CACHE 사용",
            code,
            currentPriceCache[code].price
        );

        return currentPriceCache[code];

    }


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


     const result = {

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


// -----------------------------------
// 현재가 캐시 저장
// -----------------------------------

currentPriceCache[code] =
    result;

currentPriceCacheTime[code] =
    Date.now();


console.log(
    "CURRENT PRICE CACHE 저장",
    code,
    result.price
);


return result;


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
// =======================================

async function getDailyPrice(code) {


    // -----------------------------------
// 1. 10분 캐시
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
    // 2. 이미 조회 중이면 대기
    // -----------------------------------

    if (
        dailyRequestPromise[code]
    ) {

        console.log(
            "DAILY REQUEST 대기",
            code
        );


        return await
            dailyRequestPromise[code];

    }


    // -----------------------------------
    // 3. 새로운 요청
    // -----------------------------------

    dailyRequestPromise[code] =
        fetchDailyPrice(code);


    try {

        const candles =
            await dailyRequestPromise[code];


        return candles;

    }

    finally {

        delete
            dailyRequestPromise[code];

    }

}


// =======================================
// 실제 KIS 일봉 API 호출
// 호출 제한 대응 + 자동 재시도
// =======================================

async function fetchDailyPrice(code) {

    const MAX_RETRY = 3;

    const RETRY_WAIT =
        10000;


    for (
        let attempt = 1;
        attempt <= MAX_RETRY;
        attempt++
    ) {

        try {

            // -----------------------------------
            // API 호출 간격 확인
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


            // -----------------------------------
            // 마지막 호출 시간 기록
            // -----------------------------------

            lastDailyRequestTime =
                Date.now();


            console.log(
                "DAILY API 요청",
                code,
                "시도:",
                attempt,
                "/",
                MAX_RETRY
            );


            // -----------------------------------
            // Access Token
            // -----------------------------------

            const token =
                await getAccessToken();


            // -----------------------------------
            // 날짜
            // -----------------------------------

            const today =
                new Date()
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, "");


            // -----------------------------------
            // KIS 일봉 API
            // -----------------------------------

            const url =
                `${process.env.KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice`;


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


            // -----------------------------------
            // 일봉 데이터
            // -----------------------------------

            const candles =
                response.data.output2 || [];


            console.log(
                "DAILY LENGTH",
                candles.length
            );


            // -----------------------------------
            // 성공
            // -----------------------------------

            if (
                candles.length > 0
            ) {

                dailyCache[code] =
                    candles;


                dailyCacheTime[code] =
                    Date.now();


                lastSuccessfulDailyCache[code] =
                    candles;


                console.log(
                    "DAILY CACHE 저장",
                    code,
                    candles.length
                );


                console.log(
                    "LAST SUCCESS DAILY 저장",
                    code
                );


                return candles;

            }


            // -----------------------------------
            // 데이터 없음
            // -----------------------------------

            console.log(
                "DAILY DATA EMPTY",
                code
            );


            return [];


        }

        catch (error) {

            const errorData =
                error.response?.data ||
                error.message;


            console.log(
                "DAILY ERROR",
                errorData
            );


            // -----------------------------------
            // KIS 호출 제한
            // -----------------------------------

            if (
                error.response?.data?.msg_cd ===
                "EGW00201"
            ) {

                console.log(
                    "KIS API 호출 제한 발생"
                );


                // -----------------------------------
                // 캐시 데이터 사용
                // -----------------------------------

                if (
                    dailyCache[code] &&
                    dailyCache[code].length > 0
                ) {

                    console.log(
                        "기존 DAILY CACHE 사용",
                        code
                    );


                    return dailyCache[code];

                }


                // -----------------------------------
                // 마지막 성공 데이터 사용
                // -----------------------------------

                if (
                    lastSuccessfulDailyCache[code] &&
                    lastSuccessfulDailyCache[code].length > 0
                ) {

                    console.log(
                        "마지막 성공 DAILY 데이터 사용",
                        code
                    );


                   return lastSuccessfulDailyCache[code];
                }


                // -----------------------------------
                // 재시도
                // -----------------------------------

                if (
                    attempt <
                    MAX_RETRY
                ) {

                    console.log(
                        "KIS 호출 제한 →",
                        RETRY_WAIT / 1000,
                        "초 후 재시도"
                    );


                    await sleep(
                        RETRY_WAIT
                    );


                    continue;

                }


                console.log(
                    "DAILY API 재시도 실패"
                );


                return [];

            }


            // -----------------------------------
            // 기타 오류
            // -----------------------------------

            console.log(
                "DAILY API 기타 오류"
            );


            return [];

        }

    }


    return [];

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

    try {

        const candles =
            await getDailyPrice(code);


        console.log(
            "CANDLES LENGTH",
            candles.length
        );


        // -----------------------------------
        // 일봉 데이터 부족
        // -----------------------------------

        if (
            !candles ||
            candles.length === 0
        ) {

            console.log(
                "MA 데이터 없음",
                code
            );


            // 마지막 성공 MA 사용

            if (
                lastSuccessfulMA[code]
            ) {

                console.log(
                    "LAST SUCCESS MA 사용",
                    code,
                    lastSuccessfulMA[code]
                );


                return lastSuccessfulMA[code];

            }


            return {

                ma5: 0,

                ma20: 0,

                ma60: 0

            };

        }


        // -----------------------------------
        // 종가 추출
        // -----------------------------------

        const prices = candles

            .map(
                item =>
                    Number(
                        item.stck_clpr
                    )
            )

            .filter(
                price =>
                    Number.isFinite(price) &&
                    price > 0
            );


        console.log(
            "PRICE COUNT",
            prices.length
        );


        // -----------------------------------
        // 최근 데이터 확인
        // -----------------------------------

        console.log(
            "최근 종가 5개",
            prices.slice(0, 5)
        );


        // -----------------------------------
        // MA 계산
        // -----------------------------------

        const ma5 =
            prices.length >= 5
                ? average(
                    prices.slice(0, 5)
                )
                : 0;


        const ma20 =
            prices.length >= 20
                ? average(
                    prices.slice(0, 20)
                )
                : 0;


        const ma60 =
            prices.length >= 60
                ? average(
                    prices.slice(0, 60)
                )
                : 0;


        const result = {

            ma5,

            ma20,

            ma60

        };


        // -----------------------------------
        // 성공 MA 저장
        // -----------------------------------

        if (
            ma5 > 0 ||
            ma20 > 0 ||
            ma60 > 0
        ) {

            lastSuccessfulMA[code] =
                result;


            console.log(
                "MOVING AVERAGE 성공",
                code,
                result
            );

        }


        return result;


    }

    catch (error) {

        console.log(
            "MA ERROR",
            error.response?.data ||
            error.message
        );


        // -----------------------------------
        // 마지막 성공 MA
        // -----------------------------------

        if (
            lastSuccessfulMA[code]
        ) {

            console.log(
                "오류 발생 → 마지막 성공 MA 사용",
                code
            );


            return lastSuccessfulMA[code];

        }


        return {

            ma5: 0,

            ma20: 0,

            ma60: 0

        };

    }

}



// =======================================
// 일목균형표 계산
// 전환선 9
// 기준선 26
// 선행스팬1 26
// 선행스팬2 52
// 후행스팬 26
// =======================================

async function getIchimoku(code) {

    try {

        const candles =
            await getDailyPrice(code);


        if (
            !candles ||
            candles.length === 0
        ) {

            console.log(
                "ICHIMOKU 데이터 없음",
                code
            );

            return {

                conversion: 0,

                base: 0,

                spanA: 0,

                spanB: 0,

                lagging: 0

            };

        }


        // ===================================
        // 고가 / 저가 / 종가 추출
        // ===================================

        const data =

            candles

                .map(item => ({

                    high:
                        Number(
                            item.stck_hgpr
                        ),

                    low:
                        Number(
                            item.stck_lwpr
                        ),

                    close:
                        Number(
                            item.stck_clpr
                        )

                }))

                .filter(item =>

                    item.high > 0 &&

                    item.low > 0 &&

                    item.close > 0

                );


        // ===================================
        // 기간별 최고가 / 최저가 평균
        // ===================================

        function highestLowAverage(period) {

            if (
                data.length < period
            ) {

                return 0;

            }


            const periodData =

                data.slice(
                    0,
                    period
                );


            const highs =

                periodData.map(
                    item => item.high
                );


            const lows =

                periodData.map(
                    item => item.low
                );


            const highest =

                Math.max(
                    ...highs
                );


            const lowest =

                Math.min(
                    ...lows
                );


            return Math.round(

                (
                    highest +
                    lowest
                ) / 2

            );

        }


        // ===================================
        // 전환선
        // 9일 최고가 + 최저가 / 2
        // ===================================

        const conversion =

            highestLowAverage(9);


        // ===================================
        // 기준선
        // 26일 최고가 + 최저가 / 2
        // ===================================

        const base =

            highestLowAverage(26);


        // ===================================
        // 선행스팬1
        // 전환선 + 기준선 / 2
        // ===================================

        const spanA =

            conversion > 0 &&
            base > 0

                ? Math.round(

                    (
                        conversion +
                        base
                    ) / 2

                )

                : 0;


        // ===================================
        // 선행스팬2
        // 52일 최고가 + 최저가 / 2
        // ===================================

        const spanB =

            highestLowAverage(52);


        // ===================================
        // 후행스팬
        // 현재 종가
        // ===================================

        const lagging =

            data.length > 0

                ? data[0].close

                : 0;


        const result = {

            conversion,

            base,

            spanA,

            spanB,

            lagging

        };


        console.log(

            "ICHIMOKU",

            code,

            result

        );


        return result;


    }

    catch (error) {

        console.log(

            "ICHIMOKU ERROR",

            error.message

        );


        return {

            conversion: 0,

            base: 0,

            spanA: 0,

            spanB: 0,

            lagging: 0

        };

    }

}

// =======================================
// Export
// =======================================

module.exports = {

    getCurrentPrice,

    getDailyPrice,

    getMovingAverage,

    getIchimoku

};
