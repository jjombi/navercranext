'use client';

import { fetcher } from './swr/customSwr';
import useSWR from 'swr';
import { customAxiosGet } from './axios/customAxios';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CSVLink, CSVDownload } from 'react-csv';

export default function Home() {
    const keyword_ref = useRef(null);
    const [csvData1, setCsvData1] = useState([]);
    const [csvData2, setCsvData2] = useState([]);
    const [csvData3, setCsvData3] = useState([]);
    const [csvData4, setCsvData4] = useState([]);

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
            const res = await customAxiosGet({
                url: 'api',
                params: { keyword: keyword_ref.current.value },
                timeout: 10000000000,
            });
            console.log('res:', res);

            setServerState(true);
            setCsvData1(res.data.data2);
            setCsvData2(res.data.data2);
            setCsvData3(res.data.data3);
            setCsvData4(res.data.data4);
        } catch (err) {
            // console.log(err);
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
