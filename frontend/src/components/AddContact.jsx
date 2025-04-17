import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../stores/chatStore";
import axios from "axios";
import "../css/AddContact.css";

const AddContact = () => {
  const [email, setEmail] = useState("");
  const { user, token } = useContext(ChatContext);
  const navigate = useNavigate();

  const handleAddContact = async () => {
    if (!email) return alert("Please enter an email");

    try {
      const res = await axios.post(`http://localhost:3000/api/contacts/create`, {
        email,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res) {
        console.log(res.data.message);  
        navigate("/chat");
      } else {
        alert(res.data.message || "Failed to add contact");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="add-contact-page">
      <div className="add-contact-form">
        <h2>Add New Contact</h2>
        <input
          type="email"
          placeholder="Enter contact email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleAddContact}>Add</button>
        <button className="cancel-button" onClick={() => navigate("/chat")}>Cancel</button>
      </div>
    </div>
  );
};

export default AddContact;