import { NavLink, Outlet } from "react-router-dom";
import { useLogin } from "../../pages/login/LoginContext";
import "../../css/MyPageLayout.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyPageLayout = () => {

    const nickname = sessionStorage.getItem("nickname");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const navigate = useNavigate();
    const { user } = useLogin();

    useEffect(() => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            navigate("/member/login");
            return;
        }
    }, [isLoggedIn, navigate, user]);

        const welcomeMypage = (nickname, maxLength) => {
            if (nickname && nickname.length > maxLength) {
                return nickname.substring(0, maxLength) + "...";
            }
            return nickname;
        };

    return (
        <div>
            <p className="nickname-welcome">{welcomeMypage(nickname, 50)}님, 환영합니다.</p>
            <div className="mypage-layout">
                <div className="mypage">
                    <ul>
                        {/*<li><button><NavLink to="/mypage" activeclassname="active-link"*/}
                        {/*             className="mypage-center-link">마이페이지</NavLink></button></li>*/}
                        <li><button><NavLink to="/mypage/myfar" activeclassname="active-link">즐겨찾기</NavLink></button></li>
                        <li><button><NavLink to="/mypage/myprofile" activeclassname="active-link">내 정보</NavLink></button></li>
                        <li><button><NavLink to="/mypage/myauctionitem" activeclassname="active-link">경매품</NavLink></button></li>
                        <li><button><NavLink to="/mypage/myauction" activeclassname="active-link">낙찰 경매품 목록</NavLink></button></li>
                    </ul>
                </div>
                <div className="outlet-fixsize">
                    <Outlet/>
                </div>
            </div>
        </div>
    );
};

export default MyPageLayout;
