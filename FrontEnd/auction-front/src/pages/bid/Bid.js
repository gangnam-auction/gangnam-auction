import React, {useState, useEffect, useCallback, useContext} from 'react';
import axios from 'axios';
import { useLogin } from '../../pages/login/LoginContext';
import { connectWebSocket, sendBid, subscribeToAuction } from './Websocket';
import {useParams} from "react-router-dom";



const Bid = () => {
    const {postId} = useParams();
    const [auctionItem, setAuctionItem] = useState(null);
    const [currentBid, setCurrentBid] = useState(() => {
        const savedBid = localStorage.getItem(`currentBid-${postId}`);
        return savedBid ? parseInt(savedBid, 10) : 0;
    });
    const [userInfo, setUserInfo] = useState(null);
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false); // 웹소켓 연결 상태
    const { user } = useLogin();
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const userCode = sessionStorage.getItem("userCode");

    // 실시간 현재 입찰가
    const CurrentBid = React.memo(({ bid }) => (
        <div className="bid-currentBid">
            <div className="bid-text">현재 최고 입찰가:</div>
            <div className="bid-value">{bid.toLocaleString()}원</div>
        </div>
    ));


    // 사용자 정보 가져오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (isLoggedIn) {
                try {
                    const response = await axios.get(`http://112.221.66.174:8081/admin/bid/${userCode}`);
                    setUserInfo(response.data);
                    console.log(response.data);
                } catch (error) {
                    console.error('사용자 정보를 가져오는 데 실패했습니다:', error);
                }
            }
        };
        fetchUserInfo();
    }, []);

    // 경매 아이템 데이터 가져오기
    useEffect(() => {
        const fetchAuctionItem = async () => {
            try {
                const response = await axios.get(`http://112.221.66.174:8081/auction/${postId}`);
                setAuctionItem(response.data);
                setCurrentBid(response.data.startCash);
            } catch (error) {
                console.error('경매 아이템을 가져오는 데 실패했습니다:', error);
            }
        };

        fetchAuctionItem();
    }, [postId]);

    // 입찰가 업데이트 핸들러 (WebSocket으로 수신한 메시지 처리)
    const handleBidUpdate = useCallback((bidMessage) => {
        if (bidMessage.postId === postId) {
            setCurrentBid((prevBid) => {
                const updatedBid = Math.max(prevBid, bidMessage.bidAmount);
                localStorage.setItem(`currentBid-${postId}`, updatedBid); // 실시간으로 로컬 스토리지 업데이트
                return updatedBid;
            });
        }
    }, [postId]);

    // WebSocket 연결 및 입찰 업데이트 처리
    useEffect(() => {
        const setupWebSocket = async () => {
            await connectWebSocket();
            subscribeToAuction(handleBidUpdate); // 입찰 업데이트 수신 시 처리
            setIsWebSocketConnected(true); // 웹소켓 연결 성공 시 상태 업데이트
        };

        setupWebSocket();

        // 컴포넌트 언마운트 시 WebSocket 연결 종료
        return () => {
            // WebSocket 연결 종료 로직 추가 (필요에 따라 구현)
            setIsWebSocketConnected(false); // 연결 종료 시 상태 업데이트
        };
    }, [handleBidUpdate]);

    // 입찰 금액 증가 처리
    const handleBidIncrease = async (amount) => {
        const newBid = currentBid + amount;
        console.log(currentBid);
        console.log(newBid);

        if (newBid <= userInfo.cash) {
            try {
                // 서버에 사용자의 입찰 내역을 확인
                const response = await axios.get(`http://112.221.66.174:8081/bid/check/${postId}/${userCode}`);
                const userBidData = response.data;

                if (userBidData === null) {
                    await sendBid({
                        postId: postId,
                        userCode: userCode,
                        bidAmount: newBid
                    });
                    // 사용자 캐시 차감
                    const updatedCash = userInfo.cash - newBid;
                    await axios.put(`http://112.221.66.174:8081/admin/updatecash/${user.userCode}`, { cash: updatedCash });
                    // 사용자 정보 업데이트
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        cash: updatedCash,
                    }));

                    // 입찰 후 현재 최고 입찰가 갱신
                    setCurrentBid((prevBid) => {
                        const updatedBid = Math.max(prevBid, newBid);
                        localStorage.setItem(`currentBid-${postId}`, updatedBid); // 로컬 스토리지에 저장
                        return updatedBid;
                    });

                } else {
                    // 사용자가 입찰 내역이 있는 경우, 입찰 진행
                    const response = await axios.get(`http://112.221.66.174:8081/bid/check/${postId}`);
                    const otherBidData = response.data;
                    const updateBid = otherBidData - userBidData + amount;
                    const topRate = otherBidData + amount;
                    await sendBid({
                        postId: postId,
                        userCode: userCode,
                        bidAmount: topRate
                    });
                    // 사용자 캐시 차감
                    const updatedCash = userInfo.cash - updateBid;
                    await axios.put(`http://112.221.66.174:8081/admin/updatecash/${userCode}`, { cash: updatedCash });

                    // 사용자 정보 업데이트
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        cash: updatedCash,
                    }));

                    // 입찰 후 현재 최고 입찰가 갱신
                    setCurrentBid((prevBid) => {
                        const updatedBid = Math.max(prevBid, topRate);
                        localStorage.setItem(`currentBid-${postId}`, updatedBid); // 로컬 스토리지에 저장
                        return updatedBid;
                    });
                }
                alert('입찰이 성공적으로 처리되었습니다.');
            } catch (error) {
                console.error('입찰 처리 중 오류 발생:', error);
                alert('입찰 처리에 실패했습니다. 다시 시도해 주세요.');
            }
        } else {
            alert('입찰 금액이 보유 금액을 초과했습니다.');
        }
    };

    // 최고 입찰가를 주기적으로 가져오기
    const fetchHighestBid = useCallback(async () => {
        try {
            const response = await axios.get(`http://112.221.66.174:8081/bid/${postId}`);
            const fetchedBid = response.data;
            console.log("fetchedBid", fetchedBid);

            // 유효한 값인지 확인하고 상태 업데이트
            if (fetchedBid > 0) {
                setCurrentBid(fetchedBid);
            }
        } catch (error) {
            console.error('최고 입찰가를 가져오는 데 실패했습니다:', error);
        }
    }, [postId]);

    // 주기적으로 최고 입찰가를 업데이트
    useEffect(() => {
        const interval = setInterval(fetchHighestBid, 1000); // 5초마다 최신 입찰가 가져오기

        return () => {
            clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 클리어
        };
    }, [fetchHighestBid]);

    if (!auctionItem) return <div>로딩 중...</div>;

    return (
        <div className="bid-container">
            <div className="bid-live">
                <div className="bid-currentBid">
                    <CurrentBid bid={currentBid} />
                </div>
                <div className="bid-button-container">
                    {userInfo &&
                        <>
                            <button className="bid-button" onClick={() => handleBidIncrease(10000)} disabled={!isWebSocketConnected && isLoggedIn}>+10,000원</button>
                            <button className="bid-button" onClick={() => handleBidIncrease(50000)} disabled={!isWebSocketConnected && isLoggedIn}>+50,000원</button>
                        </>
                    }
                </div>
            </div>
            <div className="bid-info">
                {userInfo &&
                    <>
                        <p className="bid-info-text">내 보유 금액</p>
                        <p className="bid-info-value">{userInfo.cash.toLocaleString()}원</p>
                    </>
                }
            </div>
        </div>
    );
};

export default Bid;