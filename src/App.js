import { useEffect, useMemo, useState } from "react";
import "./styles.css";

//constants
const MESSAGE_TYPE = {
  TEXT: "text",
  OPTIONED_MESSAGE: "optionedMessage"
};

const SENDER = {
  BOT: "BOT",
  USER: "USER"
};

// hooks
const useFetchChats = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetch("https://my-json-server.typicode.com/codebuds-fk/chat/chats")
      .then((res) => res.json())
      .then((data) => setChats(data))
      .catch((error) => {
        console.log({ error });
        setChats([]);
      });
  }, []);

  return [chats, setChats];
};

//utils
const filterChats = (filterQuery, chats) => {
  if (filterQuery.length === 0) return chats;

  return chats.filter(
    ({ orderId, title }) =>
      orderId.toLowerCase().includes(filterQuery) ||
      title.toLowerCase().includes(filterQuery)
  );
};

// components
const Card = ({ children, customClass, dataId }) => {
  return (
    <div className={`card ${customClass}`} data-id={dataId}>
      {children}
    </div>
  );
};

const ChatWindow = ({
  selectedChat: {
    title,
    imageURL,
    orderId,
    latestMessageTimestamp,
    messageList,
    isSelected
  }
}) => {
  return (
    <div className="chat-window">
      <div className="chat-top">
        <img
          className="chat-image"
          width={30}
          height={30}
          src={imageURL}
          alt={title}
        />
        <div className="chat-title">{title}</div>
      </div>
      <div className="chat-message-container">
        {messageList.length > 0 ? (
          messageList.map(
            ({
              messageId,
              message,
              timestamp,
              sender,
              messageType,
              options = []
            }) => {
              return (
                <Card
                  customClass={`message-card${
                    sender === SENDER.BOT ? " bot" : " user"
                  }`}
                  key={`${messageId}-${timestamp}`}
                >
                  <div className="message-text">{message}</div>
                  {messageType === MESSAGE_TYPE.OPTIONED_MESSAGE && (
                    <div>
                      {options.map(({ optionText, optionSubText }) => (
                        <div key={optionText}>
                          <div>{optionText}</div>
                          <div>{optionSubText}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            }
          )
        ) : (
          <p className="no-message">
            <strong>Send a message to start chating</strong>
          </p>
        )}
      </div>
      <div className="chat-input-container">
        <input placeholder="Type a Message" type="text" />
      </div>
    </div>
  );
};

const FilterContainer = ({ setFilterQuery }) => {
  // should add debounce here
  const onFilterChange = (e) => {
    setFilterQuery(e.target.value.toLowerCase());
  };

  return (
    <div className="filter-container">
      <h3>Filter by Title / Order ID</h3>
      <input
        className="filter-input"
        placeholder="Start typing to search"
        type="text"
        onChange={onFilterChange}
      />
    </div>
  );
};

const ChatCard = ({
  chatData: {
    id,
    title,
    imageURL,
    orderId,
    latestMessageTimestamp,
    messageList,
    isSelected
  }
}) => {
  const lastMessage = messageList.find(
    ({ timestamp }) => timestamp === latestMessageTimestamp
  );

  return (
    <Card
      customClass={`chat-card${isSelected ? " chat-selected" : ""}`}
      dataId={id}
    >
      <div className="order-image">
        <img width={30} height={30} src={imageURL} alt={title} />
      </div>
      <div className="order-details">
        <p>{title}</p>
        <p>Order {orderId}</p>
        {!!lastMessage > 0 && <p>{lastMessage.message}</p>}
      </div>
      {!!latestMessageTimestamp && (
        <div className="order-date">{latestMessageTimestamp}</div>
      )}
    </Card>
  );
};

const ChatsContainer = ({ chats, setChats }) => {
  const onChatClick = (e) => {
    const chatId = e.target.closest(".chat-card")?.dataset.id;
    if (!chatId) return;

    const parsedChatId = parseInt(chatId, 10);
    setChats((prevChats) =>
      prevChats.map((prevChat) => {
        prevChat.isSelected = false;
        if (prevChat.id === parsedChatId) {
          prevChat.isSelected = true;
        }

        return prevChat;
      })
    );
  };

  return (
    <div className="chats-container" onClick={onChatClick}>
      {chats.map((chatData) => (
        <ChatCard key={chatData.id} chatData={chatData} />
      ))}
    </div>
  );
};

export default function App() {
  const [chats, setChats] = useFetchChats();
  const [filterQuery, setFilterQuery] = useState("");
  const filteredChats = useMemo(() => filterChats(filterQuery, chats), [
    filterQuery,
    chats
  ]);
  const selectedChat = useMemo(
    () => chats.find(({ isSelected }) => isSelected),
    [chats]
  );

  return (
    <div className="app-container">
      <div className="left-panel">
        <FilterContainer setFilterQuery={setFilterQuery} />
        <ChatsContainer chats={filteredChats} setChats={setChats} />
      </div>
      {!!selectedChat && (
        <div className="right-panel">
          <ChatWindow selectedChat={selectedChat} />
        </div>
      )}
    </div>
  );
}
