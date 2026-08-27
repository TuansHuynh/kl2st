import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    input: string;
    classname: string;
    value: string;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ type, input, classname, value, onChange, ...rest }: InputProps) {
    return (
        <input
            type={type || "text"}
            placeholder={input}
            className={classname} 
            value={value}
            onChange={onChange}
            {...rest}
        />
    );
}