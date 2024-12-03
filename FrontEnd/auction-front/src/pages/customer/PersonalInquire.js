import axios from 'axios';
import React, { useState } from 'react';
import { useLogin } from '../../pages/login/LoginContext';
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
const baseURL =process.env.REACT_APP_API_URL;
const PersonalInquire = () => {
    const { user } = useLogin();
    const userCode = sessionStorage.getItem("userCode");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const navigate = useNavigate(); // useNavigate 훅 사용

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        userCode: user ? user.userCode : null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        try {
            const response = await axios.post('http://112.221.66.174:8081/customer/personalinquire', {
                ...formData,
                userCode: userCode
            });
            console.log('문의가 성공적으로 제출되었습니다:', response.data);
            alert('문의가 성공적으로 제출되었습니다.');
            navigate(-1); // 이전 페이지로 리다이렉트
        } catch (error) {
            console.error('문의 제출 중 오류 발생:', error);
            alert('문의 제출 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="Inquire-container">
            <h2>1:1 문의 작성</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">제목:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">내용:</label>
                    <textarea
                        className="Inquire-contentBox"
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <button type="submit" className="Inquire-submit-btn">제출</button>
            </form>
        </div>
    );
};

export default PersonalInquire;