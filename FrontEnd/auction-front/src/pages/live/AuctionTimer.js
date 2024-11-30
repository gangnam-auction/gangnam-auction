import { useEffect, useState } from "react";
import * as api from "../acution/common/AuctionAPIs";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import Bid from "../bid/Bid";
import '../../css/LiveDetail.css'
import SuccessfulBidderModal from "./SuccessfulBidderModal";
import {insertUserPost} from "../acution/common/AuctionAPIs";

const AuctionTimer = ({ startTime, postId, onUpdate }) => {
    const [remainingTime, setRemainingTime] = useState(0);
    const [started, setStarted] = useState(false); // 경매 시작 여부
    const [ended, setEnded] = useState(false); // 경매 종료 여부
    const [postStatusChanged, setPostStatusChanged] = useState(false); // 상태 변경 여부
    const navigate = useNavigate();
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const userCode = sessionStorage.getItem("userCode");
    const [requestSent, setRequestSent] = useState(false);
    const [bidFinalCash, setBidFinalCash] = useState(0);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    useEffect(() => {
        const fiveMinute = 5 * 60 * 1000;
        const startTimestamp = new Date(startTime).getTime();
        const endTimestamp = startTimestamp + fiveMinute;

        const updateRemainingTime = async () => {
            const now = Date.now();

            if (now < startTimestamp) { // 경매 시작 전
                setStarted(false);
                setRemainingTime(startTimestamp - now);
            } else if (now < endTimestamp) { // 경매 중
                setStarted(true);
                setRemainingTime(endTimestamp - now);
            } else if (now >= endTimestamp && now < endTimestamp + fiveMinute) { //경매 끝 ~ 끝+5분
                setStarted(true);
                setEnded(true);
                setRemainingTime(endTimestamp + fiveMinute - now);
            } else if(!postStatusChanged){  // 경매끝 + 5분
                setPostStatusChanged(true);
                setRemainingTime(0)
                try {
                    await api.setPostStatus(postId);
                    alert('채팅이 종료되었습니다.');
                    navigate('/auction');
                } catch (error) {
                    console.error('경매 상태 변경 실패:', error);
                }
            }
        };

        const timerInterval = setInterval(updateRemainingTime, 1000);
        updateRemainingTime();

        return () => clearInterval(timerInterval);
    }, [startTime, postId, ended, postStatusChanged, requestSent, onUpdate]);


    useEffect(() => {
        if (ended && !requestSent) {
            setRequestSent(true);

            const executeRequests = async () => {
                try {
                    // 낙찰자 정보
                    const response = await axios.get(`http://112.221.66.174:8081/bid/top/${postId}`);
                    const data = response.data;
                    setBidFinalCash(data.currentCash);


                    // userPost 가져오기
                    const resp = await api.getUserPost(postId,userCode);
                    const userData = resp.data;
                    console.log(userData)


                    // 낙찰자 모달
                    if (userData.length === 0){
                        // userPost 업데이트
                        const userPostData = {
                            postId: postId,
                            userCode: data.userCode,
                        }
                        await api.insertUserPost(userPostData);

                        // 모달 열기
                        if (userCode == data.userCode) {
                            setIsBidModalOpen(true);
                        }
                    }


                    // 경매 정보 업데이트
                    const formData = {
                        postId: postId,
                        finalCash: data.currentCash,
                        endDay: new Date().toISOString(),
                    };

                    await axios.post('http://112.221.66.174:8081/auction/final', formData, {
                        headers: { 'Content-Type': 'application/json' },
                    });

                    // 낙찰자 외 환불 요청
                    await axios.get(`http://112.221.66.174:8081/bid/end/${postId}`);

                } catch (error) {
                    console.error('요청 실행 실패', error);
                }
            };

            executeRequests();
        }
    }, [remainingTime, ended, postId, requestSent, userCode]);



    const formatTime = (time) => {
        const minutes = Math.floor(time / 1000 / 60);
        const seconds = Math.floor((time / 1000) % 60);
        return `${minutes} : ${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div>
            {started ? (
                    ended ? (
                        postStatusChanged ? (
                            <p className="live-detail-page_timer_text">경매가 종료되었습니다.</p>
                        ) : (
                            <div className="live-detail-page_after_timer">
                                <p className="live-detail-page_after_timer_time">경매종료</p>
                                <p className="live-detail-page_after_timer_time">{formatTime(remainingTime)}</p>
                                <p className="live-detail-page_after_timer_text">후에 채팅이 종료됩니다.</p>
                            </div>
                        )
                    ) : (
                        <div className="liveOn_container">
                            <div className="live-detail-page_timer">
                                <div className="live-detail-page_timer_text">경매 종료</div>
                                <div className="live-detail-page_timer_time">{formatTime(remainingTime)}</div>
                            </div>
                            <div className="liveOn-detail-page_bid">
                                {isLoggedIn ? <Bid/> : <></> }
                            </div>
                        </div>
                    )
                ) : (
                    <div className="live-detail-page_timer">
                        <p className="live-detail-page_timer_text">곧 라이브 경매가 시작됩니다.</p>
                        <p className="live-detail-page_timer_time">{formatTime(remainingTime)}</p>
                    </div>
                )}
            {/* 낙찰자 모달 */}
            <SuccessfulBidderModal isOpen={isBidModalOpen}
                                   onClose={() => setIsBidModalOpen(false)}
                                   bidFinalCash={bidFinalCash}
            />
        </div>
    );
};

export default AuctionTimer;
