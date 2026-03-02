import React from 'react';
import logoImg from '../src/logo.png';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const Logo: React.FC<LogoProps> = (props) => {
    return (
        <img 
            {...props} 
            src={logoImg} 
            alt={props.alt || "Pitangueiras F.C. Logo"}
            referrerPolicy="no-referrer"
            onError={(e) => {
                // Fallback to SVG if PNG fails, then to UI Avatar
                const target = e.currentTarget;
                if (target.src.includes('.png')) {
                    target.src = '/logo.svg';
                } else {
                    target.onerror = null; 
                    target.src = 'https://ui-avatars.com/api/?name=PFC&background=0066FF&color=fff&size=200';
                }
            }}
        />
    );
};
