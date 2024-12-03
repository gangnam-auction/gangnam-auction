import {useEffect, useRef, useState} from "react";
import * as api from "../acution/common/AuctionAPIs";
import {Link} from "react-router-dom";
import usePagination from "../acution/common/paging/usePagination";
import {updateRecentPosts} from "../../components/aside/RecentlyView";
import Pagination from "../acution/common/paging/Pagination";
import {getImagesForPosts} from "../acution/common/Images";


const Live = () =>{

    const [liveList, setLiveList] = useState([]);
    const [imgMap, setImgMap] = useState({});
    const [isLoading, setIsLoading] = useState(false);


    // 라이브 목록 가져오기
    useEffect(() => {
        const getItemList = async () => {
            try {
                const response = await api.liveList();
                const data = response.data;

                if (data && data.length > 0) {
                    const sortedData = data.sort((a, b) => new Date(a.startDay) - new Date(b.startDay));
                    const postIds = data.map(item => item.postId);
                    const images = await getImagesForPosts(postIds);
                    setImgMap(images);
                    setLiveList(sortedData);

                } else {
                    console.warn("받은 데이터가 비어 있습니다.");
                }
            } catch (error) {
                console.error("라이브 경매 목록을 불러오는 데 실패했습니다.", error);
            } finally {
                setIsLoading(false);
            }
        };

        setIsLoading(true);
        getItemList();
    }, []);


    // 페이징 처리
    const itemsPerPage = 20;
    const mainPagination = usePagination(liveList, itemsPerPage);


    // 결과 렌더링
    const renderAuctionItems = (items) =>
        items.map((item) => (
            <div key={item.postId} className="auctionItem">
                <Link to={`/auction/${item.postId}`} onClick={() => updateRecentPosts(item)} className="auction-link">
                    <img
                        className="itemImg"
                        src={imgMap[item.postId]?.[0] || "/placeholder.png"}
                        alt={`${item.title}의 이미지`}
                        loading="lazy"
                    />
                    <h2 className="itemTitle">{item.title}</h2>
                </Link>
            </div>
        ));


    return (
        <div className="auction-page">
            <h1 className="auctionTitle">실시간 경매 Live Auction</h1>

            {/*<p>인기 경매</p>*/}
            {/*<div>여기에다 인기 경매방 보여주기</div>*/}
            {/*<hr/>*/}

            <div>
                {isLoading ? (
                    <p className="loadingMessage">라이브 경매 리스트를 가져오는 중입니다.</p>
                ) : (
                    <>
                        <div className="auctionListContainer">
                            {renderAuctionItems(mainPagination.currentItems)}
                        </div>
                        <Pagination {...mainPagination} className="paginationContainer"/>
                    </>
                )}
                {liveList.length === 0 && (
                    <p className="auctionListMessage">현재 경매 중인 경매품이 없습니다.</p>
                )}
            </div>
        </div>
    );
}
export default Live;