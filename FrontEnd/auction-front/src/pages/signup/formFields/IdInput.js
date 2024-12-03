import { useState } from "react";

const IdInput = ({ value, onChange, validate }) => 
{
    const [description, setDescription] = useState("아이디는 5-15자의 영문자 혹은 영문자와 숫자의 조합이어야 합니다.");
    const [descriptionColor, setDescriptionColor] = useState("#666"); // Initial color
    const [isChecking, setIsChecking] = useState(false); // Loading state

    const validateId = (id) => 
    {
        if (id.length === 0) 
        {
            setDescriptionColor("#666");
            return "아이디를 입력해주세요.";
        }
        else if (id.length < 5 || id.length > 15) 
        {
            setDescriptionColor("red");
            return "아이디는 5-15자여야 합니다.";
        } 
        else if (/^\d+$/.test(id)) 
        { 
            setDescriptionColor("red");
            return "아이디는 숫자만으로 구성될 수 없습니다.";
        }
        else if (!/^[a-zA-Z0-9][a-zA-Z0-9]*$/.test(id)) 
        {
            setDescriptionColor("red");
            return "아이디는 영문자 또는 영문자 + 숫자 조합이어야 합니다.";
        }
        else 
        {
            setDescriptionColor("green");
            return "사용 가능한 아이디 형식입니다.";
        }
    };

    const handleChange = (e) => 
    {
        const id = e.target.value;
        onChange(e); 
        setDescription(validateId(id));
    };

    const checkDuplication = async () => 
    {
        const validationMessage = validateId(value);
        if (validationMessage !== "사용 가능한 아이디 형식입니다.") 
        {
            setDescription(validationMessage);
            return;
        }
    
        setIsChecking(true);
        try {
            const response = await fetch("http://112.221.66.174:8081/api/check-id?id=" + value,
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
                setDescription("이미 사용 중인 아이디입니다.");
                setDescriptionColor("red");
            } 
            else 
            {
                setDescription("사용 가능한 아이디입니다.");
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

    return (
        <div className="form-group">
            <label htmlFor="id">아이디</label>
            <input
                type="text"
                id="id"
                name="id"
                value={value}
                onChange={handleChange}
                maxLength={15}
                style={{ width: "120px" }}
            />
            {validate ? (
                <>
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
                </>) : (<></>)}
        </div>
    );
};

export default IdInput;
