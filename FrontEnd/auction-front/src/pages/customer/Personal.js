import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/Personal.css";
import { useLogin } from '../../pages/login/LoginContext'; // LoginContext import 추가
const baseURL =process.env.REACT_APP_API_URL;
const Personal = () => {
    const navigate = useNavigate();
    const { user } = useLogin(); // LoginContext에서 user 정보 가져오기
    const [userPosts, setUserPosts] = useState([]);
    const [error, setError] = useState(null);
    const [openItems, setOpenItems] = useState([]);
    const userCode = sessionStorage.getItem("userCode");

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!user) {
                setError('로그인 정보가 없습니다.');
                return;
            }

            try {
                console.log("Fetching posts for user:", userCode);
                const response = await axios.post('http://112.221.66.174:8081/customer/personal', { userCode });
                // console.log("Full response:", response);
                // console.log("Response data:", response.data);

                if (Array.isArray(response.data)) {
                    setUserPosts(response.data);
                    setOpenItems(new Array(response.data.length).fill(false));
                } else if (typeof response.data === 'object' && response.data !== null) {
                    setUserPosts(response.data.posts || []);
                    setOpenItems(new Array(response.data.posts?.length || 0).fill(false));
                } else {
                    console.error('Unexpected response format:', response.data);
                    setError('서버에서 예상치 못한 형식의 데이터를 반환했습니다.');
                }
            } catch (error) {
                console.error('Error fetching user posts:', error);
                setError(`게시물을 불러오는데 실패했습니다: ${error.message}`);
            }
        };
        fetchUserPosts();
    }, [user]);

    const handleCreatePost = () => {
        navigate('/customer/personalinquire');
    };

    const toggleContent = (index) => {
        setOpenItems(prevOpenItems => {
            const newOpenItems = [...prevOpenItems];
            newOpenItems[index] = !newOpenItems[index];
            return newOpenItems;
        });
    };

    return (
        <div className="personal-container">
            <h2>1:1 문의</h2>
            <div className="user-posts">
                <h3>내 문의</h3>
                {userPosts.length > 0 ? (
                    <table className="personal-table">
                        <tbody>
                            {userPosts.map((post, index) => (
                                <React.Fragment key={index}>
                                    <tr className="personal-item" onClick={() => toggleContent(index)}>
                                        <td className="personal-title" colSpan="2">
                                           {post.title}
                                        </td>
                                    </tr>
                                    {openItems[index] && (
                                        <tr className="personal-item">
                                            <td className="personal-content" colSpan="2">
                                                <p><strong>문의 내용 : </strong> {post.content}</p>
                                                {post.answer && (
                                                    <p><strong>답변 : </strong> {post.answer}</p>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="personal-text">1:1문의 내역이 없습니다.</p>
                )}
            </div>
            <button onClick={handleCreatePost} className="submit-btn">1:1 문의 작성</button>
        </div>
    );
}

export default Personal;