import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import './CategoryFilter.css';

const CategoryFilter = ({ categories = [], activeCategory, onSelectCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="category-filter-container" ref={dropdownRef}>
      <div 
        className={`dropdown-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{activeCategory}</span>
        <FaChevronDown className={`dropdown-icon ${isOpen ? 'rotate' : ''}`} />
      </div>
      
      {isOpen && (
        <ul className="dropdown-list fade-in">
          {categories.map((category) => (
            <li
              key={category}
              className={`dropdown-item ${activeCategory === category ? 'active' : ''}`}
              onClick={() => {
                onSelectCategory(category);
                setIsOpen(false);
              }}
            >
              {category}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryFilter;
