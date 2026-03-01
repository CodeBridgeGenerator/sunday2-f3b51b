import * as React from 'react';

export const EmptyCardContent = ({ message }) => {
    return (
        <div className="flex flex-col mt-2 w-full text-sm tracking-wide leading-none text-center max-md:max-w-full">
            <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/7a3a271be124afd9f292163ff032ac588b88e51f6485ce9c9ea23b1631c9b609?placeholderIfAbsent=true&apiKey=ac6c884931b34b908ff08cbf3e00bff1" className="object-contain self-center w-20 aspect-square" alt="" />
            <div className="mt-2.5 max-md:max-w-full">{message}</div>
        </div>
    );
};
