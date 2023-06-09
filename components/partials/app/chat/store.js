import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axiosInstance";

export const loadChat = createAsyncThunk(
  "appchat/loadChat",
  async (address, thunkAPI) => {
    // const response = await fetch(`https://api.example.com/users/${userId}`)
    // return await response.json()

    try {
      const { data } = await axiosInstance.get(
        `/api/chat/getAllThreads?address=${address}`
      );

      return {
        threadIds: data.threadIds,
        threadData: data.threadData,
      };
    } catch (error) {
      toast.error(error.response);
      console.log(error);
      throw error;
    }
  }
);

export const appChatSlice = createSlice({
  name: "appchat",
  initialState: {
    openProfile: false,
    loadingChat: false,
    loadingChatError: false,
    openinfo: false,
    activechat: false,
    searchThread: "",
    mobileChatSidebar: false,
    profileinfo: {},
    messFeed: [],
    user: {},
    threads: [],
    chats: [],
  },
  reducers: {
    openChat: (state, action) => {
      state.activechat = action.payload.activechat;
      state.mobileChatSidebar = !state.mobileChatSidebar;
      state.user = action.payload.thread;
    },
    // toggole mobile chat sidebar
    toggleMobileChatSidebar: (state, action) => {
      state.mobileChatSidebar = action.payload;
    },
    infoToggle: (state, action) => {
      state.openinfo = action.payload;
    },
    sendMessage: (state, action) => {
      state.messFeed.push(action.payload);
    },
    toggleProfile: (state, action) => {
      state.openProfile = action.payload;
    },
    setThreadSearch: (state, action) => {
      state.searchThread = action.payload;
    },
    toggleActiveChat: (state, action) => {
      state.activechat = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadChat.pending, (state) => {
        state.loadingChat = true;
        console.log("loading");
      })
      .addCase(loadChat.fulfilled, (state, action) => {
        // state.loading = "idle";
        console.log(action.payload);
        state.chats = action.payload.threadData;
        state.threads = action.payload.threadIds;
        // state.chats = [...action.payload];

        let data = state.chats.find((data) => {
          console.log("data ", data);
          if (data.threadId === state.threads[0]) {
            return data.messages;
          }
        });

        console.log(data, "chat messages");
        state.messFeed = [...data.messages];
        state.loadingChat = false;

        console.log(state.user.id, state.messFeed, state.chats, "davik");
      })
      .addCase(loadChat.rejected, (state, action) => {
        console.log(action, "rejected");
        toast.error(action.error.message);
        state.loadingChat = false;
        state.loadingChatError = true;
      });
  },
});

export const {
  openChat,
  toggleMobileChatSidebar,
  infoToggle,
  sendMessage,
  toggleProfile,
  setThreadSearch,
  toggleActiveChat,
} = appChatSlice.actions;

export default appChatSlice.reducer;
