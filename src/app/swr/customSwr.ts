import useSWR from 'swr';
import { customAxiosGet } from '../axios/customAxios';

// const GetData = async (url: string) => {
const fetcher = async (url: string) => {
    const res = await customAxiosGet({ url });
    return res.data;
};
//     const { data, error, isLoading } = useSWR(`${url}`, fetcher);

//     return {
//         data,
//         isLoading,
//         isError: error,
//     };
// };

export { fetcher };
