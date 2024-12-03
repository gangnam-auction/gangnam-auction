import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../../pages/acution/common/AuctionAPIs";
import '../../css/RecentlyView.css'

const RecentlyView = () => {

    const getRecentPosts = () => JSON.parse(localStorage.getItem("recentPosts")) || [];
    const [recentViews, setRecentViews] = useState(getRecentPosts());


    // 브라우저 뒤로가기, 페이지 이동 감지
    useEffect(() => {
        const handlePopState = () =>{
            setRecentViews(getRecentPosts());
        }

        window.addEventListener("popstate", handlePopState);

        // 컴포넌트 언마운트 시 리스너 제거
        return() =>{
            window.removeEventListener("popstate", handlePopState)
        };
    }, []);


    const onItemClick = async (post) => {
        const updatedPosts = await updateRecentPosts(post);
        setRecentViews(updatedPosts);
    };


    return (
        <aside className="right-aside">
            <p className="right-aside_Text">최근 본 게시물</p>
            <div>
                {recentViews.length > 0 ? (
                    getRecentPosts().map((view) => (
                        <div key={view.postId} className="recently-views">
                            <Link to={`/auction/${view.postId}`} onClick={()=>onItemClick(view)}>
                                <img
                                    className="recently-views_img"
                                    src={view.imageUrl}
                                    alt={`${view.title}의 이미지`}
                                />
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="recently-views_text">최근 본 게시물이 없습니다.</p>
                )}
            </div>
        </aside>
    );
}
export default RecentlyView;


export const updateRecentPosts = async (post) => {
    const recentPosts = JSON.parse(localStorage.getItem("recentPosts")) || [];

    // 이미지 가져오기
    const postId = post.postId;
    try {
        const response = await api.getBoardImg(postId);
        const data = response.data;

        // 첫 번째 이미지 URL만 가져오기
        const firstImageUrl = data.length > 0 ? data[0].imageUrl : 'default-image-url.jpg';
        const postWithImage = { ...post, imageUrl: firstImageUrl };

        const updatedPostsWithImages = [
            postWithImage,
            ...recentPosts.filter((p) => p.postId !== post.postId),
        ].slice(0, 2);

        // 로컬 스토리지에 저장
        localStorage.setItem("recentPosts", JSON.stringify(updatedPostsWithImages));
        return updatedPostsWithImages; // 변경된 게시물 목록 반환
    } catch (error) {
        console.error("(최근본게시물)게시글 이미지를 불러오는 중 오류가 발생했습니다:", error);
        return recentPosts;
    }
};

