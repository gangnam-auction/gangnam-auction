/**
 * Signup2.js -> SignupForm.js
 * - 회원가입 과정 중 회원 정보 입력 부분을 담당
 * 
 * Nov 13:
 * 1) '다음으로' 버튼 클릭 시 <form> 생성 (완료)
 * 2) 각 <label>에 해당하는 입력 요소를 포함한 <form> 표시 (완료)
 * 3) useRef 이용, 자동 스크롤 처리 (완료)
 * 
 * <form> 요구사항:
 * 1) <input> 우측 dynamic 메시지를 통한 값 요구사항 표시 (완료)
 * 2) 일부 항목에 대한 중복확인 절차 추가 (완료)
 * 
 * Nov 15:
 * formFields 폴더 생성, <label> 별로 파일을 분리하였으며,
 * 각 파일은 파일 이름에 해당하는 요소의 입력을 담당
 */

// import GenderInput from './formFields/GenderInput';
import { useState, useEffect } from 'react';
import "../../css/SignupForm.css";
import { useSignupContext } from "./SignupContext";
import IdInput from './formFields/IdInput';
import PasswordInput from './formFields/PasswordInput';
import ConfirmPasswordInput from './formFields/ConfirmPasswordInput';
import NameInput from './formFields/NameInput';
import NicknameInput from './formFields/NicknameInput';
import BirthInput from './formFields/BirthInput';
import EmailInput from './formFields/EmailInput';
import PhoneInput from './formFields/PhoneInput';
import AddressInput from './formFields/AddressInput';

const SignupForm = () => 
{
    const { setCurrentStep, marketingPreferences } = useSignupContext();
    const { sendEmail, sendMessage } = marketingPreferences;

    const [formData, setFormData] = useState(
    {
        id: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        phone: { areaCode: '', middle: '', last: '' },
        address: '',
        birth: '',
        nickname: '',
    });
    const [success, setSuccess] = useState(false);
    const [formValid, setFormValid] = useState(false);

    // Generalized change handler
    const handleChange = (e) => 
    {
        if (!e || !e.target) return;

        const { name, value } = e.target;

        setFormData((prevData) => 
        {
            return { ...prevData, [name]: value };
        });
    };

    // Address selection handler
    const handleAddressSelect = (addressData) => 
    {
        setFormData((prevData) => (
        {
            ...prevData,
            address: `[${addressData.zipCode}] ${addressData.roadAddress} ${addressData.detailAddress} (${addressData.extraAddr})`,
        }));
    };

    // Validation function
    useEffect(() => 
    {
        const isValid = 
            formData.id.trim() !== '' &&
            formData.password.trim() !== '' &&
            formData.confirmPassword.trim() !== '' &&
            formData.password === formData.confirmPassword &&
            formData.name.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.nickname.trim() !== '' &&
            formData.birth.trim() !== '' &&
            formData.address.trim() !== '' &&
            formData.phone.areaCode.trim() !== '' &&
            formData.phone.middle.trim() !== '' &&
            formData.phone.last.trim() !== '';
        
        setFormValid(isValid);
    }, [formData]); // Validate whenever `formData` changes

    // Form submission handler
    const handleSubmit = async (e) => 
    {
        e.preventDefault();

        const phoneNumber = `${formData.phone.areaCode}-${formData.phone.middle}-${formData.phone.last}`;
        const dataToSend = 
        {
            ...formData,
            phone: phoneNumber,
            marketingPreferences: 
            {
                sendEmail,
                sendMessage,
            },
        };

        try {
            const response = await fetch('http://112.221.66.174:8081/api/signup',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) 
            {
                setSuccess(true);
            }
        } catch (err) 
        {
            // console.error(err);
        }
    };

    // Success case: Render success message
    if (success) 
    {
        setCurrentStep(3);
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="signup-form">
                <h3 className="subtitle">정보입력</h3>
                <hr className="line" />
                <span className="message">
                    타인의 명의를 도용할 경우 관련 법에 따라 처벌을 받을 수 있으며, 당사는 이에 대해 어떠한 책임도 지지 않습니다.
                </span>
                <IdInput value={formData.id} onChange={handleChange} validate={true} />
                <PasswordInput value={formData.password} onChange={handleChange} />
                <ConfirmPasswordInput
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    password={formData.password}
                />
                <NameInput value={formData.name} onChange={handleChange} />
                <NicknameInput value={formData.nickname} onChange={handleChange} />
                <BirthInput value={formData.birth} onChange={handleChange} />
                <PhoneInput phone={formData.phone} setFormData={setFormData} formData={formData} />
                <AddressInput onAddressSelect={handleAddressSelect} />
                <EmailInput value={formData.email} onChange={handleChange} />
                {/* DB 저장용 주소 디버그용 input */}
                {/* <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    readOnly
                    style={{ width: "400px" }}
                /> */}
                {/* <GenderInput value={formData.gender} onChange={handleChange} /> */}
                <div className="button-wrapper">
                    <button type="submit" className={`auth-link ${formValid ? "" : "disabled"}`} disabled={!formValid}>
                        가입하기
                    </button>
                </div>
            </form>
            {/* 마케팅 수신 동의 확인용 */}
            {/* <div>
                <ul>
                    <li>이메일 수신: {sendEmail ? "동의함" : "동의하지 않음"}</li>
                    <li>SMS 수신: {sendMessage ? "동의함" : "동의하지 않음"}</li>
                </ul>
            </div> */}
        </div>
    );
};

export default SignupForm;
