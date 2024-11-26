import axios from "axios";
const BASE_URL = "http://localhost:8080/auction";

export const totalAuctionList = () => axios.get(`${BASE_URL}`);

export const antiqueList = () => axios.get(`${BASE_URL}/antique`);

export const limitedList = () => axios.get(`${BASE_URL}/limited`);

export const discontinuationList = () => axios.get(`${BASE_URL}/discontinuation`);

export const artProductList = () => axios.get(`${BASE_URL}/artproduct`);

export const valuablesList = () => axios.get(`${BASE_URL}/valuables`);

export const liveList = ()=> axios.get(`${BASE_URL}/live`);

export const postDetail = (postId) => {
    return axios.get(`${BASE_URL}/${postId}`);
}

export const searchItemList = (searchItem,categoryCode) => {
    const encodedSearchItem = encodeURIComponent(searchItem);
    return axios.get(`${BASE_URL}/search`, {
        params: { q: encodedSearchItem, categoryCode : categoryCode }
    });
};

export const searchItemAllList = (searchItem) => {
    const encodedSearchItem = encodeURIComponent(searchItem);
    return axios.get(`${BASE_URL}/searchitem`, {
        params: { q: encodedSearchItem }
    });
};


export const addFavorite = (postId, userCode) => {
    return axios.post("http://localhost:8080/favo/addfav",
        {postId, userCode});
}

export const getMyFav = (postId, userCode)=>{
    return axios.get("http://localhost:8080/favo/getfav", {
        params: { postId, userCode },
    });
}

export const deleteFavorite = (postId, userCode) => {
    return axios.delete(`http://localhost:8080/favo/deletefav?postId=${postId}&userCode=${userCode}`);
}

export const getBoardImg = (postId) =>{
   return axios.get(`http://localhost:8080/images/${postId}`);
}

export const updatePost = async (formData) => {
    try {
        const response = await axios.put(`${BASE_URL}/update`, formData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("API 응답:", response.data);
        return response;
    } catch (error) {
        console.error("API 오류:", error.response?.data || error.message);
        throw error;
    }
};

export const notUseThisPost = (postId)=>{
    return axios.post(`${BASE_URL}/delete/${postId}`)
}

export const approval = (postId) =>{
    return axios.post(`${BASE_URL}/approval/${postId}`)
}


export const setPostStatus = postId =>{
    return axios.post(`${BASE_URL}/endlive/${postId}`)
}

export const updateLive = postId =>{
    return axios.post(`${BASE_URL}/startlive/${postId}`)
}