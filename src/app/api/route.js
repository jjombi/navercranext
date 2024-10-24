import puppeteer from 'puppeteer';
// const fs = require('fs');
// const { parse } = require('json2csv');
import axios from 'axios';
let browser;
//------------------------------------------------------------------------------------------------------
const initBrowser = async () => {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }
    return browser;
};

const closeBrowser = async () => {
    if (browser) {
        await browser.close();
        browser = null;
    }
};

function extractBlogId(url) {
    try {
        // URL에서 blog.naver.com/ 다음부터 그 다음 / 전까지의 문자열 추출
        const matches = url.match(/blog\.naver\.com\/([^/]+)/);

        if (matches && matches[1]) {
            return matches[1];
        } else {
            throw new Error('블로그 ID를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('에러:', error.message);
        return null;
    }
}
function extractNumbers(str) {
    // 정규표현식을 사용하여 숫자만 추출하고 배열로 변환
    const numbers = str.match(/\d+/g).map((num) => parseInt(num));
    return numbers.reverse();
}

const crawlingFunc1 = async (page) => {
    return await page.evaluate(() => {
        const items_ = Array.from(document.querySelectorAll('#content > section > div.area_list_search > div'));
        return items_.flatMap((item_) => {
            return {
                nickName:
                    item_.querySelector('div > div > div.info_post > div.writer_info > a > em')?.textContent?.trim() ||
                    '',
                siteUrl:
                    item_.querySelector('div > div > div.info_post > div.desc > a.desc_inner')?.getAttribute('href') ||
                    '',
            };
        });
    });
};
const crawlingFunc2 = async (page) => {
    pageDown(page);
    return await page.evaluate(() => {
        const items_ = Array.from(document.querySelectorAll('#main_pack > section > div.api_subject_bx > ul > li'));
        return items_.flatMap((item_) => {
            return {
                nickName:
                    item_
                        .querySelector('li > div > div.user_box > div.user_box_inner > div > a')
                        ?.textContent?.trim() || '',
                siteUrl:
                    item_.querySelector('li > div > div.detail_box > div.title_area > a')?.getAttribute('href') || '',
            };
        });
    });
};
const crawlingFunc3 = async (page) => {
    return await page.evaluate(() => {
        const items_ = Array.from(
            document.querySelectorAll(
                '#wrap > #container > #content > #main_pack > section.sc_new.sp_influencer._fe_influencer_section.type_bg10._prs_ink_kip > div.api_subject_bx > div.keyword_challenge_wrap > ul > li'
            )
        );
        return items_.flatMap((item_) => {
            return {
                nickName:
                    item_
                        .querySelector(
                            'li > div.keyword_box_wrap > div.user_box > div.user_box_inner > div.user_info > div.user_area > a > span'
                        )
                        ?.textContent?.trim() || '',
                siteUrl:
                    item_
                        .querySelector('li > div.keyword_box_wrap > div.detail_box > div.title_area > a')
                        ?.getAttribute('href') || '',
            };
        });
    });
};

async function searchNaverMap(keyword) {
    try {
        const headers = {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            Referer: 'https://map.naver.com/',
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'sec-ch-ua': '"Google Chrome";v="91", "Chromium";v="91"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
        };

        const res = await axios.get(
            `https://map.naver.com/p/api/search/allSearch?query=${keyword}&type=all&searchCoord=126.97825%3B37.566551&boundary=`,
            { headers }
        );
        const { result } = res.data;
        const data = result.place.list.map((e, i) => {
            return {
                nickName: e.name,
                address: e.address,
                siteUrl: e.homePage,
            };
        });
        return data;
    } catch (error) {
        console.error('에러 발생:', error.message);
        if (error.response) {
            console.error('응답 상태:', error.response.status);
            console.error('응답 헤더:', error.response.headers);
        }
        throw error;
    }
}

const crawlingFunc = async (url, ty) => {
    const browser = await initBrowser();
    const page = await browser.newPage();
    let content;
    console.log('크롤링 url:', url);
    try {
        await page.goto(url, {
            waitUntil: 'networkidle0',
        });

        if (ty === 1) content = await crawlingFunc1(page);
        else if (ty === 2) content = await crawlingFunc2(page);
        else if (ty === 3) content = await crawlingFunc3(page);
        if (content.length === 1) return false;
        const content2 = await Promise.all(
            content.map(async (e, i) => {
                const blogId = await extractBlogId(e.siteUrl);
                const res = await axios.get(`https://sta.tion.co.kr/_ajax_blog_visit.php?blogid=${blogId}`);
                console.log('res', res.data);
                return {
                    nickName: e.nickName,
                    siteUrl: e.siteUrl,
                    visiterNum: extractNumbers(res.data.result),
                };
            })
        );

        return content2;
    } catch (error) {
        console.error('크롤링 중 오류 발생:', error);
        return (error);
    } finally {
        await page.close();
    }
};

// const saveToCsv = (data, filename) => {
//     try {
//         if (data.length === 0) {
//             console.error('데이터가 비어 있어 CSV 파일을 생성할 수 없습니다.');
//             return;
//         }

//         const opts = {
//             fields: ['nickName', 'address', 'siteUrl', 'visiterNum'],
//             delimiter: ',',
//             quote: '"',
//             escape: '"',
//             header: true,
//         };

//         const csv = parse(data, opts);
//         const BOM = '\uFEFF';
//         const csvContentWithBOM = BOM + csv;
//         fs.writeFileSync(filename, csvContentWithBOM, { encoding: 'utf8' });
//         console.log(`${filename} 파일이 생성되었습니다.`);
//     } catch (error) {
//         console.error('CSV 파일 생성 중 오류 발생:', error);
//     }
// };
const pageDown = async (page) => {
    const scrollHeight = 'document.body.scrollHeight';
    let previousHeight = await page.evaluate(scrollHeight);
    await page.evaluate(`window.scrollTo(0, ${scrollHeight})`);
    await page.waitForFunction(`${scrollHeight} > ${previousHeight}`, {
        timeout: 30000,
    });
};

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    console.log('keyword', keyword);
    if (!keyword) {
        return Response.json({ error: 'searchData parameter is required' }, { status: 400 });
    }

    try {
        let ty = 1;
        let data1 = [];
        // const data2 = [];
        // const data3 = [];
        while (typeof ty === 'number') {
            const data = await crawlingFunc(
                `https://section.blog.naver.com/Search/Post.naver?pageNo=${ty}&rangeType=ALL&orderBy=sim&keyword=${keyword}`,
                1
            );
            if (data === false) {
                ty === false;
            } else {
                data1.push(...data);
                ty += 1;
            }
        }
        const data2 = await crawlingFunc(
            `https://search.naver.com/search.naver?ssc=tab.blog.all&sm=tab_jum&query=${keyword}`,
            2
        );
        const data3 = await crawlingFunc(
            `https://search.naver.com/search.naver?ssc=tab.influencer.chl&where=influencer&sm=tab_jum&query=${keyword}`,
            3
        );
        const data4 = await searchNaverMap(keyword);
        // const data4 = [];
        return Response.json({
            data1,
            data2,
            data3,
            data4,
        });
    } catch (error) {
        console.error('Crawling error:', error);
        return Response.json({ error: 'An error occurred while crawling' }, { status: 500 });
    }
}
