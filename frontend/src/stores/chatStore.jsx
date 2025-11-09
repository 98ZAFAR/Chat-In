import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError, showLoading, dismissToast, showPromiseToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL;

export const ChatContext = createContext({
  defaultAvatars: [],
  selectedtAvatar: "",
  setSelectedAvatar: () => { },
  contacts: [],
  selectedContact: {},
  setSelectedContact: () => { },
  user: {},
  messages: [],
  registerUser: () => { },
  loginUser: () => { },
  logoutUser: () => { },
  updateAvatar: () => { },
  updateProfile: () => { },
  addContact: () => { },
  deleteContact: () => { },
  searchUsers: () => { },
  token:"",
  setContacts:()=>{},
  getMessages:()=>{},
  getConversation:()=>{},
  markMessagesAsRead:()=>{},
  setMessages:()=>{},
  setToken:()=>{},
  setUser:()=>{},
  loading: false,
  setLoading: () => { },
});

const ChatProvider = ({ children }) => {
  const defaultAvatars = [
    "/default_avatar_1.png",
    "/default_avatar_2.png",
    "/default_avatar_3.png",
    "/default_avatar_4.png",
    "/default_avatar_5.png",
    "/default_avatar_6.png",
    "/default_avatar_7.png",
    "/default_avatar_8.png",
  ];

  const [selectedtAvatar, setSelectedAvatar] = useState(defaultAvatars[0]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || "");
  const [contacts, setContacts] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : {};
    } catch {
      return {};
    }
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Helper function to handle API errors
  const handleApiError = (error, defaultMessage = "Something went wrong!") => {
    console.error("API Error:", error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        showError("Session expired. Please login again.");
        logoutUser();
        return;
      }
      
      const errorMessage = data?.error || data?.message || defaultMessage;
      showError(errorMessage);
    } else if (error.request) {
      showError("Network error. Please check your connection.");
    } else {
      showError(defaultMessage);
    }
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const registerUser = async (formData) => {
    if (!formData.username || !formData.email || !formData.password) {
      showError("All fields are required!");
      return;
    }

    if (formData.password.length < 6) {
      showError("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);
    const loadingToast = showLoading("Creating your account...");

    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, formData);
      
      dismissToast(loadingToast);
      showSuccess("Account created successfully! Please sign in.");
      navigate('/signin');
      
    } catch (error) {
      dismissToast(loadingToast);
      handleApiError(error, "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (formData) => {
    if (!formData.email || !formData.password) {
      showError("Email and password are required!");
      return;
    }

    setLoading(true);
    const loadingToast = showLoading("Signing you in...");

    try {
      const response = await axios.post(`${API_URL}/api/auth/signin`, formData);
      
      const { token: userToken, user: userData } = response.data.data;
      
      setToken(userToken);
      setUser(userData);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      dismissToast(loadingToast);
      showSuccess(`Welcome back, ${userData.username}!`);
      
      if (!userData.avatarURL || userData.avatarURL === "" || userData.avatarURL === "#") {
        navigate('/avatar');
      } else {
        navigate('/chat');
      }
      
    } catch (error) {
      dismissToast(loadingToast);
      handleApiError(error, "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async ({ avatarURL }) => {
    if (!avatarURL) {
      showError("Please select an avatar!");
      return;
    }

    setLoading(true);
    const loadingToast = showLoading("Updating your avatar...");

    try {
      const response = await axios.put(
        `${API_URL}/api/auth/update`,
        { avatarURL },
        getAuthHeaders()
      );
      
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      dismissToast(loadingToast);
      showSuccess("Avatar updated successfully!");
      navigate('/chat');
      
    } catch (error) {
      dismissToast(loadingToast);
      handleApiError(error, "Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      if (token) {
        await axios.post(`${API_URL}/api/auth/logout`, {}, getAuthHeaders());
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state regardless of API call success
      setToken("");
      setUser({});
      setContacts([]);
      setMessages([]);
      setSelectedContact(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showSuccess("Logged out successfully!");
      navigate('/signin');
    }
  };

  const updateProfile = async (profileData) => {
    if (!profileData.username || profileData.username.trim().length < 2) {
      showError("Username must be at least 2 characters long!");
      return;
    }

    setLoading(true);
    const loadingToast = showLoading("Updating your profile...");

    try {
      const response = await axios.put(
        `${API_URL}/api/auth/update`,
        profileData,
        getAuthHeaders()
      );
      
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      dismissToast(loadingToast);
      showSuccess("Profile updated successfully!");
      
    } catch (error) {
      dismissToast(loadingToast);
      handleApiError(error, "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (email) => {
    if (!email || !email.trim()) {
      showError("Email is required!");
      return;
    }

    setLoading(true);
    const loadingToast = showLoading("Adding contact...");

    try {
      const response = await axios.post(
        `${API_URL}/api/contacts/create`,
        { email: email.trim() },
        getAuthHeaders()
      );
      
      const newContact = response.data.data.contact;
      setContacts(prev => [...prev, newContact]);
      
      dismissToast(loadingToast);
      showSuccess("Contact added successfully!");
      
    } catch (error) {
      dismissToast(loadingToast);
      handleApiError(error, "Failed to add contact");
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (contactId) => {
    setLoading(true);
    const loadingToast = showLoading("Deleting contact...");

    try {
      await axios.delete(
        `${API_URL}/api/contacts/delete/${contactId}`,
        getAuthHeaders()
      );
      
      setContacts(prev => prev.filter(contact => contact.contactId !== contactId));
      
      if (selectedContact && selectedContact.contactId === contactId) {
        setSelectedContact(null);
        setMessages([]);
      }
      
      dismissToast(loadingToast);
      showSuccess("Contact deleted successfully!");
      
    } catch (error) {
      dismissToast(loadingToast);
      handleApiError(error, "Failed to delete contact");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      showError("Search query must be at least 2 characters!");
      return [];
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/contacts/search?query=${encodeURIComponent(query.trim())}`,
        getAuthHeaders()
      );
      
      return response.data.data.users || [];
      
    } catch (error) {
      handleApiError(error, "Failed to search users");
      return [];
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/contacts/fetch`,
        getAuthHeaders()
      );
      
      setContacts(response.data.data.contacts || []);
      
    } catch (error) {
      handleApiError(error, "Failed to fetch contacts");
    }
  };

  const getMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/messages/fetch`,
        getAuthHeaders()
      );

      // console.log("Fetched messages:", response.data);
      setMessages(response.data.data.messages || []);
      
    } catch (error) {
      handleApiError(error, "Failed to fetch messages");
    }
  };

  const getConversation = async (contactId, page = 1) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/messages/conversation/${contactId}?page=${page}&limit=50`,
        getAuthHeaders()
      );

      return response.data.data;
      
    } catch (error) {
      handleApiError(error, "Failed to fetch conversation");
      return { messages: [], hasMore: false };
    }
  };

  const markMessagesAsRead = async (contactId) => {
    try {
      await axios.put(
        `${API_URL}/api/messages/mark-read/${contactId}`,
        {},
        getAuthHeaders()
      );
      
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        defaultAvatars,
        selectedtAvatar,
        setSelectedAvatar,
        contacts,
        selectedContact,
        setSelectedContact,
        user,
        messages,
        loading,
        registerUser,
        loginUser,
        logoutUser,
        updateAvatar,
        updateProfile,
        addContact,
        deleteContact,
        searchUsers,
        fetchContacts,
        token,
        setContacts,
        getMessages,
        getConversation,
        markMessagesAsRead,
        setMessages,
        setToken,
        setUser,
        setLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
