import {useEffect, useState} from 'react';
import { useLogin } from "../login/LoginContext";
import { useNavigate } from 'react-router-dom';
import "../../css/MyProfile.css";

const MyProfile = () =>
{
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const { user } = useLogin();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() =>
    {
        if (!isLoggedIn)
        {
            alert("로그인이 필요합니다.");
            navigate("/member/login");
        } else {
            setIsLoading(false);
        }
    }, [isLoggedIn, navigate, user]);

    const formatDate = (dateString) =>
    {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    if (!user)
    {
        return <div className="myprofileinfoing">사용자 정보를 불러오는 중입니다...</div>;
    }

    return (
        <div className="profile-container">
            <h1 className="profile-title">내 정보</h1><hr/>
            <div className="profile-table">
                {[
                    {label: "아이디", value: user.id},
                    {label: "이름", value: user.name},
                    {label: "닉네임", value: user.nickname},
                    {label: "생년월일", value: formatDate(user.birth)},
                    {label: "이메일", value: user.email},
                    {label: "휴대전화", value: user.phone},
                    {label: "주소", value: user.address},
                ].map(({label, value}) => (
                    <div className="profile-row" key={label}>
                        <div className="profile-label">{label}</div>
                        <div className="profile-value">
                            <input type="text" value={value || ""} readOnly/>
                        </div>
                    </div>
                ))}
                <button className="myprofile-edit-btn">수정하기</button>
            </div>

            {/*<table className="profile-table-list">*/}
            {/*    <thead>*/}
            {/*    <tr>*/}
            {/*        <th>아이디</th>*/}
            {/*        <th>이름</th>*/}
            {/*        <th>닉네임</th>*/}
            {/*        <th>생년월일</th>*/}
            {/*        <th>이메일</th>*/}
            {/*        <th>휴대전화</th>*/}
            {/*        <th>주소</th>*/}
            {/*    </tr>*/}
            {/*    </thead>*/}
            {/*    <tbody>*/}
            {/*        <td>*/}
            {/*            */}
            {/*        </td>*/}
            {/*    </tbody>*/}
            {/*</table>*/}
        </div>
    );
};

export default MyProfile;
