import React, { useState } from 'react';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrcs?: string[];
}

export const Logo: React.FC<LogoProps> = ({ fallbackSrcs = ['/Logo.png', '/Logo.PNG', '/logo.PNG'], ...props }) => {
    const [currentSrc, setCurrentSrc] = useState('/logo.png');
    const [attempts, setAttempts] = useState(0);

    const handleError = () => {
        if (attempts < fallbackSrcs.length) {
            setCurrentSrc(fallbackSrcs[attempts]);
            setAttempts(prev => prev + 1);
        }
    };

    return (
        <img 
            {...props} 
            src={currentSrc} 
            onError={handleError}
            alt={props.alt || "Logo"}
        />
    );
};
