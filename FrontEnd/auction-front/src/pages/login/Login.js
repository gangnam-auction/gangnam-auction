/**
 * Login.js
 * react-cookie 모듈 사용 (npm install 후 사용 가능)
 * 
 * 아이디와 비밀번호를 입력하고 로그인 버튼을 누를 시 DB와 일치하는지 확인한 후
 * 일치할 경우 이전 페이지로 이동 (완료)
 * 
 * 회원가입, 아이디/비밀번호 찾기 버튼 클릭 시 해당 페이지로 이동 (완료)
 * 
 * 쿠키를 이용한 아이디 저장 기능 구현 (완료)
 */

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/Login.css";
import ReactModal from "react-modal";
import FindMyIdAndPw from "../find/FindMyIdAndPw";

const Login = () => 
{
    const navigate = useNavigate();
    const [loginForm, setLoginForm] = useState({ id: "", password: "" });
    const [isRemember, setIsRemember] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(["rememberId"]);
    const [modalSwitch, setModalSwitch] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem("isLoggedIn") === "true");
    const location = useLocation();
    const current = location.pathname;

    const toggleModal = () => 
    {
        setModalSwitch((prev) => !prev);
    };

    useEffect(() => 
    {
        if (!loginForm.id && cookies.rememberId) 
        {
            setLoginForm((prevForm) => ({ ...prevForm, id: cookies.rememberId }));
            setIsRemember(true);
        }
    }, [cookies.rememberId]);

    const handleOnChange = (e) => 
    {
        const isChecked = e.target.checked;
        setIsRemember(isChecked);
        if (isChecked) 
        {
            setCookie("rememberId", loginForm.id, { maxAge: 2592000 }); // 30 days
        } 
        else 
        {
            removeCookie("rememberId");
        }
    };

    const handleInputChange = (e) => 
    {
        const { name, value } = e.target;
        setLoginForm((prevForm) => ({ ...prevForm, [name]: value }));

        if (name === "id" && isRemember) 
        {
            setCookie("rememberId", value, { maxAge: 2592000 });
        }
    };

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
    
        try {

            const response = await fetch("http://112.221.66.174:8081/api/auth/login",
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm),
            });
    
            if (response.ok) 
            {
                const data = await response.json();

                Object.entries(data).forEach(([key, value]) => 
                { 
                    sessionStorage.setItem(key, value); 
                });

                sessionStorage.setItem("isLoggedIn", "true");
                setIsLoggedIn(true);

                // 데이터 전달 33한지 확인하기
                // console.log("User Data Saved in Session:", data);
                // navigate(current, { replace: true });
                navigate("/");
            } 
            else 
            {
                alert("아이디 또는 비밀번호가 일치하지 않습니다.");
            }
        } catch (error) {
            // console.error("Error logging in:", error);
            alert("로그인 중 오류가 발생했습니다.");
        }
    };

    // 로그인 된 상태에서는 로그인 페이지 진입 불가능
    useEffect(() => 
    {
        if (isLoggedIn) 
        {
            navigate(-1);
        }
    }, [isLoggedIn, navigate]);

    return (
        <div className="login-form">
            <div className="login-div">
                <h3 className="subtitle">회원 로그인</h3>
                <hr className="line" />
                <span className="message">로그인 후 이용해주세요.</span>
                    <form className="login-group" id="loginForm" onSubmit={handleSubmit}>
                        <div className="item">
                            <div className="inputs-wrapper">
                                <input
                                    type="text"
                                    name="id"
                                    id="usrId"
                                    className="form-control"
                                    placeholder="아이디"
                                    value={loginForm.id}
                                    onChange={handleInputChange}
                                    maxLength={15}
                                />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="비밀번호"
                                    value={loginForm.password}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button
                                type="submit"
                                className="login-button"
                                disabled={!loginForm.id || !loginForm.password}
                            >
                                로그인
                            </button>
                        </div>
                        <label htmlFor="saveId" className="check-item">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="saveId"
                                onChange={handleOnChange}
                                checked={isRemember}
                            />
                            <span>아이디 저장</span>
                        </label>
                    </form>
                <span className="description">아직 회원이 아니신가요?</span>
                <div className="login-button-wrapper">
                    <button className="login-button2" onClick={() => navigate("/member/signup")}>
                        회원가입
                    </button>
                </div>
                <span className="description">아이디나 비밀번호를 잊어버리셨나요?</span>
                <div className="login-button-wrapper">
                    <button className="login-button2" onClick={toggleModal}>
                        아이디/비밀번호 찾기
                        <ReactModal
                            isOpen={modalSwitch}
                            ariaHideApp={false}
                            overlayClassName="react-modal-overlay"
                            className="react-modal-content"
                        >
                            <FindMyIdAndPw toggle={toggleModal}/>
                        </ReactModal>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
