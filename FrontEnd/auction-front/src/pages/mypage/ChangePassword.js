import { useState } from "react";
import { useLogin } from "../../pages/login/LoginContext";
import ConfirmPasswordInput from "../signup/formFields/ConfirmPasswordInput";
import NewPasswordInput from "../signup/formFields/NewPasswordInput";
import PasswordInput from "../signup/formFields/PasswordInput";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => 
{
    const { user, setUser } = useLogin();
    const [formData, setFormData] = useState(
    {
        password: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const state = true;
    const navigate = useNavigate();

    const handleChange = (e) => 
    {
        if (!e || !e.target) return;

        const { name, value } = e.target;

        setFormData((prevData) => 
        {
            return { ...prevData, [name]: value };
        });
    };

    const handlePasswordSubmit = async (e) => 
    {
        e.preventDefault();

        // 왜 안되지 이거
        // if (formData.password !== user?.password)
        // {
        //     alert("기존 비밀번호가 일치하지 않습니다.");
        //     return;
        // }

        if (formData.newPassword !== formData.confirmPassword) 
        {
            alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        const dataToSend = 
        {
            id: user?.id, // Use the logged-in user's ID
            password: formData.newPassword,
        };

        try {
            const response = await fetch("http://112.221.66.174:8081/api/finder/pw/update",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) 
            {
                setResultMessage("비밀번호가 성공적으로 변경되었습니다.");
                setPasswordChanged(true);

                // Update context or session storage if needed
                setUser((prev) => (
                {
                    ...prev,
                    password: formData.newPassword,
                }));
            } 
            else 
            {
                setResultMessage("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            setResultMessage("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    };

    if (passwordChanged) 
    {
        alert(resultMessage);
        navigate("/mypage/myprofile");
    }

    return (
        <div>
            <h3 className="subtitle">비밀번호 변경</h3>
            <hr className="line" />
            <form onSubmit={handlePasswordSubmit}>
                <PasswordInput
                    value={formData.password}
                    onChange={handleChange}
                    state={state}
                />
                <NewPasswordInput
                    value={formData.newPassword}
                    onChange={handleChange}
                />
                <ConfirmPasswordInput
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    password={formData.newPassword}
                />
                <div className="button-wrapper">
                    <button type="submit" className="auth-link">
                        변경하기
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
