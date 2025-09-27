import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/apiService';
import { API_ENDPOINTS } from '../../config/apiConfig';

// Message interface
export interface Message {
  id: string;
  conversationId: string;
  rideId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// Define the state
interface MessageState {
  messages: Record<string, Message[]>; // Indexed by conversationId or rideId
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: MessageState = {
  messages: {},
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async thunks
export const getConversation = createAsyncThunk(
  'message/getConversation',
  async (userId: string, { rejectWithValue }) => {
    try {
      const messages = await apiService.get<Message[]>(API_ENDPOINTS.CONVERSATION(userId));
      return { userId, messages };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get conversation');
    }
  }
);

export const getRideMessages = createAsyncThunk(
  'message/getRideMessages',
  async (rideId: string, { rejectWithValue }) => {
    try {
      const messages = await apiService.get<Message[]>(API_ENDPOINTS.RIDE_MESSAGES(rideId));
      return { rideId, messages };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get ride messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async (
    { 
      content, 
      receiverId, 
      rideId 
    }: { 
      content: string; 
      receiverId: string; 
      rideId?: string 
    }, 
    { rejectWithValue }
  ) => {
    try {
      return await apiService.post<Message>(API_ENDPOINTS.SEND_MESSAGE, {
        content,
        receiverId,
        rideId,
      });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'message/markAsRead',
  async (messageId: string, { rejectWithValue }) => {
    try {
      await apiService.patch(API_ENDPOINTS.MARK_AS_READ(messageId), {});
      return messageId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as read');
    }
  }
);

export const getUnreadMessageCount = createAsyncThunk(
  'message/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.get<{ count: number }>(API_ENDPOINTS.UNREAD_COUNT);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get unread count');
    }
  }
);

// Create the message slice
const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const key = message.rideId || message.conversationId;
      
      if (!state.messages[key]) {
        state.messages[key] = [];
      }
      
      state.messages[key].push(message);
      
      if (!message.read) {
        state.unreadCount += 1;
      }
    },
    resetMessageError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get conversation
      .addCase(getConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversation.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, messages } = action.payload;
        state.messages[userId] = messages;
      })
      .addCase(getConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get ride messages
      .addCase(getRideMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRideMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { rideId, messages } = action.payload;
        state.messages[rideId] = messages;
      })
      .addCase(getRideMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const message = action.payload;
        const key = message.rideId || message.conversationId;
        
        if (!state.messages[key]) {
          state.messages[key] = [];
        }
        
        state.messages[key].push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Mark message as read
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const messageId = action.payload;
        
        // Update message read status
        for (const key in state.messages) {
          const index = state.messages[key].findIndex((msg) => msg.id === messageId);
          if (index !== -1 && !state.messages[key][index].read) {
            state.messages[key][index].read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
            break;
          }
        }
      })

      // Get unread count
      .addCase(getUnreadMessageCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      });
  },
});

export const { addMessage, resetMessageError } = messageSlice.actions;
export default messageSlice.reducer; 