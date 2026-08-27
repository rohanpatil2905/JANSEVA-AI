import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function BackButton({
  to = null,
  label = 'Back',
  className = '',
  style = {},
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`btn btn-secondary btn-sm ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        ...style,
      }}
      aria-label={label}
    >
      <FaArrowLeft style={{ fontSize: '0.8rem' }} />
      <span>{label}</span>
    </button>
  );
}
