import { useEffect, useState } from "react";
import * as api from "../acution/common/AuctionAPIs";
import { getPostImages } from "../acution/common/Images"; // 이미지 API 호출 함수
import axios from "axios"; // GET 요청을 위한 axios

const Admin = () => {
    const [board, setBoard] = useState([]);
    const [postStatus, setPostStatus] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [img, setImg] = useState([]);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [startTime, setStartTime] = useState(null);

    // 게시글 가져오기
    useEffect(() => {
        const getBoard = async () => {
            try {
                const response = await api.postDetail(88);  // 게시글 세부정보 가져오기
                const data = response.data;
                setBoard(data);
                setPostStatus(data.postStatus);

                const imageUrls = await getPostImages(88);  // 이미지 URL 가져오기
                console.log(imageUrls);  // 로그로 확인
                setImg(imageUrls);  // 이미지 URL 배열 상태 업데이트

                if (data.startDay) {
                    setStartTime(new Date(data.startDay));
                } else {
                    console.error("startDay 데이터가 없습니다.");
                }

            } catch (error) {
                console.error("게시글 데이터를 불러오는 중 오류가 발생했습니다:", error);
            } finally {
                setIsLoading(false); // 로딩 상태 해제
            }
        };

        setIsLoading(true);
        getBoard();
    }, []);

    // 이미지 GET 요청 후 출력하기


    return (
        <div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h1>{board.title}</h1>
                    <p>{postStatus}</p>

                    {/* 이미지를 출력하는 부분 */}
                    <div>
                        {img.length > 0 ? (
                            img.map((imageUrl, index) => (
                                <div key={index}>
                                    <img
                                        src={imageUrl}  // 받아온 URL을 이미지로 출력
                                        alt={`image-${index}`}
                                        style={{ width: "100%", height: "auto", margin: "10px 0" }}
                                    />
                                </div>
                            ))
                        ) : (
                            <p>이미지가 없습니다.</p>
                        )}
                    </div>

                    {/* 시작 시간 출력 (optional) */}
                    {startTime && (
                        <div>
                            <p>시작 시간: {startTime.toLocaleString()}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;
