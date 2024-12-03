import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../css/AdminUsers.css"

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://112.221.66.174:8081/adminuser/users');
            setUsers(response.data);
            console.log(users);
            setLoading(false);
        } catch (err) {
            setError('사용자 정보를 불러오는 데 실패했습니다.');
            setLoading(false);
            console.error('Error fetching users:', err);
        }
    };

    const handleUserClick = (user) => {
        console.log("온클릭", user);
        navigate(`/admin/users/${user.userCode}`, { state: { user } });
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="users-container">
            <h2>사용자 관리</h2>
            <table className="users-table">
                <thead>
                    <tr>
                        <th colSpan="3">ID</th>
                        <th>이름</th>
                        <th>가입일</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr 
                            key={user.id} 
                            onClick={() => handleUserClick(user)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td colSpan="3" >{user.id}</td>
                            <td>{user.name}</td>
                            <td>{new Date(user.createUser).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsers;