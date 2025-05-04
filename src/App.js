import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DeleteCookie, getCookie, setCookie } from './cookie';
import styled from 'styled-components';

// 스타일링
const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f7fafc;
`;

const Form = styled.form`
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #4a4a4a;
`;

const Button = styled.button`
    width: 100%;
    padding: 1rem;
    background-color: #3182ce;
    color: white;
    border-radius: 8px;
    font-size: 1.25rem;
    cursor: pointer;
    border: none;
    transition: background-color 0.3s;

    &:hover {
        background-color: #2b6cb0;
    }
`;

const VoteContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    min-height: 100vh;
    background-color: #edf2f7;
`;

const VoteImage = styled.img`
    width: 230px;
    height: 300px;
    border-radius: 8px;
    margin-bottom: 1.5rem;
`;

const TierButton = styled.button`
    padding: 0.75rem 1.5rem;
    background-color: #38b2ac;
    color: white;
    border-radius: 8px;
    font-size: 1rem;
    margin: 0.5rem;
    cursor: pointer;
    border: none;
    transition: background-color 0.3s;

    &:hover {
        background-color: #2f9c8f;
    }
`;

const EndContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #edf2f7;
`;

const EndMessage = styled.div`
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
`;

const Countdown = styled.h2`
    font-size: 2rem;
    color: #3182ce;
    margin-top: 1rem;
`;


function Home() {
    const navigate = useNavigate();
    const [key, setKey] = useState('');

    useEffect(() => {
        if (getCookie('key') !== undefined) {
            navigate('/vote');
        }
    }, [navigate, key]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { key: key };
        try {
            const response = await axios.post('http://14.36.184.113:3000/auth', data);
            setCookie('key', key);
            navigate('/vote');
        } catch (err) {
            console.error('오류 발생:', err);
        }
    };

    return (
        <Container>
            <Form onSubmit={handleSubmit}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Enter your Key</h2>
                <Input
                    type="text"
                    name="key"
                    value={key}
                    onChange={(event) => setKey(event.target.value)}
                    placeholder="Enter your key"
                />
                <Button type="submit">Submit</Button>
            </Form>
        </Container>
    );
}

function Vote() {
    const navigate = useNavigate();
    const [image, setImage] = useState('null');
    const [progress, setProgress] = useState(0);

    const auth = async () => {
        const data = { key: getCookie('key') };
        try {
            const response = await axios.post('http://14.36.184.113:3000/auth', data);
            if (response.data.progress < 149) {
                setImage(response.data.image_list[response.data.progress]);
                setProgress(response.data.progress);
            } else {
                navigate('/end');
            }
        } catch (err) {
            console.error('오류 발생:', err);
        }
    };

    useEffect(() => {
        if (getCookie('key') === undefined) {
            navigate('/');
        }
        auth();
    }, []);

    const vote = async (e, tier) => {
        e.preventDefault();
        const data = { name: image, tier: tier, key: getCookie('key') };
        try {
            const response = await axios.post('http://14.36.184.113:3000/vote', data);
            await auth();
        } catch (err) {
            console.error('오류 발생:', err);
        }
    };

    return (
        <VoteContainer>
            <h4>{progress + 1}/149</h4>
            <VoteImage
                src={`/images/${image.split('-')[0]}/${image.split('-')[1]}.jpg`}
                alt="Voting"
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((tier) => (
                    <TierButton key={tier} onClick={(e) => vote(e, tier)}>
                        {tier}티어
                    </TierButton>
                ))}
            </div>
        </VoteContainer>
    );
}

function End() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);  // 카운트다운 상태

    useEffect(() => {
        // 카운트다운을 매 초마다 감소시킴
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(timer);
                    axios
                        .post('http://14.36.184.113:3000/end', { key: getCookie('key') })
                        .then((res) => {
                            console.log('✅ 삭제완료');
                        })
                        .finally(() => {
                            DeleteCookie('key');
                            navigate('/');  // 카운트다운 끝나면 루트 페이지로 이동
                        });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);  // 1초마다 업데이트

        // 컴포넌트 언마운트 시 타이머를 정리
        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <EndContainer>
            <EndMessage>
                <h2>10초 후 메인 페이지로 이동합니다...</h2>
                <Countdown>{countdown}초</Countdown> {/* 카운트다운 표시 */}
            </EndMessage>
        </EndContainer>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vote" element={<Vote />} />
                <Route path="/end" element={<End />} />
            </Routes>
        </Router>
    );
}

export default App;
