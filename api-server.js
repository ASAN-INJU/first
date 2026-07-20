// =======================================
// V12 Ultimate API Server
// 한국투자증권 KIS API 연동
// =======================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const KIS_BASE_URL =
process.env.KIS_BASE_URL ||
"https://openapivts.koreainvestment.com:29443";


let accessToken = "";


// =======================================
// 기본 접속 확인
// =======================================

app.get("/", (req,res)=>{
    res.send("V12 Ultimate API Server Running");
});


// =======================================
// KIS Access Token
// =======================================

async function getAccessToken(){

    if(accessToken){
        return accessToken;
    }


    const response = await fetch(
        `${KIS_BASE_URL}/oauth2/tokenP`,
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                grant_type:"client_credentials",

                appkey:process.env.APP_KEY,

                appsecret:process.env.APP_SECRET

            })
        }
    );


    const data = await response.json();


    if(!data.access_token){

        console.log(
            "토큰 발급 실패",
            data
        );

        throw new Error(
            data.msg1 || "Access Token 발급 실패"
        );
    }


    accessToken = data.access_token;

    return accessToken;

}



// =======================================
// 현재가 조회
// =======================================

app.get(
"/api/stock/:code",
async(req,res)=>{


try{


    const code = req.params.code;


    const token = await getAccessToken();



    const url =
    `${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${code}`;



    const response = await fetch(
        url,
        {

        method:"GET",

        headers:{

            "Content-Type":"application/json",

            "authorization":
            `Bearer ${token}`,

            "appkey":
            process.env.APP_KEY,

            "appsecret":
            process.env.APP_SECRET,

            "tr_id":
            "FHKST01010100"

        }

    });



    const data = await response.json();



    console.log("KIS RESPONSE", data);



    if(data.rt_cd !== "0"){

        return res.json({

            success:false,

            message:data.msg1

        });

    }



    const output = data.output;



    res.json({

        success:true,

        code:code,

        price:Number(output.stck_prpr),

        change:Number(output.prdy_ctrt),

        volume:Number(output.acml_vol),

        ma5:0,

        ma20:0,

        ma60:0

    });



}
catch(error){

    console.error(error);


    res.status(500).json({

        success:false,

        message:error.message

    });

}


});



// =======================================
// 서버 시작
// =======================================

app.listen(
PORT,
()=>{
console.log(
`V12 Ultimate Server Running ${PORT}`
);
});
