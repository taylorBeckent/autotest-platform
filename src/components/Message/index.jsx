//. Singleton Pattern
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import axios from 'axios';
import { CloseCircleOutlined } from '@ant-design/icons';
import TypewriterText from './TypewriterText';
import LoadingDots from './LoadingDots';
import { size } from 'lodash';

let instance = null;

const MessageContainer = (props) => {

    const {
        msg,
        type = 'error',
        duration = 3000,
        onClose
    } = props;

    const [visible, setVisible] = useState(true);
    const messageRef = useRef(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);//.AILoading
    const [btnLoading, setBtnLoading] = useState(false);//.操作loading

    let timer;

    const handleMouseEnter = () => {
        clearTimeout(timer);
        setVisible(true);
    }

    const handleMouseLeave = () => {
        timer = setTimeout(() => {
            setVisible(false);
            // if (onClose) onClose();
        }, duration);
    };

    useEffect(() => {
        handleReset();

        timer = setTimeout(() => {
            setVisible(false);
            // if (onClose) onClose();
        }, duration);

        messageRef.current.addEventListener('mouseenter', handleMouseEnter);
        messageRef.current.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            clearTimeout(timer);
        }

    }, []);

    const handleReset = () => {
        setContent('');
    }

    const handleClosed = () => {
        // if (!btnLoading) {
        //     setVisible(false);
        // }
        setVisible(false);
    };

    const AIAnalyse = (e) => {
        if (!btnLoading) {
            handleMouseEnter();
            messageRef.current.removeEventListener('mouseenter', handleMouseEnter);
            messageRef.current.removeEventListener('mouseleave', handleMouseLeave);
            analyseErrorInfo();
        }
    };

    const analyseErrorInfo = async () => {
        setContent('');
        setLoading(true);
        setBtnLoading(true);

        let params = {
            query: msg,
            response_mode: 'blocking',
            conversation_id: '',
            user: 'abc-123',
            inputs: {}
        }

        const res = await axios({
            url: 'http://10.240.192.142/v1/chat-messages',
            method: 'POST',
            headers: { Authorization: 'Bearer app-AnF5ZJ5Mvwst2zFyLD1ec9Ll' },
            data: params
        });

        if (res.status == 200) {
            setLoading(false);
            setContent(res?.data?.answer);
        }

        //.流式渲染
        // let str = '';
        // if (res?.status == 200) {
        //     const chunk = res?.data;
        //     const lines = chunk.split('\n');
        //     for (const line of lines) {
        //         if (line.startsWith('data: ')) {
        //             const data = line.slice(6);
        //             let responseData = '';
        //             isValidJSON(data) ? responseData = JSON.parse(data) : responseData = { 'event': 'message', 'answer': '' };
        //             if (responseData.event !== 'message_end') {
        //                 str += JSON.parse(JSON.stringify(responseData.answer));
        //                 setContent(str);
        //             } else {

        //             }
        //         }
        //     }
        // }
    };

    //.JSON校验
    // const isValidJSON = (jsonString) => {
    //     try {
    //         JSON.parse(jsonString);
    //         return true;
    //     } catch (error) {
    //         return false;
    //     }
    // }

    return (
        <div ref={messageRef} className={`${styles.containerStyle} ${!visible ? styles.containerClose : ''}`}>
            <div className={styles.messageContent}>
                <CloseCircleOutlined
                    style={{ color: 'red', fontSize: 14, borderRadius: 15 }}
                />
                <div className={styles.message}>{msg}</div>
                {/* <div className={styles.errorIcon}>x</div> */}
            </div>
            <div className={styles.AIContent}>
                <div style={{ letterSpacing: 1 }}>是否进行AI错误分析？</div>
                <div className={` ${btnLoading ? styles['confirm-loading'] : styles.confirm}`} onClick={AIAnalyse} >Yes</div>
                {((content && typeof (content) === 'string' && content.length > 0 && !btnLoading) ?
                    <div className={` ${btnLoading ? styles['cancel-loading'] : styles.cancel}`} onClick={handleClosed}>关闭</div>
                    : <div className={` ${btnLoading ? styles['cancel-loading'] : styles.cancel}`} onClick={handleClosed}>No</div>)}
            </div>

            {((content && typeof (content) === 'string' && content.length > 0 || loading) ?
                loading ? <LoadingDots text="" /> :
                    <div className={styles.content}>
                        <TypewriterText
                            text={content}
                            speed={30}
                            onComplete={(flag) => {
                                if (flag === 'done') {
                                    setBtnLoading(false);
                                }
                            }}
                            blinkCursor={false}
                        />
                    </div>

                : <></>)}
        </div>

    )
};

const createMsgContainer = () => {
    const container = document.createElement('div');
    container.className = 'global-container';
    container.style.opacity = 1;
    document.body.appendChild(container);
    return container;
};

const Message = {};

Message.show = (msg, type = 'error', duration, onClose = _ => { }) => {
    if (instance) document.body.removeChild(instance);

    const ReactDOM = require('react-dom');
    instance = createMsgContainer();

    ReactDOM.render(
        <MessageContainer
            msg={msg}
            type={type}
            duration={duration}
            onClose={() => {
                if (onClose) {
                    ReactDOM.unmountComponentAtNode(instance);
                    document.body.removeChild(instance);
                    instance = null;
                    onClose();
                }
            }}
        />,
        instance
    )
};

Message.error = (message, duration, onClose) => Message.show(message, 'error', duration, onClose);



export default Message;