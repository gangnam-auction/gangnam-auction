import {useEffect, useState} from "react";
import * as api from "../../apis/AuctionItem";
import {Link} from "react-router-dom";


const Valuables = () =>{
    const [valuablesList, setValuableList] = useState([]);

    // 백엔드 연결
    const getItemList = async () =>{
        const response = await api.valuablesList();
        const data = await response.data;
        console.log(data);
        setValuableList(data);
    };

    useEffect(() => {
        getItemList();
    }, []);

    // 최근 본 게시물
    const onItemClick = () =>{
        const recentPosts = JSON.parse(localStorage.getItem("recentPosts")) || [];
        const updatedPosts = [valuablesList, ...recentPosts.filter(p => p.id !== valuablesList.id)];
        localStorage.setItem("recentPosts", JSON.stringify(updatedPosts.slice(0,2))); // 최근 본 게시물 2개
    }; // 게시글 클릭하면 로컬스토리지에 최근 두개까지 저장

    return(
        <>
            <h1>귀중품 Valuables</h1>
            <input placeholder="현재 카테고리에서 검색"/>
            <select name="sort" id="sort">
                <option value="favorite">인기순</option>
                <option value="new">최신순</option>
                <option value="last">오래된순</option>
            </select>
            <hr/>
            {valuablesList.map(list => (
                <div key={list.id} className="auctionListContainer">
                    <Link to="/auction/{id}" onClick={onItemClick}>
                        <div className="itemName">{list.img}</div>
                        <h2 className="itemTitle">{list.title}</h2>
                    </Link>
                </div>
            ))}
        </>
    )
}
export default Valuables;