import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import axios from "axios";
import { useLogin } from '../../pages/login/LoginContext';
import "../../css/RequestItem.css"

const RequestItem = () => {
    const navigate = useNavigate();
    const { user } = useLogin();
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const userCode = sessionStorage.getItem("userCode");

    const [formData, setFormData] = useState({
        categoryCode: '',
        date: new Date(),
        title: '',
        content: '',
        userCode: '',
        startCash: 0
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [imageURLs, setImageURLs] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isLoggedIn) {
            setFormData(prevState => ({
                ...prevState,
                userCode: userCode
            }));
        }
    }, [user]);
    const isFormValid = () => {
        return (
            formData.categoryCode &&
            formData.date &&
            formData.title &&
            formData.content &&
            formData.startCash &&
            imageFiles.length > 0
        );
    };


    const minSelectableDate = new Date();
    minSelectableDate.setDate(minSelectableDate.getDate() + 7);

    const filterTime = (time) => {
        const hour = time.getHours();
        return hour >= 12;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleDateChange = (date) => {
        setFormData(prevState => ({
            ...prevState,
            date: date
        }));
    };

    const handleImageChange = (e) => {
        const files = e.target.files;
        setImageFiles(Array.from(files));
        const fileURLs = Array.from(files).map(file => URL.createObjectURL(file));
        setImageURLs(fileURLs);
    };

    // 전체 취소 버튼 처리
    const handleRemoveAllImages = () => {
        setImageFiles([]); // 이미지 파일 배열 초기화
        setImageURLs([]); // 미리보기 URL 배열 초기화
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // input[type="file"] 값 초기화
        }
    };

    // 첨부 이미지 개별 삭제
    const handleRemoveImages = (index) => {
        setImageFiles((prevImages) => prevImages.filter((_, i) => i !== index));
        setImageURLs((prevURLs) => prevURLs.filter((_, i) => i !== index));
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // input[type="file"] 값 초기화
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(userCode)
        console.log(formData);

        try {
            const response = await axios.post('http://112.221.66.174:8081/requestitem', formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log(formData);

            if (response.status === 200 || response.status === 201) {
                const postId = response.data.postId;

                console.log('폼 데이터가 저장되었습니다. postId:', postId);
                await handleImageUpload(postId);
            } else {
                throw new Error('서버 응답이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('폼 제출 실패:', error);
            alert('폼 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    const handleImageUpload = async (postId) => {

        const formData = new FormData();
        for (const element of imageFiles) {
            formData.append('images', element);
        }

        try {
            const response = await axios.post('http://112.221.66.174:8081/images/upload', formData, {
                params: { postId }
            });

            if (response.status === 200 || response.status === 201) {
                console.log('이미지 업로드 성공');
                alert('경매품 등록을 완료했습니다. 자세한 사항은 1:1 문의에 보내드리겠습니다');
                navigate('http://112.221.66.174:8081/customer/notice');
            } else {
                throw new Error('이미지 업로드 실패');
            }
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            alert('이미지 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    if (!isLoggedIn) {
        return <div>로그인이 필요합니다.</div>;
    }

    return (
        <div className="requestitem-container">
            <h1>경매품 신청하기</h1>
            <div className="request-notice">
                ※ 본문 입력란에 정확히 기재해 주세요. 상세 정보 및 고객의 상품을 정확히 확인합니다.
            </div>

            <form onSubmit={handleSubmit}>
                {/* 기존 폼 필드들 */}
                <div className="form-group">
                    <label htmlFor="categoryCode">분류</label>
                    <select id="categoryCode" name="categoryCode" value={formData.categoryCode} onChange={handleChange}
                            required>
                        <option value="" disabled hidden>카테고리 선택</option>
                        <option value="a">골동품</option>
                        <option value="l">한정판</option>
                        <option value="d">단종품</option>
                        <option value="ap">예술품</option>
                        <option value="v">귀중품</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>날짜</label>
                    <DatePicker
                        selected={formData.date}  // formData.date로 날짜 값 연결
                        onChange={handleDateChange}  // 날짜 변경시 formData.date 업데이트
                        dateFormat="yyyy-MM-dd HH:mm"
                        minDate={minSelectableDate}
                        showTimeSelect
                        timeIntervals={30}
                        timeFormat="HH:mm"
                        filterTime={filterTime}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}/>
                </div>

                <div className="form-group">
                    <label>내용</label>
                    <textarea id="content" name="content" cols="100" rows="20"
                              value={formData.content} onChange={handleChange}
                              placeholder="경매품의 정보를 상세히 입력해 주시기 바랍니다."/>
                </div>
                <div className="form-group">
                    <label htmlFor="startCash">희망 경매 시작 가격</label>
                    <input
                        type="number"
                        id="startCash"
                        name="startCash"
                        value={formData.startCash}
                        onChange={handleChange}
                        placeholder="숫자만 입력하세요"
                    />
                </div>

                {/* 이미지 파일 업로드 필드 */}
                <div className="form-group">
                    <label htmlFor="image">이미지 첨부</label>
                    <div className="request-image">
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            multiple
                            ref={fileInputRef}
                        />
                        <div className="request-button">
                            <button className="request-img-allDelete-button" onClick={handleRemoveAllImages}>
                                전체 취소
                            </button>
                        </div>
                    </div>
                </div>

                {/* 미리보기 영역 */}
                <div className="form-group">
                    {imageURLs.length > 0 && (
                        <div className="request-image-preview">
                            {imageURLs.map((url, index) => (
                                <div key={index}
                                     style={{display: 'inline-block', position: 'relative', marginRight: '10px'}}>
                                    <img
                                        src={url}
                                        alt={`미리보기 ${index + 1}`}
                                        style={{maxWidth: '200px', maxHeight: '200px'}}
                                    />
                                    <button className="img-delete-button"
                                            onClick={() => handleRemoveImages(index)}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="request-submit"
                    disabled={!isFormValid()}
                >
                    제출하기
                </button>
            </form>
        </div>
    );
};

export default RequestItem;