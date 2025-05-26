import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { getConversation, sendMessage } from '../redux/slices/messageSlice';
import { COLORS, STYLES, SHADOWS } from '../styles/theme';

const ChatScreen: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();
  const { messages, loading } = useAppSelector((state) => state.message);
  const { user } = useAppSelector((state) => state.auth);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    if (userId) {
      dispatch(getConversation(userId));
    }
  }, [dispatch, userId]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !newMessage.trim()) return;
    
    dispatch(sendMessage({
      content: newMessage,
      receiverId: userId,
    }));
    
    setNewMessage('');
  };
  
  // Get conversation messages
  const conversation = userId ? messages[userId] || [] : [];
  
  if (loading && conversation.length === 0) {
    return <div>Loading conversation...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 150px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Chat header */}
        <div style={{
          padding: '1rem',
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.card,
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold',
            margin: 0,
            color: COLORS.text
          }}>
            Chat with Driver
          </h2>
        </div>
        
        {/* Messages container */}
        <div style={{
          flex: 1,
          padding: '1rem',
          overflow: 'auto',
          backgroundColor: COLORS.background,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {conversation.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: COLORS.textSecondary,
              fontSize: '0.9rem',
            }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            conversation.map((message) => (
              <div
                key={message.id}
                style={{
                  alignSelf: message.senderId === user?.id ? 'flex-end' : 'flex-start',
                  backgroundColor: message.senderId === user?.id ? COLORS.primary : COLORS.card,
                  color: message.senderId === user?.id ? 'white' : COLORS.text,
                  padding: '0.75rem 1rem',
                  borderRadius: '1rem',
                  maxWidth: '70%',
                  marginBottom: '0.75rem',
                  boxShadow: SHADOWS.small,
                }}
              >
                <div style={{ wordBreak: 'break-word' }}>{message.content}</div>
                <div style={{
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  marginTop: '0.25rem',
                  textAlign: 'right',
                }}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Message input */}
        <form
          onSubmit={handleSendMessage}
          style={{
            display: 'flex',
            padding: '1rem',
            borderTop: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.card,
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              ...STYLES.input,
              flex: 1,
              marginRight: '0.75rem',
              padding: '0.75rem',
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              ...STYLES.buttonPrimary,
              whiteSpace: 'nowrap',
              opacity: !newMessage.trim() ? 0.7 : 1,
              cursor: !newMessage.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen; 