import { useEffect, useState } from "react";

const ChatWindow = () => 
{
    const nickname = sessionStorage.getItem("nickname");
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    const parseSuspensionTime = (timeString) => 
    {
        if (!timeString) return null;
    
        const parts = timeString.split(",").map((part) => parseInt(part, 10));
        if (parts.length === 6) 
        {
            const [year, month, day, hour, minute, second] = parts;
            return new Date(year, month - 1, day, hour, minute, second);
        }
        else if (parts.length < 6)
        {
            const [year, month, day, hour, minute] = parts;
            return new Date(year, month - 1, day, hour, minute, "00");
        }
    
        console.error("Invalid suspension time format:", timeString);
        return null;
    };

    const suspensionTime = sessionStorage.getItem("isSuspended");
    const isSuspendedDate = parseSuspensionTime(suspensionTime);
    const now = new Date();
    const isSuspended = isSuspendedDate ? isSuspendedDate > now : false;

    const formatSuspensionTime = (date) => 
    {
        if (!date || !(date instanceof Date)) return "";
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일
                ${date.getHours()}시 ${date.getMinutes()}분 ${date.getSeconds()}초`;
    };

    const formatDate = (date) => 
    {
        if (!date || !(date instanceof Date)) return "";
    
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Adds leading 0 if needed
        const day = String(date.getDate()).padStart(2, '0'); // Adds leading 0 if needed
        const hours = String(date.getHours()).padStart(2, '0'); // Adds leading 0 if needed
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Adds leading 0 if needed
        const seconds = String(date.getSeconds()).padStart(2, '0'); // Adds leading 0 if needed
    
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const [message, setMessage] = useState(() => 
    {
        const savedMessages = localStorage.getItem("chatMessages");
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [messageInput, setMessageInput] = useState("");
    const [webSocket, setWebSocket] = useState(null);

    useEffect(() => 
    {
        if (!isLoggedIn) return;

        const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
        const wsUrl = `${wsProtocol}112.221.66.174:8080/chat`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => 
        {
            setMessage((prev) => [
                ...prev,
                {
                    type: "info",
                    message: "채팅 서버에 연결되었습니다. 바른말 고운말을 사용해주세요.",
                },
            ]);
            ws.send(JSON.stringify({ type: "join", nickname }));
        
            if (isSuspended) 
            {
                const formattedSuspensionTime = formatSuspensionTime(isSuspendedDate);
                setMessage((prev) => [
                    ...prev,
                    {
                        type: "info",
                        message: `현재 고객님의 계정은 채팅이 정지된 상태입니다.`,
                        color: "red"
                    },
                ]);
                setMessage((prev) => [
                    ...prev,
                    {
                        type: "info",
                        message: `${formattedSuspensionTime} 이후 다시 채팅이 가능합니다.`,
                        color: "red"
                    },
                ]);
            }
        };
        

        ws.onmessage = (event) => 
        {
            const message = event.data;
            setMessage((prev) => [...prev, { type: "received", message}]);
        };

        ws.onclose = () => 
        {
            setMessage((prev) => [
                ...prev,
                { type: "info", message: "현재 채팅이 불가능한 상태입니다.", color: "red" },
            ]);
        };

        ws.onerror = (error) => 
        {
            console.error("WebSocket Error:", error);
        };

        setWebSocket(ws);

        return () => 
        {
            if (ws) 
            {
                ws.send(JSON.stringify({ type: "leave", nickname }));
                ws.close();
            }
        };
    }, [isLoggedIn, isSuspended, nickname]);

    const sendMessage = () => 
    {
        if (webSocket && webSocket.readyState === WebSocket.OPEN && !isSuspended) 
        {
            const trimmedMessage = messageInput.trim();
            if (trimmedMessage !== "") 
            {
                if (isAdmin && trimmedMessage.startsWith("/")) 
                {
                    handleAdminCommand(trimmedMessage);
                } 
                else 
                {
                    const sentMessage = { type: "sent", message: trimmedMessage };
                    webSocket.send(JSON.stringify({ type: "message", nickname, message: trimmedMessage }));
                    setMessage((prev) => 
                    {
                        const updatedMessages = [...prev, sentMessage];
                        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
                        return updatedMessages;
                    });
                }
                setMessageInput("");
            }
        }
    };

    const handleAdminCommand = (command) => 
    {
        const [cmd, ...args] = command.split(" ");
        if (cmd === "/ban") 
        {
            const targetUser = args[0];
            if (targetUser) 
            {
                const isSuspended = new Date();
                isSuspended.setDate(isSuspended.getDate() + 7);
    
                // Send ban message to the backend
                webSocket.send(
                    JSON.stringify({
                        type: "admin",
                        action: "ban",
                        target: targetUser,
                        isSuspended: formatDate(isSuspended),
                        nickname,
                    })
                );
    
                // Display feedback to the admin in the chat window
                setMessage((prev) => [
                    ...prev,
                    {
                        type: "admin-feedback",
                        message: `${targetUser}님의 메시지 전송을 7일 동안 금지했습니다.`,
                        color: "red",
                    },
                ]);
            } 
            else 
            {
                setMessage((prev) => [
                    ...prev,
                    {
                        type: "admin-feedback",
                        message: "사용방법: /ban <nickname>",
                    },
                ]);
            }
        }
        else if (cmd === "/unban") 
        {
            const targetUser = args[0];
            if (targetUser) 
            {
                // Send ban message to the backend
                webSocket.send(
                    JSON.stringify({
                        type: "admin",
                        action: "unban",
                        target: targetUser,
                        isSuspended: null,
                        nickname,
                    })
                );
    
                // Display feedback to the admin in the chat window
                setMessage((prev) => [
                    ...prev,
                    {
                        type: "admin-feedback",
                        message: `${targetUser}님의 메시지 전송 금지를 즉시 해제하였습니다.`,
                        color: "red",
                    },
                ]);
            } 
            else 
            {
                setMessage((prev) => [
                    ...prev,
                    {
                        type: "admin-feedback",
                        message: "사용방법: /(un)ban <nickname>",
                    },
                ]);
            }
        }
        else 
        {
            setMessage((prev) => [
                ...prev,
                {
                    type: "admin-feedback",
                    message: `알 수 없는 커맨드: ${cmd}`,
                },
            ]);
        }
    };
    
        

    const handleKeyPass = (event) => 
    {
        if (event.key === "Enter" && isLoggedIn && !isSuspended) 
        {
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div
                id="chatwindow"
                className="chat-window"
                style={{
                    border: "1px solid #ccc",
                    height: "400px",
                    backgroundColor: "#fff",
                    overflowY: "scroll",
                }}
            >
                {message.map((msg, index) => 
                {
                    if (msg.type === "admin-feedback" && !isAdmin) return null;

                    return (
                        <div
                            key={index}
                            className={`sendedmessage ${msg.type}`}
                            style={{
                                textAlign:
                                    msg.type === "sent"
                                        ? "right"
                                        : msg.type === "admin-feedback"
                                        ? "right"
                                        : "left",
                                marginTop: "5px",
                                color: msg.color ||
                                    (msg.type === "sent"
                                        ? "blue"
                                        : msg.type === "info"
                                        ? "gray"
                                        : msg.type === "admin-feedback"
                                        ? "purple"
                                        : "#f32f00"),
                            }}
                        >
                            {msg.message}
                        </div>
                        
                    );
                })}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    id="chatMessage"
                    placeholder={
                        isSuspended
                            ? "운영정책에 위배된 행동으로 인해 메시지를 보낼 수 없습니다."
                            : isLoggedIn
                            ? "메시지 입력"
                            : "로그인 후 메시지를 입력하세요"
                    }
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPass}
                    disabled={!isLoggedIn || isSuspended}
                    style={{width: "629px"}}
                />
                <button id="sendBtn" onClick={sendMessage} disabled={!isLoggedIn || isSuspended}>
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
