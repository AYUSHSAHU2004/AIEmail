import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth } from './firebase/firebase';
import { motion } from 'framer-motion';

const Home = () => {
    const [emailData, setEmailData] = useState({
        from: '',
        subject: '',
        text: '',
        emailUser: '',
        emailPass: '' // Added userEmail and userPassword
    });
    const nav = useNavigate();

    const [recipients, setRecipients] = useState([]);
    const [numEmails, setNumEmails] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isGroup,setIsGroup] = useState(false);
    const [groups,setGroups] = useState([]);
    const [isAIEnabled, setIsAIEnabled] = useState(false); // Toggle for AI-generated email
    const [aiPrompt, setAiPrompt] = useState(''); // Prompt for AI
    const [language, setLanguage] = useState('en'); // Language of email
    const [wordCount, setWordCount] = useState(100); // Number of words for AI email
    const [selectedEmailList, setSelectedEmailList] = useState([]);

    
    useEffect(() => {
        const fetchEmailCredentials = async () => {
          try {
            // Fetch email from localStorage
            const storedEmail = localStorage.getItem('user');
    
            if (!storedEmail) {
              console.error('No email found in local storage');
              return;
            }
            
            // Send a GET request to fetch the user's details based on the email
            const response = await axios.get(`http://localhost:3020/checkUser/${storedEmail}`);
    
            // Destructure the email and password from the response
            const { email, password } = response.data.data;
            
            // Update the state with the fetched data
            setEmailData(prevState => ({
              ...prevState,
              emailUser:email,  // Set email from response
              emailPass:password   // Set password from response
            }));
            console.log(email,password);
          } catch (error) {
            console.error('Error fetching email credentials:', error);
          }
        };
    
        // Call the function to fetch email credentials when the component mounts
        fetchEmailCredentials();
      }, []);
    
    
    const handleChange = (e) => {
        setEmailData({ ...emailData, [e.target.name]: e.target.value });
    };
    const handleLogout = async () => {
        await auth.signOut();
        localStorage.removeItem('user');
      };
    const handleRecipientChange = (index, value) => {
        const updatedRecipients = [...recipients];
        updatedRecipients[index] = value;
        setRecipients(updatedRecipients);
    };
    
    const handleSendAll = async () => {
        try {
            alert("Wait a second while emails are being sent");
            
            // Send emails to all recipients
            const promises = recipients.map((recipient) => {
                return axios.post('http://localhost:3020/api/email', {
                    ...emailData,
                    to: recipient
                });
            });
    
            await Promise.all(promises); // Wait for all emails to be sent
            
            alert('Emails sent successfully'); // Notify user of success
            setIsSuccess(true); // Update the success state
        } catch (error) {
            console.error('Failed to send emails:', error);
            alert('Failed to send some or all emails'); // Notify user of failure
        }
    };
    

    const handleNumEmailsChange = (e) => {
        const num = parseInt(e.target.value);
        setNumEmails(num);
        if (num > 0) {
            setRecipients(Array(num).fill(''));
        }
    };
    useEffect(()=>{
        const getGroupsByEmail = async () => {
            try{
                const response =  await axios.get(
                    `http://localhost:3020/getGroup/${emailData.emailUser}`
                )
                if(response?.data){
                    setGroups(response.data.data);
                    response.status(200).json(response.data);
                }
            }catch(err){
                console.log("error fetching groups",err);
            }
        }
        getGroupsByEmail();
    },[emailData.emailUser])
    
    const handleGenerateEmail = async () => {
        try {
            const response = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAX_0vks_66YdqcXiyjLO7qWTh2uMG6sb8',
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Hey, Please generate an email with topic: ${aiPrompt}. The language is ${language} and the length should be approximately ${wordCount} words.`
                                }
                            ]
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (generatedText) {
                setEmailData((prevData) => ({ ...prevData, text: generatedText.trim() }));
                alert('AI-generated email content successfully.');
            } else {
                alert('Failed to generate email content. Please try again.');
            }
        } catch (error) {
            console.error('Error generating email:', error.response?.data || error);
            alert('Error generating email. Check console for details.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{
                fontFamily: 'Arial, sans-serif',
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px',
                backgroundColor: '#e7f1fa', // Light blue background
                borderRadius: '8px',
                border: '2px solid #a6c9e2', // Subtle border
                boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
            }}
        >
            

            <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', fontWeight: 'bold' }}
            >
                Email Form
            </motion.h1>
           
                <button onClick={()=>nav('/NewGroup')}>

                    Create Group
                </button>
            

            {/* Email Form Fields */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '1rem', fontWeight: '500' }}>Your Email:</label>
                <input
                    type="email"
                    name="emailUser"
                    value={emailData.emailUser}
                    onChange={handleChange}
                    placeholder="Your email"
                    style={{
                        padding: '10px',
                        width: '100%',
                        boxSizing: 'border-box',
                        fontSize: '1rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                    }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '1rem', fontWeight: '500' }}>Your Password:</label>
                <input
                    type="password"
                    name="emailPass"
                    value={emailData.emailPass}
                    onChange={handleChange}
                    placeholder="Your app password"
                    style={{
                        padding: '10px',
                        width: '100%',
                        boxSizing: 'border-box',
                        fontSize: '1rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                    }}
                />
            </div>



            

            {/* Toggle for Manual or AI-generated Email */}
            <div style={{ marginBottom: '20px' }}>
                <label>
                    <input
                        type="radio"
                        name="emailType"
                        checked={!isAIEnabled}
                        onChange={() => setIsAIEnabled(false)}
                    />
                    Write Your Own Email
                </label>
                <label style={{ marginLeft: '20px' }}>
                    <input
                        type="radio"
                        name="emailType"
                        checked={isAIEnabled}
                        onChange={() => setIsAIEnabled(true)}
                    />
                    Use AI to Generate Email
                </label>
            </div>
            
            

            {/* AI Email Options */}
            {isAIEnabled && (
                <div>
                    <label style={{ display: 'block', marginTop: '10px', fontSize: '1rem', fontWeight: '500' }}>AI Prompt:</label>
                    <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Provide the email prompt"
                        style={{
                            padding: '10px',
                            width: '100%',
                            fontSize: '1rem',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                        }}
                    />
                    <label style={{ display: 'block', marginTop: '10px', fontSize: '1rem', fontWeight: '500' }}>Language:</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{
                            padding: '10px',
                            width: '100%',
                            fontSize: '1rem',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                        }}
                    >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                    </select>

                    <label style={{ display: 'block', marginTop: '10px', fontSize: '1rem', fontWeight: '500' }}>Word Count:</label>
                    <input
                        type="number"
                        value={wordCount}
                        onChange={(e) => setWordCount(parseInt(e.target.value))}
                        min="50"
                        max="1000"
                        style={{
                            padding: '10px',
                            width: '100%',
                            fontSize: '1rem',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                        }}
                    />
                </div>
            )}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '1rem', fontWeight: '500' }}>Subject:</label>
                <input
                    type="text"
                    name="subject"
                    value={emailData.subject}
                    onChange={handleChange}
                    placeholder="Enter the subject"
                    style={{
                        padding: '10px',
                        width: '100%',
                        boxSizing: 'border-box',
                        fontSize: '1rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                    }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '1rem', fontWeight: '500' }}>Message:</label>
                <textarea
                    name="text"
                    value={emailData.text}
                    onChange={handleChange}
                    placeholder="Enter the message"
                    rows="4"
                    style={{
                        padding: '10px',
                        width: '100%',
                        fontSize: '1rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        resize: 'vertical',
                    }}
                />
            </div>

            {/* Toggle for Manual or Grouped Email */}
            <div style={{ marginBottom: '20px' }}>
                <label>
                    <input
                        type="radio"
                        name="sendType"
                        checked={!isGroup}
                        onChange={() => setIsGroup(false)}
                    />
                    Send Manually
                </label>
                <label style={{ marginLeft: '20px' }}>
                    <input
                        type="radio"
                        name="sendType"
                        checked={isGroup}
                        onChange={() => setIsGroup(true)}
                    />
                   Send Ur Groups
                </label>
            </div>

            {!isGroup && (
                <div style={{ marginBottom: '20px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontSize: '1rem',
                            fontWeight: '500',
                        }}
                    >
                        Number of Emails to Send:
                    </label>
                    <input
                        type="number"
                        value={numEmails}
                        onChange={handleNumEmailsChange}
                        min="1"
                        style={{
                            padding: '10px',
                            width: '100%',
                            boxSizing: 'border-box',
                            fontSize: '1rem',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                        }}
                    />
                </div>
            )}

            {/* Render recipient inputs */}
            {!isGroup &&
                recipients.map((recipient, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '10px',
                                fontSize: '1rem',
                                fontWeight: '500',
                            }}
                        >
                            Recipient {index + 1} Email:
                        </label>
                        <input
                            type="email"
                            value={recipient}
                            onChange={(e) => handleRecipientChange(index, e.target.value)}
                            placeholder={`Recipient ${index + 1} email`}
                            style={{
                                padding: '10px',
                                width: '100%',
                                boxSizing: 'border-box',
                                fontSize: '1rem',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                            }}
                        />
                    </div>
                ))}

                {isGroup && (
    <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500' }}>Select Group:</label>
        <select
            onChange={(e) => setRecipients(groups[e.target.value]?.emailList || [])}
            style={{
                padding: '10px',
                width: '100%',
                fontSize: '1rem',
                borderRadius: '5px',
                border: '1px solid #ddd',
            }}
        >
            <option value="">-- Select a Group --</option>
            {groups.map((group, index) => (
                <option key={index} value={index}>
                    {group.groupName}
                </option>
            ))}
        </select>
    </div>
)}

            <motion.button
                onClick={handleSendAll}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    display: 'block',
                    width: '100%',
                }}
            >
                Send Emails
            </motion.button>

            {/* AI Generate Button */}
            {isAIEnabled && (
                <motion.button
                    onClick={handleGenerateEmail}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        backgroundColor: '#007bff',
                        color: '#fff',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        display: 'block',
                        width: '100%',
                        marginTop: '20px',
                    }}
                >
                    Generate AI Email
                </motion.button>
                
            )}
            <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
        </motion.div>
    );
};

export default Home;
