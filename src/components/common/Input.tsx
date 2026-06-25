import React from 'react';

type InputProps = {
    input: string,
    classname: string,
    value: string,
    type?: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void ;
};

export default function Input ({ type, input, classname, value, onChange }: InputProps) {
    return (
        <input
            type={type || "text"}
            placeholder={input}
            className={classname} 
            value={value}
            onChange={onChange}

            // style={{ fontSize: "16px", padding: "5px", margin: "5px", borderRadius: "0.5rem"}}
            />
    )
}