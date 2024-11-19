import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NewGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [email, setEmail] = useState("");
  const [groups, setGroups] = useState([]);
  const [emailList, setEmailList] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  // Load emails from localStorage on component mount
  useEffect(() => {
    const storedEmails = JSON.parse(localStorage.getItem("arr")) || [];
    setEmailList(storedEmails);
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      const userEmail = localStorage.getItem("user");
      if (!userEmail) {
        alert("User email is missing in localStorage!");
        return;
      }

      try {
        const response = await fetch(`https://aiemailback-3.onrender.com/getGroup/${userEmail}`);
        if (!response.ok) {
          console.log("No group found or an error occurred");
          setGroups([]); // Ensure groups state is cleared if an error occurs
          return;
        }
        const storedGroups = await response.json();
        if (storedGroups) {
          setGroups(storedGroups.data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchGroups();
  }, []);

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

  const handleDeleteEmail = (emailToDelete) => {
    const updatedEmails = emailList.filter((item) => item !== emailToDelete);
    setEmailList(updatedEmails);

    localStorage.setItem("arr", JSON.stringify(updatedEmails));
    alert(`${emailToDelete} removed from the group.`);
  };

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
      const response = await fetch("https://aiemailback-3.onrender.com/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Group created successfully!");
        setGroupName(""); // Clear group name input
        setEmailList([]); // Clear email list
        localStorage.removeItem("arr"); // Clear localStorage for emails
        window.location.reload(); // Reload the page after group creation
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteGroup = async (groupToDelete) => {
    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      alert("User email is missing in localStorage!");
      return;
    }

    try {
      const response = await fetch(
        `https://aiemailback-3.onrender.com/deleteGroup/${userEmail}/${groupToDelete}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        alert(`Group "${groupToDelete}" deleted successfully.`);
        setGroups(groups.filter((group) => group.groupName !== groupToDelete));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete the group.");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateGroup = (groupName) => {
    navigate(`/UpdateGroup/${groupName}`);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create New Group</h2>
      <button style={styles.buttonPrimary} onClick={() => navigate("/")}>
        Home Page
      </button>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Group Name:</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email to add"
          style={styles.input}
        />
        <button style={styles.buttonSecondary} onClick={handleAddEmail}>
          Add Email
        </button>
      </div>

      <h3 style={styles.subHeading}>Email List</h3>
      {emailList.length > 0 ? (
        <ul style={styles.list}>
          {emailList.map((email, index) => (
            <li key={index} style={styles.listItem}>
              <span>{email}</span>
              <button
                style={styles.buttonDanger}
                onClick={() => handleDeleteEmail(email)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No emails added yet.</p>
      )}

      <button style={styles.buttonPrimary} onClick={handleConfirmGroup}>
        Confirm Your Group
      </button>

      <h3 style={styles.subHeading}>Your Groups</h3>
      {groups.length > 0 ? (
        <ul style={styles.list}>
          {groups.map((group, index) => (
            <li key={index} style={styles.listItem}>
              <span>{group.groupName}</span>
              <div>
                <button
                  style={styles.buttonWarning}
                  onClick={() => handleUpdateGroup(group.groupName)}
                >
                  Update
                </button>
                <button
                  style={styles.buttonDanger}
                  onClick={() => handleDeleteGroup(group.groupName)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No groups found.</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "auto",
  },
  heading: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  },
  subHeading: {
    marginTop: "30px",
    color: "#555",
  },
  inputGroup: {
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
  },
  label: {
    marginRight: "10px",
    fontSize: "16px",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "70%",
  },
  list: {
    listStyle: "none",
    padding: "0",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
    marginBottom: "10px",
  },
  buttonPrimary: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonSecondary: {
    padding: "10px",
    backgroundColor: "#28A745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  buttonWarning: {
    padding: "5px 10px",
    backgroundColor: "#FFC107",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  buttonDanger: {
    padding: "5px 10px",
    backgroundColor: "#FF4D4D",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default NewGroup;
