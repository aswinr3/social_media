import React from "react";

interface ButtonProps {
  text?: string;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

// Reusable styled button component for auth forms and actions
const Button = ({
  text = "",
  type = "button",
  onClick,
  className = "",
}: ButtonProps) => {
  return (
    <>
      <style>{`
        .box-button {
          color: white;
          cursor: pointer;
          outline: none;
          border: none;
          background-color: var(--theme-accent);
          border-radius:10px;
          transition: transform 0.2s;
        }

        .box-button:active {
          transform: scale(0.95);
        }

        .box-span::before {
          position: absolute;
          content: "";
          left: 0;
          bottom: 0;
          height: 100%;
          width: 100%;
          background: var(--theme-accent-hover);
          z-index: -1;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease-out;
          border-radius: 10px;
        }

        .box-span:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        .box-span {
          width: 170px;
          display: block;
          position: relative;
          z-index: 1;
          padding: 15px;
          text-align: center;
          border-radius:10px;
          background: transparent;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 1px;
        }
      `}</style>

      <button
        type={type}
        onClick={onClick}
        className={`box-button ${className}`}
      >
        <span className="box-span">{text}</span>
      </button>
    </>
  );
};

export default Button;
