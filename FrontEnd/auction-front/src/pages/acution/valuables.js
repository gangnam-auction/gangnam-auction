import { useEffect, useRef, useState } from "react";
import * as api from "./common/AuctionAPIs";
import { Link } from "react-router-dom";
import { updateRecentPosts } from "../../components/aside/RecentlyView";
import '../../css/Auction.css';
import useFilterItem from "./common/FilterItem";
import usePagination from "./common/paging/usePagination";
import Pagination from "./common/paging/Pagination";
import {getImagesForPosts} from "./common/Images";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";

const Valuables = () => {
    const [valuablesList, setValuablesList] = useState([]);
    const [categoryCode, setCategoryCode] = useState([]);
    const searchItemRef = useRef("");
    const [searchItemList, setSearchItemList] = useState([]);
    const [imgMap, setImgMap] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [checkBoxStates, setCheckBoxStates] = useState({
        main: [
            { id: 1, title: "경매중", status: "on", isChecked: true },
            { id: 2, title: "경매예정", status: "off", isChecked: true },
            { id: 3, title: "경매종료", status: "done", isChecked: true },
        ],
        search: [
            { id: 1, title: "경매중", status: "on", isChecked: true },
            { id: 2, title: "경매예정", status: "off", isChecked: true },
            { id: 3, title: "경매종료", status: "done", isChecked: true },
        ],
    });


    // 카테고리 전체목록 가져오기
    useEffect(() => {
        const getItemList = async () => {
            try {
                const response = await api.valuablesList();
                const data = response.data;
                if (data && data.length > 0) {
                    setValuablesList(data);
                    const category = data[0].categoryCode;
                    setCategoryCode(category);
                    const postIds = data.map(item => item.postId);
                    const images = await getImagesForPosts(postIds);
                    setImgMap(images);
                } else {
                    console.warn("받은 데이터가 비어 있습니다.");
                }
            } catch (error) {
                console.error("해당 카테고리 경매 목록을 불러오는 데 실패했습니다.", error);
            }finally {
                setIsLoading(false)
            }
        };

        setIsLoading(true)
        getItemList();
    }, []);


    // 검색
    const onValueGet = (e) => {
        searchItemRef.current = e.target.value;
    };

    const search = async (e) => {
        e.preventDefault();

        if (!searchItemRef.current.trim()) {
            alert("검색어를 입력해주세요.");
            return;
        }

        try {
            const response = await api.searchItemList(searchItemRef.current, categoryCode);
            const data = response.data;
            setSearchItemList(data);
            console.log("검색 결과:", data);
        } catch (error) {
            console.error("검색 실패:", error);
            alert("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    // 경매품 상태 체크 박스
    const handleCheckboxChange = (id, isChecked, type) => {
        setCheckBoxStates((prev) => ({
            ...prev,
            [type]: prev[type].map((item) =>
                item.id === id ? { ...item, isChecked } : item
            ),
        }));
    };
    const { filteredMainItems, filteredSearchItems } = useFilterItem(valuablesList, searchItemList, checkBoxStates);


    // 페이징 처리
    const itemsPerPage = 20;
    const mainPagination = usePagination(filteredMainItems, itemsPerPage);
    const searchPagination = usePagination(filteredSearchItems, itemsPerPage);

    // 체크박스 렌더링
    const CheckboxGroup = ({ items, type }) => (
        <>
            {items.map((item) => (
                <div key={item.id} className="checkBoxContainer">
                    <input
                        type="checkbox"
                        className="checkboxInput"
                        checked={item.isChecked}
                        onChange={(e) =>
                            handleCheckboxChange(item.id, e.target.checked, type)
                        }
                    />
                    <p className="checkBoxLabel">
                        {item.title}
                    </p>
                </div>
            ))}
        </>
    );

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
            <h1 className="auctionTitle">귀중품 Valuables</h1>

            <div className="auctionCategory">
                <a href="/auction/antique">골동품</a>
                <a href="/auction/limited">한정판</a>
                <a href="/auction/discontinuation">단종품</a>
                <a href="/auction/artproduct">예술품</a>
                <a href="/auction/valuables">귀중품</a>
            </div>

            <div className="search-check">
                <form onSubmit={search} className="auctionSearch">
                    <input
                        className="auctionSearchInput"
                        placeholder="현재 카테고리에서 검색"
                        onChange={onValueGet}
                    />
                    <button type="submit" className="auctionSearchBtn">
                        <FontAwesomeIcon icon={faMagnifyingGlass} style={{color: "#2d2d2d",}}/>
                    </button>
                </form>

                <div className="check-box">
                    {!searchItemRef.current && <CheckboxGroup items={checkBoxStates.main} type="main"/>}
                    {searchItemRef.current && searchItemList.length > 0 && (
                        <CheckboxGroup items={checkBoxStates.search} type="search"/>
                    )}
                </div>
            </div>
            <hr/>

            <div>
                {isLoading ? (
                    <p className="loadingMessage">경매품 리스트를 가져오는 중입니다.</p>
                ) : (
                    <div>
                        {searchItemRef.current ? (
                            searchItemList.length > 0 ? (
                                <>
                                    <div className="auctionListContainer">
                                        {renderAuctionItems(searchPagination.currentItems)}
                                    </div>
                                    <Pagination {...searchPagination} className="paginationContainer"/>
                                </>
                            ) : (
                                <p className="loadingMessage">검색 결과가 없습니다.</p>
                            )
                        ) : (
                            <>
                                <div className="auctionListContainer">
                                    {renderAuctionItems(mainPagination.currentItems)}
                                </div>
                                <Pagination {...mainPagination} className="paginationContainer"/>
                            </>
                        )}
                    </div>
                )}
                {searchItemList.length === 0 && valuablesList.length === 0 && (
                    <p className="auctionListMessage">해당하는 카테고리의 경매품이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default Valuables;
