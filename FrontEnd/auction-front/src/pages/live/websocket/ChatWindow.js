import {useEffect, useRef, useState} from "react";
import "../../../css/ChatWindow.css";

const useBannedUsers = () =>
{
    const [bannedUsers, setBannedUsers] = useState(new Map());

    const banUser = (nickname, suspensionTime) =>
    {
        setBannedUsers((prev) =>
        {
            const updated = new Map(prev);
            updated.set(nickname, suspensionTime);
            return updated;
        });
    };

    const unbanUser = (nickname) =>
    {
        setBannedUsers((prev) =>
        {
            const updated = new Map(prev);
            updated.delete(nickname);
            return updated;
        });
    };

    const isBanned = (nickname) =>
    {
        const suspensionTime = bannedUsers.get(nickname);
        return suspensionTime && new Date() < suspensionTime;
    };

    return { bannedUsers, banUser, unbanUser, isBanned };
};

const formatDate = (date) =>
{
    if (!date || !(date instanceof Date)) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};

const ChatWindow = () =>
{
    const nickname = sessionStorage.getItem("nickname");
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    const { bannedUsers, banUser, unbanUser, isBanned } = useBannedUsers();

    const [messages, setMessages] = useState(() =>
    {
        const savedMessages = localStorage.getItem("chatMessages");
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [messageInput, setMessageInput] = useState("");
    const [webSocket, setWebSocket] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() =>
    {
        if (!isLoggedIn) return;

        const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
        const wsUrl = `${wsProtocol}112.221.66.174:8081/chat`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () =>
        {
            setMessages((prev) => [
                ...prev,
                { type: "info", message: "실시간 채팅방에 입장했습니다. 바른말 고운말을 사용해주세요." },
            ]);
            ws.send(JSON.stringify({ type: "join", nickname }));
        };

        ws.onmessage = (event) =>
        {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "self-update")
                {
                    if (data.isBanned)
                    {
                        banUser(nickname, new Date()); // Use appropriate time logic here
                        setMessages((prev) => [
                            ...prev,
                            { type: "info", message: data.message, color: "red" },
                        ]);
                    }
                    else
                    {
                        unbanUser(nickname);
                        setMessages((prev) => [
                            ...prev,
                            { type: "info", message: data.message, color: "green" },
                        ]);
                    }
                }
                else if (data.type === "admin")
                {
                    if (data.action === "ban") banUser(data.target, new Date(data.isSuspended));
                    if (data.action === "unban") unbanUser(data.target);
                }
                else if (data.type === "message")
                {
                    setMessages((prev) => [...prev, { type: "received", message: data.message }]);
                }
                else
                {
                    console.warn("Unknown message type:", data);
                }
            } catch (error) {
                setMessages((prev) => [
                    ...prev,
                    { type: "received", message: event.data, color: "gray" },
                ]);
            }
        };

        ws.onclose = () =>
        {
            setMessages((prev) => [
                ...prev,
                { type: "info", message: "현재 점검중입니다.", color: "red" },
            ]);
        };

        ws.onerror = (error) => console.error("WebSocket Error:", error);

        setWebSocket(ws);

        return () =>
        {
            ws.send(JSON.stringify({ type: "leave", nickname }));
            ws.close();
        };
    }, [isLoggedIn, nickname]);

    const handleSendMessage = () =>
    {
        if (!webSocket || webSocket.readyState !== WebSocket.OPEN || isBanned(nickname)) return;

        const trimmedMessage = messageInput.trim();
        if (!trimmedMessage) return;

        if (isAdmin && trimmedMessage.startsWith("/"))
        {
            handleAdminCommand(trimmedMessage);
        }
        else
        {
            const sentMessage = { type: "sent", message: trimmedMessage };
            webSocket.send(JSON.stringify({ type: "message", nickname, message: trimmedMessage }));
            setMessages((prev) => [...prev, sentMessage]);
            localStorage.setItem("chatMessages", JSON.stringify([...messages, sentMessage]));
        }
        setMessageInput("");
    };

    const handleAdminCommand = (command) =>
    {
        const [cmd, targetUser] = command.split(" ");
        if (!targetUser)
        {
            setMessages((prev) => [
                ...prev,
                { type: "admin-feedback", message: "사용방법: /ban or /unban <nickname>", color: "red" },
            ]);
            return;
        }

        if (cmd === "/ban")
        {
            const suspensionTime = new Date();
            suspensionTime.setDate(suspensionTime.getDate() + 7);
            banUser(targetUser, suspensionTime); // Immediate local update
            webSocket.send(
                JSON.stringify({ type: "admin", action: "ban", target: targetUser, isSuspended: formatDate(suspensionTime), nickname })
            );
            setMessages((prev) => [
                ...prev,
                { type: "admin-feedback", message: `${targetUser}님에게 메시지 발신 7일 제한을 부여하였습니다.`, color: "red" },
            ]);
        }
        else if (cmd === "/unban")
        {
            unbanUser(targetUser); // Immediate local update
            webSocket.send(
                JSON.stringify({ type: "admin", action: "unban", target: targetUser, isSuspended: null, nickname })
            );
            setMessages((prev) => [
                ...prev,
                { type: "admin-feedback", message: `${targetUser}님의 제한을 해제하였습니다.`, color: "green" },
            ]);
        }
        else
        {
            setMessages((prev) => [
                ...prev,
                { type: "admin-feedback", message: `Unknown command: ${cmd}`, color: "red" },
            ]);
        }
    };

    useEffect(() =>
    {
        const timeoutId = setTimeout(() =>
        {
            if(scrollRef.current)
            {
                scrollRef.current.scrollTop = scrollRef.current?.scrollHeight;
            }
        }, 1); // 1ms delay

        return () => clearTimeout(timeoutId);
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="chat-window"
                 ref={scrollRef}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.type}`}
                    >
                        {msg.message}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    placeholder={
                        isBanned(nickname)
                            ? "메시지 발신 제한 상태입니다."
                            : isLoggedIn
                                ? "메시지를 입력해주세요."
                                : "로그인 후 메시지를 보낼 수 있습니다."
                    }
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={!isLoggedIn || isBanned(nickname)}
                    className="input-box"
                />
                <button onClick={handleSendMessage} disabled={!isLoggedIn || isBanned(nickname)} className="send-button">
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
