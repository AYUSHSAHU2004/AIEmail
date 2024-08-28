import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [emailData, setEmailData] = useState({
        from: '',
        subject: '',
        text: '',
        emailUser: '',
        emailPass: ''
    });

    const [recipients, setRecipients] = useState([]);
    const [numEmails, setNumEmails] = useState(1);

    const handleChange = (e) => {
        setEmailData({ ...emailData, [e.target.name]: e.target.value });
    };

    const handleRecipientChange = (index, value) => {
        const updatedRecipients = [...recipients];
        updatedRecipients[index] = value;
        setRecipients(updatedRecipients);
    };

    const handleSendAll = async () => {
        try {
            const promises = recipients.map((recipient) => {
                return axios.post('http://localhost:3020/api/email', {
                    ...emailData,
                    to: recipient
                });
            });
            const results = await Promise.all(promises);
            alert("Email sent succesfully");
            console.log('Emails sent successfully:', results);
            // Handle success (e.g., update UI to indicate success)
            // localStorage.setItem("arrEmails",JSON.stringify(recipients));
            // alert(recipients);

        } catch (error) {
            console.error('Failed to send emails:', error);
            // Handle error (e.g., update UI to indicate failure)
        }
    };

    const handleNumEmailsChange = (e) => {
        const num = parseInt(e.target.value);
        setNumEmails(num);
        if(num>0){
          setRecipients(Array(num).fill(''));
        }
        // Initialize recipients array with empty strings
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Email Form</h1>
            <label style={{ display: 'block', marginBottom: '10px' }}>Number of Emails to Send:</label>
            <input
                type="number"
                value={numEmails}
                onChange={handleNumEmailsChange}
                min="1"
                style={{ marginBottom: '20px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
            />
            <form onSubmit={(e) => e.preventDefault()} style={{ marginBottom: '20px' }}>
                <input
                    type="email"
                    name="from"
                    placeholder="From"
                    value={emailData.from}
                    onChange={handleChange}
                    required
                    style={{ marginBottom: '10px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                />
                <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={emailData.subject}
                    onChange={handleChange}
                    required
                    style={{ marginBottom: '10px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                />
                <textarea
                    name="text"
                    placeholder="Message"
                    value={emailData.text}
                    onChange={handleChange}
                    required
                    style={{ marginBottom: '10px', padding: '8px', width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
                />
                <input
                    type="email"
                    name="emailUser"
                    placeholder="Your Email"
                    value={emailData.emailUser}
                    onChange={handleChange}
                    required
                    style={{ marginBottom: '10px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                />
                <input
                    type="password"
                    name="emailPass"
                    placeholder="Your Password"
                    value={emailData.emailPass}
                    onChange={handleChange}
                    required
                    style={{ marginBottom: '10px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                />
                <div>
                    {recipients.map((recipient, index) => (
                        <input
                            key={index}
                            type="email"
                            placeholder={`Recipient ${index + 1}`}
                            value={recipient}
                            onChange={(e) => handleRecipientChange(index, e.target.value)}
                            required
                            style={{ marginBottom: '10px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                        />
                    ))}
                </div>
                <button type="button" onClick={handleSendAll} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>Send Emails</button>
            </form>
        </div>
    );
};

export default App;
