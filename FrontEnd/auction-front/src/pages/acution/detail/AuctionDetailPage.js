import {Link, redirect, useNavigate, useParams} from "react-router-dom";
import * as api from "../common/AuctionAPIs";
import {useEffect, useRef, useState} from "react";
import LiveDetail from "../../live/LiveDetail";
import '../../../css/AuctionDetail.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faChevronLeft, faChevronRight, faStar} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import {formatToKoreanDate} from "./FormatDate";
import {getPostImages} from "../common/Images";
import ImageModal from "./ImageModal";


const AuctionDetailPage = () =>{

    const {postId} = useParams();
    const [board, setBoard] = useState([]);
    const [postStatus, setPostStatus] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const userCode = sessionStorage.getItem("userCode");
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    const [fav, setFav] = useState({
        userCode,
        status: false
    })
    const [img, setImg] = useState([]);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [startTime, setStartTime] = useState(null);


    // 게시글 가져오기
    useEffect( () => {
        const getBoard = async () => {

            try {
                const response = await api.postDetail(postId);
                const data = response.data;
                setBoard(data);
                setPostStatus(data.postStatus);

                const imageUrls = await getPostImages(postId);
                setImg(imageUrls);

                if (data.startDay) {
                    setStartTime(new Date(data.startDay));
                } else {
                    console.error("startDay 데이터가 없습니다.");
                }

            } catch (error) {
                console.error("게시글 데이터를 불러오는 중 오류가 발생했습니다:", error);
            }finally {
                setIsLoading(false)
            }
        };

        setIsLoading(true);
        getBoard()
    },[]);


    // 라이브 10분 전 상태 변경
    useEffect(() => {
        if (postStatus === "off") {
            if (!startTime) return;

            const now = Date.now();
            const startLiveTime = startTime.getTime() - 10 * 60 * 1000;
            const delay = startLiveTime - now;

            if (delay <= 0) {
                updateLiveStatus();
                return;
            }

            const timer = setTimeout(() => {
                updateLiveStatus();
            }, delay);

            return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
        }
    }, [startTime, postId, navigate]);

    const updateLiveStatus = async () => {
        try {
            await api.updateLive(postId);
        } catch (error) {
            console.error("updateLive API 호출 중 오류:", error);
        }
    };



    // 이미지 슬라이드
    const handlePrev = () => {
        setCurrentImgIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : img.length - 1));
    };
    const handleNext = () => {
        setCurrentImgIndex((prevIndex) => (prevIndex < img.length - 1 ? prevIndex + 1 : 0));
    };
    // 썸네일 클릭 시 슬라이드 이미지 변경
    const handleThumbnailClick = (index) => {
        setCurrentImgIndex(index);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    // 즐겨 찾기
    const fetchFavoriteStatus = async () => {
        if (userCode !== null){
            try {
                const response = await api.getMyFav(postId, userCode);
                const data = response.data;
                if (data && data.length > 0) {
                    setFav({
                        userCode: userCode,
                        status: data[0].status,
                    });
                }
            } catch (error) {
                console.error("즐겨찾기 상태를 가져오는 중 오류:", error);
            }
        }
    };

    useEffect(() => {
        fetchFavoriteStatus();
    }, [postId, userCode]);

    const favorite = async () => {

        try {
            if (!userCode) {
                alert("로그인이 필요합니다.");
                return;
            }

            if (!fav.status) {
                await api.addFavorite(postId, userCode);
                alert("나의 즐겨찾기에 추가되었습니다.");
            } else {
                await api.deleteFavorite(postId, userCode);
                alert("나의 즐겨찾기에서 삭제되었습니다.");
            }
            setFav({ ...fav, status: !fav.status });
        } catch (error) {
            console.error("즐겨찾기 상태 변경 중 오류:", error);
        }
    };

    // 뒤로가기
    const movePrevPage = ()=>{
        navigate(-1)
    }

    // 게시글 삭제
    const onDelete = async () => {

        const response = await api.notUseThisPost(postId);
        console.log("postDelete",response.data);
        alert('삭제 완료')

        navigate('/auction')
    }

    // 게시글 승인
    const changeStatus = async ()=>{
        const response = await api.approval(postId);
        console.log(response.data);
        alert("승인 완료")

        navigate('/admin/posts')
    }

    // 관리자 모드
    const renderAdminActions = () => (
        <div className="admin-button">
            <button onClick={() => navigate('/auction')} className="detail-page_admin-button-back">목록</button>
            <div className="editBtn">
                <Link to={`/auction/update/${postId}`} className="detail-page_admin-editBtn">수정</Link>
                {postStatus === "none" && <button className="detail-page_admin-editBtn" onClick={changeStatus}>승인</button>}
                <button className="detail-page_admin-editBtn" onClick={onDelete}>삭제</button>
            </div>
        </div>
    );

    // 즐겨찾기 버튼
    const renderFavoriteButton = () => (
        <button className="favBtn" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={favorite}>
            <FontAwesomeIcon icon={fav.status ? faStar : faStarRegular} style={{ color: fav.status ? "#FFD43B" : "#454545", fontSize: "24px" }} />
        </button>
    );

    // 이미지 슬라이드
    const renderImageSlider = () => (
        <div>
            <div className="imageSlider">
                <button onClick={handlePrev} className="sliderButton" style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <FontAwesomeIcon icon={faChevronLeft} style={{ color: "#454545", fontSize: "40px" }} />
                </button>
                <img className="sliderImage"
                     src={img[currentImgIndex]}
                     alt={`슬라이드 이미지 ${currentImgIndex + 1}`}
                     onClick={openModal}
                     loading="lazy" />
                <button onClick={handleNext} className="sliderButton" style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <FontAwesomeIcon icon={faChevronRight} style={{ color: "#454545", fontSize: "40px" }} />
                </button>
            </div>

            <div className="thumbnailContainer">
                {img.map((image, index) => (
                    <img
                        key={index}
                        className={`thumbnail ${index === currentImgIndex ? "activeThumbnail" : ""}`}
                        src={image}
                        alt={`썸네일 ${index + 1}`}
                        onClick={() => handleThumbnailClick(index)}
                        loading="lazy"
                    />
                ))}
            </div>
            {isModalOpen && (
                <ImageModal
                    img={img}
                    currentImgIndex={currentImgIndex}
                    onClose={closeModal}
                />
            )}
        </div>
    );


    // 게시글 상태별 최종 UI
    const renderContent = () => {

        if (postStatus === "on") {
            return <LiveDetail/>
        }

        return (
            <div className="detail-page">
                <div className="detail-page_top">
                    <div className="detail-page_top_leftSide">
                        <h2 className="detail-page_title">{board.title}</h2>
                            {renderFavoriteButton()}
                    </div>
                    <p className="detail-page_boardStatus">{postStatus === "off" && "none" ? "| 경매예정 |" : "| 낙찰완료 |"}</p>
                </div>
                <hr className="top_line"/>

                <div className="detail-page_middle">
                    <div className="detail-page_middle_left">
                        <div className="detail-page_info_img">
                            {renderImageSlider()}
                        </div>
                        <div className="detail-page_middle_info">
                            <div className="detail-page_text">
                                {postStatus === "done" && (
                                    <p className="detail-page_middle_info_text">최종 낙찰가</p>
                                )}
                                <p className="detail-page_middle_info_text">입찰 시작가</p>
                                <p className="detail-page_middle_info_text">경매 날짜</p>
                            </div>
                            <div className="detail-page_middle_info_value">
                                {postStatus === "done" && (
                                    <p className="detail-page_finalCash">{board.finalCash.toLocaleString()}원</p>
                                )}
                                <p className="detail-page_cash">{board.startCash.toLocaleString()}원</p>
                                <p className="detail-page_date">{formatToKoreanDate(board.startDay)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="detail-page_middle_right">
                    <p className="detail-page_infoText">상세 정보</p>
                        <hr className="middle_line"/>
                        <div className="content-display" style={{whiteSpace: "pre-wrap"}}>
                            {board.content}
                        </div>
                    </div>
                </div>

                <div className="detail-page_bottom">
                    <div className="detail-page_button">
                        {isAdmin ? renderAdminActions()
                            :<button onClick={movePrevPage} className="detail-page_backButton">이전</button>
                        }
                    </div>
                </div>
            </div>
        )
    }


    return (
        <>
            {isLoading ?
                <div>
                    <p className="boardText">해당 경매품의 상세 페이지를 가져오는 중입니다.</p>
                </div>
                : renderContent()}
        </>
    )
}

export default AuctionDetailPage