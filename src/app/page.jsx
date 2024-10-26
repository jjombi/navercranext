'use client';
import { customAxiosGet } from './axios/customAxios';
import { useEffect, useRef, useState } from 'react';
import { CSVLink, CSVDownload } from 'react-csv';

export default function Home() {
    const keyword_ref = useRef(null);
    const [csvData1, setCsvData1] = useState([]);
    const [csvData2, setCsvData2] = useState([]);
    const [csvData3, setCsvData3] = useState([]);
    const [csvData4, setCsvData4] = useState([]);

    const [loadingState, setLoadingState] = useState(false);
    const [serverState, setServerState] = useState(false);

    const headers = [
        { label: '상호', key: 'nickNamee' },
        { label: '순위', key: 'rank' },
        { label: '사이트주소', key: 'siteUrl' },
        { label: '방문자수', key: 'visiterNum' },
    ];
    const headers4 = [
        { label: '상호', key: 'nickName' },
        { label: '주소', key: 'address' },
        { label: '사이트주소', key: 'siteUrl' },
    ];
    const submit = async () => {
        try {
            setLoadingState(true);
            setTimeout(() => {
                setLoadingState(10000);
            }, 10000);
            const res = await customAxiosGet({
                url: 'api',
                params: { keyword: keyword_ref.current.value },
                timeout: 0,
            });
            console.log('res:', res);

            setServerState(true);
            setCsvData1(res.data.data2);
            setCsvData2(res.data.data2);
            setCsvData3(res.data.data3);
            setCsvData4(res.data.data4);
        } catch (err) {
            alert('네트워크가 느려 크롤링할 수 없습니다');
        }
    };

    return (
        <div className="">
            {serverState ? (
                <>
                    <CSVDownload header={headers} data={csvData1} target="_blank" />
                    <CSVDownload header={headers} data={csvData2} target="_blank" />
                    <CSVDownload header={headers} data={csvData3} target="_blank" />
                    <CSVDownload header={headers4} data={csvData4} target="_blank" />
                </>
            ) : null}
            {loadingState ? (
                <h1>크롤링을 진행하는 중 입니다</h1>
            ) : loadingState === 10000 ? (
                <h1>데이터 양이 많아 시간이 걸리고 있습니다</h1>
            ) : null}
            {/* <h1>크롤링을 진행하는 중 입니다</h1> */}
            <header>
                <div>
                    <input ref={keyword_ref} type="text"></input>
                    <button onClick={submit}>검색</button>
                </div>
            </header>
            <main className="content_main"></main>
        </div>
    );
}
