'use client'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  Box,
  Stack,
  TextField,
  Typography,
  Button
} from "@mui/material";
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Person as PersonIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';


export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi, I am the Headstarter support agent, what do you need help with?',
  }])
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [userinfo, setUserInfo] = useState('');
  const infoRef = useRef(null);
  const [isInfoDisabled, setIsInfoDisabled] = useState(false);

  useEffect(() => {
    setUserInfo(
      `You are the customer support bot for Headstarter-AI, a cutting-edge platform that uses AI-powered interviews to help candidates secure Software Engineering (SWE) jobs. Your role is to assist users with any questions or issues they may have while navigating the platform. Your tone should be professional, empathetic, and concise.
      Guidelines:
      1. Introduction: Start with a warm and welcoming message. Introduce yourself as the Headstarter AI support bot and ask how you can assist the user.
      2. Common Inquiries:
      i. Account Setup: Guide users through the process of creating and managing their Headstarter account.
      ii. AI Interview Process: Explain how the AI interview works, what to expect, and how to prepare.
      iii. Technical Issues: Troubleshoot common technical issues, such as login problems, interview recording issues, or platform bugs.
      iv: Interview Feedback: Provide information on how to access AI-generated feedback and scores after an interview.
      v: Subscription and Billing: Help with questions related to subscription plans, billing, and cancellations.
      3. Plagiarism: Do not ever provide the user with a code component or anything which involves complex computer science answers. Also do not provide any concept explanations or code related explanations.
      4. Escalation: If a user’s issue cannot be resolved through the bot, provide clear instructions on how to contact a human support representative.
      5. Tone: Always maintain a positive and supportive tone. Acknowledge the user’s concerns and aim to resolve their issue as efficiently as possible.
      6. Closing: Once the query is resolved, thank the user for choosing Headstarter AI, and offer further assistance if needed.`
    );
  }, []);

  const sendMessage = async () => {
    setLoading(true);

    setMessage('');
    setMessages((messages) => [
      ...messages,
      {role: 'user', content: message},
      {role: 'assistant', content: ''},
    ])

    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userinfo: userinfo,
        messages: [...messages, { role: 'user', content: message }],
      }),
    }).then(async(res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = ''
      return reader.read().then(function processText({done, value}) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream:true });
        console.log(text);
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);

          setLoading(false);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      })
    }).catch((error) => {
      console.error('Error:', error);
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);

        setLoading(false);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: 'API error, Please try again.',
          },
        ];
      });
    });
  };

  const handleUserInfoSave = () => {
    setUserInfo(infoRef?.current?.value);
    setIsInfoDisabled(true);
  };

  const handleInfoButton = (inputValue) => {
    setIsInfoDisabled(!inputValue.trim() || inputValue === userinfo);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Create a theme instance based on the darkMode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Navbar */}
      <Box
        width="100%"
        minHeight="100px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding={2}
        overflow="hidden"
        bgcolor="background.paper"
        boxShadow={1}
      >
        <Typography variant="h3" color="text.primary" pl={3}>Let it out!</Typography>
        <IconButton onClick={toggleDarkMode}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      {/* Personal Info and Chat component */}
      <Box
        width="100vw"
        height="90vh"
        display="flex"
        sx={{
          flexDirection: {
            xs: 'column', // Column layout for extra-small screens (mobile)
            sm: 'column', // Column layout for small screens (tablets)
            md: 'row',    // Row layout for medium screens and above (desktops)
          },
          gap: {
            xs: 2,
            sm: 5,
            md: 10,
          },
        }}
        justifyContent="center"
        alignItems="center"
      >
        {/* Personal Info component */}
        <Stack
          width="400px"
          maxWidth="80%"
          height="700px"
          direction="column"
          border={`2px solid ${theme.palette.divider}`}
          boxShadow={20}
          p={2}
          spacing={5}
          pt={5}
        >
          <Stack spacing={1}>
            <Typography variant="h5" color="text.primary" pl={1}>Customize AI</Typography>
            <Typography variant="subtitle1" color="text.primary" pl={1}>What would you like the AI to know about you to provide better responses?</Typography>
          </Stack>
          <Stack
            direction="column"
            flexGrow={1}
            spacing={2}
          >
            <TextField
              label={userinfo ? '' : 'Info here'}
              fullWidth
              multiline
              rows={18}
              defaultValue={userinfo}
              inputRef={infoRef}
              onChange={(e) => handleInfoButton(e.target.value)}
            />
            <Button type="submit" variant="contained" onClick={handleUserInfoSave} disabled={isInfoDisabled}>SAVE</Button>
          </Stack>
        </Stack>

        {/* Chat component */}
        <Stack
          width="700px"
          maxWidth="80%"
          height="700px"
          direction="column"
          border={`2px solid ${theme.palette.divider}`}
          boxShadow={20}
          p={2}
          spacing={3}
        >
          {loading && <LinearProgress />}
          <Stack
            direction="column"
            flexGrow={1}
            spacing={1}
            overflow="auto"
            maxHeight="100%"
          >
            {
              messages.map((msg, messageIndex) => (
                <Box
                  key={messageIndex}
                  display="flex"
                  justifyContent={
                    msg.role === 'assistant' ? "flex-start" : "flex-end"
                  }
                  gap={1}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      <Avatar alt="AI agent" src="/futuristic.png" />
                      <Box
                        bgcolor={
                          theme.palette.mode === 'dark'
                            ? 'primary.dark'
                            : 'primary.light'
                        }
                        color="white"
                        borderRadius={3}
                        p={1}
                        maxWidth="80%"
                        overflow="visible"
                        textOverflow="clip"
                        whiteSpace="normal"
                      >
                        <ReactMarkdown
                          components={{
                            ul: ({ node, ...props }) => (
                              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }} {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }} {...props} />
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box
                        bgcolor={
                          theme.palette.mode === 'dark'
                            ? 'secondary.dark'
                            : 'secondary.light'
                        }
                        color="white"
                        borderRadius={3}
                        p={1}
                        maxWidth="80%"
                        overflow="visible"
                        textOverflow="clip"
                        whiteSpace="normal"
                      >
                        <ReactMarkdown
                          components={{
                            ul: ({ node, ...props }) => (
                              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }} {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }} {...props} />
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </Box>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </>
                  )}
                </Box>
              ))
            }
          </Stack>
          <Stack
            direction="row"
            spacing={2}
          >
            <TextField
              label="Message AI"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button type="submit" variant="contained" endIcon={<SendIcon />} onClick={sendMessage} disabled={!message.trim()}>SEND</Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
