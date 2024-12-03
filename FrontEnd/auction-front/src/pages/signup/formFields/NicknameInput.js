import { useState } from "react";

const NicknameInput = ({ value, onChange }) => 
{
    const [description, setDescription] = useState("닉네임은 2-10자의 한글, 영문자, 숫자만 사용 가능합니다.");
    const [descriptionColor, setDescriptionColor] = useState("#666"); // Initial color
    const [isChecking, setIsChecking] = useState(false); // Loading state

    const validateNickname = (nickname) => 
    {
        if (nickname.length === 0) 
        {
            setDescriptionColor("#666"); // Reset to initial color
            return "닉네임을 입력해주세요.";
        }
        else if (nickname.length < 2 || nickname.length > 10) 
        {
            setDescriptionColor("red");
            return "닉네임은 2-10자여야 합니다.";
        } 
        else if (!/^[a-zA-Z가-힣0-9]*$/.test(nickname)) 
        {
            setDescriptionColor("red");
            return "사용 불가능한 닉네임 형식입니다.";
        } 
        else 
        {
            setDescriptionColor("green");
            return "사용 가능한 닉네임 형식입니다.";
        }
    };

    const handleChange = (e) => 
    {
        const nickname = e.target.value;
        onChange(e); // Pass the event to the parent handler
        setDescription(validateNickname(nickname)); // Update the description and color
    };

    const checkDuplication = async () => 
    {
        const validationMessage = validateNickname(value);
        if (validationMessage !== "사용 가능한 닉네임 형식입니다.") 
        {
            setDescription(validationMessage);
            return;
        }
    
        setIsChecking(true);
        try {
            const response = await fetch("http://112.221.66.174:8081/api/check-nickname?nickname=" + value,
            {
                method: "GET",
                headers: 
                {
                    "Content-Type": "application/json",
                },
            });
    
            const isDuplicate = await response.json();
    
            if (isDuplicate) 
            {
                setDescription("이미 사용 중인 닉네임입니다.");
                setDescriptionColor("red");
            } 
            else 
            {
                setDescription("사용 가능한 닉네임입니다.");
                setDescriptionColor("green");
            }
        } catch (error) {
            if (error.response && error.response.status === 500) 
            {
                setDescription("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
            } 
            else 
            {
                setDescription("네트워크 오류로 중복 확인에 실패했습니다.");
            }
            setDescriptionColor("red");
        } finally {
            setIsChecking(false);
        }
    };

    // 중복검사 버튼 광클로 인한 부하 방지
    const debounce = (func, delay) => 
    {
        let timer;
        return (...args) => 
        {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };
    
    const debouncedCheckDuplication = debounce(checkDuplication, 500);

    return(
        <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <input
                type="text"
                id="nickname"
                name="nickname"
                value={value}
                onChange={handleChange}
                style={{ width: "120px"}}
                maxLength={10}
            />
            <button 
                type="button" 
                className="check-button" 
                onClick={debouncedCheckDuplication}
                disabled={isChecking}
            >
                {isChecking ? "확인 중..." : "중복확인"}
            </button>
            <span
                className="input-description"
                style={{ color: descriptionColor }}
            >
                {description}
            </span>
        </div>
    )
}

export default NicknameInput;
