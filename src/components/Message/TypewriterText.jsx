import React, { useEffect, useState } from 'react';
import './TypewriterText.less';
import ReactMarkdown from 'react-markdown';

const TypewriterText = ({ text, speed = 100, onComplete = _ => { }, blinkCursor = true }) => {
    const [renderText, setRenderText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (text && typeof (text) == 'string') {
            if (currentIndex < text.length) {
                const timer = setTimeout(() => {
                    setRenderText(prev => prev + text[currentIndex]);
                    setCurrentIndex(prev => prev + 1);
                }, speed)

                return () => clearTimeout(timer);
            } else {
                onComplete('done');
            }
        }

    }, [currentIndex, text, speed, onComplete]);

    return (
        <div style={{ display: 'inline-block' }}>
            <ReactMarkdown children={renderText} escapeHtml={false} />
            {/* {renderText} */}
            {blinkCursor && (
                <span style={{ borderRight: '2px solid #000', animation: 'blink 1s step-end infinite' }}></span>
            )}
        </div>
    )
};

export default TypewriterText;