import React, { useState, useEffect } from "react";

const NewGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [email, setEmail] = useState("");
  const [emailList, setEmailList] = useState([]);

  // Load emails from localStorage on component mount
  useEffect(() => {
    const storedEmails = JSON.parse(localStorage.getItem("arr")) || [];
    setEmailList(storedEmails);
  }, []);

  // Function to add email to localStorage
  const handleAddEmail = () => {
    if (!email) {
      alert("Please enter a valid email");
      return;
    }

    const updatedEmails = [...emailList, email];
    setEmailList(updatedEmails);

    localStorage.setItem("arr", JSON.stringify(updatedEmails));
    alert(`${email} added to the group.`);
    setEmail(""); // Clear email input after adding
  };

  // Function to delete email from localStorage
  const handleDeleteEmail = (emailToDelete) => {
    const updatedEmails = emailList.filter((item) => item !== emailToDelete);
    setEmailList(updatedEmails);

    localStorage.setItem("arr", JSON.stringify(updatedEmails));
    alert(`${emailToDelete} removed from the group.`);
  };

  // Function to confirm group creation
  const handleConfirmGroup = async () => {
    const userEmail = localStorage.getItem("user");
    if (!groupName) {
      alert("Group name is required!");
      return;
    }
    if (emailList.length === 0) {
      alert("Email list cannot be empty!");
      return;
    }
    if (!userEmail) {
      alert("User email is missing in localStorage!");
      return;
    }

    const payload = {
      groupName,
      emailList,
      email: userEmail,
    };

    try {
      const response = await fetch("http://localhost:3020/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Group created successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Create New Group</h2>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Group Name:</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          style={{
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            width: "200px",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email to add"
          style={{
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            width: "200px",
          }}
        />
        <button
          onClick={handleAddEmail}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            border: "none",
            backgroundColor: "#007BFF",
            color: "#fff",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add Email
        </button>
      </div>

      <h3>Email List</h3>
      {emailList.length > 0 ? (
        <ul style={{ padding: 0, listStyle: "none" }}>
          {emailList.map((email, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "5px 0",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <span>{email}</span>
              <button
                onClick={() => handleDeleteEmail(email)}
                style={{
                  padding: "5px 10px",
                  border: "none",
                  backgroundColor: "#FF4D4D",
                  color: "#fff",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No emails added yet.</p>
      )}

      <button
        onClick={handleConfirmGroup}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          border: "none",
          backgroundColor: "#28A745",
          color: "#fff",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Confirm Your Group
      </button>
    </div>
  );
};

export default NewGroup;
